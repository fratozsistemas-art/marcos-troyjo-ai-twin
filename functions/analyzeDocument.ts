import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const xai = new OpenAI({
    apiKey: Deno.env.get("XAI_API_KEY"),
    baseURL: "https://api.x.ai/v1",
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { document_content, analysis_type, specific_questions } = await req.json();

        if (!document_content || !analysis_type) {
            return Response.json({ 
                error: 'Missing required fields: document_content and analysis_type' 
            }, { status: 400 });
        }

        const troyjoExpertise = `You are Marcos Prado Troyjo's analytical assistant.

EXPERTISE AREAS (Based on public records):
- Global Economics & Geoeconomics
- International Trade & Competitiveness
- BRICS & Emerging Markets Development
- Economic Diplomacy & Multilateral Negotiations
- Infrastructure Finance & Development Banking
- Innovation, Technology & Sustainability

CAREER BACKGROUND:
- President, New Development Bank (NDB/BRICS Bank) 2020-2023
- Special Secretary of Foreign Trade, Brazil
- Diplomat, Brazilian Ministry of Foreign Affairs
- Founded BRICLab at Columbia University SIPA (2011-2018)
- Founded international trade and investment consulting firm
- Board positions and advisory roles in multilateral institutions
- Academic positions: Columbia University, INSEAD, Oxford (Blavatnik School)

ANALYSIS APPROACH:
- Pragmatic economic diplomacy perspective
- Focus on competitiveness and strategic positioning
- Geoeconomic lens on global developments
- ESG framework: Economy + Security + Geopolitics
- Data-driven with realistic assessments`;

        let analysisPrompt = '';
        
        switch (analysis_type) {
            case 'strategic':
                analysisPrompt = 'Provide strategic analysis focusing on competitive advantages, risks, opportunities, and recommendations.';
                break;
            case 'economic':
                analysisPrompt = 'Analyze economic implications, market dynamics, trade impacts, and financial considerations.';
                break;
            case 'geopolitical':
                analysisPrompt = 'Analyze geopolitical context, power dynamics, international relations implications.';
                break;
            case 'investment':
                analysisPrompt = 'Evaluate investment potential, risk assessment, market opportunities, and ROI considerations.';
                break;
            case 'policy':
                analysisPrompt = 'Analyze policy implications, regulatory environment, and strategic recommendations.';
                break;
            default:
                analysisPrompt = 'Provide comprehensive analysis with key insights and recommendations.';
        }

        const messages = [
            { role: 'system', content: troyjoExpertise },
            { 
                role: 'user', 
                content: `${analysisPrompt}

Document/Data to analyze:
${document_content}

${specific_questions ? `\nSpecific questions to address:\n${specific_questions}` : ''}

Provide a structured analysis with:
1. Executive Summary
2. Key Findings
3. Strategic Implications
4. Recommendations
5. Risk Assessment` 
            }
        ];

        const response = await xai.chat.completions.create({
            model: 'grok-beta',
            messages,
            temperature: 0.7,
        });

        const analysis = response.choices[0].message.content;

        return Response.json({
            success: true,
            analysis,
            analysis_type,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in analyzeDocument:', error);
        return Response.json({ 
            error: error.message || 'Failed to analyze document',
            success: false
        }, { status: 500 });
    }
});