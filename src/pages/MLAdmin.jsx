import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import MLRoleManager from '@/components/admin/MLRoleManager';
import MLAuditLogViewer from '@/components/admin/MLAuditLogViewer';

export default function MLAdmin() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {lang === 'pt' ? 'Voltar' : 'Back'}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">
                                {lang === 'pt' ? 'Administração ML' : 'ML Administration'}
                            </h1>
                            <p className="text-xs text-[#333F48]/60">
                                {lang === 'pt' ? 'Gerencie permissões e auditoria' : 'Manage permissions and audit'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <Tabs defaultValue="roles" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="roles">
                            {lang === 'pt' ? 'Papéis & Permissões' : 'Roles & Permissions'}
                        </TabsTrigger>
                        <TabsTrigger value="audit">
                            {lang === 'pt' ? 'Logs de Auditoria' : 'Audit Logs'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="roles">
                        <MLRoleManager lang={lang} />
                    </TabsContent>

                    <TabsContent value="audit">
                        <MLAuditLogViewer lang={lang} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}