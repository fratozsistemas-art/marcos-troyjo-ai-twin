import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp, BarChart3, Database } from 'lucide-react';
import VocabularyManager from './VocabularyManager';
import ConceptEvolutionTracker from './ConceptEvolutionTracker';
import HUAValidator from './HUAValidator';
import KnowledgeBaseManager from './KnowledgeBaseManager';

export default function KnowledgeHub({ lang = 'pt' }) {
    const translations = {
        pt: {
            deliverables: "Deliverables IA",
            vocabulary: "Vocabulário",
            evolution: "Evolução Conceitual",
            validation: "Validação HUA"
        },
        en: {
            deliverables: "AI Deliverables",
            vocabulary: "Vocabulary",
            evolution: "Conceptual Evolution",
            validation: "HUA Validation"
        }
    };

    const t = translations[lang];

    return (
        <Tabs defaultValue="deliverables" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="deliverables" className="gap-2">
                    <Database className="w-4 h-4" />
                    {t.deliverables}
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

            <TabsContent value="deliverables">
                <KnowledgeBaseManager lang={lang} />
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