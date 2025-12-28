import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ObservatoryWidget({ lang = 'pt', context = 'overview' }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [context]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('queryObservatoryAPI', {
                endpoint: `/data/${context}`,
                method: 'GET'
            });
            setData(response.data);
        } catch (error) {
            console.error('Error loading observatory data:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar dados' : 'Error loading data');
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'crítico':
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'alto':
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'médio':
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center text-gray-500">
                    {lang === 'pt' ? 'Nenhum dado disponível' : 'No data available'}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-semibold text-[#002D62] mb-2">
                                        {item.title || item.name}
                                    </CardTitle>
                                    {item.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                {item.risk_level && (
                                    <Badge className={getRiskColor(item.risk_level)}>
                                        {item.risk_level}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {item.value && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            {lang === 'pt' ? 'Valor' : 'Value'}
                                        </p>
                                        <p className="text-sm font-semibold text-[#00654A]">
                                            R$ {item.value.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {item.agency && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            {lang === 'pt' ? 'Órgão' : 'Agency'}
                                        </p>
                                        <p className="text-sm font-semibold truncate">
                                            {item.agency}
                                        </p>
                                    </div>
                                )}
                                {item.date && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            {lang === 'pt' ? 'Data' : 'Date'}
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {new Date(item.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {item.status && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                            Status
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {item.status === 'active' ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                            )}
                                            <p className="text-sm font-semibold">
                                                {item.status}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {item.insights && item.insights.length > 0 && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs font-semibold text-blue-900 mb-2">
                                        💡 {lang === 'pt' ? 'Insights' : 'Insights'}:
                                    </p>
                                    <ul className="space-y-1">
                                        {item.insights.map((insight, i) => (
                                            <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                                                <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {item.url && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {lang === 'pt' ? 'Ver detalhes' : 'View details'}
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}