import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, Globe } from 'lucide-react';
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
            long_term: 'Longo Prazo'
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
            long_term: 'Long Term'
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

    return (
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
                                            onClick={async () => {
                                                try {
                                                    const response = await base44.functions.invoke('analyzeGeopoliticalRisk', {
                                                        risk_id: risk.id
                                                    });
                                                    toast.success(lang === 'pt' ? 'Artigo de análise gerado!' : 'Analysis article generated!');
                                                } catch (error) {
                                                    toast.error(lang === 'pt' ? 'Erro ao gerar análise' : 'Error generating analysis');
                                                }
                                            }}
                                            className="text-xs"
                                        >
                                            {lang === 'pt' ? 'Gerar Análise' : 'Generate Analysis'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}