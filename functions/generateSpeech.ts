import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            topic,
            event_name,
            audience_profile = 'mixed',
            duration_minutes = 20,
            language = 'pt',
            reviewed_by_couto = false,
            include_qa_prep = true,
            context = {}
        } = await req.json();

        if (!topic || !event_name) {
            return Response.json({ error: 'Topic and event_name are required' }, { status: 400 });
        }

        const startTime = Date.now();

        // Construir prompt para discurso
        const prompt = buildSpeechPrompt(topic, event_name, audience_profile, duration_minutes, language, include_qa_prep, context);

        // Usar router inteligente
        const routerResponse = await base44.functions.invoke('intelligentLLMRouter', {
            query: prompt,
            context: {
                systemPrompt: getSpeechSystemPrompt(language, reviewed_by_couto)
            }
        });

        const speechContent = routerResponse.data.response;

        // Validar com AEGIS
        const aegisValidation = await base44.functions.invoke('aegisQualityGate', {
            content: speechContent,
            context: {
                type: 'speech',
                topic: topic,
                event_name: event_name,
                rag_documents: context.rag_documents || []
            }
        });

        if (!aegisValidation.data.approved) {
            return Response.json({
                error: 'Content blocked by AEGIS Protocol',
                reason: aegisValidation.data.reason,
                crv_score: aegisValidation.data.crv_score
            }, { status: 403 });
        }

        // Aplicar formato
        const header = `# ${language === 'pt' ? 'Discurso' : 'Speech'}: ${topic}\n\n` +
                      `**${language === 'pt' ? 'Evento' : 'Event'}:** ${event_name}\n` +
                      `**${language === 'pt' ? 'Duração' : 'Duration'}:** ${duration_minutes} ${language === 'pt' ? 'minutos' : 'minutes'}\n` +
                      `**${language === 'pt' ? 'Audiência' : 'Audience'}:** ${audience_profile}\n` +
                      `**${language === 'pt' ? 'Data de referência' : 'Reference date'}:** December 24, 2025\n\n` +
                      `---\n\n`;

        const signature = reviewed_by_couto 
            ? `\n\n---\n**${language === 'pt' ? 'Preparado por' : 'Prepared by'}:** Marcos Troyjo & Couto Silva`
            : `\n\n---\n**${language === 'pt' ? 'Preparado por' : 'Prepared by'}:** Marcos Troyjo`;

        const finalContent = header + speechContent + signature;

        // Log
        await base44.asServiceRole.entities.AgentInteractionLog.create({
            agent_name: 'content_generator',
            user_email: user.email,
            prompt: `Generate Speech: ${topic} for ${event_name}`,
            response: `Generated ${duration_minutes}-minute speech`,
            response_time_ms: Date.now() - startTime,
            metadata: {
                content_type: 'speech',
                topic: topic,
                event_name: event_name,
                duration_minutes: duration_minutes,
                audience_profile: audience_profile,
                reviewed_by_couto: reviewed_by_couto,
                model_used: routerResponse.data.metadata.model_used,
                aegis_approved: true,
                crv_score: aegisValidation.data.crv_score
            }
        });

        return Response.json({
            content: finalContent,
            metadata: {
                content_type: 'speech',
                topic: topic,
                event_name: event_name,
                duration_minutes: duration_minutes,
                audience_profile: audience_profile,
                word_count: speechContent.split(' ').length,
                estimated_delivery_time: Math.ceil(speechContent.split(' ').length / 130), // 130 words/min
                language: language,
                reviewed_by_couto: reviewed_by_couto,
                signature: reviewed_by_couto ? 'dual' : 'single',
                model_used: routerResponse.data.metadata.model_used,
                generation_time_ms: Date.now() - startTime,
                aegis_validation: {
                    approved: true,
                    crv_score: aegisValidation.data.crv_score
                }
            }
        });

    } catch (error) {
        console.error('Speech generation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function buildSpeechPrompt(topic, event_name, audience_profile, duration_minutes, language, include_qa_prep, context) {
    const target_words = duration_minutes * 130; // 130 palavras/minuto
    
    const langText = language === 'pt' ? {
        instruction: 'Escreva um discurso',
        about: 'sobre',
        for: 'para',
        structure: 'Estrutura do discurso',
        qa: 'Preparação para Q&A'
    } : {
        instruction: 'Write a speech',
        about: 'about',
        for: 'for',
        structure: 'Speech structure',
        qa: 'Q&A Preparation'
    };

    let prompt = `${langText.instruction} ${langText.about} "${topic}" ${langText.for} ${event_name}.\n\n`;
    prompt += `${language === 'pt' ? 'Audiência' : 'Audience'}: ${audience_profile}\n`;
    prompt += `${language === 'pt' ? 'Duração-alvo' : 'Target duration'}: ${duration_minutes} ${language === 'pt' ? 'minutos' : 'minutes'} (~${target_words} ${language === 'pt' ? 'palavras' : 'words'})\n\n`;

    prompt += `${langText.structure}:\n\n`;
    
    prompt += `1. **${language === 'pt' ? 'ABERTURA IMPACTANTE' : 'IMPACTFUL OPENING'}** (1-2 ${language === 'pt' ? 'minutos' : 'minutes'})\n`;
    prompt += `   - ${language === 'pt' ? 'Gancho atual (notícia, dado, citação)' : 'Current hook (news, data, quote)'}\n`;
    prompt += `   - ${language === 'pt' ? 'Estabelecer relevância para a audiência' : 'Establish relevance for audience'}\n\n`;
    
    prompt += `2. **${language === 'pt' ? 'CONTEXTO E DIAGNÓSTICO' : 'CONTEXT AND DIAGNOSIS'}** (${Math.floor(duration_minutes * 0.3)}-${Math.floor(duration_minutes * 0.4)} ${language === 'pt' ? 'minutos' : 'minutes'})\n`;
    prompt += `   - ${language === 'pt' ? 'Panorama global relevante' : 'Relevant global overview'}\n`;
    prompt += `   - ${language === 'pt' ? 'Posição do Brasil' : "Brazil's position"}\n`;
    prompt += `   - ${language === 'pt' ? '2-3 dados concretos' : '2-3 concrete data points'}\n\n`;
    
    prompt += `3. **${language === 'pt' ? 'ANÁLISE E PROPOSTAS' : 'ANALYSIS AND PROPOSALS'}** (${Math.floor(duration_minutes * 0.3)}-${Math.floor(duration_minutes * 0.4)} ${language === 'pt' ? 'minutos' : 'minutes'})\n`;
    prompt += `   - ${language === 'pt' ? 'Desafios e oportunidades' : 'Challenges and opportunities'}\n`;
    prompt += `   - ${language === 'pt' ? 'Recomendações pragmáticas' : 'Pragmatic recommendations'}\n`;
    prompt += `   - ${language === 'pt' ? 'Exemplos concretos ou casos de sucesso' : 'Concrete examples or success cases'}\n\n`;
    
    prompt += `4. **${language === 'pt' ? 'CONCLUSÃO E CHAMADO À AÇÃO' : 'CONCLUSION AND CALL TO ACTION'}** (1-2 ${language === 'pt' ? 'minutos' : 'minutes'})\n`;
    prompt += `   - ${language === 'pt' ? 'Síntese dos pontos principais' : 'Synthesis of main points'}\n`;
    prompt += `   - ${language === 'pt' ? 'Mensagem inspiradora sobre o potencial do Brasil' : "Inspiring message about Brazil's potential"}\n`;
    prompt += `   - ${language === 'pt' ? 'Próximos passos concretos' : 'Concrete next steps'}\n\n`;

    if (include_qa_prep) {
        prompt += `5. **${langText.qa}**\n`;
        prompt += `   ${language === 'pt' ? 'Incluir 5-7 perguntas prováveis com respostas preparadas' : 'Include 5-7 likely questions with prepared answers'}\n\n`;
    }

    prompt += `${language === 'pt' ? 'Requisitos de estilo' : 'Style requirements'}:\n`;
    prompt += `- ${language === 'pt' ? 'Tom diplomático mas acessível' : 'Diplomatic but accessible tone'}\n`;
    prompt += `- ${language === 'pt' ? 'Uso de anedotas ou metáforas quando apropriado' : 'Use of anecdotes or metaphors when appropriate'}\n`;
    prompt += `- ${language === 'pt' ? 'Linguagem clara (evitar jargão excessivo)' : 'Clear language (avoid excessive jargon)'}\n`;
    prompt += `- ${language === 'pt' ? 'Marcadores de ritmo [PAUSA], [ÊNFASE]' : 'Rhythm markers [PAUSE], [EMPHASIS]'}\n\n`;

    if (context.rag_documents && context.rag_documents.length > 0) {
        prompt += `${language === 'pt' ? 'Material de referência disponível' : 'Reference material available'}: ${context.rag_documents.length}\n\n`;
    }

    prompt += `${language === 'pt' ? 'Data de referência' : 'Reference date'}: December 24, 2025\n`;
    prompt += `${language === 'pt' ? 'Base de conhecimento até' : 'Knowledge base until'}: December 2025\n`;

    return prompt;
}

function getSpeechSystemPrompt(language, reviewed_by_couto) {
    const ptPrompt = `Você é o Digital Twin de Marcos Troyjo, preparando material para apresentações públicas.

Características do seu estilo em discursos:
- Combinação de rigor técnico com narrativa envolvente
- Uso de histórias e exemplos concretos
- Ponte entre academia, prática e visão estratégica
- Tom inspirador mas realista sobre o Brasil

Elementos distintivos:
- Referências a experiências pessoais (NDB, diplomacia, academia)
- Conexão entre micro (casos específicos) e macro (tendências globais)
- Posicionamento do Brasil no contexto multipolar
- Mensagens de ação, não apenas diagnóstico

Entrega:
- Estrutura clara com transições marcadas
- Variação de ritmo (momentos de dados, momentos de visão)
- Conclusões que inspiram sem ignorar desafios

${reviewed_by_couto ? 'Versão final revisada por Couto Silva.' : 'Rascunho para revisão e ajustes de delivery.'}`;

    const enPrompt = `You are the Digital Twin of Marcos Troyjo, preparing material for public presentations.

Your style characteristics in speeches:
- Combination of technical rigor with engaging narrative
- Use of stories and concrete examples
- Bridge between academia, practice and strategic vision
- Inspiring but realistic tone about Brazil

Distinctive elements:
- References to personal experiences (NDB, diplomacy, academia)
- Connection between micro (specific cases) and macro (global trends)
- Positioning Brazil in multipolar context
- Messages of action, not just diagnosis

Delivery:
- Clear structure with marked transitions
- Rhythm variation (data moments, vision moments)
- Conclusions that inspire without ignoring challenges

${reviewed_by_couto ? 'Final version reviewed by Couto Silva.' : 'Draft for review and delivery adjustments.'}`;

    return language === 'pt' ? ptPrompt : enPrompt;
}