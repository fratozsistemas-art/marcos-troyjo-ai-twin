import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            topic,
            module_type = 'complete', // 'lecture', 'reading', 'exercise', 'case_study', 'complete'
            target_level = 'intermediate', // 'basic', 'intermediate', 'advanced'
            language = 'pt',
            reviewed_by_couto = false,
            context = {}
        } = await req.json();

        if (!topic) {
            return Response.json({ error: 'Topic is required' }, { status: 400 });
        }

        const startTime = Date.now();
        const modules = {};

        // Gerar componentes conforme tipo solicitado
        if (module_type === 'complete' || module_type === 'lecture') {
            modules.lecture = await generateLecture(base44, topic, target_level, language, context);
        }

        if (module_type === 'complete' || module_type === 'reading') {
            modules.reading = await generateReading(base44, topic, target_level, language, context);
        }

        if (module_type === 'complete' || module_type === 'exercise') {
            modules.exercise = await generateExercise(base44, topic, target_level, language, context);
        }

        if (module_type === 'complete' || module_type === 'case_study') {
            modules.case_study = await generateCaseStudy(base44, topic, target_level, language, context);
        }

        // Aplicar assinatura
        const signature = reviewed_by_couto 
            ? `\n\n---\n**${language === 'pt' ? 'Módulo desenvolvido por' : 'Module developed by'}:** Marcos Troyjo & Couto Silva\n**Innova Academy**`
            : `\n\n---\n**${language === 'pt' ? 'Módulo desenvolvido por' : 'Module developed by'}:** Marcos Troyjo\n**Innova Academy** - ${language === 'pt' ? 'Versão draft' : 'Draft version'}`;

        // Compilar conteúdo final
        const header = `# ${language === 'pt' ? 'Módulo Educacional' : 'Educational Module'}: ${topic}\n\n` +
                      `**${language === 'pt' ? 'Nível' : 'Level'}:** ${target_level}\n` +
                      `**${language === 'pt' ? 'Componentes' : 'Components'}:** ${Object.keys(modules).join(', ')}\n` +
                      `**${language === 'pt' ? 'Data de criação' : 'Creation date'}:** December 24, 2025\n\n` +
                      `---\n\n`;

        let finalContent = header;

        if (modules.lecture) finalContent += `## ${language === 'pt' ? 'AULA' : 'LECTURE'}\n\n${modules.lecture}\n\n---\n\n`;
        if (modules.reading) finalContent += `## ${language === 'pt' ? 'LEITURA' : 'READING'}\n\n${modules.reading}\n\n---\n\n`;
        if (modules.exercise) finalContent += `## ${language === 'pt' ? 'EXERCÍCIOS' : 'EXERCISES'}\n\n${modules.exercise}\n\n---\n\n`;
        if (modules.case_study) finalContent += `## ${language === 'pt' ? 'ESTUDO DE CASO' : 'CASE STUDY'}\n\n${modules.case_study}\n\n---\n\n`;

        finalContent += signature;

        // Log
        await base44.asServiceRole.entities.AgentInteractionLog.create({
            agent_name: 'content_generator',
            user_email: user.email,
            prompt: `Generate Education Module: ${topic} (${module_type})`,
            response: `Generated ${Object.keys(modules).length} components`,
            response_time_ms: Date.now() - startTime,
            metadata: {
                content_type: 'education-module',
                topic: topic,
                module_type: module_type,
                target_level: target_level,
                components: Object.keys(modules),
                reviewed_by_couto: reviewed_by_couto
            }
        });

        return Response.json({
            content: finalContent,
            modules: modules,
            metadata: {
                content_type: 'education-module',
                topic: topic,
                module_type: module_type,
                target_level: target_level,
                components: Object.keys(modules),
                language: language,
                reviewed_by_couto: reviewed_by_couto,
                signature: reviewed_by_couto ? 'dual' : 'single',
                generation_time_ms: Date.now() - startTime
            }
        });

    } catch (error) {
        console.error('Education Module generation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

async function generateLecture(base44, topic, level, language, context) {
    const prompt = language === 'pt' 
        ? `Crie uma aula expositiva sobre "${topic}" para nível ${level}.

Estrutura:
1. Objetivos de aprendizagem (3-5)
2. Introdução motivadora (5 min)
3. Conceitos fundamentais (15 min)
4. Exemplos práticos e dados (15 min)
5. Aplicações ao contexto brasileiro (10 min)
6. Discussão e perguntas (10 min)

Requisitos:
- Slides conceituais descritos (não precisa criar os slides, apenas descrever)
- Pontos de pausa para discussão
- Perguntas para verificar compreensão
- Recursos adicionais sugeridos`
        : `Create a lecture on "${topic}" for ${level} level.

Structure:
1. Learning objectives (3-5)
2. Motivating introduction (5 min)
3. Fundamental concepts (15 min)
4. Practical examples and data (15 min)
5. Applications to Brazilian context (10 min)
6. Discussion and questions (10 min)

Requirements:
- Conceptual slides described (no need to create slides, just describe)
- Discussion pause points
- Comprehension check questions
- Suggested additional resources`;

    const response = await base44.functions.invoke('intelligentLLMRouter', {
        query: prompt,
        context: { systemPrompt: getEducationSystemPrompt(language) }
    });

    return response.data.response;
}

async function generateReading(base44, topic, level, language, context) {
    const prompt = language === 'pt'
        ? `Escreva um texto de leitura complementar sobre "${topic}" para nível ${level}.

Formato:
- 2000-3000 palavras
- Introdução contextual
- Desenvolvimento em seções claras
- Boxes com "Para saber mais" e "Conceitos-chave"
- Conexões com casos brasileiros e globais
- Bibliografia comentada (5-7 fontes)`
        : `Write a supplementary reading text on "${topic}" for ${level} level.

Format:
- 2000-3000 words
- Contextual introduction
- Development in clear sections
- Boxes with "Learn more" and "Key concepts"
- Connections to Brazilian and global cases
- Annotated bibliography (5-7 sources)`;

    const response = await base44.functions.invoke('intelligentLLMRouter', {
        query: prompt,
        context: { systemPrompt: getEducationSystemPrompt(language) }
    });

    return response.data.response;
}

async function generateExercise(base44, topic, level, language, context) {
    const prompt = language === 'pt'
        ? `Crie um conjunto de exercícios sobre "${topic}" para nível ${level}.

Incluir:
1. Questões conceituais (5-7)
   - Múltipla escolha
   - Verdadeiro/Falso com justificativa
   - Questões dissertativas curtas

2. Exercício prático (1)
   - Problema real para resolver
   - Análise de dados ou cenário
   - Guia passo-a-passo

3. Gabarito comentado
   - Respostas corretas
   - Explicação dos erros comuns
   - Conceitos reforçados`
        : `Create a set of exercises on "${topic}" for ${level} level.

Include:
1. Conceptual questions (5-7)
   - Multiple choice
   - True/False with justification
   - Short essay questions

2. Practical exercise (1)
   - Real problem to solve
   - Data or scenario analysis
   - Step-by-step guide

3. Answer key with comments
   - Correct answers
   - Explanation of common errors
   - Reinforced concepts`;

    const response = await base44.functions.invoke('intelligentLLMRouter', {
        query: prompt,
        context: { systemPrompt: getEducationSystemPrompt(language) }
    });

    return response.data.response;
}

async function generateCaseStudy(base44, topic, level, language, context) {
    const prompt = language === 'pt'
        ? `Desenvolva um estudo de caso sobre "${topic}" para nível ${level}.

Estrutura:
1. Contexto e cenário (500 palavras)
   - Situação real ou realística
   - Atores envolvidos
   - Dilema ou desafio central

2. Dados e informações (tabelas, gráficos conceituais)

3. Perguntas para análise (5-7)
   - De compreensão
   - De aplicação
   - De avaliação crítica

4. Guia do instrutor
   - Pontos-chave a explorar
   - Possíveis direções de discussão
   - Conceitos teóricos relacionados`
        : `Develop a case study on "${topic}" for ${level} level.

Structure:
1. Context and scenario (500 words)
   - Real or realistic situation
   - Involved actors
   - Central dilemma or challenge

2. Data and information (tables, conceptual charts)

3. Analysis questions (5-7)
   - Comprehension
   - Application
   - Critical evaluation

4. Instructor guide
   - Key points to explore
   - Possible discussion directions
   - Related theoretical concepts`;

    const response = await base44.functions.invoke('intelligentLLMRouter', {
        query: prompt,
        context: { systemPrompt: getEducationSystemPrompt(language) }
    });

    return response.data.response;
}

function getEducationSystemPrompt(language) {
    const ptPrompt = `Você é o Digital Twin de Marcos Troyjo, criando material educacional para a Innova Academy.

Princípios pedagógicos:
- Partir do concreto (casos, exemplos) para o abstrato (conceitos)
- Conectar sempre com a realidade brasileira
- Promover pensamento crítico, não apenas memorização
- Integrar múltiplas perspectivas (global, regional, local)

Estilo educacional:
- Acessível mas rigoroso
- Uso de perguntas socráticas
- Exemplos contemporâneos e relevantes
- Estímulo ao debate e à aplicação prática

Foco Innova Academy:
- Preparação para mercado e formulação de políticas
- Desenvolvimento de soft skills (pensamento crítico, comunicação)
- Conexão teoria-prática
- Ênfase em competências do século XXI`;

    const enPrompt = `You are the Digital Twin of Marcos Troyjo, creating educational material for Innova Academy.

Pedagogical principles:
- Start from concrete (cases, examples) to abstract (concepts)
- Always connect with Brazilian reality
- Promote critical thinking, not just memorization
- Integrate multiple perspectives (global, regional, local)

Educational style:
- Accessible but rigorous
- Use of Socratic questions
- Contemporary and relevant examples
- Stimulate debate and practical application

Innova Academy focus:
- Preparation for market and policy formulation
- Soft skills development (critical thinking, communication)
- Theory-practice connection
- Emphasis on 21st century competencies`;

    return language === 'pt' ? ptPrompt : enPrompt;
}