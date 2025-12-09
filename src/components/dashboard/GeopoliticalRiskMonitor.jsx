import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, Globe, Sparkles, Target, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const SEVERITY_COLORS = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
};

const RISK_TYPE_LABELS = {
    pt: {
        political: 'Político',
        economic: 'Econômico',
        security: 'Segurança',
        social: 'Social',
        environmental: 'Ambiental',
        trade: 'Comércio',
        diplomatic: 'Diplomático'
    },
    en: {
        political: 'Political',
        economic: 'Economic',
        security: 'Security',
        social: 'Social',
        environmental: 'Environmental',
        trade: 'Trade',
        diplomatic: 'Diplomatic'
    }
};

export default function GeopoliticalRiskMonitor({ lang = 'pt' }) {
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedRisk, setExpandedRisk] = useState(null);
    const [predictionDialog, setPredictionDialog] = useState(null);
    const [scenarioDialog, setScenarioDialog] = useState(false);
    const [reportDialog, setReportDialog] = useState(false);
    const [vizDialog, setVizDialog] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [generatingViz, setGeneratingViz] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [scenarioResult, setScenarioResult] = useState(null);
    const [report, setReport] = useState(null);
    const [visualization, setVisualization] = useState(null);
    const [scenarioInput, setScenarioInput] = useState({
        description: '',
        regions: [],
        riskTypes: [],
        timeHorizon: '12'
    });
    const [selectedRisksForReport, setSelectedRisksForReport] = useState([]);

    const t = {
        pt: {
            title: 'Monitor de Riscos Geopolíticos',
            description: 'Análise em tempo real de riscos globais',
            refresh: 'Atualizar Dados',
            refreshing: 'Atualizando...',
            noRisks: 'Nenhum risco identificado',
            severity: 'Severidade',
            probability: 'Probabilidade',
            trend: 'Tendência',
            impact: 'Áreas de Impacto',
            horizon: 'Horizonte',
            source: 'Fonte',
            updated: 'Atualizado',
            expanding: 'Expandir',
            collapsing: 'Recolher',
            immediate: 'Imediato',
            short_term: 'Curto Prazo',
            medium_term: 'Médio Prazo',
            long_term: 'Longo Prazo',
            predict: 'Prever Tendências',
            simulate: 'Simular Cenário',
            generateReport: 'Gerar Relatório',
            visualize: 'Visualizar',
            predicting: 'Prevendo...',
            simulating: 'Simulando...',
            generatingReport: 'Gerando...',
            scenarioDescription: 'Descreva o cenário',
            affectedRegions: 'Regiões afetadas',
            riskTypes: 'Tipos de risco',
            timeHorizon: 'Horizonte temporal (meses)',
            selectRisks: 'Selecione riscos para relatório',
            includePredict: 'Incluir previsões',
            shortTerm: 'Curto prazo (1-3 meses)',
            mediumTerm: 'Médio prazo (3-6 meses)',
            longTerm: 'Longo prazo (6-12 meses)',
            acceleratingFactors: 'Fatores Aceleradores',
            mitigatingFactors: 'Fatores Mitigadores',
            monitoringIndicators: 'Indicadores de Monitoramento',
            confidence: 'Nível de Confiança',
            marketImpacts: 'Impactos no Mercado',
            economicImpacts: 'Impactos Econômicos',
            politicalConsequences: 'Consequências Políticas',
            mitigationStrategies: 'Estratégias de Mitigação',
            copyReport: 'Copiar Relatório',
            downloadReport: 'Baixar Relatório'
        },
        en: {
            title: 'Geopolitical Risk Monitor',
            description: 'Real-time global risk analysis',
            refresh: 'Refresh Data',
            refreshing: 'Refreshing...',
            noRisks: 'No risks identified',
            severity: 'Severity',
            probability: 'Probability',
            trend: 'Trend',
            impact: 'Impact Areas',
            horizon: 'Horizon',
            source: 'Source',
            updated: 'Updated',
            expanding: 'Expand',
            collapsing: 'Collapse',
            immediate: 'Immediate',
            short_term: 'Short Term',
            medium_term: 'Medium Term',
            long_term: 'Long Term',
            predict: 'Predict Trends',
            simulate: 'Simulate Scenario',
            generateReport: 'Generate Report',
            visualize: 'Visualize',
            predicting: 'Predicting...',
            simulating: 'Simulating...',
            generatingReport: 'Generating...',
            scenarioDescription: 'Describe the scenario',
            affectedRegions: 'Affected regions',
            riskTypes: 'Risk types',
            timeHorizon: 'Time horizon (months)',
            selectRisks: 'Select risks for report',
            includePredict: 'Include predictions',
            shortTerm: 'Short-term (1-3 months)',
            mediumTerm: 'Medium-term (3-6 months)',
            longTerm: 'Long-term (6-12 months)',
            acceleratingFactors: 'Accelerating Factors',
            mitigatingFactors: 'Mitigating Factors',
            monitoringIndicators: 'Monitoring Indicators',
            confidence: 'Confidence Level',
            marketImpacts: 'Market Impacts',
            economicImpacts: 'Economic Impacts',
            politicalConsequences: 'Political Consequences',
            mitigationStrategies: 'Mitigation Strategies',
            copyReport: 'Copy Report',
            downloadReport: 'Download Report'
        }
    }[lang];

    useEffect(() => {
        loadRisks();
    }, []);

    const loadRisks = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.GeopoliticalRisk.filter({
                active: true
            }, '-severity', 10);
            setRisks(data);
        } catch (error) {
            console.error('Error loading risks:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshRisks = async () => {
        setRefreshing(true);
        try {
            await base44.functions.invoke('fetchGeopoliticalRisks');
            await loadRisks();
            toast.success(lang === 'pt' ? 'Dados atualizados com sucesso!' : 'Data refreshed successfully!');
        } catch (error) {
            console.error('Error refreshing risks:', error);
            toast.error(lang === 'pt' ? 'Erro ao atualizar dados' : 'Error refreshing data');
        } finally {
            setRefreshing(false);
        }
    };

    const trendIcons = {
        increasing: TrendingUp,
        stable: Minus,
        decreasing: TrendingDown
    };

    const getTrendColor = (trend) => {
        if (trend === 'increasing') return 'text-red-500';
        if (trend === 'decreasing') return 'text-green-500';
        return 'text-gray-500';
    };

    const handlePredictTrends = async (riskId) => {
        setPredicting(true);
        try {
            const response = await base44.functions.invoke('predictRiskTrends', { risk_id: riskId });
            setPrediction(response.data);
            setPredictionDialog(riskId);
            toast.success(t.predict + ' ' + (lang === 'pt' ? 'concluído' : 'completed'));
        } catch (error) {
            console.error('Error predicting trends:', error);
            toast.error(lang === 'pt' ? 'Erro ao prever tendências' : 'Error predicting trends');
        } finally {
            setPredicting(false);
        }
    };

    const handleSimulateScenario = async () => {
        setSimulating(true);
        try {
            const response = await base44.functions.invoke('simulateScenario', {
                scenario_description: scenarioInput.description,
                affected_regions: scenarioInput.regions,
                risk_types: scenarioInput.riskTypes,
                time_horizon: scenarioInput.timeHorizon
            });
            setScenarioResult(response.data);
            toast.success(t.simulate + ' ' + (lang === 'pt' ? 'concluído' : 'completed'));
        } catch (error) {
            console.error('Error simulating scenario:', error);
            toast.error(lang === 'pt' ? 'Erro ao simular cenário' : 'Error simulating scenario');
        } finally {
            setSimulating(false);
        }
    };

    const handleGenerateReport = async (includePredictions) => {
        setGeneratingReport(true);
        try {
            const response = await base44.functions.invoke('generateRiskReport', {
                risk_ids: selectedRisksForReport,
                report_format: 'executive_summary',
                include_predictions: includePredictions
            });
            setReport(response.data);
            toast.success(t.generateReport + ' ' + (lang === 'pt' ? 'concluído' : 'completed'));
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar relatório' : 'Error generating report');
        } finally {
            setGeneratingReport(false);
        }
    };

    const handleGenerateVisualization = async (riskId) => {
        setGeneratingViz(true);
        try {
            const risk = risks.find(r => r.id === riskId);
            const response = await base44.functions.invoke('generateDataVisualization', {
                data_description: `Geopolitical risk: ${risk.title}. Severity: ${risk.severity}, Trend: ${risk.trend}, Probability: ${risk.probability}%, Impact areas: ${risk.impact_areas?.join(', ')}`,
                chart_type: 'risk_dashboard',
                title: risk.title
            });
            setVisualization(response.data);
            setVizDialog(riskId);
            toast.success(t.visualize + ' ' + (lang === 'pt' ? 'gerado' : 'generated'));
        } catch (error) {
            console.error('Error generating visualization:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar visualização' : 'Error generating visualization');
        } finally {
            setGeneratingViz(false);
        }
    };

    const handleDownloadReport = () => {
        if (!report) return;
        const blob = new Blob([report.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk-report-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    };

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <AlertTriangle className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => setScenarioDialog(true)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Target className="w-4 h-4" />
                            {t.simulate}
                        </Button>
                        <Button 
                            onClick={() => {
                                setSelectedRisksForReport(risks.map(r => r.id));
                                setReportDialog(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            {t.generateReport}
                        </Button>
                        <Button
                            onClick={refreshRisks}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                        >
                            {refreshing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t.refreshing}
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {t.refresh}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : risks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        {t.noRisks}
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {risks.map((risk) => {
                            const TrendIcon = trendIcons[risk.trend] || Minus;
                            const isExpanded = expandedRisk === risk.id;
                            
                            return (
                                <div
                                    key={risk.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Globe className="w-4 h-4 text-[#002D62]" />
                                                <h4 className="font-semibold text-[#002D62]">{risk.title}</h4>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">{risk.region}</p>
                                        </div>
                                        <Badge className={SEVERITY_COLORS[risk.severity]}>
                                            {risk.severity}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-3">
                                        {isExpanded ? risk.description : risk.summary}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant="outline" className="text-xs">
                                            {RISK_TYPE_LABELS[lang][risk.risk_type]}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs gap-1">
                                            <TrendIcon className={`w-3 h-3 ${getTrendColor(risk.trend)}`} />
                                            {risk.trend}
                                        </Badge>
                                        {risk.probability && (
                                            <Badge variant="outline" className="text-xs">
                                                {t.probability}: {risk.probability}%
                                            </Badge>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className="space-y-2 pt-3 border-t">
                                            {risk.impact_areas && risk.impact_areas.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-[#002D62] mb-1">
                                                        {t.impact}:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {risk.impact_areas.map((area, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {area}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500">
                                                <span className="font-semibold">{t.horizon}:</span>{' '}
                                                {t[risk.time_horizon] || risk.time_horizon}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                <span className="font-semibold">{t.source}:</span> {risk.source}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setExpandedRisk(isExpanded ? null : risk.id)}
                                            className="text-xs"
                                        >
                                            {isExpanded ? t.collapsing : t.expanding}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePredictTrends(risk.id)}
                                            disabled={predicting}
                                            className="text-xs gap-1"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            {predicting ? t.predicting : t.predict}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleGenerateVisualization(risk.id)}
                                            disabled={generatingViz}
                                            className="text-xs gap-1"
                                        >
                                            <BarChart3 className="w-3 h-3" />
                                            {t.visualize}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
        
        {/* Prediction Dialog */}
        <Dialog open={!!predictionDialog} onOpenChange={() => setPredictionDialog(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.predict}: {prediction?.risk_title}</DialogTitle>
                    <DialogDescription>AI-powered trend analysis and outlook</DialogDescription>
                </DialogHeader>
                {prediction && (
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">{t.shortTerm}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-2">{prediction.prediction.short_term?.outlook}</p>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Probability: {prediction.prediction.short_term?.probability}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">{t.mediumTerm}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-2">{prediction.prediction.medium_term?.outlook}</p>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Probability: {prediction.prediction.medium_term?.probability}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">{t.longTerm}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-2">{prediction.prediction.long_term?.outlook}</p>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Probability: {prediction.prediction.long_term?.probability}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-2">{t.acceleratingFactors}</h4>
                                <ul className="space-y-1">
                                    {prediction.prediction.accelerating_factors?.map((f, i) => (
                                        <li key={i} className="text-xs flex items-start gap-2">
                                            <TrendingUp className="w-3 h-3 text-red-500 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">{t.mitigatingFactors}</h4>
                                <ul className="space-y-1">
                                    {prediction.prediction.mitigating_factors?.map((f, i) => (
                                        <li key={i} className="text-xs flex items-start gap-2">
                                            <TrendingDown className="w-3 h-3 text-green-500 mt-0.5" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">{t.monitoringIndicators}</h4>
                            <ul className="space-y-1">
                                {prediction.prediction.monitoring_indicators?.map((i, idx) => (
                                    <li key={idx} className="text-xs">• {i}</li>
                                ))}
                            </ul>
                        </div>
                        <Badge>{t.confidence}: {prediction.prediction.confidence_level}</Badge>
                    </div>
                )}
            </DialogContent>
        </Dialog>

        {/* Scenario Simulation Dialog */}
        <Dialog open={scenarioDialog} onOpenChange={setScenarioDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.simulate}</DialogTitle>
                    <DialogDescription>Model geopolitical scenarios and analyze potential impacts</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Textarea
                        placeholder={t.scenarioDescription}
                        value={scenarioInput.description}
                        onChange={(e) => setScenarioInput({...scenarioInput, description: e.target.value})}
                        rows={4}
                    />
                    <Input
                        placeholder={t.affectedRegions + " (comma-separated)"}
                        value={scenarioInput.regions.join(', ')}
                        onChange={(e) => setScenarioInput({...scenarioInput, regions: e.target.value.split(',').map(s => s.trim())})}
                    />
                    <Input
                        placeholder={t.riskTypes + " (comma-separated)"}
                        value={scenarioInput.riskTypes.join(', ')}
                        onChange={(e) => setScenarioInput({...scenarioInput, riskTypes: e.target.value.split(',').map(s => s.trim())})}
                    />
                    <Input
                        type="number"
                        placeholder={t.timeHorizon}
                        value={scenarioInput.timeHorizon}
                        onChange={(e) => setScenarioInput({...scenarioInput, timeHorizon: e.target.value})}
                    />
                    <Button 
                        onClick={handleSimulateScenario}
                        disabled={simulating || !scenarioInput.description}
                        className="w-full"
                    >
                        {simulating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {simulating ? t.simulating : t.simulate}
                    </Button>

                    {scenarioResult && (
                        <div className="mt-6 space-y-4 border-t pt-4">
                            <h3 className="font-semibold">{scenarioResult.simulation.scenario_name}</h3>
                            <div>
                                <Badge>Probability: {scenarioResult.simulation.probability_of_occurrence}%</Badge>
                                <Badge className="ml-2">{scenarioResult.simulation.confidence_level}</Badge>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{t.marketImpacts}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs space-y-2">
                                        <div><strong>Equity:</strong> {scenarioResult.simulation.market_impacts?.equity_markets}</div>
                                        <div><strong>Currencies:</strong> {scenarioResult.simulation.market_impacts?.currencies}</div>
                                        <div><strong>Commodities:</strong> {scenarioResult.simulation.market_impacts?.commodities}</div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{t.economicImpacts}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs">
                                        {scenarioResult.simulation.economic_impacts?.slice(0, 3).map((impact, i) => (
                                            <div key={i} className="mb-2">
                                                <strong>{impact.region} - {impact.sector}:</strong> {impact.impact_description}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">{t.politicalConsequences}</h4>
                                <ul className="text-xs space-y-1">
                                    {scenarioResult.simulation.political_consequences?.map((c, i) => (
                                        <li key={i}>• {c}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">{t.mitigationStrategies}</h4>
                                <ul className="text-xs space-y-1">
                                    {scenarioResult.simulation.mitigation_strategies?.map((s, i) => (
                                        <li key={i}>• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Report Generation Dialog */}
        <Dialog open={reportDialog} onOpenChange={setReportDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.generateReport}</DialogTitle>
                    <DialogDescription>Create comprehensive risk analysis reports</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => handleGenerateReport(false)}
                            disabled={generatingReport || selectedRisksForReport.length === 0}
                            variant="outline"
                        >
                            {generatingReport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {t.generateReport}
                        </Button>
                        <Button 
                            onClick={() => handleGenerateReport(true)}
                            disabled={generatingReport || selectedRisksForReport.length === 0}
                        >
                            {generatingReport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {t.includePredict}
                        </Button>
                    </div>

                    {report && (
                        <div className="border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">{report.title}</h3>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigator.clipboard.writeText(report.content)}
                                    >
                                        {t.copyReport}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleDownloadReport}
                                    >
                                        {t.downloadReport}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge>Total: {report.summary_statistics.total_risks}</Badge>
                                <Badge variant="destructive">Critical: {report.summary_statistics.critical_risks}</Badge>
                                <Badge className="bg-orange-500">High: {report.summary_statistics.high_risks}</Badge>
                                <Badge className="bg-yellow-500">Increasing: {report.summary_statistics.increasing_trends}</Badge>
                            </div>
                            <div className="prose prose-sm max-w-none bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
                                <pre className="whitespace-pre-wrap text-xs">{report.content}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Visualization Dialog */}
        <Dialog open={!!vizDialog} onOpenChange={() => setVizDialog(null)}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{t.visualize}</DialogTitle>
                </DialogHeader>
                {visualization && (
                    <div className="space-y-4">
                        <div dangerouslySetInnerHTML={{ __html: visualization.html }} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
        </>
    );
}