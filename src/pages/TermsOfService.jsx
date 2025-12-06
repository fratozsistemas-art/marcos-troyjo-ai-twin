import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, AlertTriangle, Scale, Shield } from 'lucide-react';

export default function TermsOfService() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
    }, [lang]);

    const content = {
        pt: {
            title: "Termos de Serviço",
            lastUpdated: "Última atualização: Dezembro 2025",
            intro: "Ao utilizar o Marcos Troyjo Digital Twin, você concorda com os seguintes termos e condições.",
            sections: [
                {
                    icon: FileText,
                    title: "Uso do Serviço",
                    content: [
                        "O Digital Twin fornece análises e insights baseados no pensamento público de Marcos Prado Troyjo até dezembro de 2025",
                        "O serviço é destinado a fins educacionais, de pesquisa e consultoria estratégica",
                        "Você deve ter 18 anos ou mais para usar este serviço",
                        "É proibido usar o serviço para fins ilegais ou não autorizados"
                    ]
                },
                {
                    icon: AlertTriangle,
                    title: "Limitações e Responsabilidades",
                    content: [
                        "As respostas do Digital Twin são geradas por IA e não substituem consultoria profissional certificada",
                        "O conhecimento base é limitado a dezembro de 2025 - eventos posteriores não são conhecidos",
                        "Não nos responsabilizamos por decisões tomadas com base nas análises fornecidas",
                        "O serviço é fornecido 'como está', sem garantias de disponibilidade contínua",
                        "Reservamos o direito de modificar ou descontinuar o serviço a qualquer momento"
                    ]
                },
                {
                    icon: Scale,
                    title: "Propriedade Intelectual",
                    content: [
                        "O conteúdo das conversas gerado pelo Digital Twin é de propriedade compartilhada entre você e a plataforma",
                        "Você mantém direitos sobre suas perguntas e pode deletar seu histórico a qualquer momento",
                        "É proibido reproduzir, distribuir ou comercializar o conteúdo do serviço sem autorização",
                        "O nome 'Marcos Prado Troyjo' e identidade visual associada são marcas registradas"
                    ]
                },
                {
                    icon: Shield,
                    title: "Conduta do Usuário",
                    content: [
                        "Você concorda em usar o serviço de forma ética e respeitosa",
                        "É proibido tentar manipular, hackear ou comprometer a segurança do sistema",
                        "Não use o serviço para disseminar desinformação ou conteúdo prejudicial",
                        "Reservamos o direito de suspender contas que violem estes termos"
                    ]
                }
            ],
            acceptance: "Ao continuar usando o serviço, você confirma que leu e concorda com estes Termos de Serviço e nossa Política de Privacidade."
        },
        en: {
            title: "Terms of Service",
            lastUpdated: "Last updated: December 2025",
            intro: "By using Marcos Troyjo Digital Twin, you agree to the following terms and conditions.",
            sections: [
                {
                    icon: FileText,
                    title: "Use of Service",
                    content: [
                        "The Digital Twin provides analyses and insights based on Marcos Prado Troyjo's public thinking until December 2025",
                        "The service is intended for educational, research, and strategic consulting purposes",
                        "You must be 18 years or older to use this service",
                        "It is prohibited to use the service for illegal or unauthorized purposes"
                    ]
                },
                {
                    icon: AlertTriangle,
                    title: "Limitations and Responsibilities",
                    content: [
                        "Digital Twin responses are AI-generated and do not replace certified professional consulting",
                        "Knowledge base is limited to December 2025 - subsequent events are not known",
                        "We are not responsible for decisions made based on provided analyses",
                        "The service is provided 'as is', without guarantees of continuous availability",
                        "We reserve the right to modify or discontinue the service at any time"
                    ]
                },
                {
                    icon: Scale,
                    title: "Intellectual Property",
                    content: [
                        "Content generated by the Digital Twin in conversations is jointly owned by you and the platform",
                        "You retain rights to your questions and can delete your history at any time",
                        "It is prohibited to reproduce, distribute, or commercialize service content without authorization",
                        "The name 'Marcos Prado Troyjo' and associated visual identity are registered trademarks"
                    ]
                },
                {
                    icon: Shield,
                    title: "User Conduct",
                    content: [
                        "You agree to use the service ethically and respectfully",
                        "It is prohibited to attempt to manipulate, hack, or compromise system security",
                        "Do not use the service to disseminate misinformation or harmful content",
                        "We reserve the right to suspend accounts that violate these terms"
                    ]
                }
            ],
            acceptance: "By continuing to use the service, you confirm that you have read and agree to these Terms of Service and our Privacy Policy."
        }
    };

    const t = content[lang];

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">{lang === 'pt' ? 'Voltar' : 'Back'}</span>
                        </Button>
                    </Link>
                    <button
                        onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                        className="px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 text-sm"
                    >
                        {lang === 'pt' ? 'EN' : 'PT'}
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#002D62] mb-2">{t.title}</h1>
                    <p className="text-sm text-gray-500">{t.lastUpdated}</p>
                </div>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <p className="text-[#333F48] leading-relaxed">{t.intro}</p>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {t.sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                        <Icon className="w-5 h-5" />
                                        {section.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {section.content.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#00654A] mt-2 flex-shrink-0" />
                                                <span className="text-[#333F48]">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card className="mt-6 bg-amber-50 border-amber-200">
                    <CardContent className="pt-6">
                        <p className="text-[#333F48] text-sm font-medium">{t.acceptance}</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}