import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Globe, Calendar, Users } from 'lucide-react';
import ForumManager from './ForumManager';
import EventManager from './EventManager';
import KeyActorManager from './KeyActorManager';

export default function SSOTHub({ lang = 'pt' }) {
    const [activeTab, setActiveTab] = useState('forums');

    const t = {
        pt: {
            title: 'Single Source of Truth (SSOT)',
            subtitle: 'Centro de gerenciamento de dados mestres',
            forums: 'Fóruns',
            events: 'Eventos',
            actors: 'Atores Chave'
        },
        en: {
            title: 'Single Source of Truth (SSOT)',
            subtitle: 'Master data management center',
            forums: 'Forums',
            events: 'Events',
            actors: 'Key Actors'
        }
    };

    const text = t[lang];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Database className="w-6 h-6" />
                    {text.title}
                </CardTitle>
                <CardDescription>{text.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="forums" className="gap-2">
                            <Globe className="w-4 h-4" />
                            {text.forums}
                        </TabsTrigger>
                        <TabsTrigger value="events" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            {text.events}
                        </TabsTrigger>
                        <TabsTrigger value="actors" className="gap-2">
                            <Users className="w-4 h-4" />
                            {text.actors}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="forums" className="mt-4">
                        <ForumManager lang={lang} />
                    </TabsContent>
                    <TabsContent value="events" className="mt-4">
                        <EventManager lang={lang} />
                    </TabsContent>
                    <TabsContent value="actors" className="mt-4">
                        <KeyActorManager lang={lang} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}