import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';
import { checkRateLimit, getRateLimitHeaders } from './utils/rateLimiter';
import { validateInput } from './utils/inputValidator';
import { logger, withPerformanceLog } from './utils/logger';
import { cacheGet, cacheSet, CACHE_TTL } from './utils/caching';

const xai = new OpenAI({
    apiKey: Deno.env.get("XAI_API_KEY"),
    baseURL: "https://api.x.ai/v1",
});

const generateReport = async (userRequest, entities, base44, user) => {
    // Query relevant data based on natural language
    const dataContext = await gatherReportData(userRequest, entities, base44);
    
    const response = await xai.chat.completions.create({
        model: 'grok-beta',
        messages: [{
            role: 'system',
            content: `You are an expert data analyst creating strategic reports. Analyze the provided data and generate insights.

Output JSON with this structure:
{
  "title": "Report title",
  "summary": "Executive summary",
  "sections": [
    {
      "title": "Section title",
      "content": "Detailed analysis",
      "chart_type": "bar|line|pie|area",
      "chart_data": {"labels": [...], "datasets": [{...}]}
    }
  ],
  "insights": [
    {"type": "trend|warning|opportunity", "message": "insight text", "confidence": 0.9}
  ],
  "recommendations": ["action 1", "action 2"]
}`
        }, {
            role: 'user',
            content: `Generate report for: "${userRequest}"\n\nData context:\n${JSON.stringify(dataContext, null, 2)}`
        }],
        response_format: { type: "json_object" },
        temperature: 0.7,
    });

    const report = JSON.parse(response.choices[0].message.content);
    
    // Store report
    const stored = await base44.entities.Report.create({
        title: report.title,
        user_email: user.email,
        request: userRequest,
        content: report,
        type: 'ai_generated',
        metadata: {
            entities_used: entities,
            generated_at: new Date().toISOString()
        }
    });
    
    logger.audit('AI report generated', user, { reportId: stored.id, request: userRequest });
    
    return { ...report, id: stored.id };
};

const gatherReportData = async (request, entities, base44) => {
    const data = {};
    const requestLower = request.toLowerCase();
    
    // Auto-detect relevant entities
    const entityMap = {
        'strategic fact': 'StrategicFact',
        'corporate fact': 'CorporateFact',
        'article': 'Article',
        'publication': 'Publication',
        'document': 'Document',
        'event': 'Event',
        'actor': 'KeyActor',
        'risk': 'GeopoliticalRisk',
        'interaction': 'UserInteraction'
    };
    
    for (const [keyword, entityName] of Object.entries(entityMap)) {
        if (requestLower.includes(keyword) || entities?.includes(entityName)) {
            try {
                const items = await base44.entities[entityName].list('-created_date', 50);
                data[entityName] = items.slice(0, 20); // Limit for context
            } catch (e) {
                logger.warn(`Failed to fetch ${entityName}`, { error: e.message });
            }
        }
    }
    
    return data;
};

Deno.serve(async (req) => {
    const start = performance.now();
    
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const rateCheck = checkRateLimit(user.email, 'ai_operations');
        if (!rateCheck.allowed) {
            logger.security('Rate limit exceeded', { user: user.email, operation: 'generateAIReport' });
            return Response.json(
                { error: 'Too many requests' }, 
                { 
                    status: 429,
                    headers: { 
                        'Retry-After': rateCheck.retryAfter,
                        ...getRateLimitHeaders(user.email, 'ai_operations')
                    }
                }
            );
        }

        const { request: userRequest, entities } = await req.json();

        // Input validation
        const validation = validateInput(userRequest, {
            required: true,
            maxLength: 500,
            type: 'message'
        });

        if (!validation.valid) {
            logger.warn('Invalid input', { errors: validation.errors, user: user.email });
            return Response.json({ error: 'Invalid input', details: validation.errors }, { status: 400 });
        }

        // Check cache
        const cacheKey = `report:${user.email}:${userRequest}`;
        const cached = cacheGet(cacheKey);
        if (cached) {
            logger.info('Cache hit for report', { user: user.email, request: userRequest });
            return Response.json(cached);
        }

        const report = await generateReport(validation.sanitized, entities, base44, user);
        
        // Cache for 15 minutes
        cacheSet(cacheKey, report, CACHE_TTL.long);

        const duration = performance.now() - start;
        logger.perf('generateAIReport', duration, { user: user.email });

        return Response.json(report);

    } catch (error) {
        logger.error('Error generating AI report', error, { 
            duration_ms: performance.now() - start 
        });
        return Response.json({ error: error.message }, { status: 500 });
    }
});