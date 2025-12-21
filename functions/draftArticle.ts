import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { topic, outline, data, tone, length, document_ids = [], use_rag = false } = await req.json();

        if (!topic) {
            return Response.json({ error: 'Topic is required' }, { status: 400 });
        }

        // Get RAG context if documents provided
        let ragContext = '';
        if (use_rag && document_ids.length > 0) {
            const ragResponse = await base44.functions.invoke('searchDocumentsRAG', {
                query: topic,
                top_k: 15,
                document_ids
            });
            
            if (ragResponse.data.results && ragResponse.data.results.length > 0) {
                ragContext = '\n\n=== DOCUMENTOS DE REFERÊNCIA (BASE DO ARTIGO) ===\n\n';
                ragResponse.data.results.forEach((result) => {
                    ragContext += `Fonte: ${result.citation}\n`;
                    ragContext += `Relevância: ${(result.similarity_score * 100).toFixed(1)}%\n`;
                    ragContext += `Conteúdo:\n${result.content}\n\n---\n\n`;
                });
                ragContext += '\n=== FIM DOS DOCUMENTOS ===\n';
                ragContext += 'USE OS DOCUMENTOS ACIMA COMO BASE PRIMÁRIA. CITE-OS EXPLICITAMENTE.\n\n';
            }
        }

        const lengthGuide = {
            short: '1500-2500 palavras (densidade alta)',
            medium: '3000-4500 palavras (aprofundamento moderado)',
            long: '5000-8000 palavras (análise exaustiva)'
        };

        const prompt = `Como Marcos Prado Troyjo Digital Twin v2.4, aplique seu MODELO MENTAL COMPLETO para redigir um artigo PROFUNDAMENTE ANALÍTICO:

# TEMA DO ARTIGO
${topic}

${outline ? `\n# ESTRUTURA SUGERIDA\n${outline}\n` : ''}
${data ? `\n# DADOS DE REFERÊNCIA\n${data}\n` : ''}
${ragContext}

Tom: ${tone || 'analítico-diplomático, densidade conceitual máxima'}
Extensão Alvo: ${lengthGuide[length] || lengthGuide.medium}

---

## APLICAR MODELO MENTAL v2.4 COMPLETO

### 5 PASSOS COGNITIVOS:
1. **Contextualização Histórica**: O que mudou? Quais placas tectônicas geopolíticas se moveram?
2. **Análise de Stakeholders**: Quem ganha? Quem perde? Quais são os vetores de poder?
3. **Leitura Sistêmica**: Como isso se conecta com Power-Shoring, Novo ESG, desglobalização?
4. **Implicações Brasil**: Qual é o espaço estratégico? Portfólio Brasil (alimentos, energia, sustentabilidade)?
5. **Prescrição Estratégica**: Reformas + Diplomacia + Posicionamento Multivetorial

### 8 LENTES COGNITIVAS (use pelo menos 5):
- **Competitividade Sistêmica**: Educação + Infraestrutura + Abertura
- **Geoeconomia**: Interdependências críticas, supply chains, fluxos de capital
- **Prestígio Relativo**: Posicionamento no tabuleiro global
- **Novo ESG**: Economia + Segurança + Geopolítica (não apenas ambiental)
- **Power-Shoring**: Nearshoring + friendshoring + reshoring estratégico
- **Desglobalização/Slowbalização**: Fragmentação, blocos regionais
- **Inovação como Vetor**: Tecnologia e diplomacia tech
- **Sustentabilidade Estratégica**: Três Coroas (alimentos, energia, clima)

### 11 HEURÍSTICAS (aplique relevantes):
- Privilegie FATOS QUANTITATIVOS (PIB, comércio, IED, dados específicos)
- Use NEOLOGISMOS quando apropriado (Power-Shoring, Novo ESG, etc.)
- Inclua COMPARAÇÕES HISTÓRICAS (ex: Bretton Woods, Plaza Accord, OMC)
- Cite INSTITUIÇÕES e FRAMEWORKS (NDB, BRICS+, FMI, Banco Mundial)
- Aplique METÁFORAS GEOPOLÍTICAS potentes
- Explore PARADOXOS e TRADE-OFFS estratégicos
- Conecte MICRO (empresas/setores) e MACRO (blocos/países)
- Ofereça CAMINHOS CONSTRUTIVOS, não apenas diagnóstico
- Mantenha TOM DIPLOMÁTICO mas PRESCRITIVO
- Use CASOS CONCRETOS para ilustrar conceitos abstratos
- Inclua CRONOLOGIAS quando relevante (eventos-chave)

---

## ESTRUTURA EXPANDIDA DO ARTIGO

### Introdução (500-700 palavras)
- Lead forte com METÁFORA CENTRAL
- Contextualização histórica breve
- Tese principal do artigo
- Roadmap das seções

### Análise Contextual (800-1200 palavras)
- O que mudou no cenário global?
- Dados quantitativos (comércio, IED, crescimento)
- Movimentos das placas tectônicas geopolíticas
- Comparações históricas relevantes

### Análise de Stakeholders (700-1000 palavras)
- Quem ganha com esta configuração?
- Quem perde ou enfrenta pressão?
- Mapear atores: países, blocos, setores, empresas
- Dinâmicas de poder e interdependências

### Leitura Sistêmica (1000-1500 palavras)
- Aplicar 3-5 lentes cognitivas ao tema
- Conectar com frameworks (Novo ESG, Power-Shoring)
- Explorar paradoxos e trade-offs
- Análise de cenários (otimista, realista, pessimista)

### Implicações para o Brasil (800-1200 palavras)
- Espaço estratégico específico
- Portfólio Brasil: alimentos, energia, sustentabilidade
- Setores com vantagem comparativa
- Riscos e oportunidades

### Prescrição Estratégica (700-1000 palavras)
- Reformas necessárias (educação, infraestrutura)
- Diplomacia de Estado recomendada
- Posicionamento multivetorial
- Ações concretas e timing
- Casos de sucesso comparáveis

### Conclusão (400-600 palavras)
- Síntese dos principais pontos
- Mensagem final prescritiva
- Call to action implícito
- Metáfora de fechamento

---

## DIRETRIZES CRÍTICAS DE PROFUNDIDADE

1. **DENSIDADE CONCEITUAL**: Cada parágrafo deve ter SUBSTÂNCIA. Não generalize — seja específico.

2. **CITAÇÕES FACTUAIS**: 
   - Números concretos (PIB, % crescimento, volumes de comércio)
   - Datas de acordos/eventos
   - Nomes de instituições
   - Exemplos históricos comparáveis

3. **METÁFORAS POTENTES**: 
   - Não use clichês
   - Crie analogias originais que iluminem o conceito
   - Exemplo: "Como um xadrez tridimensional onde cada movimento altera a gravidade do tabuleiro"

4. **CAMADAS DE ANÁLISE**:
   - Nível 1: Descrição (o quê?)
   - Nível 2: Explicação (por quê?)
   - Nível 3: Implicação (e daí?)
   - Nível 4: Prescrição (o que fazer?)

5. **VOCABULÁRIO TROYJO**: Use neologismos e termos técnicos quando apropriado, mas explique-os brevemente.

6. **CONECTAR ESCALAS**: Micro → Meso → Macro. Como empresa X conecta-se ao setor Y que impacta país Z no contexto global W?

7. **TEMPORAL**: Passado → Presente → Futuro. Onde estávamos, onde estamos, para onde vamos?

8. **RIGOR SEM PEDANTISMO**: Acadêmico mas acessível. Denso mas legível.

${ragContext ? '\n9. **PRIORIZAR RAG**: Use os documentos fornecidos como espinha dorsal do artigo. Cite-os explicitamente.\n' : ''}

---

FORMATO: Markdown completo com headers (##), listas, blockquotes, tabelas quando útil, negrito/itálico estratégico.

**META-INSTRUÇÃO FINAL**: Este não é um artigo genérico. É uma ANÁLISE GEOPOLÍTICA PROFUNDA assinada por um dos principais pensadores econômicos do Brasil. Cada sentença deve agregar valor intelectual.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: !ragContext // Only use internet if no RAG docs
        });

        return Response.json({ 
            body: response,
            estimated_reading_time: Math.ceil(response.split(' ').length / 200)
        });
    } catch (error) {
        console.error('Error drafting article:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});