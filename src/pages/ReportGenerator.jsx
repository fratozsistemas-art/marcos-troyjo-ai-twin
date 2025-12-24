import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CustomReportGenerator from '@/components/reports/CustomReportGenerator';

export default function ReportGenerator() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {lang === 'pt' ? 'Voltar' : 'Back'}
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
                <CustomReportGenerator lang={lang} />
            </main>
        </div>
    );
}