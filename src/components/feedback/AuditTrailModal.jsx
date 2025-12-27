import React, { useState } from 'react';
import { ExternalLink, Book, FileText, Globe, Database, Award, User, Calendar, CheckCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

export default function AuditTrailModal({ sources = [], lang = 'pt', trigger }) {
    const [open, setOpen] = useState(false);

    const t = {
        pt: {
            title: 'Fontes e Auditoria',
            description: 'Documentos e fontes utilizados para gerar esta resposta',
            noSources: 'Nenhuma fonte específica foi citada para esta resposta',
            type: 'Tipo',
            date: 'Data',
            verified: 'Verificado',
            viewSource: 'Ver fonte'
        },
        en: {
            title: 'Sources & Audit Trail',
            description: 'Documents and sources used to generate this response',
            noSources: 'No specific sources were cited for this response',
            type: 'Type',
            date: 'Date',
            verified: 'Verified',
            viewSource: 'View source'
        }
    };

    const text = t[lang];

    const getSourceIcon = (type) => {
        const icons = {
            book: Book,
            article: FileText,
            publication: Award,
            speech: User,
            document: FileText,
            web: Globe,
            database: Database,
            default: FileText
        };
        return icons[type?.toLowerCase()] || icons.default;
    };

    const getSourceColor = (type) => {
        const colors = {
            book: 'bg-blue-50 text-blue-600 border-blue-200',
            article: 'bg-green-50 text-green-600 border-green-200',
            publication: 'bg-purple-50 text-purple-600 border-purple-200',
            speech: 'bg-orange-50 text-orange-600 border-orange-200',
            document: 'bg-gray-50 text-gray-600 border-gray-200',
            web: 'bg-cyan-50 text-cyan-600 border-cyan-200',
            database: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            default: 'bg-gray-50 text-gray-600 border-gray-200'
        };
        return colors[type?.toLowerCase()] || colors.default;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">{text.title}</span>
                        <Badge variant="secondary">{sources.length}</Badge>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {text.title}
                    </DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    {sources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <Database className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="text-sm">{text.noSources}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sources.map((source, index) => {
                                const Icon = getSourceIcon(source.type);
                                const colorClass = getSourceColor(source.type);

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg border ${colorClass}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-semibold text-gray-900 text-sm">
                                                        {source.title || source.name || 'Untitled Source'}
                                                    </h4>
                                                    {source.verified && (
                                                        <Badge variant="outline" className="gap-1 text-xs">
                                                            <CheckCircle className="w-3 h-3" />
                                                            {text.verified}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {source.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {source.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    {source.type && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {source.type}
                                                        </Badge>
                                                    )}
                                                    {source.date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {source.date}
                                                        </span>
                                                    )}
                                                    {source.author && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {source.author}
                                                        </span>
                                                    )}
                                                </div>

                                                {source.url && (
                                                    <a
                                                        href={source.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {text.viewSource}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}