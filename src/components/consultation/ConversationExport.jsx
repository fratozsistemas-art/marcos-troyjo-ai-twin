import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileJson, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ConversationExport({ conversation, messages, lang = 'pt' }) {
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState('pdf');
    const [includeMetadata, setIncludeMetadata] = useState(true);
    const [selectedRange, setSelectedRange] = useState({ start: 0, end: messages.length });
    const [isExporting, setIsExporting] = useState(false);

    const t = {
        pt: {
            title: 'Exportar Conversa',
            description: 'Escolha o formato e as opções de exportação',
            format: 'Formato',
            pdf: 'PDF (Profissional)',
            text: 'Texto Simples',
            json: 'JSON (Completo)',
            range: 'Intervalo de Mensagens',
            allMessages: 'Todas as mensagens',
            customRange: 'Intervalo personalizado',
            from: 'De',
            to: 'Até',
            metadata: 'Incluir Metadados',
            metadataDesc: 'Timestamps, roles e informações técnicas',
            export: 'Exportar',
            exporting: 'Exportando...',
            cancel: 'Cancelar'
        },
        en: {
            title: 'Export Conversation',
            description: 'Choose format and export options',
            format: 'Format',
            pdf: 'PDF (Professional)',
            text: 'Plain Text',
            json: 'JSON (Complete)',
            range: 'Message Range',
            allMessages: 'All messages',
            customRange: 'Custom range',
            from: 'From',
            to: 'To',
            metadata: 'Include Metadata',
            metadataDesc: 'Timestamps, roles and technical information',
            export: 'Export',
            exporting: 'Exporting...',
            cancel: 'Cancel'
        }
    }[lang];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await base44.functions.invoke('exportConversation', {
                conversation_id: conversation.id,
                format,
                include_metadata: includeMetadata,
                message_range: selectedRange
            });

            // Create blob and download
            const blob = new Blob([response.data.content], { 
                type: response.data.mimeType 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.data.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            toast.success(lang === 'pt' ? 'Conversa exportada com sucesso!' : 'Conversation exported successfully!');
            setOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.error(lang === 'pt' ? 'Erro ao exportar conversa' : 'Error exporting conversation');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    {lang === 'pt' ? 'Exportar' : 'Export'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Format Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">{t.format}</Label>
                        <RadioGroup value={format} onValueChange={setFormat}>
                            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="pdf" id="pdf" />
                                <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-red-500" />
                                        <span className="font-medium">{t.pdf}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {lang === 'pt' ? 'Formatação profissional com logos e estilo' : 'Professional formatting with logos and styling'}
                                    </p>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="txt" id="txt" />
                                <Label htmlFor="txt" className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">{t.text}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {lang === 'pt' ? 'Formato simples e universal' : 'Simple and universal format'}
                                    </p>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="json" id="json" />
                                <Label htmlFor="json" className="flex-1 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <FileJson className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">{t.json}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {lang === 'pt' ? 'Dados completos para análise técnica' : 'Complete data for technical analysis'}
                                    </p>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-start space-x-2 p-3 rounded-lg border">
                        <Checkbox 
                            id="metadata" 
                            checked={includeMetadata}
                            onCheckedChange={setIncludeMetadata}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="metadata" className="cursor-pointer font-medium">
                                {t.metadata}
                            </Label>
                            <p className="text-xs text-gray-500">{t.metadataDesc}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
                        {t.cancel}
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting} className="bg-[#002D62]">
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.exporting}
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                {t.export}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}