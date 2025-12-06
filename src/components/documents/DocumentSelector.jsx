import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Search, Loader2, Check } from 'lucide-react';

export default function DocumentSelector({ selectedDocuments = [], onSelectionChange, lang = 'pt' }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const translations = {
        pt: {
            title: 'Selecionar Documentos',
            description: 'Escolha documentos da sua biblioteca para usar como contexto',
            search: 'Buscar documentos...',
            noDocuments: 'Nenhum documento encontrado',
            selected: 'selecionado(s)'
        },
        en: {
            title: 'Select Documents',
            description: 'Choose documents from your library to use as context',
            search: 'Search documents...',
            noDocuments: 'No documents found',
            selected: 'selected'
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const docs = await base44.entities.Document.list('-created_date', 100);
            setDocuments(docs || []);
        } catch (error) {
            console.error('Error loading documents:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleDocument = (doc) => {
        const isSelected = selectedDocuments.some(d => d.id === doc.id);
        if (isSelected) {
            onSelectionChange(selectedDocuments.filter(d => d.id !== doc.id));
        } else {
            onSelectionChange([...selectedDocuments, doc]);
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.title?.toLowerCase().includes(search.toLowerCase()) ||
        doc.description?.toLowerCase().includes(search.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    const getFileIcon = (fileType) => {
        const icons = {
            'pdf': '📄',
            'docx': '📝',
            'doc': '📝',
            'txt': '📃',
            'csv': '📊'
        };
        return icons[fileType] || '📎';
    };

    if (loading) {
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
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-[#002D62]">{t.title}</CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    {selectedDocuments.length > 0 && (
                        <Badge className="bg-[#00654A]">
                            {selectedDocuments.length} {t.selected}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.search}
                        className="pl-10"
                    />
                </div>

                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">{t.noDocuments}</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredDocuments.map((doc) => {
                            const isSelected = selectedDocuments.some(d => d.id === doc.id);
                            return (
                                <div
                                    key={doc.id}
                                    onClick={() => toggleDocument(doc)}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-[#002D62] bg-blue-50'
                                            : 'border-gray-200 hover:border-[#002D62]/30 hover:bg-gray-50'
                                    }`}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{getFileIcon(doc.file_type)}</span>
                                            <h4 className="font-medium text-sm text-[#333F48] truncate">
                                                {doc.title}
                                            </h4>
                                        </div>
                                        {doc.description && (
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {doc.description}
                                            </p>
                                        )}
                                        {doc.tags && doc.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {doc.tags.slice(0, 3).map((tag, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <Check className="w-5 h-5 text-[#00654A] flex-shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}