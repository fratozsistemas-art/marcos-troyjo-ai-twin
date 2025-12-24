import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, GitCompare, RotateCcw, User, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { toast } from 'sonner';

export default function StrategicFactVersionHistory({ fact, onRevert, lang = 'pt' }) {
    const [versions, setVersions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVersions, setSelectedVersions] = useState([null, null]);
    const [compareDialogOpen, setCompareDialogOpen] = useState(false);

    const t = {
        pt: {
            title: 'Histórico de Versões',
            description: 'Acompanhe a evolução do fato',
            noVersions: 'Nenhuma versão registrada',
            version: 'Versão',
            changedBy: 'Alterado por',
            changeReason: 'Motivo',
            viewChanges: 'Ver Alterações',
            compare: 'Comparar',
            revert: 'Reverter',
            revertConfirm: 'Tem certeza que deseja reverter para esta versão?',
            reverted: 'Versão revertida com sucesso',
            added: 'Adicionado',
            modified: 'Modificado',
            removed: 'Removido',
            selectToCompare: 'Selecione 2 versões para comparar'
        },
        en: {
            title: 'Version History',
            description: 'Track fact evolution',
            noVersions: 'No versions recorded',
            version: 'Version',
            changedBy: 'Changed by',
            changeReason: 'Reason',
            viewChanges: 'View Changes',
            compare: 'Compare',
            revert: 'Revert',
            revertConfirm: 'Are you sure you want to revert to this version?',
            reverted: 'Version reverted successfully',
            added: 'Added',
            modified: 'Modified',
            removed: 'Removed',
            selectToCompare: 'Select 2 versions to compare'
        }
    };

    const text = t[lang];

    useEffect(() => {
        if (fact?.fact_id) {
            loadVersions();
        }
    }, [fact?.fact_id]);

    const loadVersions = async () => {
        setIsLoading(true);
        try {
            const history = await base44.entities.StrategicFactHistory.filter({ 
                fact_id: fact.fact_id 
            });
            setVersions(history.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error('Error loading versions:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar histórico' : 'Error loading history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevert = async (version) => {
        if (!confirm(text.revertConfirm)) return;

        try {
            await base44.entities.StrategicFact.update(fact.id, version.snapshot);
            toast.success(text.reverted);
            if (onRevert) onRevert();
        } catch (error) {
            console.error('Error reverting:', error);
            toast.error(lang === 'pt' ? 'Erro ao reverter' : 'Error reverting');
        }
    };

    const toggleVersionSelection = (version) => {
        if (selectedVersions[0]?.id === version.id) {
            setSelectedVersions([selectedVersions[1], null]);
        } else if (selectedVersions[1]?.id === version.id) {
            setSelectedVersions([selectedVersions[0], null]);
        } else if (!selectedVersions[0]) {
            setSelectedVersions([version, selectedVersions[1]]);
        } else {
            setSelectedVersions([selectedVersions[0], version]);
        }
    };

    const renderDiff = (changes) => {
        if (!changes || (Object.keys(changes.added || {}).length === 0 && 
            Object.keys(changes.modified || {}).length === 0 && 
            Object.keys(changes.removed || {}).length === 0)) {
            return <p className="text-sm text-gray-500">{lang === 'pt' ? 'Nenhuma alteração' : 'No changes'}</p>;
        }

        return (
            <div className="space-y-3">
                {Object.keys(changes.added || {}).length > 0 && (
                    <div>
                        <Badge className="bg-green-100 text-green-800 mb-2">{text.added}</Badge>
                        <div className="space-y-1">
                            {Object.entries(changes.added).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                    <span className="font-semibold">{key}:</span>{' '}
                                    <span className="text-green-700">{JSON.stringify(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {Object.keys(changes.modified || {}).length > 0 && (
                    <div>
                        <Badge className="bg-blue-100 text-blue-800 mb-2">{text.modified}</Badge>
                        <div className="space-y-2">
                            {Object.entries(changes.modified).map(([key, change]) => (
                                <div key={key} className="text-sm border-l-2 border-blue-300 pl-3">
                                    <div className="font-semibold">{key}:</div>
                                    <div className="text-red-600 line-through">
                                        {JSON.stringify(change.old)}
                                    </div>
                                    <div className="text-green-600">
                                        {JSON.stringify(change.new)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {Object.keys(changes.removed || {}).length > 0 && (
                    <div>
                        <Badge className="bg-red-100 text-red-800 mb-2">{text.removed}</Badge>
                        <div className="space-y-1">
                            {Object.entries(changes.removed).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                    <span className="font-semibold">{key}:</span>{' '}
                                    <span className="text-red-700 line-through">{JSON.stringify(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderComparison = () => {
        if (!selectedVersions[0] || !selectedVersions[1]) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <GitCompare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>{text.selectToCompare}</p>
                </div>
            );
        }

        const [v1, v2] = selectedVersions.sort((a, b) => 
            new Date(b.created_date) - new Date(a.created_date)
        );

        const diff = calculateDiff(v2.snapshot, v1.snapshot);

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <Badge variant="outline">{v2.version}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                            {moment(v2.created_date).format('MMM D, YYYY HH:mm')}
                        </p>
                    </div>
                    <div>
                        <Badge variant="outline">{v1.version}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                            {moment(v1.created_date).format('MMM D, YYYY HH:mm')}
                        </p>
                    </div>
                </div>
                {renderDiff({ modified: diff, added: {}, removed: {} })}
            </div>
        );
    };

    const calculateDiff = (old, current) => {
        const diff = {};
        for (const key in current) {
            if (JSON.stringify(old[key]) !== JSON.stringify(current[key])) {
                diff[key] = { old: old[key], new: current[key] };
            }
        }
        return diff;
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
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
                            <Clock className="w-5 h-5 text-[#002D62]" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.description}</CardDescription>
                    </div>
                    {selectedVersions.filter(v => v).length === 2 && (
                        <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <GitCompare className="w-4 h-4 mr-2" />
                                    {text.compare}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>{text.compare}</DialogTitle>
                                </DialogHeader>
                                {renderComparison()}
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {versions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>{text.noVersions}</p>
                    </div>
                ) : (
                    <ScrollArea className="h-96">
                        <div className="space-y-3">
                            <AnimatePresence>
                                {versions.map((version) => (
                                    <motion.div
                                        key={version.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`p-4 border rounded-lg transition-colors ${
                                            selectedVersions.some(v => v?.id === version.id)
                                                ? 'border-[#002D62] bg-blue-50'
                                                : 'hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline">
                                                        {text.version} {version.version}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {moment(version.created_date).fromNow()}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                    <User className="w-3 h-3" />
                                                    <span>{version.changed_by}</span>
                                                </div>
                                                {version.change_reason && (
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        {version.change_reason}
                                                    </p>
                                                )}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 px-2">
                                                            {text.viewChanges}
                                                            <ChevronRight className="w-3 h-3 ml-1" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                {text.version} {version.version}
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <ScrollArea className="max-h-96">
                                                            {renderDiff(version.changes)}
                                                        </ScrollArea>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={selectedVersions.some(v => v?.id === version.id) ? "default" : "outline"}
                                                    onClick={() => toggleVersionSelection(version)}
                                                >
                                                    <GitCompare className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRevert(version)}
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}