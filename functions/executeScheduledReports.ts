import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get all enabled scheduled reports due for execution
        const now = new Date();
        const scheduledReports = await base44.asServiceRole.entities.ScheduledReport.filter({
            enabled: true
        });

        const dueReports = scheduledReports.filter(report => {
            if (!report.next_run) return false;
            return new Date(report.next_run) <= now;
        });

        const results = [];

        for (const report of dueReports) {
            try {
                // Update status to running
                await base44.asServiceRole.entities.ScheduledReport.update(report.id, {
                    last_status: 'running'
                });

                // Generate the report
                const reportResponse = await base44.asServiceRole.functions.invoke('generateExecutiveReport', {
                    scenario: report.scenario,
                    scenario_b: report.scenario_b,
                    report_type: report.report_type,
                    template: report.template,
                    sections: report.sections || [],
                    focus_section: report.focus_section,
                    document_ids: report.document_ids || [],
                    format: report.format
                });

                // Upload report to storage (simplified - would need actual storage integration)
                const reportUrl = `scheduled_reports/${report.id}_${Date.now()}.${report.format}`;

                // Calculate next run
                const nextRun = calculateNextRun(report);

                // Update report record
                await base44.asServiceRole.entities.ScheduledReport.update(report.id, {
                    last_run: now.toISOString(),
                    last_status: 'success',
                    last_report_url: reportUrl,
                    next_run: nextRun.toISOString(),
                    run_count: (report.run_count || 0) + 1
                });

                // Send notifications
                if (report.notification_emails && report.notification_emails.length > 0) {
                    for (const email of report.notification_emails) {
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: email,
                            subject: `Relatório Agendado: ${report.name}`,
                            body: `Seu relatório agendado "${report.name}" foi gerado com sucesso.\n\nCenário: ${report.scenario}\n\nAcesse o relatório no dashboard.`
                        });
                    }
                }

                // Create notification
                await base44.asServiceRole.entities.UserNotification.create({
                    user_email: report.created_by,
                    title: 'Relatório Agendado Gerado',
                    message: `O relatório "${report.name}" foi gerado com sucesso.`,
                    type: 'success',
                    category: 'workflow',
                    action_url: reportUrl
                });

                results.push({
                    report_id: report.id,
                    name: report.name,
                    status: 'success',
                    next_run: nextRun
                });

            } catch (error) {
                console.error(`Error generating report ${report.id}:`, error);
                
                await base44.asServiceRole.entities.ScheduledReport.update(report.id, {
                    last_status: 'failed',
                    last_run: now.toISOString()
                });

                // Notify of failure
                await base44.asServiceRole.entities.UserNotification.create({
                    user_email: report.created_by,
                    title: 'Erro no Relatório Agendado',
                    message: `Falha ao gerar o relatório "${report.name}": ${error.message}`,
                    type: 'alert',
                    category: 'workflow'
                });

                results.push({
                    report_id: report.id,
                    name: report.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return Response.json({
            executed: results.length,
            results
        });

    } catch (error) {
        console.error('Error executing scheduled reports:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function calculateNextRun(report) {
    const now = new Date();
    let next = new Date(now);

    if (report.schedule_type === 'daily') {
        next.setDate(next.getDate() + 1);
        if (report.time) {
            const [hours, minutes] = report.time.split(':');
            next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
    } else if (report.schedule_type === 'weekly') {
        const targetDay = report.day_of_week || 1; // Default to Monday
        const currentDay = next.getDay();
        const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntilNext);
        if (report.time) {
            const [hours, minutes] = report.time.split(':');
            next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
    } else if (report.schedule_type === 'monthly') {
        const targetDay = report.day_of_month || 1;
        next.setMonth(next.getMonth() + 1);
        next.setDate(targetDay);
        if (report.time) {
            const [hours, minutes] = report.time.split(':');
            next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
    } else if (report.schedule_type === 'custom' && report.cron_expression) {
        // Simple cron parsing - would need a proper cron library for production
        // For now, default to weekly
        next.setDate(next.getDate() + 7);
    }

    return next;
}