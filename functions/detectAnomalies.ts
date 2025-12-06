import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { time_window_minutes = 30 } = await req.json();

        const cutoffTime = new Date(Date.now() - time_window_minutes * 60 * 1000);
        
        // Fetch recent learning data
        const recentData = await base44.asServiceRole.entities.AgentLearning.list('-created_date', 200);
        const recentDataFiltered = recentData.filter(d => 
            new Date(d.created_date) > cutoffTime
        );

        const anomalies = [];

        // Detect slow responses (> 5 seconds)
        const slowActions = recentDataFiltered.filter(d => 
            d.execution_time_ms && d.execution_time_ms > 5000
        );
        
        if (slowActions.length > 0) {
            const avgTime = slowActions.reduce((sum, a) => sum + a.execution_time_ms, 0) / slowActions.length;
            anomalies.push({
                anomaly_type: 'slow_response',
                severity: avgTime > 10000 ? 'high' : 'medium',
                screen: slowActions[0].screen,
                element_id: slowActions[0].element_id,
                description: `Detected ${slowActions.length} slow responses (avg: ${Math.round(avgTime)}ms)`,
                metrics: {
                    response_time_ms: avgTime,
                    error_count: 0,
                    retry_count: slowActions.length
                },
                suggested_fix: 'Optimize element loading or implement loading states'
            });
        }

        // Detect repeated failures
        const failureGroups = {};
        recentDataFiltered.filter(d => !d.success).forEach(d => {
            const key = `${d.screen}-${d.element_id}-${d.interaction_type}`;
            if (!failureGroups[key]) {
                failureGroups[key] = [];
            }
            failureGroups[key].push(d);
        });

        Object.entries(failureGroups).forEach(([key, failures]) => {
            if (failures.length >= 3) {
                anomalies.push({
                    anomaly_type: 'repeated_failure',
                    severity: failures.length > 5 ? 'critical' : 'high',
                    screen: failures[0].screen,
                    element_id: failures[0].element_id,
                    description: `Action failing repeatedly (${failures.length} times): ${failures[0].interaction_type}`,
                    metrics: {
                        response_time_ms: 0,
                        error_count: failures.length,
                        retry_count: failures.length
                    },
                    suggested_fix: 'Check element selector, permissions, or add error recovery'
                });
            }
        });

        // Detect error spikes
        const errorRate = (recentDataFiltered.filter(d => !d.success).length / recentDataFiltered.length) * 100;
        if (errorRate > 30) {
            anomalies.push({
                anomaly_type: 'error_spike',
                severity: errorRate > 50 ? 'critical' : 'high',
                screen: 'system',
                description: `High error rate detected: ${errorRate.toFixed(1)}%`,
                metrics: {
                    response_time_ms: 0,
                    error_count: recentDataFiltered.filter(d => !d.success).length,
                    retry_count: 0
                },
                suggested_fix: 'Review recent system changes or check service availability'
            });
        }

        // Detect bottlenecks (actions taking progressively longer)
        const timeSeriesData = recentDataFiltered
            .filter(d => d.execution_time_ms)
            .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        
        if (timeSeriesData.length >= 10) {
            const firstHalf = timeSeriesData.slice(0, Math.floor(timeSeriesData.length / 2));
            const secondHalf = timeSeriesData.slice(Math.floor(timeSeriesData.length / 2));
            
            const avgFirst = firstHalf.reduce((s, d) => s + d.execution_time_ms, 0) / firstHalf.length;
            const avgSecond = secondHalf.reduce((s, d) => s + d.execution_time_ms, 0) / secondHalf.length;
            
            if (avgSecond > avgFirst * 1.5) {
                anomalies.push({
                    anomaly_type: 'bottleneck',
                    severity: 'medium',
                    screen: 'system',
                    description: `Performance degradation detected: ${((avgSecond - avgFirst) / avgFirst * 100).toFixed(1)}% slower`,
                    metrics: {
                        response_time_ms: avgSecond,
                        error_count: 0,
                        retry_count: 0
                    },
                    suggested_fix: 'Check system resources, cache, or concurrent operations'
                });
            }
        }

        // Store detected anomalies
        for (const anomaly of anomalies) {
            await base44.asServiceRole.entities.UIAnomaly.create(anomaly);
        }

        return Response.json({
            success: true,
            anomalies_detected: anomalies.length,
            anomalies,
            time_window_minutes,
            data_points_analyzed: recentDataFiltered.length
        });

    } catch (error) {
        console.error('Error in detectAnomalies:', error);
        return Response.json({ 
            error: error.message || 'Failed to detect anomalies',
            success: false
        }, { status: 500 });
    }
});