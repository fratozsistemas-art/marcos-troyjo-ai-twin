import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { reportData, config, lang = 'pt' } = await req.json();

        if (!reportData) {
            return Response.json({ error: 'No report data provided' }, { status: 400 });
        }

        const doc = new jsPDF();
        let yPosition = 20;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(0, 45, 98);
        doc.text(lang === 'pt' ? 'Relatório SSOT' : 'SSOT Report', 20, yPosition);
        
        yPosition += 10;
        doc.setFontSize(10);
        doc.setTextColor(107, 107, 107);
        doc.text(`${lang === 'pt' ? 'Gerado em' : 'Generated on'}: ${new Date().toLocaleDateString()}`, 20, yPosition);
        doc.text(`${lang === 'pt' ? 'Por' : 'By'}: ${user.full_name || user.email}`, 120, yPosition);

        yPosition += 15;

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
            doc.setFontSize(9);
            doc.setTextColor(45, 45, 45);

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
        const pageCount = doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.setTextColor(107, 107, 107);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`${lang === 'pt' ? 'Página' : 'Page'} ${i} ${lang === 'pt' ? 'de' : 'of'} ${pageCount}`, 170, 285);
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