// Análise avançada de perfil baseada em padrões linguísticos e semânticos

const TECHNICAL_KEYWORDS = {
    alto: ['geoeconômica', 'multilateralismo', 'competitividade sistêmica', 'cadeias globais', 
           'IED', 'policrise', 'ESG', 'indústria 4.0', 'nearshoring', 'friendshoring'],
    medio: ['economia', 'comércio', 'investimento', 'exportação', 'mercado', 'crescimento',
            'desenvolvimento', 'política', 'internacional', 'global'],
    basico: ['preço', 'emprego', 'salário', 'inflação', 'dólar', 'brasil', 'governo']
};

const QUESTION_PATTERNS = {
    academico: [/como.*teoria/i, /segundo.*autor/i, /literatura.*sobre/i, /framework.*de/i, /modelo.*conceitual/i],
    gestor: [/como.*implementar/i, /estratégia.*para/i, /recomenda.*que/i, /passos.*para/i, /plano.*de/i],
    tecnico: [/dados.*sobre/i, /análise.*de/i, /impacto.*de/i, /cenário.*de/i, /projeção/i],
    intermediario: [/explica.*como/i, /por que.*brasil/i, /qual.*futuro/i, /o que.*significa/i],
    leigo: [/o que é/i, /como funciona/i, /ajuda.*entender/i, /simples/i, /básico/i]
};

const DOMAIN_INDICATORS = {
    institucional: ['acordo', 'tratado', 'protocolo', 'convenção', 'multilateral', 'ONU', 'OMC', 'BRICS'],
    academico: ['tese', 'pesquisa', 'estudo', 'paper', 'artigo', 'bibliografia', 'metodologia'],
    corporativo: ['empresa', 'negócio', 'mercado', 'concorrência', 'ROI', 'estratégia', 'gestão']
};

export function analyzeUserProfile(messageHistory) {
    if (!messageHistory || messageHistory.length === 0) {
        return {
            level: 'intermediario',
            confidence: 0,
            technicality: 50,
            complexity: 'media',
            keywords: []
        };
    }

    const userMessages = messageHistory.filter(m => m.role === 'user');
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;

    // 1. Análise de keywords técnicas
    let technicalScore = 0;
    let foundKeywords = [];

    Object.entries(TECHNICAL_KEYWORDS).forEach(([level, keywords]) => {
        keywords.forEach(keyword => {
            if (allText.includes(keyword.toLowerCase())) {
                foundKeywords.push(keyword);
                technicalScore += level === 'alto' ? 15 : level === 'medio' ? 8 : 3;
            }
        });
    });

    // 2. Análise de padrões de perguntas
    let patternMatch = null;
    let patternScore = 0;

    Object.entries(QUESTION_PATTERNS).forEach(([level, patterns]) => {
        patterns.forEach(pattern => {
            if (pattern.test(allText)) {
                patternMatch = level;
                patternScore = 20;
            }
        });
    });

    // 3. Análise de domínio
    let domainType = null;
    Object.entries(DOMAIN_INDICATORS).forEach(([domain, indicators]) => {
        const matches = indicators.filter(ind => allText.includes(ind.toLowerCase())).length;
        if (matches > 2) {
            domainType = domain;
        }
    });

    // 4. Análise de complexidade sintática
    const longSentences = userMessages.filter(m => m.content.length > 200).length;
    const questionComplexity = userMessages.filter(m => 
        (m.content.match(/\?/g) || []).length > 1 || 
        m.content.split(',').length > 3
    ).length;

    const complexityScore = (longSentences * 10) + (questionComplexity * 8);

    // 5. Cálculo do score total
    let totalScore = technicalScore + patternScore + complexityScore;
    
    // Bonus por tamanho médio de mensagem
    if (avgLength > 300) totalScore += 15;
    else if (avgLength > 150) totalScore += 8;
    else if (avgLength < 50) totalScore -= 10;

    // 6. Determinação do nível
    let level;
    let technicality;

    if (totalScore >= 70 || domainType === 'academico') {
        level = 'academico';
        technicality = 85;
    } else if (totalScore >= 50 || patternMatch === 'tecnico') {
        level = 'tecnico';
        technicality = 70;
    } else if (domainType === 'corporativo' || patternMatch === 'gestor') {
        level = 'gestor';
        technicality = 60;
    } else if (totalScore >= 30 || patternMatch === 'intermediario') {
        level = 'intermediario';
        technicality = 50;
    } else {
        level = 'leigo';
        technicality = 30;
    }

    // Se há indicadores institucionais fortes, sobrescreve para modo diplomático
    if (domainType === 'institucional') {
        level = 'institucional';
    }

    // 7. Cálculo de confiança
    const confidence = Math.min(100, 
        (userMessages.length * 10) + 
        (foundKeywords.length * 5) + 
        (patternMatch ? 15 : 0) +
        (domainType ? 10 : 0)
    );

    // 8. Determinação de complexidade
    let complexity;
    if (totalScore >= 60) complexity = 'alta';
    else if (totalScore >= 35) complexity = 'media';
    else complexity = 'baixa';

    return {
        level,
        confidence,
        technicality,
        complexity,
        keywords: foundKeywords.slice(0, 5),
        avgMessageLength: Math.round(avgLength),
        totalScore,
        domainType,
        patternMatch
    };
}

export function getAdaptationSuggestion(profile) {
    const { level, technicality, confidence } = profile;

    const suggestions = {
        leigo: 'Use analogias simples e evite jargões. Explique cada conceito antes de usá-lo.',
        intermediario: 'Equilibre acessibilidade com precisão técnica. Use termos técnicos com breve contexto.',
        tecnico: 'Aprofunde análise com dados, modelos e comparações internacionais.',
        gestor: 'Foque em recomendações práticas e aplicabilidade imediata. Use formato executivo.',
        academico: 'Fundamente com teoria, citações e rigor metodológico. Mencione literatura relevante.',
        institucional: 'Mantenha tom cerimonioso e foco em princípios multilaterais.'
    };

    return {
        suggestion: suggestions[level],
        adjustTechnicality: technicality,
        confidence: confidence,
        shouldMonitor: confidence < 60
    };
}