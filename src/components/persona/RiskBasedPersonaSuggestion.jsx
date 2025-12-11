import React from 'react';
import { usePersonaAdaptation } from '@/components/persona/PersonaAdaptationProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RiskBasedPersonaSuggestion() {
    const { riskBasedSuggestion, applyRiskBasedSuggestion } = usePersonaAdaptation();

    if (!riskBasedSuggestion) return null;

    const { suggested_persona, reasoning, risk_context, adjustment_type } = riskBasedSuggestion;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 right-4 z-50 max-w-md"
            >
                <Alert className="border-orange-500 bg-orange-50">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <AlertTitle className="text-orange-900 font-semibold">
                        Adaptação de Persona Sugerida
                    </AlertTitle>
                    <AlertDescription className="space-y-3 mt-2">
                        <p className="text-sm text-gray-700">{reasoning}</p>

                        {suggested_persona && (
                            <div className="bg-white rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm text-gray-900">
                                        {suggested_persona.name}
                                    </h4>
                                    <Badge variant="secondary">
                                        {adjustment_type}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                    {suggested_persona.description}
                                </p>
                                {suggested_persona.focus_areas?.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                        {suggested_persona.focus_areas.map(area => (
                                            <Badge key={area} variant="outline" className="text-xs">
                                                {area}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                {suggested_persona.duration && (
                                    <p className="text-xs text-gray-500">
                                        Duração sugerida: {suggested_persona.duration}
                                    </p>
                                )}
                            </div>
                        )}

                        {risk_context?.length > 0 && (
                            <div className="text-xs text-gray-600">
                                <p className="font-medium mb-1">Riscos relacionados:</p>
                                <ul className="space-y-1">
                                    {risk_context.slice(0, 2).map((risk, idx) => (
                                        <li key={idx} className="flex items-start gap-1">
                                            <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            <span>{risk.concise_summary}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                size="sm"
                                onClick={() => applyRiskBasedSuggestion(true)}
                                className="gap-1 flex-1 bg-orange-600 hover:bg-orange-700"
                            >
                                <Check className="w-4 h-4" />
                                Aplicar Adaptação
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applyRiskBasedSuggestion(false)}
                                className="gap-1"
                            >
                                <X className="w-4 h-4" />
                                Recusar
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </motion.div>
        </AnimatePresence>
    );
}