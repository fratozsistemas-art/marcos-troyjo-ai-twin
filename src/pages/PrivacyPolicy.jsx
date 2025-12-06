import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Database, Lock, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
    }, [lang]);

    const content = {
        pt: {
            title: "Política de Privacidade",
            lastUpdated: "Última atualização: Dezembro 2025",
            intro: "Esta Política de Privacidade descreve como o Marcos Troyjo Digital Twin coleta, usa e protege suas informações pessoais.",
            sections: [
                {
                    icon: Database,
                    title: "Dados Coletados",
                    content: [
                        "Informações de registro: nome, email e preferências de perfil",
                        "Histórico de conversas: mensagens trocadas com o Digital Twin",
                        "Dados de uso: tópicos discutidos, frequência de interação e preferências de persona",
                        "Informações técnicas: tipo de navegador, dispositivo e endereço IP"
                    ]
                },
                {
                    icon: Eye,
                    title: "Como Usamos Seus Dados",
                    content: [
                        "Personalizar sua experiência com adaptação de persona e sugestões proativas",
                        "Melhorar a qualidade das respostas do Digital Twin através de análise de interações",
                        "Enviar notificações sobre novos recursos e conteúdos relevantes (com seu consentimento)",
                        "Analisar padrões de uso para desenvolvimento de produto"
                    ]
                },
                {
                    icon: Lock,
                    title: "Proteção de Dados",
                    content: [
                        "Criptografia de dados em trânsito e em repouso",
                        "Acesso restrito a dados pessoais apenas para equipe autorizada",
                        "Backups regulares e protocolos de recuperação de desastres",
                        "Conformidade com LGPD e regulamentações internacionais de privacidade"
                    ]
                },
                {
                    icon: UserCheck,
                    title: "Seus Direitos",
                    content: [
                        "Acessar e exportar seus dados pessoais a qualquer momento",
                        "Solicitar correção de informações incorretas",
                        "Deletar sua conta e todos os dados associados",
                        "Desabilitar rastreamento de tópicos nas configurações de perfil",
                        "Revogar consentimentos de processamento de dados específicos"
                    ]
                },
                {
                    icon: Shield,
                    title: "Compartilhamento de Dados",
                    content: [
                        "Não vendemos seus dados pessoais para terceiros",
                        "Compartilhamento limitado com provedores de serviços essenciais (hospedagem, analytics)",
                        "Todos os provedores são obrigados contratualmente a proteger seus dados",
                        "Dados agregados e anonimizados podem ser usados para pesquisa acadêmica"
                    ]
                }
            ],
            contact: "Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato através do dashboard."
        },
        en: {
            title: "Privacy Policy",
            lastUpdated: "Last updated: December 2025",
            intro: "This Privacy Policy describes how Marcos Troyjo Digital Twin collects, uses, and protects your personal information.",
            sections: [
                {
                    icon: Database,
                    title: "Data Collected",
                    content: [
                        "Registration information: name, email, and profile preferences",
                        "Conversation history: messages exchanged with the Digital Twin",
                        "Usage data: topics discussed, interaction frequency, and persona preferences",
                        "Technical information: browser type, device, and IP address"
                    ]
                },
                {
                    icon: Eye,
                    title: "How We Use Your Data",
                    content: [
                        "Personalize your experience with persona adaptation and proactive suggestions",
                        "Improve Digital Twin response quality through interaction analysis",
                        "Send notifications about new features and relevant content (with your consent)",
                        "Analyze usage patterns for product development"
                    ]
                },
                {
                    icon: Lock,
                    title: "Data Protection",
                    content: [
                        "Data encryption in transit and at rest",
                        "Restricted access to personal data only for authorized team",
                        "Regular backups and disaster recovery protocols",
                        "Compliance with GDPR and international privacy regulations"
                    ]
                },
                {
                    icon: UserCheck,
                    title: "Your Rights",
                    content: [
                        "Access and export your personal data at any time",
                        "Request correction of incorrect information",
                        "Delete your account and all associated data",
                        "Disable topic tracking in profile settings",
                        "Revoke specific data processing consents"
                    ]
                },
                {
                    icon: Shield,
                    title: "Data Sharing",
                    content: [
                        "We do not sell your personal data to third parties",
                        "Limited sharing with essential service providers (hosting, analytics)",
                        "All providers are contractually obligated to protect your data",
                        "Aggregated and anonymized data may be used for academic research"
                    ]
                }
            ],
            contact: "To exercise your rights or clarify privacy questions, contact us through the dashboard."
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

                <Card className="mt-6 bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <p className="text-[#333F48] text-sm">{t.contact}</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}