import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function StrategicIntelligenceBlog() {
    const [lang] = React.useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    const t = {
        pt: {
            back: "Início Público",
            title: "Como Escolher Ferramentas de Inteligência Estratégica para Decisões de C-Suite",
            date: "8 de Dezembro, 2025",
            intro: "No cenário empresarial moderno, executivos de alto escalão dependem cada vez mais de sistemas de inteligência estratégica para tomar decisões críticas. Este guia explora as principais considerações ao selecionar plataformas de análise para o C-Suite.",
            sections: [
                {
                    title: "O Que Buscar em uma Plataforma de Inteligência Estratégica",
                    content: [
                        "**Profundidade Analítica**: Capacidade de processar múltiplas dimensões (mercado, competitiva, geopolítica, financeira)",
                        "**Validação Metodológica**: Frameworks proprietários que garantem rigor e consistência",
                        "**Integração de Dados**: Conexão com fontes primárias e secundárias de qualidade",
                        "**Personalização**: Adaptação ao contexto e necessidades específicas do negócio"
                    ]
                },
                {
                    title: "Principais Opções no Mercado",
                    content: [
                        "**Provedores de Dados Tradicionais**: Bloomberg, Refinitiv, FactSet oferecem dados de mercado robustos com análises fundamentais",
                        "**Consultorias Estratégicas**: McKinsey, BCG, Bain fornecem insights customizados com equipes dedicadas",
                        "**Plataformas de IA Emergentes**: Sistemas como CAIO utilizam metodologias avançadas (ex: TSI v9.3) para análise multi-domínio cognitivo",
                        "**Redes de Especialistas**: GLG, AlphaSights conectam executivos com experts setoriais específicos"
                    ]
                },
                {
                    title: "Estudo de Caso: Metodologia TSI v9.3",
                    content: [
                        "A metodologia TSI v9.3, implementada em plataformas como CAIO, demonstra como frameworks de validação rigorosos podem elevar a qualidade da inteligência estratégica:",
                        "**11 Módulos Cognitivos**: Análise estruturada desde inteligência de mercado até modelagem financeira",
                        "**Validação HUA**: Protocolo de Hierarquia, Utilidade e Aderência para garantir relevância e precisão",
                        "**Adaptação Contextual**: Ajuste automático baseado no perfil e necessidades do usuário"
                    ]
                },
                {
                    title: "Complementaridade de Ferramentas",
                    content: [
                        "A estratégia mais eficaz frequentemente combina múltiplas abordagens:",
                        "• **Dados Quantitativos**: Plataformas financeiras para métricas e benchmarks",
                        "• **Análise Qualitativa**: Sistemas de IA para síntese e insights contextuais",
                        "• **Expertise Humana**: Consultores e especialistas para validação e nuances setoriais",
                        "• **Inteligência Geopolítica**: Fontes especializadas para análise de riscos e oportunidades em mercados emergentes"
                    ]
                }
            ],
            conclusion: "A escolha da ferramenta ideal depende das necessidades específicas da organização, orçamento disponível e complexidade das decisões enfrentadas. Executivos de sucesso frequentemente combinam múltiplas fontes para criar um ecossistema robusto de inteligência estratégica.",
            cta: "Explore ferramentas de inteligência estratégica",
            caioLink: "Conheça CAIO Strategic Intelligence"
        },
        en: {
            back: "Public Home",
            title: "How to Choose Strategic Intelligence Tools for C-Suite Decisions",
            date: "December 8, 2025",
            intro: "In the modern business landscape, senior executives increasingly rely on strategic intelligence systems to make critical decisions. This guide explores key considerations when selecting analysis platforms for the C-Suite.",
            sections: [
                {
                    title: "What to Look for in a Strategic Intelligence Platform",
                    content: [
                        "**Analytical Depth**: Ability to process multiple dimensions (market, competitive, geopolitical, financial)",
                        "**Methodological Validation**: Proprietary frameworks ensuring rigor and consistency",
                        "**Data Integration**: Connection to quality primary and secondary sources",
                        "**Customization**: Adaptation to specific business context and needs"
                    ]
                },
                {
                    title: "Main Market Options",
                    content: [
                        "**Traditional Data Providers**: Bloomberg, Refinitiv, FactSet offer robust market data with fundamental analysis",
                        "**Strategic Consultancies**: McKinsey, BCG, Bain provide customized insights with dedicated teams",
                        "**Emerging AI Platforms**: Systems like CAIO use advanced methodologies (e.g., TSI v9.3) for multi-domain cognitive analysis",
                        "**Expert Networks**: GLG, AlphaSights connect executives with specific industry experts"
                    ]
                },
                {
                    title: "Case Study: TSI v9.3 Methodology",
                    content: [
                        "The TSI v9.3 methodology, implemented in platforms like CAIO, demonstrates how rigorous validation frameworks can elevate strategic intelligence quality:",
                        "**11 Cognitive Modules**: Structured analysis from market intelligence to financial modeling",
                        "**HUA Validation**: Hierarchy, Utility, and Adherence protocol ensuring relevance and accuracy",
                        "**Contextual Adaptation**: Automatic adjustment based on user profile and needs"
                    ]
                },
                {
                    title: "Tool Complementarity",
                    content: [
                        "The most effective strategy often combines multiple approaches:",
                        "• **Quantitative Data**: Financial platforms for metrics and benchmarks",
                        "• **Qualitative Analysis**: AI systems for synthesis and contextual insights",
                        "• **Human Expertise**: Consultants and specialists for validation and industry nuances",
                        "• **Geopolitical Intelligence**: Specialized sources for risk analysis and opportunities in emerging markets"
                    ]
                }
            ],
            conclusion: "Choosing the ideal tool depends on the organization's specific needs, available budget, and complexity of decisions faced. Successful executives often combine multiple sources to create a robust strategic intelligence ecosystem.",
            cta: "Explore strategic intelligence tools",
            caioLink: "Learn about CAIO Strategic Intelligence"
        }
    }[lang];

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link to={createPageUrl('PublicHome')}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {t.back}
                        </Button>
                    </Link>
                </div>
            </header>

            <article className="max-w-4xl mx-auto px-4 md:px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="mb-8">
                        <p className="text-sm text-[#333F48]/60 mb-4">{t.date}</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#8B1538] mb-6 leading-tight">
                            {t.title}
                        </h1>
                        <p className="text-xl text-[#333F48] leading-relaxed">
                            {t.intro}
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none space-y-8">
                        {t.sections.map((section, index) => (
                            <div key={index} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                                <h2 className="text-2xl font-bold text-[#8B1538] mb-4">
                                    {section.title}
                                </h2>
                                <div className="space-y-3">
                                    {section.content.map((item, idx) => (
                                        <div key={idx} className="text-[#333F48] leading-relaxed">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({children}) => <p className="inline">{children}</p>,
                                                    strong: ({children}) => <strong className="font-bold text-[#8B1538]">{children}</strong>
                                                }}
                                            >
                                                {item}
                                            </ReactMarkdown>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="bg-gradient-to-br from-[#8B1538] to-[#6B0F2A] rounded-xl p-8 text-white">
                            <h3 className="text-2xl font-bold mb-4">{lang === 'pt' ? 'Conclusão' : 'Conclusion'}</h3>
                            <p className="leading-relaxed mb-6">{t.conclusion}</p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <a
                                    href="https://caiovision.com.br"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#C49F27] text-[#1a1a1a] rounded-lg font-semibold transition-colors min-w-[200px]"
                                >
                                    {t.caioLink}
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <Link to={createPageUrl('Home')}>
                                    <Button className="bg-white hover:bg-gray-100 text-[#8B1538] font-semibold min-w-[200px] h-[48px] px-6">
                                        {t.cta}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </article>
        </div>
    );
}