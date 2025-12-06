import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HUAValidator({ lang = 'pt' }) {
    const [conceptName, setConceptName] = useState('');
    const [conceptContent, setConceptContent] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validation, setValidation] = useState(null);

    const translations = {
        pt: {
            title: "Validador HUA",
            desc: "Hierarquia • Utilidade • Aderência",
            conceptName: "Nome do Conceito",
            conceptContent: "Conteúdo do Conceito",
            validate: "Validar HUA",
            validating: "Validando...",
            hierarchy: "Hierarquia",
            utility: "Utilidade",
            adherence: "Aderência",
            overall: "Score Geral",
            decision: "Decisão",
            approve: "✅ APROVAR",
            adjust: "⚠️ AJUSTAR",
            reject: "🛑 REJEITAR",
            analysis: "Análise",
            noValidation: "Configure um conceito e clique em Validar"
        },
        en: {
            title: "HUA Validator",
            desc: "Hierarchy • Utility • Adherence",
            conceptName: "Concept Name",
            conceptContent: "Concept Content",
            validate: "Validate HUA",
            validating: "Validating...",
            hierarchy: "Hierarchy",
            utility: "Utility",
            adherence: "Adherence",
            overall: "Overall Score",
            decision: "Decision",
            approve: "✅ APPROVE",
            adjust: "⚠️ ADJUST",
            reject: "🛑 REJECT",
            analysis: "Analysis",
            noValidation: "Set up a concept and click Validate"
        }
    };

    const t = translations[lang];

    const validateConcept = async () => {
        if (!conceptName.trim() || !conceptContent.trim()) return;

        setIsValidating(true);
        try {
            const response = await base44.functions.invoke('validateHUA', {
                concept_name: conceptName,
                concept_content: conceptContent
            });

            setValidation(response.data);
        } catch (error) {
            console.error('Error validating concept:', error);
        } finally {
            setIsValidating(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getDecisionBadge = (decision) => {
        const badges = {
            'APROVAR': 'bg-green-600 text-white',
            'AJUSTAR': 'bg-yellow-600 text-white',
            'REJEITAR': 'bg-red-600 text-white'
        };
        return badges[decision] || 'bg-gray-600 text-white';
    };

    return (
        <Card className="border-2 border-[#B8860B]">
            <CardHeader className="bg-gradient-to-r from-[#B8860B] to-[#002D62] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription className="text-gray-100">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <Input
                    placeholder={t.conceptName}
                    value={conceptName}
                    onChange={(e) => setConceptName(e.target.value)}
                />
                <Textarea
                    placeholder={t.conceptContent}
                    value={conceptContent}
                    onChange={(e) => setConceptContent(e.target.value)}
                    rows={6}
                />
                <Button
                    onClick={validateConcept}
                    disabled={!conceptName.trim() || !conceptContent.trim() || isValidating}
                    className="w-full bg-[#B8860B] hover:bg-[#9a7009]"
                >
                    {isValidating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t.validating}
                        </>
                    ) : (
                        <>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {t.validate}
                        </>
                    )}
                </Button>

                {validation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 pt-4 border-t border-gray-200"
                    >
                        {/* Scores */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-xs text-blue-600 font-semibold mb-1">
                                    {t.hierarchy}
                                </div>
                                <div className={`text-3xl font-bold ${getScoreColor(validation.h_score)}`}>
                                    {validation.h_score}
                                </div>
                                <Progress value={validation.h_score} className="mt-2 h-1" />
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-xs text-green-600 font-semibold mb-1">
                                    {t.utility}
                                </div>
                                <div className={`text-3xl font-bold ${getScoreColor(validation.u_score)}`}>
                                    {validation.u_score}
                                </div>
                                <Progress value={validation.u_score} className="mt-2 h-1" />
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="text-xs text-purple-600 font-semibold mb-1">
                                    {t.adherence}
                                </div>
                                <div className={`text-3xl font-bold ${getScoreColor(validation.a_score)}`}>
                                    {validation.a_score}
                                </div>
                                <Progress value={validation.a_score} className="mt-2 h-1" />
                            </div>
                        </div>

                        {/* Decision */}
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-700">{t.decision}:</span>
                                <Badge className={getDecisionBadge(validation.decision)}>
                                    {validation.decision}
                                </Badge>
                            </div>
                            {validation.analysis && (
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {validation.analysis}
                                </p>
                            )}
                        </div>

                        {/* Overall Score */}
                        <div className="p-4 bg-[#002D62] text-white rounded-lg">
                            <div className="text-xs opacity-80 mb-2">{t.overall}</div>
                            <div className="text-4xl font-bold">
                                {Math.round((validation.h_score + validation.u_score + validation.a_score) / 3)}
                                <span className="text-lg opacity-80">/100</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {!validation && !isValidating && (
                    <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{t.noValidation}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}