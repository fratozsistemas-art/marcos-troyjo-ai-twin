import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function VersionHistory({ open, onOpenChange, itemType, itemId, onRestore, lang = 'pt' }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);

    const t = {
        pt: {
            title: 'Histórico de Versões',
            description: 'Visualize e restaure versões anteriores',
            version: 'Versão',
            current: 'Atual',
            restore: 'Restaurar',
            restoring: 'Restaurando...',
            noVersions: 'Nenhuma versão anterior',
            restoreSuccess: 'Versão restaurada com sucesso!',
            changes: 'Alterações'
        },
        en: {
            title: 'Version History',
            description: 'View and restore previous versions',
            version: 'Version',
            current: 'Current',
            restore: 'Restore',
            restoring: 'Restoring...',
            noVersions: 'No previous versions',
            restoreSuccess: 'Version restored successfully!',
            changes: 'Changes'
        }
    }[lang];

    useEffect(() => {
        if (open && itemId) {
            loadVersions();
        }
    }, [open, itemId]);

    const loadVersions = async () => {
        setLoading(true);
        try {
            const versionList = await base44.entities.Version.filter(
                { item_type: itemType, item_id: itemId },
                '-version_number'
            );
            setVersions(versionList || []);
        } catch (error) {
            console.error('Error loading versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (version) => {
        try {
            await onRestore(version.content);
            
            // Create new version entry
            const maxVersion = Math.max(...versions.map(v => v.version_number), 0);
            await base44.entities.Version.create({
                item_type: itemType,
                item_id: itemId,
                version_number: maxVersion + 1,
                content: version.content,
                change_summary: `Restored from version ${version.version_number}`
            });

            toast.success(t.restoreSuccess);
            onOpenChange(false);
        } catch (error) {
            console.error('Error restoring version:', error);
            toast.error('Error restoring version');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-96">
                    {versions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>{t.noVersions}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((version, index) => (
                                <div
                                    key={version.id}
                                    className="border rounded-lg p-4 hover:border-[#002D62]/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={index === 0 ? 'default' : 'outline'} className={index === 0 ? 'bg-[#00654A]' : ''}>
                                                {t.version} {version.version_number}
                                            </Badge>
                                            {index === 0 && (
                                                <Badge variant="secondary">{t.current}</Badge>
                                            )}
                                        </div>
                                        {index > 0 && (
                                            <Button
                                                onClick={() => handleRestore(version)}
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                {t.restore}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(version.created_date).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="w-3 h-3" />
                                            <span>{version.created_by}</span>
                                        </div>
                                        {version.change_summary && (
                                            <div className="text-gray-700 mt-2">
                                                <strong>{t.changes}:</strong> {version.change_summary}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}