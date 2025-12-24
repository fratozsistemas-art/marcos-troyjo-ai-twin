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
            target_institution = 'MCTI',
            page_count = 10,
            language = 'pt',
            reviewed_by_couto = false,
            include_scenarios = true,
            context = {}
        } = await req.json();

        if (!topic) {
            return Response.json({ error: 'Topic is required' }, { status: 400 });
        }

        const startTime = Date.now();

        // Construir prompt para policy brief
        const prompt = buildPolicyBriefPrompt(topic, target_institution, page_count, language, include_scenarios, context);

        // Usar router inteligente
        const routerResponse = await base44.functions.invoke('intelligentLLMRouter', {
            query: prompt,
            context: {
                systemPrompt: getPolicySystemPrompt(language, reviewed_by_couto)
            }
        });

        const content = routerResponse.data.response;

        // Validar com AEGIS
        const aegisValidation = await base44.functions.invoke('aegisQualityGate', {
            content: content,
            context: {
                type: 'policy-brief',
                topic: topic,
                target_institution: target_institution,
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

        // Aplicar assinatura e formato
        const signature = reviewed_by_couto 
            ? '\n\n---\n**Authors:** Marcos Troyjo & Couto Silva'
            : '\n\n---\n**Author:** Marcos Troyjo';

        const header = `# Policy Brief: ${topic}\n\n` +
                      `**Target Institution:** ${target_institution}\n` +
                      `**Date:** December 24, 2025\n` +
                      `**Knowledge Base Cutoff:** December 2025\n\n` +
                      `---\n\n`;

        const finalContent = header + content + signature;

        // Log
        await base44.asServiceRole.entities.AgentInteractionLog.create({
            agent_name: 'content_generator',
            user_email: user.email,
            prompt: `Generate Policy Brief: ${topic}`,
            response: `Generated ${Math.ceil(finalContent.length / 2000)} pages`,
            response_time_ms: Date.now() - startTime,
            metadata: {
                content_type: 'policy-brief',
                topic: topic,
                target_institution: target_institution,
                estimated_pages: Math.ceil(finalContent.length / 2000),
                reviewed_by_couto: reviewed_by_couto,
                model_used: routerResponse.data.metadata.model_used,
                aegis_approved: true,
                crv_score: aegisValidation.data.crv_score
            }
        });

        return Response.json({
            content: finalContent,
            metadata: {
                content_type: 'policy-brief',
                topic: topic,
                target_institution: target_institution,
                estimated_pages: Math.ceil(finalContent.length / 2000),
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
        console.error('Policy Brief generation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function buildPolicyBriefPrompt(topic, target_institution, page_count, language, include_scenarios, context) {
    const langText = language === 'pt' ? {
        instruction: 'Elabore um policy brief detalhado',
        about: 'sobre',
        for: 'para',
        pages: 'páginas',
        requirements: 'Requisitos',
        structure: 'Estrutura obrigatória'
    } : {
        instruction: 'Develop a detailed policy brief',
        about: 'about',
        for: 'for',
        pages: 'pages',
        requirements: 'Requirements',
        structure: 'Required structure'
    };

    let prompt = `${langText.instruction} ${langText.about} "${topic}" ${langText.for} ${target_institution} (~${page_count} ${langText.pages}).\n\n`;

    prompt += `${langText.structure}:\n\n`;
    prompt += `1. **${language === 'pt' ? 'SUMÁRIO EXECUTIVO' : 'EXECUTIVE SUMMARY'}**\n`;
    prompt += `   - ${language === 'pt' ? '1 página, key findings e recomendações principais' : '1 page, key findings and main recommendations'}\n\n`;
    
    prompt += `2. **${language === 'pt' ? 'CONTEXTO' : 'CONTEXT'}**\n`;
    prompt += `   - ${language === 'pt' ? 'Situação atual com dados concretos' : 'Current situation with concrete data'}\n`;
    prompt += `   - ${language === 'pt' ? 'Tendências globais e regionais relevantes' : 'Relevant global and regional trends'}\n`;
    prompt += `   - ${language === 'pt' ? 'Posição do Brasil comparada a peers' : "Brazil's position compared to peers"}\n\n`;
    
    prompt += `3. **${language === 'pt' ? 'DIAGNÓSTICO' : 'DIAGNOSIS'}**\n`;
    prompt += `   - ${language === 'pt' ? 'Análise SWOT (Forças, Fraquezas, Oportunidades, Ameaças)' : 'SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)'}\n`;
    prompt += `   - ${language === 'pt' ? 'Gaps críticos' : 'Critical gaps'}\n`;
    prompt += `   - ${language === 'pt' ? 'Riscos e incertezas' : 'Risks and uncertainties'}\n\n`;
    
    if (include_scenarios) {
        prompt += `4. **${language === 'pt' ? 'CENÁRIOS' : 'SCENARIOS'}**\n`;
        prompt += `   - ${language === 'pt' ? 'Cenário base (status quo)' : 'Base scenario (status quo)'}\n`;
        prompt += `   - ${language === 'pt' ? 'Cenário otimista (com intervenção efetiva)' : 'Optimistic scenario (with effective intervention)'}\n`;
        prompt += `   - ${language === 'pt' ? 'Cenário pessimista (inação ou erros)' : 'Pessimistic scenario (inaction or errors)'}\n\n`;
    }
    
    prompt += `5. **${language === 'pt' ? 'OPÇÕES DE POLÍTICA' : 'POLICY OPTIONS'}**\n`;
    prompt += `   - ${language === 'pt' ? 'Pelo menos 3 opções com pros/cons' : 'At least 3 options with pros/cons'}\n`;
    prompt += `   - ${language === 'pt' ? 'Estimativa de custos e prazos' : 'Cost and timeline estimates'}\n`;
    prompt += `   - ${language === 'pt' ? 'Requisitos de implementação' : 'Implementation requirements'}\n\n`;
    
    prompt += `6. **${language === 'pt' ? 'RECOMENDAÇÕES' : 'RECOMMENDATIONS'}**\n`;
    prompt += `   - ${language === 'pt' ? 'Ações prioritárias (curto, médio, longo prazo)' : 'Priority actions (short, medium, long term)'}\n`;
    prompt += `   - ${language === 'pt' ? 'Atores responsáveis' : 'Responsible actors'}\n`;
    prompt += `   - ${language === 'pt' ? 'Métricas de sucesso' : 'Success metrics'}\n\n`;
    
    prompt += `7. **${language === 'pt' ? 'ANEXOS' : 'ANNEXES'}**\n`;
    prompt += `   - ${language === 'pt' ? 'Tabelas, gráficos, dados detalhados' : 'Tables, charts, detailed data'}\n`;
    prompt += `   - ${language === 'pt' ? 'Referências e fontes' : 'References and sources'}\n\n`;

    prompt += `${langText.requirements}:\n`;
    prompt += `- ${language === 'pt' ? 'Linguagem técnica mas acessível para formuladores de política' : 'Technical but accessible language for policymakers'}\n`;
    prompt += `- ${language === 'pt' ? 'Dados quantitativos sempre que possível' : 'Quantitative data whenever possible'}\n`;
    prompt += `- ${language === 'pt' ? 'Referências a casos internacionais de sucesso' : 'References to international success cases'}\n`;
    prompt += `- ${language === 'pt' ? 'Acionabilidade: recomendações devem ser implementáveis' : 'Actionability: recommendations must be implementable'}\n\n`;

    if (context.rag_documents && context.rag_documents.length > 0) {
        prompt += `${language === 'pt' ? 'Documentos de referência' : 'Reference documents'}: ${context.rag_documents.length}\n\n`;
    }

    prompt += `${language === 'pt' ? 'Data de corte' : 'Cutoff date'}: December 2025\n`;
    prompt += `${language === 'pt' ? 'Data de referência' : 'Reference date'}: December 24, 2025\n`;

    return prompt;
}

function getPolicySystemPrompt(language, reviewed_by_couto) {
    const ptPrompt = `Você é o Digital Twin de Marcos Troyjo, especialista em formulação de políticas públicas para economia, comércio e desenvolvimento.

Seu papel na elaboração de policy briefs:
- Combinar análise técnica rigorosa com viabilidade política
- Apresentar opções claras, não apenas uma solução
- Quantificar impactos sempre que possível
- Considerar restrições orçamentárias e institucionais do Brasil
- Ancorar recomendações em experiências internacionais comparáveis

Estilo de escrita para policy briefs:
- Objetivo, estruturado, baseado em evidências
- Uso de bullets, tabelas e gráficos conceituais
- Linguagem técnica mas compreensível para não-especialistas
- Tom propositivo, não apenas crítico

${reviewed_by_couto ? 'Versão final co-assinada com Couto Silva após revisão técnica.' : 'Rascunho técnico inicial para revisão.'}`;

    const enPrompt = `You are the Digital Twin of Marcos Troyjo, specialist in public policy formulation for economy, trade and development.

Your role in policy brief development:
- Combine rigorous technical analysis with political feasibility
- Present clear options, not just one solution
- Quantify impacts whenever possible
- Consider Brazil's budgetary and institutional constraints
- Anchor recommendations in comparable international experiences

Writing style for policy briefs:
- Objective, structured, evidence-based
- Use of bullets, tables and conceptual charts
- Technical but understandable language for non-specialists
- Propositional tone, not just critical

${reviewed_by_couto ? 'Final version co-signed with Couto Silva after technical review.' : 'Initial technical draft for review.'}`;

    return language === 'pt' ? ptPrompt : enPrompt;
}