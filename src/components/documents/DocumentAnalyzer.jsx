import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    Sparkles, Loader2, User, MapPin, Building, Tag, 
    FileText, CheckCircle, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentAnalyzer({ document, onAnalysisComplete, lang = 'pt' }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const t = {
        pt: {
            analyze: 'Analisar com IA',
            analyzing: 'Analisando...',
            title: 'Análise do Documento',
            summary: 'Resumo',
            entities: 'Entidades Extraídas',
            people: 'Pessoas',
            locations: 'Locais',
            organizations: 'Organizações',
            themes: 'Temas Identificados',
            context: 'Contexto',
            tagsAdded: 'Tags adicionadas',
            keywordsAdded: 'Palavras-chave adicionadas',
            success: 'Documento analisado com sucesso!',
            error: 'Erro ao analisar documento',
            close: 'Fechar'
        },
        en: {
            analyze: 'Analyze with AI',
            analyzing: 'Analyzing...',
            title: 'Document Analysis',
            summary: 'Summary',
            entities: 'Extracted Entities',
            people: 'People',
            locations: 'Locations',
            organizations: 'Organizations',
            themes: 'Identified Themes',
            context: 'Context',
            tagsAdded: 'Tags added',
            keywordsAdded: 'Keywords added',
            success: 'Document analyzed successfully!',
            error: 'Error analyzing document',
            close: 'Close'
        }
    };

    const text = t[lang];

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const response = await base44.functions.invoke('analyzeDocument', {
                document_id: document.id
            });

            if (response.data.success) {
                setAnalysis(response.data.analysis);
                setShowResults(true);
                toast.success(text.success);
                if (onAnalysisComplete) {
                    onAnalysisComplete(response.data.analysis);
                }
            } else {
                toast.error(text.error);
            }
        } catch (error) {
            console.error('Error analyzing document:', error);
            toast.error(text.error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                variant="outline"
                size="sm"
                className="gap-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            >
                {analyzing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {text.analyzing}
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        {text.analyze}
                    </>
                )}
            </Button>

            <Dialog open={showResults} onOpenChange={setShowResults}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 dark:text-gray-200">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            {text.title}
                        </DialogTitle>
                    </DialogHeader>

                    {analysis && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-200">
                                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            {text.summary}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {analysis.summary}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Context */}
                            {analysis.context && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="dark:bg-gray-900 dark:border-gray-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-200">
                                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                {text.context}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {analysis.context}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Entities */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-lg dark:text-gray-200">{text.entities}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {analysis.entities?.people?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    {text.people}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.entities.people.map((person, idx) => (
                                                        <Badge key={idx} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {person}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {analysis.entities?.locations?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {text.locations}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.entities.locations.map((location, idx) => (
                                                        <Badge key={idx} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            {location}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {analysis.entities?.organizations?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                                    <Building className="w-4 h-4" />
                                                    {text.organizations}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.entities.organizations.map((org, idx) => (
                                                        <Badge key={idx} className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                            {org}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Themes */}
                            {analysis.themes?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Card className="dark:bg-gray-900 dark:border-gray-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2 dark:text-gray-200">
                                                <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                {text.themes}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.themes.map((theme, idx) => (
                                                    <Badge key={idx} variant="outline" className="dark:border-gray-600">
                                                        {theme}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-2 gap-4"
                            >
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                <span className="text-sm font-medium dark:text-gray-300">{text.tagsAdded}</span>
                                            </div>
                                            <span className="text-2xl font-bold text-[#002D62] dark:text-blue-400">
                                                {analysis.tags_added || 0}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="dark:bg-gray-900 dark:border-gray-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                <span className="text-sm font-medium dark:text-gray-300">{text.keywordsAdded}</span>
                                            </div>
                                            <span className="text-2xl font-bold text-[#002D62] dark:text-blue-400">
                                                {analysis.keywords_added || 0}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <div className="flex justify-end">
                                <Button onClick={() => setShowResults(false)}>
                                    {text.close}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}