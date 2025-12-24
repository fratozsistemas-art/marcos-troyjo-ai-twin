import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, max_results = 5, priority = 'all' } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query is required' }, { status: 400 });
        }

        const startTime = Date.now();
        const sources = {
            knowledge_graph: [],
            government_apis: [],
            web_scraping: [],
            external_financial: []
        };

        // PRIORIDADE 1: Knowledge Graph (RAG)
        if (priority === 'all' || priority === 'knowledge') {
            const kgResults = await queryKnowledgeGraph(base44, query, max_results);
            sources.knowledge_graph = kgResults;
            
            // Se encontrou resultados suficientes no Knowledge Graph, retornar
            if (kgResults.length >= max_results) {
                return buildResponse(sources, 'knowledge_graph', startTime, user, base44);
            }
        }

        // PRIORIDADE 2: APIs Governamentais (IBGE, Banco Central, etc.)
        if (priority === 'all' || priority === 'government') {
            const govResults = await queryGovernmentAPIs(query, max_results - sources.knowledge_graph.length);
            sources.government_apis = govResults;
            
            if (sources.knowledge_graph.length + govResults.length >= max_results) {
                return buildResponse(sources, 'government_apis', startTime, user, base44);
            }
        }

        // PRIORIDADE 3: APIs Financeiras Externas (Alpha Vantage, World Bank)
        if (priority === 'all' || priority === 'financial') {
            const finResults = await queryExternalFinancial(query, max_results - sources.knowledge_graph.length - sources.government_apis.length);
            sources.external_financial = finResults;
        }

        // PRIORIDADE 4: Web Scraping (último recurso)
        if (priority === 'all' || priority === 'web') {
            const remaining = max_results - sources.knowledge_graph.length - sources.government_apis.length - sources.external_financial.length;
            if (remaining > 0) {
                const webResults = await queryWebScraping(query, remaining);
                sources.web_scraping = webResults;
            }
        }

        return buildResponse(sources, 'mixed', startTime, user, base44);

    } catch (error) {
        console.error('Enhanced RAG error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

async function queryKnowledgeGraph(base44, query, maxResults) {
    try {
        // Buscar documentos relevantes no Knowledge Graph
        const documents = await base44.asServiceRole.entities.Document.filter({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }, '-usage_count', maxResults);

        // Buscar artigos de conhecimento
        const articles = await base44.asServiceRole.entities.KnowledgeEntry.filter({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        }, '-relevance_score', maxResults);

        const results = [
            ...documents.map(d => ({
                source: 'knowledge_graph',
                type: 'document',
                title: d.title,
                content: d.description,
                url: d.file_url,
                relevance: d.usage_count || 0,
                metadata: { category: d.category, author: d.author }
            })),
            ...articles.map(a => ({
                source: 'knowledge_graph',
                type: 'article',
                title: a.title,
                content: a.content?.substring(0, 500),
                relevance: a.relevance_score || 0,
                metadata: { category: a.category, tags: a.tags }
            }))
        ];

        return results.sort((a, b) => b.relevance - a.relevance).slice(0, maxResults);
    } catch (error) {
        console.error('Knowledge Graph query error:', error);
        return [];
    }
}

async function queryGovernmentAPIs(query, maxResults) {
    const results = [];
    
    // Verificar se a query é relacionada a dados brasileiros
    const isBrazilianQuery = /brasil|brazilian|ibge|bacen|bcb/i.test(query);
    
    if (!isBrazilianQuery) return results;

    try {
        // API do IBGE - Dados econômicos e demográficos
        if (/população|pib|inflação|desemprego|censo/i.test(query)) {
            const ibgeData = await queryIBGE(query);
            results.push(...ibgeData);
        }

        // API do Banco Central - Dados financeiros
        if (/taxa|juros|selic|câmbio|dólar|inflação|ipca/i.test(query)) {
            const bacenData = await queryBacen(query);
            results.push(...bacenData);
        }
    } catch (error) {
        console.error('Government API error:', error);
    }

    return results.slice(0, maxResults);
}

async function queryIBGE(query) {
    try {
        // Exemplo: buscar dados de PIB
        const response = await fetch('https://servicodados.ibge.gov.br/api/v3/agregados/1620/periodos/2020|2021|2022|2023/variaveis/583?localidades=N1[all]');
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        return [{
            source: 'government_api',
            provider: 'IBGE',
            type: 'economic_indicator',
            title: 'Dados do PIB - IBGE',
            content: JSON.stringify(data).substring(0, 500),
            url: 'https://www.ibge.gov.br',
            relevance: 90,
            metadata: { api: 'ibge', query_type: 'pib' }
        }];
    } catch (error) {
        console.error('IBGE API error:', error);
        return [];
    }
}

async function queryBacen(query) {
    try {
        // Exemplo: buscar taxa SELIC
        const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/12?formato=json');
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        return [{
            source: 'government_api',
            provider: 'Banco Central',
            type: 'financial_indicator',
            title: 'Taxa SELIC - Banco Central',
            content: JSON.stringify(data).substring(0, 500),
            url: 'https://www.bcb.gov.br',
            relevance: 95,
            metadata: { api: 'bacen', query_type: 'selic' }
        }];
    } catch (error) {
        console.error('Bacen API error:', error);
        return [];
    }
}

async function queryExternalFinancial(query, maxResults) {
    const results = [];
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY') || 'demo';

    try {
        // Alpha Vantage - Dados de mercado
        if (/stock|ação|bolsa|market|nasdaq/i.test(query)) {
            const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=${apiKey}`);
            
            if (response.ok) {
                const data = await response.json();
                results.push({
                    source: 'external_financial',
                    provider: 'Alpha Vantage',
                    type: 'market_data',
                    title: 'Dados de Mercado',
                    content: JSON.stringify(data).substring(0, 500),
                    relevance: 80,
                    metadata: { api: 'alpha_vantage' }
                });
            }
        }

        // World Bank - Dados globais
        if (/world|global|internacional|gdp|growth/i.test(query)) {
            const wbResponse = await fetch('https://api.worldbank.org/v2/country/br/indicator/NY.GDP.MKTP.CD?format=json');
            
            if (wbResponse.ok) {
                const wbData = await wbResponse.json();
                results.push({
                    source: 'external_financial',
                    provider: 'World Bank',
                    type: 'economic_indicator',
                    title: 'Indicadores Econômicos Globais',
                    content: JSON.stringify(wbData).substring(0, 500),
                    url: 'https://data.worldbank.org',
                    relevance: 85,
                    metadata: { api: 'world_bank' }
                });
            }
        }
    } catch (error) {
        console.error('External financial API error:', error);
    }

    return results.slice(0, maxResults);
}

async function queryWebScraping(query, maxResults) {
    // Web scraping como último recurso
    // Por enquanto, retornar vazio (implementar conforme necessidade)
    return [];
}

async function buildResponse(sources, primarySource, startTime, user, base44) {
    const responseTime = Date.now() - startTime;
    
    const allResults = [
        ...sources.knowledge_graph,
        ...sources.government_apis,
        ...sources.external_financial,
        ...sources.web_scraping
    ];

    // Log da query RAG para análise
    await base44.asServiceRole.entities.AgentInteractionLog.create({
        agent_name: 'enhanced_rag',
        user_email: user.email,
        prompt: JSON.stringify({ query: 'RAG Query' }),
        response: `${allResults.length} results`,
        response_time_ms: responseTime,
        metadata: {
            primary_source: primarySource,
            source_distribution: {
                knowledge_graph: sources.knowledge_graph.length,
                government_apis: sources.government_apis.length,
                external_financial: sources.external_financial.length,
                web_scraping: sources.web_scraping.length
            }
        }
    });

    return Response.json({
        results: allResults,
        metadata: {
            total_results: allResults.length,
            primary_source: primarySource,
            response_time_ms: responseTime,
            source_distribution: {
                knowledge_graph: sources.knowledge_graph.length,
                government_apis: sources.government_apis.length,
                external_financial: sources.external_financial.length,
                web_scraping: sources.web_scraping.length
            }
        }
    });
}