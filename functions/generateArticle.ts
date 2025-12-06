import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { topic, target_outlet, word_count, angle, tone, file_urls } = await req.json();

        if (!topic) {
            return Response.json({ 
                error: 'Topic is required' 
            }, { status: 400 });
        }

        const wordCount = word_count || 1000;
        const targetOutlet = target_outlet || 'Op-Ed geral';
        const articleAngle = angle || 'Análise geoeconômica';
        const articleTone = tone || 'Analítico e propositivo';

        const prompt = `Você é Marcos Prado Troyjo escrevendo um artigo de opinião/análise.

TEMA: ${topic}
VEÍCULO-ALVO: ${targetOutlet}
EXTENSÃO: ${wordCount} palavras
ÂNGULO: ${articleAngle}
TOM: ${articleTone}
REFERÊNCIAS: ${file_urls ? 'Documentos anexados' : 'Pesquisa contextual'}

ESTRUTURA TROYJO:
1. **Lead impactante**: Comece com dados recentes, evento significativo ou metáfora poderosa
2. **Contextualização geoeconômica**: Situe o tema no cenário global atual
3. **Análise em camadas**: 
   - Dimensão econômica (com dados)
   - Dimensão geopolítica
   - Implicações para competitividade
4. **Comparações internacionais**: Use benchmarks e casos relevantes
5. **Posicionamento Brasil**: Foque em oportunidades e desafios para o país
6. **Propostas pragmáticas**: Recomendações concretas e viáveis
7. **Conclusão memorável**: Frase de impacto ou call-to-action

ELEMENTOS ESTILÍSTICOS:
- Vocabulário técnico mas acessível
- Metáforas geoeconômicas ("tempestade", "arquipélago", "ecossistema")
- Dados concretos e recentes
- Referências históricas quando relevante
- Tom diplomático mas assertivo
- Evite polarizações ideológicas
- Use conceitos Troyjo quando apropriado ("Novo ESG", "trumpulência", etc.)

FORMATO:
- Título chamativo (máximo 10 palavras)
- Subtítulo explicativo (opcional, máximo 20 palavras)
- Corpo do artigo dividido em seções lógicas
- Sugestão de box/destaque (dado ou frase-chave)

GERE um artigo completo, formatado e pronto para publicação.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: !file_urls,
            file_urls: file_urls || undefined,
            response_json_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    lead_paragraph: { type: "string" },
                    main_body: { type: "string" },
                    conclusion: { type: "string" },
                    highlight_box: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            content: { type: "string" }
                        }
                    },
                    key_data_points: {
                        type: "array",
                        items: { type: "string" }
                    },
                    suggested_images: {
                        type: "array",
                        items: { type: "string" }
                    },
                    seo_keywords: {
                        type: "array",
                        items: { type: "string" }
                    },
                    word_count: { type: "number" }
                }
            }
        });

        return Response.json({ 
            success: true,
            article: response
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});