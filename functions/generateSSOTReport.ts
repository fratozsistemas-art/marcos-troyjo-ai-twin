import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { indicator, countries, startYear, endYear, reportType = 'executive' } = await req.json();

        // Fetch relevant facts
        const facts = await base44.asServiceRole.entities.CorporateFact.filter({
            indicator_name: indicator
        });

        const filtered = facts.filter(f => 
            countries.includes(f.country) && 
            f.year >= startYear && 
            f.year <= endYear
        );

        if (filtered.length === 0) {
            return Response.json({ 
                success: false,
                message: 'No data found for the selected parameters'
            });
        }

        // Prepare data summary
        const dataSummary = filtered.map(f => 
            `${f.country} (${f.year}): ${f.value} ${f.unit}`
        ).join('\n');

        // Generate report using LLM
        const prompt = reportType === 'executive' 
            ? `Como analista econômico sênior, crie um resumo executivo detalhado sobre o indicador "${indicator}" para os seguintes dados:\n\n${dataSummary}\n\nIncluir: tendências principais, comparações entre países, insights estratégicos e recomendações. Formato profissional.`
            : `Como analista técnico, crie um relatório técnico completo sobre o indicador "${indicator}" com os seguintes dados:\n\n${dataSummary}\n\nIncluir: metodologia, análise estatística detalhada, gráficos sugeridos, contexto histórico, projeções e conclusões técnicas. Formato acadêmico.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false
        });

        const report = {
            title: `Relatório: ${indicator}`,
            type: reportType,
            indicator: indicator,
            countries: countries,
            period: `${startYear}-${endYear}`,
            generated_at: new Date().toISOString(),
            generated_by: user.email,
            content: response,
            data_points: filtered.length,
            sources: [...new Set(filtered.map(f => f.source))]
        };

        return Response.json({
            success: true,
            report: report
        });

    } catch (error) {
        console.error('Error generating report:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});