import React, { useState } from 'react';
import { AlertTriangle, Check, X, Info, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ParadoxResolution({ 
    paradox, 
    onResolve,
    lang = 'pt' 
}) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [resolved, setResolved] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const t = {
        pt: {
            title: 'Paradoxo Identificado',
            description: 'O Digital Twin identificou informações conflitantes. Sua análise é importante.',
            selectOption: 'Selecione a interpretação mais adequada:',
            viewExplanation: 'Ver raciocínio',
            hideExplanation: 'Ocultar raciocínio',
            resolve: 'Confirmar resolução',
            resolved: 'Paradoxo resolvido',
            confidence: 'Confiança',
            impact: 'Impacto'
        },
        en: {
            title: 'Paradox Identified',
            description: 'The Digital Twin identified conflicting information. Your analysis is important.',
            selectOption: 'Select the most appropriate interpretation:',
            viewExplanation: 'View reasoning',
            hideExplanation: 'Hide reasoning',
            resolve: 'Confirm resolution',
            resolved: 'Paradox resolved',
            confidence: 'Confidence',
            impact: 'Impact'
        }
    };

    const text = t[lang];

    if (!paradox) return null;

    const handleResolve = () => {
        if (!selectedOption) return;
        setResolved(true);
        if (onResolve) {
            onResolve({
                paradox_id: paradox.id,
                selected_resolution: selectedOption,
                timestamp: new Date().toISOString()
            });
        }
    };

    if (resolved) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Alert className="border-green-200 bg-green-50">
                    <Check className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        {text.resolved}
                    </AlertDescription>
                </Alert>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-900">
                        <AlertTriangle className="w-5 h-5" />
                        {text.title}
                    </CardTitle>
                    <CardDescription className="text-orange-700">
                        {text.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Paradox Description */}
                    {paradox.description && (
                        <Alert>
                            <Info className="w-4 h-4" />
                            <AlertDescription>{paradox.description}</AlertDescription>
                        </Alert>
                    )}

                    {/* Resolution Options */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            {text.selectOption}
                        </Label>
                        <RadioGroup 
                            value={selectedOption} 
                            onValueChange={setSelectedOption}
                            className="space-y-3"
                        >
                            {paradox.options?.map((option, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                                        selectedOption === option.id
                                            ? 'border-orange-500 bg-white shadow-md'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                                    <div className="flex-1 space-y-2">
                                        <Label
                                            htmlFor={option.id}
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            {option.label}
                                        </Label>
                                        {option.description && (
                                            <p className="text-xs text-gray-600">
                                                {option.description}
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            {option.confidence && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {text.confidence}: {option.confidence}%
                                                </Badge>
                                            )}
                                            {option.impact && (
                                                <Badge variant="outline" className="text-xs">
                                                    {text.impact}: {option.impact}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Explanation Toggle */}
                    {paradox.reasoning && (
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowExplanation(!showExplanation)}
                                className="gap-2 text-orange-700 hover:text-orange-900"
                            >
                                {showExplanation ? text.hideExplanation : text.viewExplanation}
                                <ChevronRight className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-90' : ''}`} />
                            </Button>

                            <AnimatePresence>
                                {showExplanation && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <Alert>
                                            <AlertDescription className="text-sm text-gray-700">
                                                {paradox.reasoning}
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Resolve Button */}
                    <Button
                        onClick={handleResolve}
                        disabled={!selectedOption}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        {text.resolve}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}