import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    TrendingUp, BarChart3, AlertTriangle, FileText, Database
} from 'lucide-react';

const translations = {
    pt: {
        title: 'Adicionar Widget',
        description: 'Selecione um tipo de visualização',
        quarterlyData: 'Dados Trimestrais',
        quarterlyDataDesc: 'Visualização de dados econômicos trimestrais',
        customChart: 'Gráfico Customizado',
        customChartDesc: 'Crie gráficos personalizados',
        riskMonitor: 'Monitor de Riscos',
        riskMonitorDesc: 'Acompanhamento de riscos geopolíticos',
        textNote: 'Nota de Texto',
        textNoteDesc: 'Adicione anotações e observações',
        worldBank: 'Dados World Bank',
        worldBankDesc: 'Indicadores econômicos do Banco Mundial',
        noteTitle: 'Título da Nota',
        noteContent: 'Conteúdo',
        add: 'Adicionar',
        cancel: 'Cancelar'
    },
    en: {
        title: 'Add Widget',
        description: 'Select a visualization type',
        quarterlyData: 'Quarterly Data',
        quarterlyDataDesc: 'Quarterly economic data visualization',
        customChart: 'Custom Chart',
        customChartDesc: 'Create custom charts',
        riskMonitor: 'Risk Monitor',
        riskMonitorDesc: 'Geopolitical risk tracking',
        textNote: 'Text Note',
        textNoteDesc: 'Add notes and observations',
        worldBank: 'World Bank Data',
        worldBankDesc: 'World Bank economic indicators',
        noteTitle: 'Note Title',
        noteContent: 'Content',
        add: 'Add',
        cancel: 'Cancel'
    }
};

export default function WidgetSelector({ open, onClose, onSelect, lang = 'pt' }) {
    const [selectedType, setSelectedType] = useState(null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteText, setNoteText] = useState('');
    const t = translations[lang];

    const widgetTypes = [
        {
            type: 'quarterly_data',
            icon: TrendingUp,
            title: t.quarterlyData,
            description: t.quarterlyDataDesc,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            type: 'custom_chart',
            icon: BarChart3,
            title: t.customChart,
            description: t.customChartDesc,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            type: 'risk_monitor',
            icon: AlertTriangle,
            title: t.riskMonitor,
            description: t.riskMonitorDesc,
            color: 'bg-amber-100 text-amber-600'
        },
        {
            type: 'text_note',
            icon: FileText,
            title: t.textNote,
            description: t.textNoteDesc,
            color: 'bg-green-100 text-green-600'
        },
        {
            type: 'world_bank',
            icon: Database,
            title: t.worldBank,
            description: t.worldBankDesc,
            color: 'bg-indigo-100 text-indigo-600'
        }
    ];

    const handleSelect = (type) => {
        if (type === 'text_note') {
            setSelectedType(type);
        } else {
            onSelect({ type, config: {} });
            handleClose();
        }
    };

    const handleAddNote = () => {
        onSelect({
            type: 'text_note',
            config: {
                title: noteTitle,
                text: noteText
            }
        });
        handleClose();
    };

    const handleClose = () => {
        setSelectedType(null);
        setNoteTitle('');
        setNoteText('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>
                
                {selectedType === 'text_note' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t.noteTitle}</label>
                            <Input
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder={t.noteTitle}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t.noteContent}</label>
                            <Textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder={t.noteContent}
                                rows={6}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={handleClose}>
                                {t.cancel}
                            </Button>
                            <Button onClick={handleAddNote} disabled={!noteTitle.trim()}>
                                {t.add}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {widgetTypes.map((widget) => {
                            const Icon = widget.icon;
                            return (
                                <Card
                                    key={widget.type}
                                    className="cursor-pointer hover:border-[#002D62] transition-all"
                                    onClick={() => handleSelect(widget.type)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${widget.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-[#002D62] mb-1">
                                                    {widget.title}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {widget.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}