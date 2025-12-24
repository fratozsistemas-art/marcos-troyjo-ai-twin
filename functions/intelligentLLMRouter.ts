import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, context = {}, custom_persona_id = null } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query is required' }, { status: 400 });
        }

        // Carregar persona customizada se fornecida
        let customPersona = null;
        if (custom_persona_id) {
            try {
                customPersona = await base44.asServiceRole.entities.CustomAgentPersona.filter({ id: custom_persona_id });
                customPersona = customPersona[0];
            } catch (error) {
                console.error('Error loading custom persona:', error);
            }
        }

        // Análise de tipo de consulta
        const queryAnalysis = analyzeQuery(query, customPersona);
        
        // Seleção do modelo baseado na análise (customPersona pode influenciar)
        const selectedModel = selectModel(queryAnalysis, customPersona);
        
        // Execução da consulta no modelo selecionado
        const startTime = Date.now();
        let response, tokenCount, modelUsed;

        // Aplicar configurações da persona customizada
        const temperature = customPersona?.temperature || queryAnalysis.suggestedTemperature;
        const topP = customPersona?.top_p || 0.9;
        const systemPrompt = customPersona?.system_prompt || context.systemPrompt;

        try {
            if (selectedModel === 'grok') {
                const result = await callGrok(query, { ...context, systemPrompt, temperature, topP });
                response = result.response;
                tokenCount = result.tokens;
                modelUsed = 'grok-beta';
            } else if (selectedModel === 'deepseek') {
                const result = await callDeepSeek(query, { ...context, systemPrompt, temperature, topP });
                response = result.response;
                tokenCount = result.tokens;
                modelUsed = 'deepseek-chat';
            } else {
                const result = await callGPT4(query, { ...context, systemPrompt, temperature, topP });
                response = result.response;
                tokenCount = result.tokens;
                modelUsed = 'gpt-4o';
            }
        } catch (error) {
            // Fallback para GPT-4 em caso de erro
            console.error(`Error with ${selectedModel}, falling back to GPT-4:`, error);
            const result = await callGPT4(query, { ...context, systemPrompt, temperature, topP });
            response = result.response;
            tokenCount = result.tokens;
            modelUsed = 'gpt-4o (fallback)';
        }

        // Incrementar uso da persona customizada
        if (customPersona) {
            try {
                await base44.asServiceRole.entities.CustomAgentPersona.update(customPersona.id, {
                    usage_count: (customPersona.usage_count || 0) + 1
                });
            } catch (error) {
                console.error('Error updating persona usage:', error);
            }
        }

        const responseTime = Date.now() - startTime;

        // Log da decisão de roteamento para auditoria
        await base44.asServiceRole.entities.AgentInteractionLog.create({
            agent_name: 'intelligent_router',
            user_email: user.email,
            prompt: query,
            response: response,
            persona_mode: customPersona ? `custom_${customPersona.name}` : selectedModel,
            temperature: temperature,
            response_time_ms: responseTime,
            token_count: tokenCount,
            metadata: {
                query_type: queryAnalysis.type,
                complexity: queryAnalysis.complexity,
                model_selected: modelUsed,
                reasoning: queryAnalysis.reasoning,
                custom_persona_used: customPersona ? {
                    id: customPersona.id,
                    name: customPersona.name,
                    role: customPersona.role
                } : null
            }
        });

        return Response.json({
            response,
            metadata: {
                model_used: modelUsed,
                query_type: queryAnalysis.type,
                complexity: queryAnalysis.complexity,
                response_time_ms: responseTime,
                reasoning: queryAnalysis.reasoning
            }
        });

    } catch (error) {
        console.error('Router error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function analyzeQuery(query, customPersona) {
    const lowerQuery = query.toLowerCase();
    
    // Se há persona customizada com áreas de foco, influenciar análise
    if (customPersona?.focus_areas && customPersona.focus_areas.length > 0) {
        const focusMatch = customPersona.focus_areas.some(area => 
            lowerQuery.includes(area.toLowerCase())
        );
        if (focusMatch) {
            return {
                type: 'custom_focus',
                complexity: 'high',
                reasoning: `Matched custom persona focus area: ${customPersona.name}`,
                suggestedTemperature: customPersona.temperature || 0.7
            };
        }
    }
    
    // Padrões matemáticos e quantitativos
    const mathPatterns = [
        /calcul/i, /matemática/i, /equação/i, /resolver/i, /quantos/i,
        /\d+[\+\-\*\/]\d+/, /derivada/i, /integral/i, /estatística/i,
        /probabilidade/i, /média/i, /soma/i, /multiplicação/i
    ];
    
    // Padrões geopolíticos e estratégicos
    const geopoliticalPatterns = [
        /geopolítica/i, /economia/i, /comércio/i, /brics/i, /diplomacia/i,
        /política internacional/i, /estratégia/i, /análise/i, /cenário/i,
        /troyjo/i, /desglobalização/i, /trumpulência/i, /novo esg/i
    ];
    
    // Padrões criativos e conversacionais
    const creativePatterns = [
        /crie/i, /escreva/i, /conte/i, /história/i, /poema/i,
        /criativo/i, /imagine/i, /gere/i, /faça um/i
    ];

    // Análise de complexidade
    const wordCount = query.split(/\s+/).length;
    const hasMultipleClauses = query.split(/[.!?]/).length > 2;
    
    let type, complexity, reasoning, suggestedTemperature;

    // Detecção de tipo
    if (mathPatterns.some(p => p.test(query))) {
        type = 'mathematical';
        complexity = wordCount > 50 ? 'high' : 'medium';
        reasoning = 'Consulta contém padrões matemáticos/quantitativos - DeepSeek é otimizado para raciocínio matemático';
        suggestedTemperature = 0.3;
    } else if (geopoliticalPatterns.some(p => p.test(query))) {
        type = 'geopolitical';
        complexity = hasMultipleClauses ? 'high' : 'medium';
        reasoning = 'Consulta geopolítica/estratégica - GPT-4o tem melhor conhecimento contextual e nuance';
        suggestedTemperature = 0.7;
    } else if (creativePatterns.some(p => p.test(query))) {
        type = 'creative';
        complexity = 'medium';
        reasoning = 'Consulta criativa/conversacional - Grok oferece respostas mais dinâmicas';
        suggestedTemperature = 0.9;
    } else {
        type = 'general';
        complexity = wordCount > 100 ? 'high' : 'low';
        reasoning = 'Consulta geral - GPT-4o como padrão para versatilidade';
        suggestedTemperature = 0.7;
    }

    return {
        type,
        complexity,
        reasoning,
        suggestedTemperature
    };
}

function selectModel(analysis, customPersona) {
    // Se há persona customizada com foco específico, usar GPT-4 para versatilidade
    if (analysis.type === 'custom_focus') {
        return 'gpt4';
    }
    
    // Lógica de seleção baseada na análise
    switch (analysis.type) {
        case 'mathematical':
            return 'deepseek';
        case 'geopolitical':
            return 'gpt4';
        case 'creative':
            return 'grok';
        default:
            return 'gpt4';
    }
}

async function callGPT4(query, context) {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: context.systemPrompt || 'Você é um assistente especializado em análise geopolítica e econômica.'
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            temperature: context.temperature || 0.7,
            top_p: context.topP || 0.9
        })
    });

    const data = await response.json();
    
    return {
        response: data.choices[0].message.content,
        tokens: data.usage?.total_tokens || 0
    };
}

async function callDeepSeek(query, context) {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    // DeepSeek usa a mesma API que OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: context.systemPrompt || 'Você é um assistente especializado em raciocínio matemático e análise quantitativa.'
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            temperature: context.temperature || 0.3,
            top_p: context.topP || 0.85
        })
    });

    const data = await response.json();
    
    return {
        response: data.choices[0].message.content,
        tokens: data.usage?.total_tokens || 0
    };
}

async function callGrok(query, context) {
    const apiKey = Deno.env.get('XAI_API_KEY');
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'grok-beta',
            messages: [
                {
                    role: 'system',
                    content: context.systemPrompt || 'Você é um assistente criativo e dinâmico.'
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            temperature: context.temperature || 0.9,
            top_p: context.topP || 0.95
        })
    });

    const data = await response.json();
    
    return {
        response: data.choices[0].message.content,
        tokens: data.usage?.total_tokens || 0
    };
}