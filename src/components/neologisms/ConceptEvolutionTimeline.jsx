import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, BookOpen, Globe } from 'lucide-react';

const conceptEvolution = {
    pt: [
        {
            year: '2015',
            term: 'Desglobalização',
            milestone: 'Livro seminal',
            description: 'Reversão da globalização profunda pós-2008',
            impact: 'Popularizou o termo no debate brasileiro e internacional',
            sources: ['Livro: Desglobalização (2016)', 'Artigos acadêmicos'],
            position: 0,
            color: '#6B6B6B'
        },
        {
            year: '2018-2020',
            term: 'Geoeconomia Sistêmica',
            milestone: 'Framework analítico',
            description: 'Leitura integrada de economia, geopolítica e tecnologia',
            impact: 'Adotado como lente analítica em think tanks',
            sources: ['INSEAD', 'Oxford Policy Papers'],
            position: 25,
            color: '#002D62'
        },
        {
            year: '2020-2021',
            term: 'Policrise + Poli-oportunidades',
            milestone: 'Frase-assinatura',
            description: 'Crises múltiplas simultâneas + oportunidades para ágeis',
            impact: 'Mais de 50 citações em mídia brasileira em 2021',
            sources: ['Valor Econômico', 'Exame', 'InfoMoney'],
            position: 45,
            color: '#D97706'
        },
        {
            year: '2023',
            term: 'Revolução Calórica Asiática',
            milestone: 'Projeção US$ 1 tri',
            description: 'Brasil como "fiel da balança" na demanda asiática por proteína',
            impact: 'Adotado por JP Morgan, BTG, agências governamentais',
            sources: ['NDB Reports', 'JP Morgan Brazil', 'MAPA'],
            position: 65,
            color: '#047857'
        },
        {
            year: '2023-2024',
            term: 'BRICS 2.0',
            milestone: 'Metamorfose institucional',
            description: 'Plataforma pragmática de reequilíbrio global (BRICS+)',
            impact: 'Framework usado em análise de expansão BRICS',
            sources: ['Financial Times', 'The Economist', 'Foreign Affairs'],
            position: 75,
            color: '#002D62'
        },
        {
            year: '2025',
            term: 'Trumpulência',
            milestone: 'Termo mais usado Q4 2025',
            description: 'Turbulência econômica + disrupção trumpista',
            impact: 'Trending topic LinkedIn, citado por 30+ analistas',
            sources: ['LinkedIn (viral)', 'InfoMoney', 'Exame', 'FL Cast'],
            position: 90,
            color: '#D4AF37',
            featured: true
        },
        {
            year: '2025',
            term: 'Novo ESG',
            milestone: 'Mudança de paradigma',
            description: 'Economia + Segurança + Geopolítica (substitui ESG clássico)',
            impact: 'Apresentado em INSEAD, Oxford, debates institucionais',
            sources: ['INSEAD Talks', 'Oxford Forums', 'Bloomberg Brasil'],
            position: 95,
            color: '#D4AF37',
            featured: true
        }
    ],
    en: [
        {
            year: '2015',
            term: 'Deglobalization',
            milestone: 'Seminal book',
            description: 'Reversal of deep post-2008 globalization',
            impact: 'Popularized the term in Brazilian and international debate',
            sources: ['Book: Deglobalization (2016)', 'Academic papers'],
            position: 0,
            color: '#6B6B6B'
        },
        {
            year: '2018-2020',
            term: 'Systemic Geoeconomics',
            milestone: 'Analytical framework',
            description: 'Integrated reading of economy, geopolitics and technology',
            impact: 'Adopted as analytical lens in think tanks',
            sources: ['INSEAD', 'Oxford Policy Papers'],
            position: 25,
            color: '#002D62'
        },
        {
            year: '2020-2021',
            term: 'Polycrisis + Poly-opportunities',
            milestone: 'Signature phrase',
            description: 'Multiple simultaneous crises + opportunities for agile actors',
            impact: 'Over 50 citations in Brazilian media in 2021',
            sources: ['Valor Econômico', 'Exame', 'InfoMoney'],
            position: 45,
            color: '#D97706'
        },
        {
            year: '2023',
            term: 'Asian Caloric Revolution',
            milestone: '$1 trillion projection',
            description: 'Brazil as "swing factor" in Asian protein demand',
            impact: 'Adopted by JP Morgan, BTG, government agencies',
            sources: ['NDB Reports', 'JP Morgan Brazil', 'MAPA'],
            position: 65,
            color: '#047857'
        },
        {
            year: '2023-2024',
            term: 'BRICS 2.0',
            milestone: 'Institutional metamorphosis',
            description: 'Pragmatic platform for global rebalancing (BRICS+)',
            impact: 'Framework used in BRICS expansion analysis',
            sources: ['Financial Times', 'The Economist', 'Foreign Affairs'],
            position: 75,
            color: '#002D62'
        },
        {
            year: '2025',
            term: 'Trumpulence',
            milestone: 'Most used term Q4 2025',
            description: 'Economic turbulence + Trumpist disruption',
            impact: 'LinkedIn trending topic, cited by 30+ analysts',
            sources: ['LinkedIn (viral)', 'InfoMoney', 'Exame', 'FL Cast'],
            position: 90,
            color: '#D4AF37',
            featured: true
        },
        {
            year: '2025',
            term: 'New ESG',
            milestone: 'Paradigm shift',
            description: 'Economy + Security + Geopolitics (replaces classic ESG)',
            impact: 'Presented at INSEAD, Oxford, institutional debates',
            sources: ['INSEAD Talks', 'Oxford Forums', 'Bloomberg Brasil'],
            position: 95,
            color: '#D4AF37',
            featured: true
        }
    ]
};

export default function ConceptEvolutionTimeline({ lang = 'pt' }) {
    const [selectedConcept, setSelectedConcept] = useState(null);
    const concepts = conceptEvolution[lang];

    return (
        <div className="w-full space-y-8">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#002D62] mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                    {lang === 'pt' ? 'Evolução Conceitual: 2015-2025' : 'Conceptual Evolution: 2015-2025'}
                </h3>
                <p className="text-[#6B6B6B]">
                    {lang === 'pt' 
                        ? 'Uma década de inovação intelectual em análise geopolítica'
                        : 'A decade of intellectual innovation in geopolitical analysis'}
                </p>
            </div>

            {/* Interactive Timeline */}
            <div className="relative">
                {/* Timeline track */}
                <div className="relative h-3 bg-gradient-to-r from-[#002D62] via-[#00654A] to-[#D4AF37] rounded-full overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                </div>

                {/* Year labels */}
                <div className="flex justify-between mt-2 px-2">
                    <span className="text-xs font-semibold text-[#6B6B6B]">2015</span>
                    <span className="text-xs font-semibold text-[#6B6B6B]">2025</span>
                </div>

                {/* Concept markers */}
                <div className="relative mt-8">
                    {concepts.map((concept, index) => (
                        <motion.div
                            key={concept.term}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="absolute cursor-pointer"
                            style={{ left: `${concept.position}%`, top: 0 }}
                            onClick={() => setSelectedConcept(selectedConcept?.term === concept.term ? null : concept)}
                        >
                            <div className="relative flex flex-col items-center -translate-x-1/2">
                                <motion.div
                                    className={`w-4 h-4 rounded-full border-3 ${concept.featured ? 'border-[#D4AF37]' : 'border-[#8B1538]'} bg-white`}
                                    style={{ 
                                        boxShadow: concept.featured ? '0 0 20px rgba(212, 175, 55, 0.6)' : '0 2px 8px rgba(139, 21, 56, 0.3)',
                                        backgroundColor: concept.color 
                                    }}
                                    whileHover={{ scale: 1.4 }}
                                />
                                <div className="text-xs font-semibold mt-2 whitespace-nowrap" style={{ color: concept.color }}>
                                    {concept.year}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Concept cards below timeline */}
                <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {concepts.map((concept) => (
                            <motion.div
                                key={concept.term}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ 
                                    opacity: selectedConcept ? (selectedConcept.term === concept.term ? 1 : 0.3) : 1,
                                    scale: selectedConcept?.term === concept.term ? 1.05 : 1
                                }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setSelectedConcept(selectedConcept?.term === concept.term ? null : concept)}
                            >
                                <Card className={`cursor-pointer transition-all duration-300 ${
                                    concept.featured 
                                        ? 'border-2 border-[#D4AF37] shadow-lg' 
                                        : 'border border-gray-200 hover:border-[#8B1538]/30'
                                } ${selectedConcept?.term === concept.term ? 'ring-2 ring-[#D4AF37]' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-bold text-[#002D62] text-sm mb-1">{concept.term}</h4>
                                                <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{concept.year}</span>
                                                </div>
                                            </div>
                                            {concept.featured && (
                                                <Badge className="bg-[#D4AF37] text-[#2D2D2D] text-xs">
                                                    {lang === 'pt' ? 'Destaque' : 'Featured'}
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <p className="text-xs text-[#6B6B6B] mb-3 leading-relaxed">
                                            {concept.description}
                                        </p>

                                        {selectedConcept?.term === concept.term && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-2"
                                            >
                                                <div className="bg-amber-50 border-l-2 border-[#D4AF37] p-2 rounded">
                                                    <div className="flex items-start gap-2">
                                                        <TrendingUp className="w-3 h-3 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs font-semibold text-[#002D62] mb-1">
                                                                {concept.milestone}
                                                            </p>
                                                            <p className="text-xs text-[#6B6B6B]">{concept.impact}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-1">
                                                    {concept.sources.map((source, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs border-[#002D62]/30">
                                                            <BookOpen className="w-3 h-3 mr-1" />
                                                            {source}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-[#002D62]">7</div>
                        <div className="text-xs text-[#6B6B6B]">
                            {lang === 'pt' ? 'Conceitos Principais' : 'Main Concepts'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-[#002D62]">10</div>
                        <div className="text-xs text-[#6B6B6B]">
                            {lang === 'pt' ? 'Anos de Evolução' : 'Years of Evolution'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-[#002D62]">2</div>
                        <div className="text-xs text-[#6B6B6B]">
                            {lang === 'pt' ? 'Termos Virais (2025)' : 'Viral Terms (2025)'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-[#002D62]">95%</div>
                        <div className="text-xs text-[#6B6B6B]">
                            {lang === 'pt' ? 'Fidelidade HUA' : 'HUA Fidelity'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}