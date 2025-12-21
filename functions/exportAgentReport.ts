import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            agent_name = 'troyjo_twin',
            date_filter = '30',
            format = 'pdf'
        } = await req.json();

        // Fetch data
        const allLogs = await base44.asServiceRole.entities.AgentInteractionLog.filter({
            agent_name
        });

        // Apply date filter
        const cutoffDate = new Date();
        if (date_filter !== 'all') {
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(date_filter));
        }
        const filteredLogs = date_filter === 'all' ? allLogs : allLogs.filter(log => 
            new Date(log.created_date) >= cutoffDate
        );

        // Calculate metrics
        const totalInteractions = filteredLogs.length;
        const avgResponseTime = filteredLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalInteractions;
        const logsWithFeedback = filteredLogs.filter(l => l.feedback_score);
        const avgFeedback = logsWithFeedback.length > 0 
            ? logsWithFeedback.reduce((sum, log) => sum + log.feedback_score, 0) / logsWithFeedback.length 
            : 0;

        // Interactions by persona
        const byPersona = {};
        filteredLogs.forEach(log => {
            const persona = log.persona_mode || 'não especificado';
            byPersona[persona] = (byPersona[persona] || 0) + 1;
        });

        // Feedback distribution
        const feedbackCounts = { positive: 0, negative: 0, neutral: 0 };
        filteredLogs.forEach(log => {
            if (log.feedback_score >= 4) feedbackCounts.positive++;
            else if (log.feedback_score <= 2) feedbackCounts.negative++;
            else if (log.feedback_score === 3) feedbackCounts.neutral++;
        });

        // RAG usage
        const ragUsed = filteredLogs.filter(l => l.used_rag).length;

        if (format === 'pdf') {
            const doc = new jsPDF();
            let yPos = 20;

            // Title
            doc.setFontSize(20);
            doc.setTextColor(0, 45, 98);
            doc.text('Agent Performance Report', 20, yPos);
            yPos += 10;

            // Subtitle
            doc.setFontSize(12);
            doc.setTextColor(51, 63, 72);
            doc.text(`Agent: ${agent_name}`, 20, yPos);
            yPos += 6;
            doc.text(`Period: ${date_filter === 'all' ? 'All Time' : `Last ${date_filter} days`}`, 20, yPos);
            yPos += 6;
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
            yPos += 15;

            // Summary Metrics
            doc.setFontSize(16);
            doc.setTextColor(0, 45, 98);
            doc.text('Summary Metrics', 20, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setTextColor(51, 63, 72);
            doc.text(`Total Interactions: ${totalInteractions}`, 25, yPos);
            yPos += 7;
            doc.text(`Avg Response Time: ${Math.round(avgResponseTime)} ms`, 25, yPos);
            yPos += 7;
            doc.text(`Avg Feedback Score: ${avgFeedback.toFixed(2)} / 5`, 25, yPos);
            yPos += 7;
            doc.text(`RAG Usage: ${ragUsed} (${((ragUsed / totalInteractions) * 100).toFixed(1)}%)`, 25, yPos);
            yPos += 15;

            // Interactions by Persona
            doc.setFontSize(16);
            doc.setTextColor(0, 45, 98);
            doc.text('Interactions by Persona', 20, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setTextColor(51, 63, 72);
            Object.entries(byPersona).forEach(([persona, count]) => {
                const percentage = ((count / totalInteractions) * 100).toFixed(1);
                doc.text(`${persona}: ${count} (${percentage}%)`, 25, yPos);
                yPos += 7;
            });
            yPos += 10;

            // Feedback Distribution
            doc.setFontSize(16);
            doc.setTextColor(0, 45, 98);
            doc.text('Feedback Distribution', 20, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setTextColor(51, 63, 72);
            const totalFeedback = feedbackCounts.positive + feedbackCounts.negative + feedbackCounts.neutral;
            if (totalFeedback > 0) {
                doc.setTextColor(16, 185, 129);
                doc.text(`Positive: ${feedbackCounts.positive} (${((feedbackCounts.positive / totalFeedback) * 100).toFixed(1)}%)`, 25, yPos);
                yPos += 7;
                doc.setTextColor(107, 114, 128);
                doc.text(`Neutral: ${feedbackCounts.neutral} (${((feedbackCounts.neutral / totalFeedback) * 100).toFixed(1)}%)`, 25, yPos);
                yPos += 7;
                doc.setTextColor(239, 68, 68);
                doc.text(`Negative: ${feedbackCounts.negative} (${((feedbackCounts.negative / totalFeedback) * 100).toFixed(1)}%)`, 25, yPos);
                yPos += 15;
            } else {
                doc.setTextColor(51, 63, 72);
                doc.text('No feedback data available', 25, yPos);
                yPos += 15;
            }

            // Top Queries (if space)
            if (yPos < 250) {
                doc.setFontSize(16);
                doc.setTextColor(0, 45, 98);
                doc.text('Recent Interactions', 20, yPos);
                yPos += 10;

                doc.setFontSize(9);
                doc.setTextColor(51, 63, 72);
                const recentLogs = filteredLogs.slice(-10).reverse();
                recentLogs.forEach(log => {
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 20;
                    }
                    const date = new Date(log.created_date).toLocaleString();
                    const prompt = log.prompt?.substring(0, 60) + (log.prompt?.length > 60 ? '...' : '');
                    doc.text(`${date} - ${prompt}`, 25, yPos);
                    yPos += 5;
                });
            }

            // Footer
            const pageCount = doc.internal.pages.length - 1;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            }

            const pdfBytes = doc.output('arraybuffer');

            return new Response(pdfBytes, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename=agent-report-${agent_name}-${Date.now()}.pdf`
                }
            });

        } else if (format === 'json') {
            // Return structured data for frontend processing
            return Response.json({
                summary: {
                    total_interactions: totalInteractions,
                    avg_response_time: Math.round(avgResponseTime),
                    avg_feedback: avgFeedback.toFixed(2),
                    rag_usage: ragUsed,
                    rag_percentage: ((ragUsed / totalInteractions) * 100).toFixed(1)
                },
                by_persona: byPersona,
                feedback: feedbackCounts,
                logs: filteredLogs.map(log => ({
                    date: log.created_date,
                    prompt: log.prompt,
                    persona: log.persona_mode,
                    feedback: log.feedback_score,
                    response_time: log.response_time_ms,
                    used_rag: log.used_rag
                }))
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