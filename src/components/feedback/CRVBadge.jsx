import React from 'react';
import { Shield, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function CRVBadge({ 
    confidence = 0, 
    risk = 0, 
    value = 0,
    lang = 'pt',
    compact = false,
    showLabels = true 
}) {
    const t = {
        pt: {
            confidence: 'Confiança',
            risk: 'Risco',
            value: 'Valor',
            confidenceDesc: 'Nível de confiança na precisão da informação',
            riskDesc: 'Grau de risco ou incerteza associado',
            valueDesc: 'Relevância estratégica da informação'
        },
        en: {
            confidence: 'Confidence',
            risk: 'Risk',
            value: 'Value',
            confidenceDesc: 'Confidence level in information accuracy',
            riskDesc: 'Degree of risk or uncertainty associated',
            valueDesc: 'Strategic relevance of information'
        }
    };

    const text = t[lang];

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getRiskColor = (score) => {
        if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
        if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
        if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const metrics = [
        {
            key: 'confidence',
            label: text.confidence,
            value: confidence,
            icon: Shield,
            color: getScoreColor(confidence),
            description: text.confidenceDesc
        },
        {
            key: 'risk',
            label: text.risk,
            value: risk,
            icon: AlertTriangle,
            color: getRiskColor(risk),
            description: text.riskDesc
        },
        {
            key: 'value',
            label: text.value,
            value: value,
            icon: TrendingUp,
            color: getScoreColor(value),
            description: text.valueDesc
        }
    ];

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <TooltipProvider key={metric.key}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${metric.color}`}>
                                        <Icon className="w-3 h-3" />
                                        <span>{metric.value}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-medium">{metric.label}</p>
                                    <p className="text-xs text-gray-500">{metric.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                    <motion.div
                        key={metric.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${metric.color.split(' ')[0]}`} />
                                {showLabels && (
                                    <span className="text-sm font-medium text-gray-700">
                                        {metric.label}
                                    </span>
                                )}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3 h-3 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{metric.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <span className={`text-sm font-bold ${metric.color.split(' ')[0]}`}>
                                {metric.value}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`h-full rounded-full ${metric.color.split(' ')[1]}`}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}