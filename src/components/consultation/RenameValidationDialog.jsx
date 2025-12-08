import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, X, Edit2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Sugestão de Renomeação',
        subtitle: 'Analisamos o tema predominante desta conversa',
        currentName: 'Nome Atual',
        suggestedName: 'Nome Sugerido',
        primaryTheme: 'Tema Principal',
        secondaryThemes: 'Temas Secundários',
        confidence: 'Confiança',
        reasoning: 'Justificativa',
        customName: 'Nome Personalizado (opcional)',
        approve: 'Aprovar',
        reject: 'Rejeitar',
        edit: 'Editar e Aprovar',
        approving: 'Aprovando...',
        rejecting: 'Rejeitando...'
    },
    en: {
        title: 'Rename Suggestion',
        subtitle: 'We analyzed the predominant theme of this conversation',
        currentName: 'Current Name',
        suggestedName: 'Suggested Name',
        primaryTheme: 'Primary Theme',
        secondaryThemes: 'Secondary Themes',
        confidence: 'Confidence',
        reasoning: 'Reasoning',
        customName: 'Custom Name (optional)',
        approve: 'Approve',
        reject: 'Reject',
        edit: 'Edit & Approve',
        approving: 'Approving...',
        rejecting: 'Rejecting...'
    }
};

export default function RenameValidationDialog({ 
    open, 
    onOpenChange, 
    conversationId,
    currentName,
    renameData,
    onComplete,
    lang = 'pt'
}) {
    const t = translations[lang];
    const [customName, setCustomName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            const response = await base44.functions.invoke('applyConversationRename', {
                conversation_id: conversationId,
                approved: true,
                custom_name: customName || null
            });

            toast.success(lang === 'pt' ? 'Conversa renomeada com sucesso!' : 'Conversation renamed successfully!');
            onComplete?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error approving rename:', error);
            toast.error(lang === 'pt' ? 'Erro ao renomear' : 'Error renaming');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        setIsProcessing(true);
        try {
            await base44.functions.invoke('applyConversationRename', {
                conversation_id: conversationId,
                approved: false
            });

            toast.success(lang === 'pt' ? 'Sugestão rejeitada' : 'Suggestion rejected');
            onComplete?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error rejecting rename:', error);
            toast.error(lang === 'pt' ? 'Erro ao rejeitar' : 'Error rejecting');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!renameData) return null;

    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return 'bg-green-100 text-green-800';
        if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-[#B8860B]" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription>{t.subtitle}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Name */}
                    <div>
                        <label className="text-sm font-medium text-[#333F48]/60 mb-1 block">
                            {t.currentName}
                        </label>
                        <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-sm text-[#333F48]">{currentName}</p>
                        </div>
                    </div>

                    {/* Suggested Name */}
                    <div>
                        <label className="text-sm font-medium text-[#333F48]/60 mb-1 block">
                            {t.suggestedName}
                        </label>
                        <div className="px-3 py-2 rounded-lg bg-[#002D62]/5 border border-[#002D62]/20">
                            <p className="text-sm font-semibold text-[#002D62]">
                                {renameData.suggested_name}
                            </p>
                        </div>
                    </div>

                    {/* Primary Theme */}
                    <div>
                        <label className="text-sm font-medium text-[#333F48]/60 mb-2 block">
                            {t.primaryTheme}
                        </label>
                        <Badge className="bg-[#00654A] text-white">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {renameData.primary_theme}
                        </Badge>
                    </div>

                    {/* Secondary Themes */}
                    {renameData.secondary_themes?.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-[#333F48]/60 mb-2 block">
                                {t.secondaryThemes}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {renameData.secondary_themes.map((theme, idx) => (
                                    <Badge key={idx} variant="outline">
                                        {theme}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Confidence */}
                    <div>
                        <label className="text-sm font-medium text-[#333F48]/60 mb-2 block">
                            {t.confidence}
                        </label>
                        <Badge className={getConfidenceColor(renameData.confidence)}>
                            {renameData.confidence}%
                        </Badge>
                    </div>

                    {/* Reasoning */}
                    {renameData.reasoning && (
                        <div>
                            <label className="text-sm font-medium text-[#333F48]/60 mb-1 block">
                                {t.reasoning}
                            </label>
                            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                                <p className="text-sm text-[#333F48] leading-relaxed">
                                    {renameData.reasoning}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Custom Name Input */}
                    {isEditing && (
                        <div>
                            <label className="text-sm font-medium text-[#333F48]/60 mb-1 block">
                                {t.customName}
                            </label>
                            <Input
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder={renameData.suggested_name}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="gap-2"
                    >
                        <X className="w-4 h-4" />
                        {isProcessing ? t.rejecting : t.reject}
                    </Button>
                    
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                    className="gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    {t.edit}
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="bg-[#002D62] hover:bg-[#001d42] gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    {isProcessing ? t.approving : t.approve}
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="bg-[#002D62] hover:bg-[#001d42] gap-2"
                            >
                                <Check className="w-4 h-4" />
                                {isProcessing ? t.approving : t.approve}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}