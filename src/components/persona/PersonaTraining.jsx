import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, BookOpen, Brain, FileText, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Treinamento de Persona',
        description: 'Ensine a persona com documentos específicos',
        upload: 'Adicionar Documento',
        uploading: 'Enviando...',
        training: 'Treinando...',
        trainPersona: 'Treinar Persona',
        noDocuments: 'Nenhum documento de treinamento',
        uploadFirst: 'Faça upload de documentos para treinar a persona',
        trained: 'Treinado',
        remove: 'Remover',
        processing: 'Processando...',
        trained_docs: 'Documentos de Treinamento'
    },
    en: {
        title: 'Persona Training',
        description: 'Train the persona with specific documents',
        upload: 'Add Document',
        uploading: 'Uploading...',
        training: 'Training...',
        trainPersona: 'Train Persona',
        noDocuments: 'No training documents',
        uploadFirst: 'Upload documents to train the persona',
        trained: 'Trained',
        remove: 'Remove',
        processing: 'Processing...',
        trained_docs: 'Training Documents'
    }
};

export default function PersonaTraining({ lang = 'pt' }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [training, setTraining] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadTrainingDocs();
    }, []);

    const loadTrainingDocs = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const docs = await base44.entities.Document.filter({
                created_by: user.email,
                category: 'persona_training'
            });
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading training docs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            for (const file of files) {
                const uploadResult = await base44.integrations.Core.UploadFile({ file });
                
                await base44.entities.Document.create({
                    title: file.name,
                    file_url: uploadResult.file_url,
                    file_type: file.name.split('.').pop().toLowerCase(),
                    file_size: file.size,
                    category: 'persona_training',
                    usage_count: 0,
                    metadata: {
                        trained: false
                    }
                });
            }

            toast.success(lang === 'pt' ? 'Documentos carregados!' : 'Documents uploaded!');
            await loadTrainingDocs();
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error('Error');
        } finally {
            setUploading(false);
        }
    };

    const handleTrainPersona = async () => {
        setTraining(true);
        try {
            const untrainedDocs = documents.filter(d => !d.metadata?.trained);
            
            for (const doc of untrainedDocs) {
                // Extract content and create embeddings
                await base44.functions.invoke('trainPersonaWithDocument', {
                    document_id: doc.id,
                    file_url: doc.file_url
                });

                // Mark as trained
                await base44.entities.Document.update(doc.id, {
                    metadata: {
                        ...doc.metadata,
                        trained: true,
                        trained_at: new Date().toISOString()
                    }
                });
            }

            toast.success(lang === 'pt' ? 'Persona treinada com sucesso!' : 'Persona trained successfully!');
            await loadTrainingDocs();
        } catch (error) {
            console.error('Error training:', error);
            toast.error('Error');
        } finally {
            setTraining(false);
        }
    };

    const handleRemove = async (docId) => {
        try {
            await base44.entities.Document.delete(docId);
            setDocuments(documents.filter(d => d.id !== docId));
            toast.success(lang === 'pt' ? 'Documento removido' : 'Document removed');
        } catch (error) {
            console.error('Error removing:', error);
            toast.error('Error');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Brain className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <label htmlFor="training-upload">
                            <Button disabled={uploading} className="bg-[#002D62] hover:bg-[#001d42]" asChild>
                                <span>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t.uploading}
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            {t.upload}
                                        </>
                                    )}
                                </span>
                            </Button>
                        </label>
                        <Input
                            id="training-upload"
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            multiple
                            className="hidden"
                            onChange={handleUpload}
                        />
                        {documents.some(d => !d.metadata?.trained) && (
                            <Button
                                onClick={handleTrainPersona}
                                disabled={training}
                                variant="outline"
                            >
                                {training ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.training}
                                    </>
                                ) : (
                                    <>
                                        <Brain className="w-4 h-4 mr-2" />
                                        {t.trainPersona}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">{t.noDocuments}</p>
                        <p className="text-xs text-gray-400 mt-1">{t.uploadFirst}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="border border-gray-100 rounded-lg p-4 hover:border-[#002D62]/20 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <FileText className="w-8 h-8 text-[#002D62]" />
                                        <div>
                                            <h4 className="font-semibold text-sm text-[#002D62]">
                                                {doc.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {doc.file_type.toUpperCase()}
                                                </Badge>
                                                {doc.metadata?.trained ? (
                                                    <Badge className="bg-green-100 text-green-800 text-xs gap-1">
                                                        <Check className="w-3 h-3" />
                                                        {t.trained}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {t.processing}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(doc.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}