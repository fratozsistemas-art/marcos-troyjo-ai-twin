import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DrillDownModal({ isOpen, onClose, entity, filterKey, filterValue, lang = 'pt' }) {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const t = {
        pt: { title: 'Registros Detalhados', loading: 'Carregando...', noRecords: 'Nenhum registro encontrado', close: 'Fechar' },
        en: { title: 'Detailed Records', loading: 'Loading...', noRecords: 'No records found', close: 'Close' }
    };

    useEffect(() => {
        if (isOpen && entity && filterKey && filterValue) {
            loadRecords();
        }
    }, [isOpen, entity, filterKey, filterValue]);

    const loadRecords = async () => {
        setIsLoading(true);
        try {
            const query = { [filterKey]: filterValue };
            const data = await base44.entities[entity].filter(query);
            setRecords(data);
        } catch (error) {
            console.error('Error loading records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{t[lang].title}</span>
                        <Badge variant="outline">{records.length} {lang === 'pt' ? 'registros' : 'records'}</Badge>
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62] mx-auto mb-3" />
                        <p className="text-sm text-gray-500">{t[lang].loading}</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <p>{t[lang].noRecords}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {records.map((record, idx) => (
                            <div key={record.id || idx} className="p-4 rounded-lg border border-gray-200 hover:border-[#002D62] transition-colors">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {Object.entries(record).filter(([key]) => !['id', 'created_date', 'updated_date', 'created_by'].includes(key)).map(([key, value]) => (
                                        <div key={key}>
                                            <span className="font-semibold text-gray-600">{key.replace(/_/g, ' ')}: </span>
                                            <span className="text-gray-800">
                                                {Array.isArray(value) ? value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '') :
                                                 typeof value === 'object' ? JSON.stringify(value).slice(0, 50) :
                                                 String(value).slice(0, 100)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={onClose}>
                        {t[lang].close}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}