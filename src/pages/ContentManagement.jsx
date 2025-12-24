import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, FileText, Sparkles, Settings } from 'lucide-react';
import BookManager from '@/components/cms/BookManager';
import AwardManager from '@/components/cms/AwardManager';
import PublicationManager from '@/components/cms/PublicationManager';
import NeologismManager from '@/components/cms/NeologismManager';

export default function ContentManagement() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    const t = {
        pt: {
            title: 'Gerenciamento de Conteúdo',
            subtitle: 'Gerencie todo o conteúdo do Website Público',
            books: 'Livros',
            awards: 'Prêmios',
            publications: 'Publicações',
            neologisms: 'Neologismos'
        },
        en: {
            title: 'Content Management',
            subtitle: 'Manage all Public Website content',
            books: 'Books',
            awards: 'Awards',
            publications: 'Publications',
            neologisms: 'Neologisms'
        }
    };

    const text = t[lang];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/7b4794e58_CapturadeTela2025-12-23s93044PM.png"
                                alt="MT Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#002D62]">{text.title}</h1>
                            <p className="text-gray-600">{text.subtitle}</p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="books" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
                        <TabsTrigger value="books" className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">{text.books}</span>
                        </TabsTrigger>
                        <TabsTrigger value="awards" className="gap-2">
                            <Award className="w-4 h-4" />
                            <span className="hidden sm:inline">{text.awards}</span>
                        </TabsTrigger>
                        <TabsTrigger value="publications" className="gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">{text.publications}</span>
                        </TabsTrigger>
                        <TabsTrigger value="neologisms" className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="hidden sm:inline">{text.neologisms}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="books">
                        <BookManager lang={lang} />
                    </TabsContent>

                    <TabsContent value="awards">
                        <AwardManager lang={lang} />
                    </TabsContent>

                    <TabsContent value="publications">
                        <PublicationManager lang={lang} />
                    </TabsContent>

                    <TabsContent value="neologisms">
                        <NeologismManager lang={lang} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}