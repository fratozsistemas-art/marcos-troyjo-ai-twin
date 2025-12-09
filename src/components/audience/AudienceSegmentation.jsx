import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, GraduationCap } from 'lucide-react';

const audiences = {
    pt: [
        {
            id: 'ceo',
            icon: Building2,
            title: 'CEO / C-Suite',
            description: 'Decisões estratégicas de M&A, entrada em mercados, risco geopolítico',
            features: [
                'Análise BRICS 2.0 e multipolaridade',
                'Novo ESG (Economia + Segurança + Geopolítica)',
                'Navegação da trumpulência gerenciada'
            ],
            gradient: 'from-[#8B1538] to-[#6B0F2A]'
        },
        {
            id: 'investor',
            icon: TrendingUp,
            title: 'Investidor / Family Office',
            description: 'Alocação de ativos, hedge geopolítico, oportunidades emergentes',
            features: [
                'Revolução Calórica Asiática (agro brasileiro)',
                'Desdolarização pragmática (risco cambial)',
                'Poli-oportunidades em policrise'
            ],
            gradient: 'from-[#D4AF37] to-[#B8860B]'
        },
        {
            id: 'academic',
            icon: GraduationCap,
            title: 'Acadêmico / Pesquisador',
            description: 'Pesquisa em geoeconomia, policy papers, frameworks conceituais',
            features: [
                '11 neologismos (2015-2025) documentados',
                'Geoeconomia sistêmica como lente analítica',
                'Geração de artigos com voz autêntica'
            ],
            gradient: 'from-[#002D62] to-[#001d42]'
        },
        {
            id: 'government',
            icon: Building2,
            title: 'Governo / Diplomacia',
            description: 'Negociações multilaterais, inserção competitiva, arquitetura global',
            features: [
                'Experiência NDB (2020-2023, primeiro ocidental)',
                'Diplomacia econômica prática',
                'BRICS 2.0: metamorfose do reequilíbrio global'
            ],
            gradient: 'from-[#8B1538] to-[#002D62]'
        },
        {
            id: 'media',
            icon: TrendingUp,
            title: 'Jornalista / Mídia',
            description: 'Análise para matérias, contexto geopolítico, expert quotes',
            features: [
                'Contexto atualizado (09/Dez/2025: pós-pico trumpulência)',
                'Frameworks conceituais precisos',
                'Citações atribuíveis ao pensamento Troyjo'
            ],
            gradient: 'from-[#D4AF37] to-[#8B1538]'
        },
        {
            id: 'student',
            icon: GraduationCap,
            title: 'Estudante / Jovem Profissional',
            description: 'Aprendizado em economia global, preparação para contexto policrítico',
            features: [
                'Modo Professor (didático, contextualizado)',
                'Vocabulário técnico explicado',
                '"Vocês trabalharão em contexto policrítico"'
            ],
            gradient: 'from-[#002D62] to-[#D4AF37]'
        }
    ],
    en: [
        {
            id: 'ceo',
            icon: Building2,
            title: 'CEO / C-Suite',
            description: 'Strategic decisions on M&A, market entry, geopolitical risk',
            features: [
                'BRICS 2.0 and multipolarity analysis',
                'New ESG (Economy + Security + Geopolitics)',
                'Managed trumpulence navigation'
            ],
            gradient: 'from-[#8B1538] to-[#6B0F2A]'
        },
        {
            id: 'investor',
            icon: TrendingUp,
            title: 'Investor / Family Office',
            description: 'Asset allocation, geopolitical hedge, emerging opportunities',
            features: [
                'Asian Caloric Revolution (Brazilian agribusiness)',
                'Pragmatic de-dollarization (FX risk)',
                'Poly-opportunities in polycrisis'
            ],
            gradient: 'from-[#D4AF37] to-[#B8860B]'
        },
        {
            id: 'academic',
            icon: GraduationCap,
            title: 'Academic / Researcher',
            description: 'Research in geoeconomics, policy papers, conceptual frameworks',
            features: [
                '11 neologisms (2015-2025) documented',
                'Systemic geoeconomics as analytical lens',
                'Article generation with authentic voice'
            ],
            gradient: 'from-[#002D62] to-[#001d42]'
        },
        {
            id: 'government',
            icon: Building2,
            title: 'Government / Diplomacy',
            description: 'Multilateral negotiations, competitive insertion, global architecture',
            features: [
                'NDB experience (2020-2023, first Westerner)',
                'Practical economic diplomacy',
                'BRICS 2.0: metamorphosis of global rebalancing'
            ],
            gradient: 'from-[#8B1538] to-[#002D62]'
        },
        {
            id: 'media',
            icon: TrendingUp,
            title: 'Journalist / Media',
            description: 'Analysis for stories, geopolitical context, expert quotes',
            features: [
                'Updated context (09/Dec/2025: post-peak trumpulence)',
                'Precise conceptual frameworks',
                'Attributable quotes from Troyjo thinking'
            ],
            gradient: 'from-[#D4AF37] to-[#8B1538]'
        },
        {
            id: 'student',
            icon: GraduationCap,
            title: 'Student / Young Professional',
            description: 'Learning in global economics, preparation for polycrisis context',
            features: [
                'Professor mode (didactic, contextualized)',
                'Technical vocabulary explained',
                '"You will work in polycrisis context"'
            ],
            gradient: 'from-[#002D62] to-[#D4AF37]'
        }
    ]
};

export default function AudienceSegmentation({ lang = 'pt' }) {
    const items = audiences[lang];

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {items.map((audience, index) => {
                const Icon = audience.icon;
                return (
                    <motion.div
                        key={audience.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-2xl transition-all duration-300 h-full group">
                            <CardContent className="p-6">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-[#8B1538] mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                                    {audience.title}
                                </h3>
                                <p className="text-sm text-[#2D2D2D]/70 mb-4 leading-relaxed">
                                    {audience.description}
                                </p>
                                <ul className="space-y-2 mb-6">
                                    {audience.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-[#2D2D2D]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link to={createPageUrl('Consultation') + `?context=${audience.id}`}>
                                    <Button 
                                        variant="outline" 
                                        className="w-full border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white transition-all"
                                    >
                                        {lang === 'pt' ? 'Explorar →' : 'Explore →'}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}