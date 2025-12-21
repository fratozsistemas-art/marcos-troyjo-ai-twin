import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const actionColors = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    verify: 'bg-purple-100 text-purple-800',
    restore: 'bg-amber-100 text-amber-800'
};

export default function CorporateFactHistory({ fact, isOpen, onClose, lang = 'pt' }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const t = {
        pt: {
            title: 'Histórico de Alterações',
            action: 'Ação',
            changedBy: 'Alterado por',
            date: 'Data',
            oldValue: 'Valor Anterior',
            newValue: 'Novo Valor',
            reason: 'Motivo',
            restore: 'Restaurar',
            noHistory: 'Sem histórico de alterações'
        },
        en: {
            title: 'Change History',
            action: 'Action',
            changedBy: 'Changed by',
            date: 'Date',
            oldValue: 'Previous Value',
            newValue: 'New Value',
            reason: 'Reason',
            restore: 'Restore',
            noHistory: 'No change history'
        }
    }[lang];

    useEffect(() => {
        if (isOpen && fact) {
            loadHistory();
        }
    }, [isOpen, fact]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.CorporateFactHistory.filter({
                fact_id: fact.id
            });
            setHistory(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (historyEntry) => {
        try {
            const user = await base44.auth.me();
            
            // Update fact with old value
            await base44.entities.CorporateFact.update(fact.id, {
                [historyEntry.field_name]: historyEntry.old_value
            });

            // Log restore action
            await base44.entities.CorporateFactHistory.create({
                fact_id: fact.id,
                field_name: historyEntry.field_name,
                old_value: historyEntry.new_value,
                new_value: historyEntry.old_value,
                changed_by: user.email,
                action_type: 'restore',
                change_reason: 'Restored from history'
            });

            toast.success(lang === 'pt' ? 'Valor restaurado!' : 'Value restored!');
            loadHistory();
        } catch (error) {
            console.error('Error restoring:', error);
            toast.error(lang === 'pt' ? 'Erro ao restaurar' : 'Error restoring');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-[#002D62]" />
                        {t.title}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {t.noHistory}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((entry) => (
                            <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge className={actionColors[entry.action_type]}>
                                            {entry.action_type}
                                        </Badge>
                                        <span className="text-sm text-gray-600">
                                            {new Date(entry.created_date).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                        </span>
                                    </div>
                                    {entry.action_type === 'update' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRestore(entry)}
                                        >
                                            <RotateCcw className="w-3 h-3 mr-1" />
                                            {t.restore}
                                        </Button>
                                    )}
                                </div>
                                <div className="text-sm space-y-1">
                                    <p className="text-gray-700">
                                        <span className="font-semibold">{t.changedBy}:</span> {entry.changed_by}
                                    </p>
                                    {entry.field_name && (
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Campo:</span> {entry.field_name}
                                        </p>
                                    )}
                                    {entry.old_value && (
                                        <p className="text-gray-700">
                                            <span className="font-semibold">{t.oldValue}:</span> {entry.old_value}
                                        </p>
                                    )}
                                    {entry.new_value && (
                                        <p className="text-gray-700">
                                            <span className="font-semibold">{t.newValue}:</span> {entry.new_value}
                                        </p>
                                    )}
                                    {entry.change_reason && (
                                        <p className="text-gray-700">
                                            <span className="font-semibold">{t.reason}:</span> {entry.change_reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}