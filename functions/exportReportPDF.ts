import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';
import { checkRateLimit } from './utils/rateLimiter';
import { logger } from './utils/logger';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rateCheck = checkRateLimit(user.email, 'exports');
        if (!rateCheck.allowed) {
            return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const { report_id } = await req.json();

        const report = await base44.entities.Report.filter({ id: report_id });
        if (!report || report.length === 0) {
            return Response.json({ error: 'Report not found' }, { status: 404 });
        }

        const reportData = report[0];
        const content = typeof reportData.content === 'string' 
            ? JSON.parse(reportData.content) 
            : reportData.content;

        const doc = new jsPDF();
        let y = 20;

        // Title
        doc.setFontSize(20);
        doc.text(content.title, 20, y);
        y += 15;

        // Summary
        doc.setFontSize(12);
        doc.text('Summary:', 20, y);
        y += 7;
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(content.summary, 170);
        doc.text(summaryLines, 20, y);
        y += summaryLines.length * 5 + 10;

        // Sections
        if (content.sections) {
            for (const section of content.sections) {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFontSize(14);
                doc.text(section.title, 20, y);
                y += 7;

                doc.setFontSize(10);
                const contentLines = doc.splitTextToSize(section.content, 170);
                doc.text(contentLines, 20, y);
                y += contentLines.length * 5 + 10;
            }
        }

        // Insights
        if (content.insights && content.insights.length > 0) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);
            doc.text('Key Insights:', 20, y);
            y += 7;

            doc.setFontSize(10);
            content.insights.forEach((insight) => {
                const insightLines = doc.splitTextToSize(`• ${insight.message}`, 170);
                doc.text(insightLines, 20, y);
                y += insightLines.length * 5 + 2;
            });
            y += 5;
        }

        // Recommendations
        if (content.recommendations && content.recommendations.length > 0) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);
            doc.text('Recommendations:', 20, y);
            y += 7;

            doc.setFontSize(10);
            content.recommendations.forEach((rec, idx) => {
                const recLines = doc.splitTextToSize(`${idx + 1}. ${rec}`, 170);
                doc.text(recLines, 20, y);
                y += recLines.length * 5 + 2;
            });
        }

        const pdfBytes = doc.output('arraybuffer');

        logger.audit('Report exported', user, { reportId: report_id });

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${content.title}.pdf"`
            }
        });

    } catch (error) {
        logger.error('Error exporting report', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});