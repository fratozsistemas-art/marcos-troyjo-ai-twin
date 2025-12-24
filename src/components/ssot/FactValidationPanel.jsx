import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function FactValidationPanel({ fact, onValidationComplete, lang = 'pt' }) {
    const [isValidating, setIsValidating] = useState(false);
    const [validation, setValidation] = useState(null);

    const t = {
        pt: {
            title: 'Validação de Integridade',
            description: 'Análise AI de validade e conflitos',
            validate: 'Validar Fato',
            validating: 'Validando...',
            riskScore: 'Pontuação de Risco',
            valid: 'Válido',
            invalid: 'Inválido',
            contradictions: 'Contradições',
            biasAnalysis: 'Análise de Viés',
            confidenceRec: 'Recomendação de Confiança',
            validityIssues: 'Problemas de Validade',
            sourceCredibility: 'Credibilidade da Fonte',
            recommendations: 'Recomendações',
            overall: 'Avaliação Geral',
            noContradictions: 'Nenhuma contradição detectada',
            noBiases: 'Nenhum viés significativo detectado',
            noIssues: 'Nenhum problema detectado'
        },
        en: {
            title: 'Integrity Validation',
            description: 'AI-powered validity and conflict analysis',
            validate: 'Validate Fact',
            validating: 'Validating...',
            riskScore: 'Risk Score',
            valid: 'Valid',
            invalid: 'Invalid',
            contradictions: 'Contradictions',
            biasAnalysis: 'Bias Analysis',
            confidenceRec: 'Confidence Recommendation',
            validityIssues: 'Validity Issues',
            sourceCredibility: 'Source Credibility',
            recommendations: 'Recommendations',
            overall: 'Overall Assessment',
            noContradictions: 'No contradictions detected',
            noBiases: 'No significant biases detected',
            noIssues: 'No issues detected'
        }
    };

    const text = t[lang];

    const handleValidate = async () => {
        setIsValidating(true);
        try {
            const response = await base44.functions.invoke('validateStrategicFact', {
                fact_id: fact.fact_id,
                fact_data: fact
            });
            setValidation(response.data);
            toast.success(lang === 'pt' ? 'Validação concluída' : 'Validation complete');
            if (onValidationComplete) onValidationComplete(response.data);
        } catch (error) {
            console.error('Error validating fact:', error);
            toast.error(lang === 'pt' ? 'Erro na validação' : 'Validation error');
        } finally {
            setIsValidating(false);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-yellow-100 text-yellow-800',
            medium: 'bg-orange-100 text-orange-800',
            high: 'bg-red-100 text-red-800',
            critical: 'bg-red-600 text-white'
        };
        return colors[severity] || colors.low;
    };

    const getRiskColor = (score) => {
        if (score < 25) return 'text-green-600';
        if (score < 50) return 'text-yellow-600';
        if (score < 75) return 'text-orange-600';
        return 'text-red-600';
    };

    if (!validation) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#002D62]" />
                        {text.title}
                    </CardTitle>
                    <CardDescription>{text.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleValidate}
                        disabled={isValidating}
                        className="w-full"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {text.validating}
                            </>
                        ) : (
                            <>
                                <Shield className="w-4 h-4 mr-2" />
                                {text.validate}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#002D62]" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.description}</CardDescription>
                    </div>
                    <Button
                        onClick={handleValidate}
                        disabled={isValidating}
                        variant="outline"
                        size="sm"
                    >
                        {isValidating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Shield className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Risk Score & Overall Status */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">{text.riskScore}</span>
                            <span className={`text-2xl font-bold ${getRiskColor(validation.risk_score)}`}>
                                {validation.risk_score}
                            </span>
                        </div>
                        <Progress value={validation.risk_score} className="h-2" />
                    </div>
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                        <span className="text-sm font-semibold">{text.valid}</span>
                        {validation.validation.is_valid ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : (
                            <XCircle className="w-8 h-8 text-red-600" />
                        )}
                    </div>
                </div>

                {/* Overall Assessment */}
                <Alert>
                    <AlertDescription className="text-sm">
                        {validation.validation.overall_assessment}
                    </AlertDescription>
                </Alert>

                {/* Contradictions */}
                <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {text.contradictions}
                    </h4>
                    {validation.validation.contradictions?.length > 0 ? (
                        <div className="space-y-2">
                            {validation.validation.contradictions.map((contradiction, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 border rounded-lg"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs">
                                            {contradiction.conflicting_fact_id}
                                        </Badge>
                                        <Badge className={getSeverityColor(contradiction.severity)}>
                                            {contradiction.severity}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-700">{contradiction.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">{text.noContradictions}</p>
                    )}
                </div>

                {/* Bias Analysis */}
                <div>
                    <h4 className="font-semibold text-sm mb-3">{text.biasAnalysis}</h4>
                    {validation.validation.bias_analysis?.detected_biases?.length > 0 ? (
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {validation.validation.bias_analysis.detected_biases.map((bias, idx) => (
                                    <Badge key={idx} variant="secondary">{bias}</Badge>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {validation.validation.bias_analysis.explanation}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">{text.noBiases}</p>
                    )}
                </div>

                {/* Confidence Recommendation */}
                {validation.validation.confidence_recommendation && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">{text.confidenceRec}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{fact.confidence}</span>
                                {validation.validation.confidence_recommendation.suggested_confidence > fact.confidence ? (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className="font-bold text-blue-900">
                                    {validation.validation.confidence_recommendation.suggested_confidence}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-blue-800">
                            {validation.validation.confidence_recommendation.adjustment_reason}
                        </p>
                    </div>
                )}

                {/* Validity Issues */}
                <div>
                    <h4 className="font-semibold text-sm mb-3">{text.validityIssues}</h4>
                    {validation.validation.validity_issues?.length > 0 ? (
                        <div className="space-y-2">
                            {validation.validation.validity_issues.map((issue, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                    <Badge className={getSeverityColor(issue.severity)}>
                                        {issue.severity}
                                    </Badge>
                                    <span className="text-gray-700">{issue.issue}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">{text.noIssues}</p>
                    )}
                </div>

                {/* Recommendations */}
                {validation.validation.recommendations?.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm mb-3">{text.recommendations}</h4>
                        <ul className="space-y-2">
                            {validation.validation.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}