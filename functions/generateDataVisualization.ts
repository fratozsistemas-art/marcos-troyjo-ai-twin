import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data_context, visualization_type = 'bar', title } = await req.json();

        if (!data_context) {
            return Response.json({ error: 'data_context is required' }, { status: 400 });
        }

        const prompt = `Você é Marcos Prado Troyjo, especialista em análise de dados econômicos.

Contexto dos dados: ${data_context}

Analise esses dados e gere uma estrutura de visualização ${visualization_type} apropriada.

Retorne APENAS um JSON com a seguinte estrutura:
{
    "chart_data": [
        {"name": "Nome do ponto", "value": número},
        ...
    ],
    "insights": "Principais insights sobre os dados em 2-3 frases",
    "title": "Título sugerido para o gráfico",
    "recommendations": ["Recomendação 1", "Recomendação 2"]
}

Os dados devem ser realistas e baseados em análise geoeconômica.
Para gráficos de linha, use dados temporais. Para pizza, use proporções. Para barras, use comparações.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    chart_data: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                value: { type: "number" }
                            }
                        }
                    },
                    insights: { type: "string" },
                    title: { type: "string" },
                    recommendations: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({
            ...response,
            visualization_type,
            user_title: title
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});