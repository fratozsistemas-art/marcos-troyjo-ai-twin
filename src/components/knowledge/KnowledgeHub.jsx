import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp, BarChart3, Library, Database } from 'lucide-react';
import VocabularyManager from './VocabularyManager';
import ConceptEvolutionTracker from './ConceptEvolutionTracker';
import HUAValidator from './HUAValidator';
import DocumentLibrary from './DocumentLibrary';
import ArticleAnalyzer from './ArticleAnalyzer';
import KnowledgeBaseManager from './KnowledgeBaseManager';

export default function KnowledgeHub({ lang = 'pt' }) {
    const translations = {
        pt: {
            knowledge: "Base de Conhecimento",
            documents: "Documentos",
            vocabulary: "Vocabulário",
            evolution: "Evolução Conceitual",
            validation: "Validação HUA"
        },
        en: {
            knowledge: "Knowledge Base",
            documents: "Documents",
            vocabulary: "Vocabulary",
            evolution: "Conceptual Evolution",
            validation: "HUA Validation"
        }
    };

    const t = translations[lang];

    return (
        <Tabs defaultValue="knowledge" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="knowledge" className="gap-2">
                    <Database className="w-4 h-4" />
                    {t.knowledge}
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                    <Library className="w-4 h-4" />
                    {t.documents}
                </TabsTrigger>
                <TabsTrigger value="vocabulary" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t.vocabulary}
                </TabsTrigger>
                <TabsTrigger value="evolution" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t.evolution}
                </TabsTrigger>
                <TabsTrigger value="validation" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {t.validation}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="knowledge">
                <KnowledgeBaseManager lang={lang} />
            </TabsContent>

            <TabsContent value="documents">
                <DocumentLibrary lang={lang} />
            </TabsContent>

            <TabsContent value="vocabulary">
                <VocabularyManager lang={lang} />
            </TabsContent>

            <TabsContent value="evolution">
                <ConceptEvolutionTracker lang={lang} />
            </TabsContent>

            <TabsContent value="validation">
                <HUAValidator lang={lang} />
            </TabsContent>
        </Tabs>
    );
}