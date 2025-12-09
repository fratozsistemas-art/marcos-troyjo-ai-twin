import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Globe, Zap, DollarSign } from 'lucide-react';

const neologisms = {
    pt: [
        {
            term: 'Trumpulência',
            year: '2025',
            definition: 'Turbulência econômica + disrupção trumpista (tarifas erráticas, nearshoring agressivo)',
            context: 'Após meses de pico, observamos estabilização — cessar-fogo EUA-China, distensão Brasil',
            badge: 'Mais Usado Q4 2025',
            icon: TrendingUp,
            featured: true
        },
        {
            term: 'Novo ESG',
            year: '2025',
            definition: 'Economia + Segurança + Geopolítica (substitui Environment/Social/Governance)',
            context: 'Realidade geopolítica exige resiliência econômica e segurança de cadeias, não apenas métricas verdes',
            badge: 'Mudança de Paradigma',
            icon: Globe,
            featured: true
        },
        {
            term: 'Desglobalização',
            year: '2015-2016',
            definition: 'Reversão da globalização profunda pós-2008',
            badge: 'Legacy Term',
            icon: Globe,
            featured: false
        },
        {
            term: 'Poli-oportunidades',
            year: '2021-2025',
            definition: 'Múltiplas oportunidades em meio à policrise',
            badge: 'Framework',
            icon: Zap,
            featured: false
        },
        {
            term: 'Revolução Calórica Asiática',
            year: '2023-2025',
            definition: 'Brasil como "fiel da balança" na demanda asiática por proteína. US$ 1 tri até 2040',
            badge: 'Opportunity',
            icon: TrendingUp,
            featured: false
        },
        {
            term: 'BRICS 2.0',
            year: '2023-2025',
            definition: 'Plataforma pragmática de reequilíbrio global',
            badge: 'Framework',
            icon: Globe,
            featured: false
        },
        {
            term: 'Desdolarização Pragmática',
            year: '2023-2025',
            definition: 'Gradual, via BRICS Pay e moedas locais',
            badge: 'Trend',
            icon: DollarSign,
            featured: false
        },
        {
            term: 'Geopolítica como Nova Globalização',
            year: '2024-2025',
            definition: 'Política mandando via economia (tarifas, sanções)',
            badge: 'Framework',
            icon: Globe,
            featured: false
        },
        {
            term: 'Policrise',
            year: '2020-2025',
            definition: 'Crises múltiplas simultâneas (pandemia, guerra, clima)',
            badge: 'Context',
            icon: TrendingUp,
            featured: false
        },
        {
            term: 'Geoeconomia Sistêmica',
            year: '2018-2025',
            definition: 'Leitura integrada de economia, geopolítica e tecnologia',
            badge: 'Lens',
            icon: Globe,
            featured: false
        },
        {
            term: 'Brasil Cosmopolita Realista',
            year: '2022-2025',
            definition: 'Pragmatismo diplomático: alimento, energia, sustentabilidade',
            badge: 'Vision',
            icon: Globe,
            featured: false
        }
    ],
    en: [
        {
            term: 'Trumpulence',
            year: '2025',
            definition: 'Economic turbulence + Trumpist disruption (erratic tariffs, aggressive nearshoring)',
            context: 'After months at peak, we observe stabilization — US-China tariff ceasefire, Brazil détente',
            badge: 'Most Used Q4 2025',
            icon: TrendingUp,
            featured: true
        },
        {
            term: 'New ESG',
            year: '2025',
            definition: 'Economy + Security + Geopolitics (replaces Environment/Social/Governance)',
            context: 'Geopolitical reality demands economic resilience and supply chain security, not just green metrics',
            badge: 'Paradigm Shift',
            icon: Globe,
            featured: true
        },
        {
            term: 'Deglobalization',
            year: '2015-2016',
            definition: 'Reversal of deep post-2008 globalization',
            badge: 'Legacy Term',
            icon: Globe,
            featured: false
        },
        {
            term: 'Poly-opportunities',
            year: '2021-2025',
            definition: 'Multiple opportunities amid polycrisis',
            badge: 'Framework',
            icon: Zap,
            featured: false
        },
        {
            term: 'Asian Caloric Revolution',
            year: '2023-2025',
            definition: 'Brazil as "swing factor" in Asian protein demand. $1 trillion by 2040',
            badge: 'Opportunity',
            icon: TrendingUp,
            featured: false
        },
        {
            term: 'BRICS 2.0',
            year: '2023-2025',
            definition: 'Pragmatic platform for global rebalancing',
            badge: 'Framework',
            icon: Globe,
            featured: false
        },
        {
            term: 'Pragmatic De-dollarization',
            year: '2023-2025',
            definition: 'Gradual, via BRICS Pay and local currencies',
            badge: 'Trend',
            icon: DollarSign,
            featured: false
        },
        {
            term: 'Geopolitics as New Globalization',
            year: '2024-2025',
            definition: 'Politics commanding via economics (tariffs, sanctions)',
            badge: 'Framework',
            icon: Globe,
            featured: false
        },
        {
            term: 'Polycrisis',
            year: '2020-2025',
            definition: 'Multiple simultaneous crises (pandemic, war, climate)',
            badge: 'Context',
            icon: TrendingUp,
            featured: false
        },
        {
            term: 'Systemic Geoeconomics',
            year: '2018-2025',
            definition: 'Integrated reading of economy, geopolitics and technology',
            badge: 'Lens',
            icon: Globe,
            featured: false
        },
        {
            term: 'Cosmopolitan Realist Brazil',
            year: '2022-2025',
            definition: 'Diplomatic pragmatism: food, energy, sustainability',
            badge: 'Vision',
            icon: Globe,
            featured: false
        }
    ]
};

const badgeColors = {
    'Mais Usado Q4 2025': 'bg-[#D4AF37] text-[#2D2D2D]',
    'Most Used Q4 2025': 'bg-[#D4AF37] text-[#2D2D2D]',
    'Mudança de Paradigma': 'bg-[#002D62] text-white',
    'Paradigm Shift': 'bg-[#002D62] text-white',
    'Legacy Term': 'bg-gray-600 text-white',
    'Framework': 'bg-[#00654A] text-white',
    'Opportunity': 'bg-green-600 text-white',
    'Trend': 'bg-purple-600 text-white',
    'Context': 'bg-orange-600 text-white',
    'Lens': 'bg-teal-600 text-white',
    'Vision': 'bg-indigo-600 text-white'
};

export default function NeologismShowcase({ lang = 'pt' }) {
    const items = neologisms[lang];
    const featured = items.filter(n => n.featured);
    const others = items.filter(n => !n.featured);

    return (
        <div className="space-y-8">
            {/* Featured Neologisms */}
            <div className="grid md:grid-cols-2 gap-6">
                {featured.map((neologism, index) => {
                    const Icon = neologism.icon;
                    return (
                        <motion.div
                            key={neologism.term}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-2 border-[#002D62]/20 hover:border-[#002D62] hover:shadow-xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-[#002D62]" style={{ fontFamily: 'Crimson Text, serif' }}>
                                                    {neologism.term}
                                                </h3>
                                                <span className="text-sm text-gray-500">{neologism.year}</span>
                                            </div>
                                        </div>
                                        <Badge className={badgeColors[neologism.badge] || 'bg-gray-200'}>
                                            {neologism.badge}
                                        </Badge>
                                    </div>
                                    <p className="text-[#2D2D2D] mb-3 leading-relaxed">
                                        <strong>{lang === 'pt' ? 'Definição:' : 'Definition:'}</strong> {neologism.definition}
                                    </p>
                                    {neologism.context && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <p className="text-sm text-amber-900 leading-relaxed">
                                                <strong>{lang === 'pt' ? 'Contexto (09/Dez/2025):' : 'Context (09/Dec/2025):'}</strong> {neologism.context}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Compact Grid for Other Neologisms */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map((neologism, index) => {
                    const Icon = neologism.icon;
                    return (
                        <motion.div
                            key={neologism.term}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (index + featured.length) * 0.05 }}
                        >
                            <Card className="hover:border-[#002D62]/40 hover:shadow-lg transition-all duration-300 h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#002D62]/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-4 h-4 text-[#002D62]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-[#002D62] text-sm mb-1">{neologism.term}</h4>
                                            <span className="text-xs text-gray-500">{neologism.year}</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                            {neologism.badge}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-[#2D2D2D] leading-relaxed">{neologism.definition}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}