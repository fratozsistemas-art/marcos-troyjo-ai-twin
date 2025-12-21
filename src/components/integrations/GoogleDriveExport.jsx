import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        exportToDrive: 'Exportar para Google Drive',
        fileName: 'Nome do arquivo',
        folderName: 'Nome da pasta (opcional)',
        uploading: 'Enviando...',
        export: 'Exportar',
        cancel: 'Cancelar',
        success: 'Arquivo salvo no Google Drive!',
        viewFile: 'Ver no Drive',
        error: 'Erro ao exportar'
    },
    en: {
        exportToDrive: 'Export to Google Drive',
        fileName: 'File name',
        folderName: 'Folder name (optional)',
        uploading: 'Uploading...',
        export: 'Export',
        cancel: 'Cancel',
        success: 'File saved to Google Drive!',
        viewFile: 'View in Drive',
        error: 'Export error'
    }
};

export default function GoogleDriveExport({ 
    data, 
    defaultFileName, 
    mimeType = 'application/json',
    lang = 'pt',
    trigger 
}) {
    const [open, setOpen] = useState(false);
    const [fileName, setFileName] = useState(defaultFileName || 'export');
    const [folderName, setFolderName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadedLink, setUploadedLink] = useState(null);
    const t = translations[lang];

    const handleExport = async () => {
        if (!fileName.trim()) {
            toast.error(lang === 'pt' ? 'Digite um nome de arquivo' : 'Enter a file name');
            return;
        }

        setUploading(true);
        try {
            let fileContent;
            
            if (typeof data === 'string') {
                fileContent = data;
            } else if (typeof data === 'object') {
                fileContent = JSON.stringify(data, null, 2);
            } else {
                fileContent = String(data);
            }

            const response = await base44.functions.invoke('uploadToGoogleDrive', {
                file_name: fileName,
                file_content: fileContent,
                mime_type: mimeType,
                folder_name: folderName.trim() || undefined
            });

            if (response.data.success) {
                setUploadedLink(response.data.web_view_link);
                toast.success(t.success);
            } else {
                throw new Error(response.data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Error exporting to Drive:', error);
            toast.error(t.error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            {trigger ? (
                React.cloneElement(trigger, { onClick: () => setOpen(true) })
            ) : (
                <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    {t.exportToDrive}
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.exportToDrive}</DialogTitle>
                        <DialogDescription>
                            {lang === 'pt' 
                                ? 'Salve este arquivo no seu Google Drive' 
                                : 'Save this file to your Google Drive'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {uploadedLink ? (
                        <div className="text-center py-6">
                            <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-gray-900 mb-2">{t.success}</p>
                            <Button
                                onClick={() => window.open(uploadedLink, '_blank')}
                                className="gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {t.viewFile}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">{t.fileName}</label>
                                <Input
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    placeholder="my-file.json"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">{t.folderName}</label>
                                <Input
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    placeholder="Troyjo Analytics"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleExport} disabled={uploading}>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t.uploading}
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            {t.export}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}