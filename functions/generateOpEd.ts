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
            angle,
            target_outlet = 'Valor Econômico',
            word_count = 1200,
            language = 'pt',
            reviewed_by_couto = false,
            context = {}
        } = await req.json();

        if (!topic) {
            return Response.json({ error: 'Topic is required' }, { status: 400 });
        }

        const startTime = Date.now();

        // Construir prompt específico para op-ed
        const prompt = buildOpEdPrompt(topic, angle, target_outlet, word_count, language, context);

        // Usar router inteligente para selecionar melhor LLM
        const routerResponse = await base44.functions.invoke('intelligentLLMRouter', {
            query: prompt,
            context: {
                systemPrompt: getSystemPrompt(language, reviewed_by_couto)
            }
        });

        const content = routerResponse.data.response;

        // Validar com AEGIS
        const aegisValidation = await base44.functions.invoke('aegisQualityGate', {
            content: content,
            context: {
                type: 'op-ed',
                topic: topic,
                target_outlet: target_outlet,
                rag_documents: context.rag_documents || []
            }
        });

        if (!aegisValidation.data.approved) {
            return Response.json({
                error: 'Content blocked by AEGIS Protocol',
                reason: aegisValidation.data.reason,
                crv_score: aegisValidation.data.crv_score,
                validation: aegisValidation.data.validation
            }, { status: 403 });
        }

        // Aplicar assinatura
        const signature = reviewed_by_couto 
            ? '\n\n---\n**By Marcos Troyjo & Couto Silva**'
            : '\n\n---\n**By Marcos Troyjo**';

        const finalContent = content + signature;

        // Log da geração
        await base44.asServiceRole.entities.AgentInteractionLog.create({
            agent_name: 'content_generator',
            user_email: user.email,
            prompt: `Generate Op-Ed: ${topic}`,
            response: `Generated ${finalContent.split(' ').length} words`,
            response_time_ms: Date.now() - startTime,
            metadata: {
                content_type: 'op-ed',
                topic: topic,
                target_outlet: target_outlet,
                word_count: finalContent.split(' ').length,
                reviewed_by_couto: reviewed_by_couto,
                model_used: routerResponse.data.metadata.model_used,
                aegis_approved: true,
                crv_score: aegisValidation.data.crv_score
            }
        });

        return Response.json({
            content: finalContent,
            metadata: {
                content_type: 'op-ed',
                topic: topic,
                target_outlet: target_outlet,
                word_count: finalContent.split(' ').length,
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
        console.error('Op-Ed generation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function buildOpEdPrompt(topic, angle, target_outlet, word_count, language, context) {
    const langText = language === 'pt' ? {
        instruction: 'Escreva um artigo de opinião',
        about: 'sobre',
        for: 'para',
        words: 'palavras',
        angle: 'Ângulo',
        requirements: 'Requisitos',
        structure: 'Estrutura esperada',
        tone: 'Tom diplomático e analítico, adequado para tomadores de decisão'
    } : {
        instruction: 'Write an opinion piece',
        about: 'about',
        for: 'for',
        words: 'words',
        angle: 'Angle',
        requirements: 'Requirements',
        structure: 'Expected structure',
        tone: 'Diplomatic and analytical tone, suitable for decision-makers'
    };

    let prompt = `${langText.instruction} ${langText.about} "${topic}" ${langText.for} ${target_outlet} (~${word_count} ${langText.words}).\n\n`;
    
    if (angle) {
        prompt += `${langText.angle}: ${angle}\n\n`;
    }

    prompt += `${langText.requirements}:\n`;
    prompt += `- ${langText.tone}\n`;
    prompt += `- ${language === 'pt' ? 'Citações de dados confiáveis (IBGE, Banco Central, instituições internacionais)' : 'Citations from reliable data sources (IBGE, Central Bank, international institutions)'}\n`;
    prompt += `- ${language === 'pt' ? 'Foco no contexto brasileiro e sul-global' : 'Focus on Brazilian and Global South context'}\n`;
    prompt += `- ${language === 'pt' ? 'Recomendações acionáveis' : 'Actionable recommendations'}\n\n`;

    prompt += `${langText.structure}:\n`;
    prompt += `1. ${language === 'pt' ? 'Abertura impactante (gancho atual)' : 'Impactful opening (current hook)'}\n`;
    prompt += `2. ${language === 'pt' ? 'Contextualização (dados e tendências)' : 'Contextualization (data and trends)'}\n`;
    prompt += `3. ${language === 'pt' ? 'Análise crítica (oportunidades e desafios)' : 'Critical analysis (opportunities and challenges)'}\n`;
    prompt += `4. ${language === 'pt' ? 'Recomendações práticas' : 'Practical recommendations'}\n`;
    prompt += `5. ${language === 'pt' ? 'Conclusão (chamado à ação)' : 'Conclusion (call to action)'}\n\n`;

    if (context.rag_documents && context.rag_documents.length > 0) {
        prompt += `${language === 'pt' ? 'Documentos de referência disponíveis' : 'Reference documents available'}: ${context.rag_documents.length}\n\n`;
    }

    prompt += `${language === 'pt' ? 'Data de corte de conhecimento' : 'Knowledge cutoff date'}: December 2025\n`;
    prompt += `${language === 'pt' ? 'Data de referência' : 'Reference date'}: December 24, 2025\n`;

    return prompt;
}

function getSystemPrompt(language, reviewed_by_couto) {
    const ptPrompt = `Você é o Digital Twin de Marcos Troyjo, ex-Presidente do Novo Banco de Desenvolvimento (NDB/BRICS, 2020-2023), economista e especialista em comércio internacional, geopolítica e desenvolvimento.

Características do seu estilo:
- Tom diplomático, mas direto
- Visão macro-econômica global
- Foco em multiporalidade e agência do Sul Global
- Ponte entre academia, negócios e formulação de políticas
- Uso de dados concretos e exemplos práticos

Temas centrais:
- Economia global e comércio internacional
- BRICS e emergentes
- Brasil como ponte entre Norte-Sul
- IA e tecnologia como infraestrutura comercial
- Pragmatismo multilateral (G20, BRICS, G7+)

IMPORTANTE:
- Sempre ancore análises em datas específicas ("em dezembro de 2025")
- Cite fontes confiáveis quando apresentar dados
- Mantenha foco no contexto brasileiro e sul-global
- Ofereça recomendações acionáveis, não apenas análise

${reviewed_by_couto ? 'Este conteúdo será revisado por Couto Silva antes da publicação.' : 'Este é um rascunho inicial para revisão.'}`;

    const enPrompt = `You are the Digital Twin of Marcos Troyjo, former President of the New Development Bank (NDB/BRICS, 2020-2023), economist and specialist in international trade, geopolitics and development.

Style characteristics:
- Diplomatic but direct tone
- Global macro-economic vision
- Focus on multipolarity and Global South agency
- Bridge between academia, business and policy-making
- Use of concrete data and practical examples

Core themes:
- Global economy and international trade
- BRICS and emerging markets
- Brazil as bridge between North-South
- AI and technology as trade infrastructure
- Pragmatic multilateralism (G20, BRICS, G7+)

IMPORTANT:
- Always anchor analysis to specific dates ("as of December 2025")
- Cite reliable sources when presenting data
- Maintain focus on Brazilian and Global South context
- Offer actionable recommendations, not just analysis

${reviewed_by_couto ? 'This content will be reviewed by Couto Silva before publication.' : 'This is an initial draft for review.'}`;

    return language === 'pt' ? ptPrompt : enPrompt;
}