import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp, BarChart3, Library } from 'lucide-react';
import VocabularyManager from './VocabularyManager';
import ConceptEvolutionTracker from './ConceptEvolutionTracker';
import HUAValidator from './HUAValidator';
import DocumentLibrary from './DocumentLibrary';
import ArticleAnalyzer from './ArticleAnalyzer';

export default function KnowledgeHub({ lang = 'pt' }) {
    const translations = {
        pt: {
            documents: "Documentos",
            vocabulary: "Vocabulário",
            evolution: "Evolução Conceitual",
            validation: "Validação HUA"
        },
        en: {
            documents: "Documents",
            vocabulary: "Vocabulary",
            evolution: "Conceptual Evolution",
            validation: "HUA Validation"
        }
    };

    const t = translations[lang];

    return (
        <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
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