import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'npm:docx@8.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            scenario, 
            report_type, 
            template = 'complete',
            sections = [],
            document_ids = [], 
            format = 'pdf' 
        } = await req.json();
        
        if (!scenario) {
            return Response.json({ error: 'scenario required' }, { status: 400 });
        }

        // Get RAG context if documents provided
        let ragContext = '';
        let ragSources = [];
        if (document_ids.length > 0) {
            const ragResponse = await base44.functions.invoke('retrieveRAGContext', {
                query: scenario,
                max_tokens: 2000
            });
            ragContext = ragResponse.data.context || '';
            ragSources = ragResponse.data.sources || [];
        }

        // Build prompt based on template and sections
        let analysisPrompt = '';
        
        if (template === 'executive_summary') {
            analysisPrompt = `Como Marcos Prado Troyjo, forneça um SUMÁRIO EXECUTIVO conciso (máximo 500 palavras) sobre:

CENÁRIO: ${scenario}

${ragContext}

Estrutura:
• Síntese do movimento geopolítico
• Implicações-chave para o Brasil
• 3 recomendações estratégicas prioritárias

Tom: direto, prescritivo, densidade máxima.`;
        } else if (template === 'complete') {
            // Build custom sections if provided
            const sectionInstructions = sections.length > 0 ? 
                `\n\nINCLUA APENAS ESTAS SEÇÕES:\n${sections.map(s => `- ${s}`).join('\n')}` :
                '';

            if (report_type === 'risk_opportunity') {
                analysisPrompt = `Como Marcos Prado Troyjo, analise o seguinte cenário aplicando o Modelo Mental v2.4:

CENÁRIO: ${scenario}

${ragContext}

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

${sectionInstructions}

Use as 8 lentes cognitivas e vocabulário técnico. Inclua citações dos documentos fornecidos quando relevante.`;
            } else if (report_type === 'strategic_vectors') {
                analysisPrompt = `Como Marcos Prado Troyjo, analise o seguinte cenário aplicando o framework de Vetores Estratégicos:

CENÁRIO: ${scenario}

${ragContext}

Estruture a análise em 5 etapas:

# VETORES ESTRATÉGICOS

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

${sectionInstructions}

Aplique heurísticas relevantes. Cite documentos fornecidos.`;
            } else {
                analysisPrompt = `Como Marcos Prado Troyjo, forneça análise estratégica profunda sobre:

${scenario}

${ragContext}

${sectionInstructions}

Use o Modelo Mental v2.4, aplicando as lentes cognitivas e heurísticas relevantes ao tema.
Mantenha tom diplomático, estrutura clara e ofereça caminhos construtivos.
Cite documentos fornecidos quando aplicável.`;
            }
        }

        // Generate analysis using agent
        const analysisConv = await base44.asServiceRole.agents.createConversation({
            agent_name: "troyjo_twin",
            metadata: {
                purpose: 'executive_report',
                report_type,
                template,
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
        while (attempts < 40) {
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

        // Filter sections if requested
        if (sections.length > 0) {
            analysis = filterSections(analysis, sections);
        }

        // Generate based on format
        if (format === 'pdf') {
            return generatePDF(analysis, scenario, user, ragSources, template);
        } else if (format === 'docx') {
            return generateDOCX(analysis, scenario, user, ragSources, template);
        } else {
            // Return markdown
            const markdown = buildMarkdown(analysis, scenario, user, ragSources, template);
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

function filterSections(analysis, selectedSections) {
    const lines = analysis.split('\n');
    let filtered = [];
    let includeSection = false;
    
    for (const line of lines) {
        if (line.startsWith('## ')) {
            const sectionTitle = line.replace('## ', '').trim();
            includeSection = selectedSections.some(s => 
                sectionTitle.toLowerCase().includes(s.toLowerCase())
            );
        }
        
        if (includeSection || line.startsWith('# ')) {
            filtered.push(line);
        }
    }
    
    return filtered.join('\n');
}

function buildMarkdown(analysis, scenario, user, sources, template) {
    let markdown = `# RELATÓRIO EXECUTIVO\n\n`;
    markdown += `**Template:** ${template === 'executive_summary' ? 'Sumário Executivo' : 'Análise Completa'}\n`;
    markdown += `**Gerado em:** ${new Date().toLocaleString('pt-BR')}\n`;
    markdown += `**Por:** ${user.full_name || user.email}\n\n`;
    markdown += `---\n\n## CENÁRIO\n\n${scenario}\n\n---\n\n${analysis}\n\n`;
    
    if (sources.length > 0) {
        markdown += `---\n\n## FONTES CONSULTADAS\n\n`;
        sources.forEach((source, idx) => {
            markdown += `${idx + 1}. ${source.document_name} (similaridade: ${(source.similarity * 100).toFixed(0)}%)\n`;
        });
        markdown += '\n';
    }
    
    markdown += `---\n\n*Troyjo Digital Twin v2.4 | Modelo Mental Superset*`;
    return markdown;
}

function generatePDF(analysis, scenario, user, sources, template) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 45, 98);
    doc.text('RELATÓRIO EXECUTIVO', margin, y);
    y += 10;

    doc.setFontSize(9);
    doc.setTextColor(139, 21, 56);
    doc.text(`Template: ${template === 'executive_summary' ? 'Sumário Executivo' : 'Análise Completa'}`, margin, y);
    y += 5;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, y);
    y += 5;
    doc.text(`Por: ${user.full_name || user.email}`, margin, y);
    y += 12;

    // Scenario
    doc.setFontSize(12);
    doc.setTextColor(139, 21, 56);
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
            y += 3;
            doc.setFontSize(11);
            doc.setTextColor(139, 21, 56);
            doc.text(line.replace('## ', ''), margin, y);
            y += 7;
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
        } else if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
            doc.setTextColor(100, 100, 100);
            const wrappedLines = doc.splitTextToSize(line, maxWidth);
            doc.text(wrappedLines, margin, y);
            y += wrappedLines.length * 5;
            doc.setTextColor(0, 0, 0);
        } else if (line.trim()) {
            const wrappedLines = doc.splitTextToSize(line, maxWidth);
            doc.text(wrappedLines, margin, y);
            y += wrappedLines.length * 5;
        } else {
            y += 4;
        }
    }

    // Sources
    if (sources.length > 0) {
        if (y > pageHeight - 60) {
            doc.addPage();
            y = 20;
        }
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(139, 21, 56);
        doc.text('FONTES CONSULTADAS', margin, y);
        y += 8;
        
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        sources.forEach((source, idx) => {
            if (y > pageHeight - 25) {
                doc.addPage();
                y = 20;
            }
            const sourceText = `${idx + 1}. ${source.document_name} (${(source.similarity * 100).toFixed(0)}% relevância)`;
            doc.text(sourceText, margin, y);
            y += 5;
        });
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
}

function generateDOCX(analysis, scenario, user, sources, template) {
    const paragraphs = [];

    // Title
    paragraphs.push(
        new Paragraph({
            text: 'RELATÓRIO EXECUTIVO',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        })
    );

    // Metadata
    paragraphs.push(
        new Paragraph({
            children: [
                new TextRun({ text: 'Template: ', bold: true }),
                new TextRun(template === 'executive_summary' ? 'Sumário Executivo' : 'Análise Completa')
            ],
            spacing: { after: 100 }
        })
    );

    paragraphs.push(
        new Paragraph({
            children: [
                new TextRun({ text: 'Gerado em: ', bold: true }),
                new TextRun(new Date().toLocaleString('pt-BR'))
            ],
            spacing: { after: 100 }
        })
    );

    paragraphs.push(
        new Paragraph({
            children: [
                new TextRun({ text: 'Por: ', bold: true }),
                new TextRun(user.full_name || user.email)
            ],
            spacing: { after: 400 }
        })
    );

    // Scenario
    paragraphs.push(
        new Paragraph({
            text: 'CENÁRIO',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 }
        })
    );

    paragraphs.push(
        new Paragraph({
            text: scenario,
            spacing: { after: 400 }
        })
    );

    // Analysis
    const lines = analysis.split('\n');
    
    for (const line of lines) {
        if (line.startsWith('# ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.replace('# ', ''),
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 200 }
                })
            );
        } else if (line.startsWith('## ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.replace('## ', ''),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 250, after: 150 }
                })
            );
        } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            paragraphs.push(
                new Paragraph({
                    text: line.replace(/^[•\-]\s*/, ''),
                    bullet: { level: 0 },
                    spacing: { after: 100 }
                })
            );
        } else if (line.trim()) {
            paragraphs.push(
                new Paragraph({
                    text: line,
                    spacing: { after: 150 }
                })
            );
        } else {
            paragraphs.push(new Paragraph({ text: '' }));
        }
    }

    // Sources
    if (sources.length > 0) {
        paragraphs.push(
            new Paragraph({
                text: 'FONTES CONSULTADAS',
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
            })
        );

        sources.forEach((source, idx) => {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${idx + 1}. ${source.document_name}`, bold: true }),
                        new TextRun(` (${(source.similarity * 100).toFixed(0)}% relevância)`)
                    ],
                    spacing: { after: 100 }
                })
            );
        });
    }

    // Footer
    paragraphs.push(
        new Paragraph({
            text: 'Troyjo Digital Twin v2.4 | Modelo Mental Superset',
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 }
        })
    );

    const document = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(1),
                        right: convertInchesToTwip(1),
                        bottom: convertInchesToTwip(1),
                        left: convertInchesToTwip(1)
                    }
                }
            },
            children: paragraphs
        }]
    });

    // This is a workaround - docx package expects Node.js Packer
    // We'll return the document structure as JSON and handle conversion client-side
    return Response.json({
        format: 'docx',
        content: analysis,
        scenario,
        user: user.full_name || user.email,
        sources,
        template,
        timestamp: new Date().toISOString()
    });
}