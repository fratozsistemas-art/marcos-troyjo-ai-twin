import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            topic, 
            target_audience, 
            depth_level = 'comprehensive',
            include_scenarios = true,
            include_recommendations = true,
            max_length = 15000
        } = await req.json();

        if (!topic) {
            return Response.json({ error: 'topic is required' }, { status: 400 });
        }

        // Gather context from knowledge base
        const [positions, concepts, geopoliticalRisks, documents] = await Promise.all([
            base44.asServiceRole.entities.KnownPosition.filter({}),
            base44.asServiceRole.entities.ConceptEvolution.filter({}),
            base44.asServiceRole.entities.GeopoliticalRisk.filter({}),
            base44.asServiceRole.entities.Document.filter({})
        ]);

        // Build context string
        const contextStr = `
POSIÇÕES CONHECIDAS:
${positions.slice(0, 10).map(p => `- ${p.topic}: ${p.position}`).join('\n')}

CONCEITOS E HEURÍSTICAS:
${concepts.slice(0, 5).map(c => `- ${c.concept_name}: ${c.content.substring(0, 200)}...`).join('\n')}

RISCOS GEOPOLÍTICOS ATUAIS:
${geopoliticalRisks.slice(0, 5).map(r => `- ${r.title} (${r.region}): ${r.summary || r.description.substring(0, 150)}`).join('\n')}
        `;

        // Generate policy paper structure
        const prompt = `Você é Marcos Prado Troyjo, economista e ex-presidente do Banco dos BRICS. Gere um policy paper no estilo técnico-analítico, mas acessível.

TEMA: ${topic}
AUDIÊNCIA: ${target_audience || 'Tomadores de decisão em política pública'}
NÍVEL DE PROFUNDIDADE: ${depth_level}

CONTEXTO DISPONÍVEL:
${contextStr}

ESTRUTURA OBRIGATÓRIA DO POLICY PAPER:

I. SUMÁRIO EXECUTIVO (300-500 palavras)
- Tese central
- Principais achados
- Recomendações-chave

II. INTRODUÇÃO E CONTEXTO
- Contexto histórico e geopolítico
- Por que o tema importa agora
- Metodologia e escopo do documento

III. DIAGNÓSTICO E ANÁLISE
- Situação atual
- Atores principais e seus interesses
- Dinâmicas de poder
- Evidências e dados

IV. IMPLICAÇÕES PARA O BRASIL
- Riscos e oportunidades
- Ativos estratégicos brasileiros
- Vulnerabilidades atuais
- Comparação com outros emergentes

${include_scenarios ? `
V. CENÁRIOS 2025-2035
- Cenário A (otimista): [descrever]
- Cenário B (base): [descrever]
- Cenário C (pessimista): [descrever]
- Matriz de probabilidade e impacto
` : ''}

${include_recommendations ? `
VI. OPÇÕES DE POLÍTICA PÚBLICA
1. Capital Humano
2. Infraestrutura e Tecnologia
3. Diplomacia Econômica
4. Marcos Regulatórios
5. Parcerias Estratégicas

VII. ROADMAP DE IMPLEMENTAÇÃO
- Curto prazo (0-12 meses)
- Médio prazo (12-36 meses)
- Métricas de sucesso (KPIs)
` : ''}

VIII. CONCLUSÃO
- Síntese dos principais pontos
- Urgência da ação
- Escolha estratégica

INSTRUÇÕES ESTILÍSTICAS:
- Tom: técnico mas não hermético, diplomático mas direto
- Use heurísticas Troyjo quando relevante (competitividade se constrói, não se declama; Brasil cosmopolita realista)
- Cite fontes quando possível (Oxford Analytics, NDB, FMI, etc.)
- Evite jargão excessivo
- Mantenha entre ${Math.floor(max_length * 0.8)} e ${max_length} palavras

IMPORTANTE: Gere o texto completo em Markdown formatado.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false
        });

        // Calculate reading time
        const wordCount = response.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        // Log access
        await base44.asServiceRole.entities.AccessLog.create({
            user_email: user.email,
            action: 'create',
            resource_type: 'policy_paper',
            metadata: { topic, target_audience }
        });

        return Response.json({
            success: true,
            policy_paper: response,
            metadata: {
                word_count: wordCount,
                reading_time: readingTime,
                generated_at: new Date().toISOString(),
                topic,
                target_audience
            }
        });

    } catch (error) {
        console.error('Error generating policy paper:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});