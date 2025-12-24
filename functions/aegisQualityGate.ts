import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, context = {} } = await req.json();

        if (!content) {
            return Response.json({ error: 'Content is required' }, { status: 400 });
        }

        // Executar validação AEGIS
        const validation = await validateContent(content, context);
        
        // Calcular CRV Score (Confiança, Risco, Valor)
        const crvScore = calculateCRV(validation);

        // Decisão: BLOQUEAR ou APROVAR
        const threshold = 70; // Score mínimo para aprovação
        const approved = crvScore.total >= threshold;

        // Log de auditoria AEGIS
        await base44.asServiceRole.entities.AegisAuditLog.create({
            user_email: user.email,
            content_hash: generateHash(content),
            validation_result: validation,
            crv_score: crvScore,
            approved: approved,
            threshold: threshold,
            blocked_reason: approved ? null : getBlockedReason(validation, crvScore),
            metadata: {
                context: context,
                timestamp: new Date().toISOString()
            }
        });

        if (!approved) {
            return Response.json({
                approved: false,
                blocked: true,
                reason: getBlockedReason(validation, crvScore),
                validation: validation,
                crv_score: crvScore,
                message: 'Conteúdo bloqueado pelo Protocolo AEGIS - Qualidade insuficiente'
            }, { status: 403 });
        }

        return Response.json({
            approved: true,
            blocked: false,
            validation: validation,
            crv_score: crvScore,
            message: 'Conteúdo aprovado pelo Protocolo AEGIS'
        });

    } catch (error) {
        console.error('AEGIS error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

async function validateContent(content, context) {
    const checks = {
        data_authority: await checkDataAuthority(content, context),
        brazilian_context: checkBrazilianContext(content),
        logical_consistency: checkLogicalConsistency(content),
        actionability: checkActionability(content),
        source_citation: checkSourceCitation(content)
    };

    return checks;
}

async function checkDataAuthority(content, context) {
    // Verifica se há citações de fontes confiáveis
    const authorityKeywords = [
        'segundo', 'de acordo com', 'conforme', 'dados do', 'relatório',
        'estudo', 'pesquisa', 'banco central', 'ibge', 'fmi', 'banco mundial'
    ];
    
    const hasCitation = authorityKeywords.some(kw => 
        content.toLowerCase().includes(kw)
    );

    const hasRAGContext = context.rag_documents && context.rag_documents.length > 0;

    const score = hasCitation ? 80 : (hasRAGContext ? 60 : 30);
    
    return {
        passed: score >= 50,
        score: score,
        details: `${hasCitation ? 'Citações encontradas' : 'Sem citações explícitas'}. ${hasRAGContext ? 'Contexto RAG presente' : 'Sem contexto RAG'}`
    };
}

function checkBrazilianContext(content) {
    // Verifica se há contexto brasileiro relevante
    const brazilianKeywords = [
        'brasil', 'brasileiro', 'brics', 'mercosul', 'latin', 
        'sul global', 'economia brasileira', 'política brasileira',
        'real (moeda)', 'brasília', 'governo brasileiro'
    ];
    
    const mentionCount = brazilianKeywords.filter(kw => 
        content.toLowerCase().includes(kw)
    ).length;

    const score = Math.min(100, mentionCount * 25);
    
    return {
        passed: score >= 25,
        score: score,
        details: `${mentionCount} menções ao contexto brasileiro encontradas`
    };
}

function checkLogicalConsistency(content) {
    // Verifica estrutura lógica: introdução, desenvolvimento, conclusão
    const hasIntro = content.length > 100;
    const hasStructure = content.split('\n\n').length >= 2;
    const hasConclusion = /portanto|assim|logo|conclusão|em suma/i.test(content);
    
    let score = 0;
    if (hasIntro) score += 40;
    if (hasStructure) score += 30;
    if (hasConclusion) score += 30;
    
    return {
        passed: score >= 60,
        score: score,
        details: `Estrutura: ${hasIntro ? '✓ Intro' : '✗ Intro'}, ${hasStructure ? '✓ Desenvolvimento' : '✗ Desenvolvimento'}, ${hasConclusion ? '✓ Conclusão' : '✗ Conclusão'}`
    };
}

function checkActionability(content) {
    // Verifica se há recomendações acionáveis
    const actionKeywords = [
        'recomendo', 'sugiro', 'deve', 'considere', 'ação',
        'estratégia', 'implementar', 'avaliar', 'priorizar',
        'próximos passos', 'caminho', 'direção'
    ];
    
    const hasAction = actionKeywords.some(kw => 
        content.toLowerCase().includes(kw)
    );

    const hasSpecifics = /\d+%|\d+ (meses|anos|dias)|prazo|curto prazo|médio prazo|longo prazo/i.test(content);
    
    let score = 0;
    if (hasAction) score += 60;
    if (hasSpecifics) score += 40;
    
    return {
        passed: score >= 60,
        score: score,
        details: `${hasAction ? '✓ Recomendações presentes' : '✗ Sem recomendações'}. ${hasSpecifics ? '✓ Métricas específicas' : '✗ Sem métricas'}`
    };
}

function checkSourceCitation(content) {
    // Verifica qualidade das citações
    const hasLinks = /https?:\/\//i.test(content);
    const hasYear = /20\d{2}|19\d{2}/i.test(content);
    const hasAuthor = /segundo (.*?),|conforme (.*?),/i.test(content);
    
    let score = 50; // Base score
    if (hasLinks) score += 20;
    if (hasYear) score += 15;
    if (hasAuthor) score += 15;
    
    return {
        passed: score >= 50,
        score: score,
        details: `${hasLinks ? '✓ Links' : '✗ Links'}, ${hasYear ? '✓ Anos' : '✗ Anos'}, ${hasAuthor ? '✓ Autores' : '✗ Autores'}`
    };
}

function calculateCRV(validation) {
    // CRV = Confiança + Risco (inverso) + Valor
    
    // Confiança (baseado em Data Authority + Source Citation)
    const confidence = (
        validation.data_authority.score * 0.6 +
        validation.source_citation.score * 0.4
    );
    
    // Risco (inverso da Consistência Lógica - quanto maior consistência, menor risco)
    const risk = 100 - validation.logical_consistency.score;
    
    // Valor (baseado em Brazilian Context + Actionability)
    const value = (
        validation.brazilian_context.score * 0.4 +
        validation.actionability.score * 0.6
    );
    
    const total = Math.round((confidence * 0.4 + (100 - risk) * 0.3 + value * 0.3));
    
    return {
        confidence: Math.round(confidence),
        risk: Math.round(risk),
        value: Math.round(value),
        total: total
    };
}

function getBlockedReason(validation, crvScore) {
    const failures = [];
    
    if (!validation.data_authority.passed) {
        failures.push('Falta de autoridade de dados');
    }
    if (!validation.brazilian_context.passed) {
        failures.push('Contexto brasileiro insuficiente');
    }
    if (!validation.logical_consistency.passed) {
        failures.push('Inconsistência lógica');
    }
    if (!validation.actionability.passed) {
        failures.push('Falta de acionabilidade');
    }
    if (!validation.source_citation.passed) {
        failures.push('Citações inadequadas');
    }
    
    return `Score CRV: ${crvScore.total}/100. Falhas: ${failures.join(', ')}`;
}

function generateHash(content) {
    // Hash simples para identificação
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}