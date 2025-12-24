import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { reportData, pdfConfig, lang = 'pt' } = await req.json();

        if (!reportData) {
            return Response.json({ error: 'No report data provided' }, { status: 400 });
        }

        const config = pdfConfig || {
            title: lang === 'pt' ? 'Relatório SSOT' : 'SSOT Report',
            orientation: 'portrait',
            fontSize: 'medium',
            includeHeader: true,
            includeFooter: true,
            includeDate: true,
            includeAuthor: true,
            colorScheme: 'default'
        };

        const doc = new jsPDF({
            orientation: config.orientation || 'portrait'
        });

        const fontSizes = { small: 8, medium: 10, large: 12 };
        const baseFontSize = fontSizes[config.fontSize] || 10;
        
        let yPosition = 20;

        // Title
        if (config.includeHeader) {
            doc.setFontSize(20);
            doc.setTextColor(0, 45, 98);
            doc.text(config.title, 20, yPosition);
        
            yPosition += 10;
            doc.setFontSize(baseFontSize);
            doc.setTextColor(107, 107, 107);
            if (config.includeDate) {
                doc.text(`${lang === 'pt' ? 'Gerado em' : 'Generated on'}: ${new Date().toLocaleDateString()}`, 20, yPosition);
            }
            if (config.includeAuthor) {
                doc.text(`${lang === 'pt' ? 'Por' : 'By'}: ${user.full_name || user.email}`, 120, yPosition);
            }
            yPosition += 15;
        }

        // Process each entity
        Object.keys(reportData).forEach(entityName => {
            const data = reportData[entityName];
            if (data.length === 0) return;

            // Check if need new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // Entity Header
            doc.setFontSize(14);
            doc.setTextColor(0, 45, 98);
            doc.text(`${entityName} (${data.length} ${lang === 'pt' ? 'registros' : 'records'})`, 20, yPosition);
            yPosition += 8;

            // Draw separator line
            doc.setDrawColor(212, 175, 55);
            doc.setLineWidth(0.5);
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 6;

            // Data rows
            doc.setFontSize(baseFontSize - 1);
            const colors = {
                default: [45, 45, 45],
                monochrome: [0, 0, 0],
                vibrant: [0, 45, 98]
            };
            const [r, g, b] = colors[config.colorScheme] || colors.default;
            doc.setTextColor(r, g, b);

            data.forEach((item, idx) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                // Item name/title
                doc.setFont(undefined, 'bold');
                doc.text(`${idx + 1}. ${item.name || 'N/A'}`, 25, yPosition);
                yPosition += 5;

                doc.setFont(undefined, 'normal');
                doc.setTextColor(107, 107, 107);

                // Other fields
                const fields = Object.keys(item).filter(k => k !== 'name' && k !== 'id');
                fields.forEach(field => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    let value = item[field];
                    if (Array.isArray(value)) {
                        value = value.join(', ');
                    } else if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    }

                    const text = `   ${field}: ${value || 'N/A'}`;
                    const lines = doc.splitTextToSize(text, 160);
                    
                    lines.forEach(line => {
                        if (yPosition > 270) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(line, 25, yPosition);
                        yPosition += 4;
                    });
                });

                yPosition += 3;
            });

            yPosition += 10;
        });

        // Footer on last page
        if (config.includeFooter) {
            const pageCount = doc.internal.pages.length - 1;
            doc.setFontSize(8);
            doc.setTextColor(107, 107, 107);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`${lang === 'pt' ? 'Página' : 'Page'} ${i} ${lang === 'pt' ? 'de' : 'of'} ${pageCount}`, 170, 285);
            }
        }

        // Convert to ArrayBuffer
        const pdfBytes = doc.output('arraybuffer');

        // Upload to storage
        const file = new Blob([pdfBytes], { type: 'application/pdf' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file });

        return Response.json({
            success: true,
            pdf_url: uploadResult.file_url
        });

    } catch (error) {
        console.error('Error exporting PDF:', error);
        return Response.json({ 
            error: error.message || 'Internal server error',
            details: error.toString()
        }, { status: 500 });
    }
});