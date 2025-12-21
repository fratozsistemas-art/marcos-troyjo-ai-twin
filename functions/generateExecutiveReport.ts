import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { scenario, report_type, document_ids = [], format = 'pdf' } = await req.json();
        
        if (!scenario) {
            return Response.json({ error: 'scenario required' }, { status: 400 });
        }

        // Get RAG context if documents provided
        let ragContext = '';
        if (document_ids.length > 0) {
            const ragResponse = await base44.functions.invoke('retrieveRAGContext', {
                query: scenario,
                max_tokens: 2000
            });
            ragContext = ragResponse.data.context || '';
        }

        // Build prompt based on report type
        let analysisPrompt = '';
        
        if (report_type === 'risk_opportunity') {
            analysisPrompt = `Como Marcos Prado Troyjo, analise o seguinte cenário aplicando o Modelo Mental v2.4:

CENÁRIO: ${scenario}

${ragContext ? `\n${ragContext}\n` : ''}

Forneça análise estruturada seguindo EXATAMENTE este formato:

# ANÁLISE DE RISCO E OPORTUNIDADE

## 1. O QUE MUDOU? (Contextualização Histórica)
[Análise do movimento das placas tectônicas geopolíticas]

## 2. QUEM GANHA?
[Países, blocos e setores beneficiados]

## 3. QUEM PERDE?
[Atores prejudicados e setores sob pressão]

## 4. ESPAÇO PARA O BRASIL
[Oportunidades específicas para o Portfólio Brasil: alimentos, energia, sustentabilidade]

## 5. TIMING E AÇÃO
[Janela de oportunidade e recomendações pragmáticas]

Use as 8 lentes cognitivas e vocabulário técnico. Inclua citações dos documentos fornecidos quando relevante.`;
        } else if (report_type === 'strategic_vectors') {
            analysisPrompt = `Como Marcos Prado Troyjo, analise o seguinte cenário aplicando o framework de Vetores Estratégicos:

CENÁRIO: ${scenario}

${ragContext ? `\n${ragContext}\n` : ''}

Estruture a análise em 5 etapas:

# VETORES ESTRATÉGICOS - ${scenario}

## 1. CONTEXTO GLOBAL (World)
[Movimento do tabuleiro geoeconômico global]

## 2. FLUXOS E REALINHAMENTOS
[Comércio, IED, tecnologia, energia, confiança geopolítica]

## 3. RISCOS E OPORTUNIDADES
[Análise pela ótica do Novo ESG: Economia + Segurança + Geopolítica]

## 4. IMPLICAÇÕES BRASIL
[Como isso molda o Portfólio Brasil? Power-Shoring? Três Coroas?]

## 5. PRESCRIÇÃO ESTRATÉGICA
[Reformas + Diplomacia de Estado + Posicionamento Multivetorial]

Aplique heurísticas relevantes. Cite documentos fornecidos.`;
        } else {
            // Default strategic analysis
            analysisPrompt = `Como Marcos Prado Troyjo, forneça análise estratégica profunda sobre:

${scenario}

${ragContext ? `\n${ragContext}\n` : ''}

Use o Modelo Mental v2.4, aplicando as lentes cognitivas e heurísticas relevantes ao tema.
Mantenha tom diplomático, estrutura clara e ofereça caminhos construtivos.
Cite documentos fornecidos quando aplicável.`;
        }

        // Generate analysis using agent
        const analysisConv = await base44.asServiceRole.agents.createConversation({
            agent_name: "troyjo_twin",
            metadata: {
                purpose: 'executive_report',
                report_type,
                user_email: user.email
            }
        });

        await base44.asServiceRole.agents.addMessage(analysisConv, {
            role: 'user',
            content: analysisPrompt
        });

        // Wait for response (polling)
        let attempts = 0;
        let analysis = '';
        while (attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const conv = await base44.asServiceRole.agents.getConversation(analysisConv.id);
            const lastMessage = conv.messages[conv.messages.length - 1];
            
            if (lastMessage?.role === 'assistant' && lastMessage?.content) {
                analysis = lastMessage.content;
                break;
            }
            attempts++;
        }

        if (!analysis) {
            return Response.json({ error: 'Timeout generating analysis' }, { status: 500 });
        }

        // Generate PDF
        if (format === 'pdf') {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - 2 * margin;
            let y = 20;

            // Header
            doc.setFontSize(20);
            doc.setTextColor(0, 45, 98); // #002D62
            doc.text('RELATÓRIO EXECUTIVO', margin, y);
            y += 10;

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, y);
            y += 5;
            doc.text(`Por: ${user.full_name || user.email}`, margin, y);
            y += 10;

            // Scenario
            doc.setFontSize(12);
            doc.setTextColor(139, 21, 56); // #8B1538
            doc.text('CENÁRIO:', margin, y);
            y += 7;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const scenarioLines = doc.splitTextToSize(scenario, maxWidth);
            doc.text(scenarioLines, margin, y);
            y += scenarioLines.length * 5 + 10;

            // Analysis content
            doc.setFontSize(9);
            const lines = analysis.split('\n');
            
            for (const line of lines) {
                if (y > pageHeight - 30) {
                    doc.addPage();
                    y = 20;
                }

                if (line.startsWith('# ')) {
                    doc.setFontSize(14);
                    doc.setTextColor(0, 45, 98);
                    doc.text(line.replace('# ', ''), margin, y);
                    y += 8;
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                } else if (line.startsWith('## ')) {
                    doc.setFontSize(11);
                    doc.setTextColor(139, 21, 56);
                    doc.text(line.replace('## ', ''), margin, y);
                    y += 7;
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                } else if (line.trim()) {
                    const wrappedLines = doc.splitTextToSize(line, maxWidth);
                    doc.text(wrappedLines, margin, y);
                    y += wrappedLines.length * 5;
                } else {
                    y += 4;
                }
            }

            // Footer
            const totalPages = doc.internal.pages.length - 1;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Troyjo Digital Twin v2.4 | Página ${i} de ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            const pdfBytes = doc.output('arraybuffer');

            return new Response(pdfBytes, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename=relatorio_${Date.now()}.pdf`
                }
            });
        } else {
            // Return markdown
            const markdown = `# RELATÓRIO EXECUTIVO\n\n**Gerado em:** ${new Date().toLocaleString('pt-BR')}\n**Por:** ${user.full_name || user.email}\n\n---\n\n## CENÁRIO\n\n${scenario}\n\n---\n\n${analysis}\n\n---\n\n*Troyjo Digital Twin v2.4*`;

            return Response.json({
                content: markdown,
                format: 'markdown'
            });
        }

    } catch (error) {
        console.error('Error generating report:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});