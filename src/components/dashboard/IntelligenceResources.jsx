import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, TrendingUp, Database, Brain, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function IntelligenceResources({ lang }) {
    const t = {
        pt: {
            title: "Expanda Sua Rede de Inteligência",
            description: "Complemente a análise geopolítica com ferramentas estratégicas adicionais",
            categories: [
                {
                    icon: Database,
                    title: "Provedores de Dados de Mercado",
                    items: ["Bloomberg Terminal", "Refinitiv Eikon", "FactSet"]
                },
                {
                    icon: Brain,
                    title: "Sistemas de Inteligência Estratégica",
                    items: ["Plataformas de IA para C-Suite", "Ferramentas de Modelagem Financeira"],
                    link: "/strategic-intelligence-guide"
                },
                {
                    icon: Users,
                    title: "Redes de Especialistas",
                    items: ["GLG", "AlphaSights", "Especialistas Setoriais"]
                },
                {
                    icon: BookOpen,
                    title: "Bibliotecas de Pesquisa",
                    items: ["McKinsey Insights", "BCG Reports", "World Bank Data"]
                }
            ],
            learnMore: "Saiba mais"
        },
        en: {
            title: "Expand Your Intelligence Network",
            description: "Complement geopolitical analysis with additional strategic tools",
            categories: [
                {
                    icon: Database,
                    title: "Market Data Providers",
                    items: ["Bloomberg Terminal", "Refinitiv Eikon", "FactSet"]
                },
                {
                    icon: Brain,
                    title: "Strategic Intelligence Systems",
                    items: ["AI Platforms for C-Suite", "Financial Modeling Tools"],
                    link: "/strategic-intelligence-guide"
                },
                {
                    icon: Users,
                    title: "Expert Networks",
                    items: ["GLG", "AlphaSights", "Industry Specialists"]
                },
                {
                    icon: BookOpen,
                    title: "Research Libraries",
                    items: ["McKinsey Insights", "BCG Reports", "World Bank Data"]
                }
            ],
            learnMore: "Learn more"
        }
    }[lang];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B1538]">
                    <TrendingUp className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                    {t.categories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 rounded-lg border border-gray-100 hover:border-[#8B1538]/20 hover:shadow-md transition-all bg-white"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-[#8B1538]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm text-[#333F48] mb-2">
                                            {category.title}
                                        </h3>
                                        <ul className="space-y-1">
                                            {category.items.map((item, idx) => (
                                                <li key={idx} className="text-xs text-[#333F48]/70">
                                                    • {item}
                                                </li>
                                            ))}
                                        </ul>
                                        {category.link && (
                                            <a
                                                href={createPageUrl('StrategicIntelligenceBlog')}
                                                className="inline-flex items-center gap-1 text-xs text-[#8B1538] hover:text-[#6B0F2A] mt-2 font-medium"
                                            >
                                                {t.learnMore}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}