import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function SyncMonitor({ lang = 'pt' }) {
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [progress, setProgress] = useState(0);

    const t = {
        pt: {
            title: 'Sincronização World Bank',
            sync: 'Sincronizar Agora',
            syncing: 'Sincronizando...',
            lastSync: 'Última Sincronização',
            status: 'Status',
            created: 'Criados',
            updated: 'Atualizados',
            skipped: 'Ignorados',
            errors: 'Erros',
            never: 'Nunca sincronizado'
        },
        en: {
            title: 'World Bank Sync',
            sync: 'Sync Now',
            syncing: 'Syncing...',
            lastSync: 'Last Sync',
            status: 'Status',
            created: 'Created',
            updated: 'Updated',
            skipped: 'Skipped',
            errors: 'Errors',
            never: 'Never synced'
        }
    };

    const text = t[lang];

    const handleSync = async () => {
        setSyncing(true);
        setProgress(10);
        
        try {
            const response = await base44.functions.invoke('syncWorldBankData', {
                countries: ['BRA', 'CHN', 'IND', 'RUS', 'ZAF', 'USA'],
                force_update: false
            });

            setProgress(100);

            if (response.data.success) {
                setLastSync(response.data.sync_log);
                toast.success(
                    `${response.data.sync_log.facts_created} novos fatos criados, ${response.data.sync_log.facts_updated} atualizados`
                );
            }
        } catch (error) {
            console.error('Error syncing:', error);
            toast.error('Erro na sincronização');
        } finally {
            setSyncing(false);
            setProgress(0);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <Database className="w-5 h-5" />
                        {text.title}
                    </CardTitle>
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        size="sm"
                    >
                        {syncing ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                {text.syncing}
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {text.sync}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {syncing && (
                    <div className="space-y-2">
                        <Progress value={progress} />
                        <p className="text-xs text-center text-gray-500">
                            Sincronizando dados do World Bank...
                        </p>
                    </div>
                )}

                {lastSync && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{text.lastSync}:</span>
                            <span className="font-medium">
                                {new Date(lastSync.completed_at).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <div>
                                            <p className="text-xs text-green-700">{text.created}</p>
                                            <p className="text-lg font-bold text-green-900">
                                                {lastSync.facts_created}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-blue-700">{text.updated}</p>
                                            <p className="text-lg font-bold text-blue-900">
                                                {lastSync.facts_updated}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-50 border-gray-200">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-gray-600" />
                                        <div>
                                            <p className="text-xs text-gray-700">{text.skipped}</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {lastSync.facts_skipped}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {lastSync.errors.length > 0 && (
                                <Card className="bg-red-50 border-red-200">
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                            <div>
                                                <p className="text-xs text-red-700">{text.errors}</p>
                                                <p className="text-lg font-bold text-red-900">
                                                    {lastSync.errors.length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {lastSync.indicators_processed} indicadores processados
                            </Badge>
                        </div>
                    </div>
                )}

                {!lastSync && !syncing && (
                    <div className="text-center py-6 text-gray-500 text-sm">
                        {text.never}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}