import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileImage, Presentation, Share2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const VisualizationCard = ({ title, content, visualization, index, type }) => {
    const [expanded, setExpanded] = useState(false);
    const cardRef = React.useRef(null);

    const exportAsImage = async () => {
        if (!cardRef.current) return;
        
        const canvas = await html2canvas(cardRef.current, {
            backgroundColor: '#ffffff',
            scale: 2
        });
        
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const getTypeIcon = () => {
        const icons = {
            metaphor: '🎭',
            storytelling: '📖',
            analogy: '🔗',
            impact: '💥'
        };
        return icons[type] || '✨';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card ref={cardRef} className="border-2 hover:border-[#002D62]/30 transition-all">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{getTypeIcon()}</span>
                                <Badge variant="outline" className="text-xs">
                                    {type}
                                </Badge>
                            </div>
                            <CardTitle className="text-[#002D62]">{title}</CardTitle>
                            {content && (
                                <CardDescription className="mt-2 text-[#333F48]">
                                    {content}
                                </CardDescription>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={exportAsImage}
                            className="text-[#00654A]"
                        >
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                {visualization && (
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-[#002D62]/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Presentation className="w-5 h-5 text-[#002D62]" />
                                    <h4 className="font-semibold text-[#002D62]">Sugestão Visual</h4>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Tipo</p>
                                        <Badge className="bg-[#002D62] text-white">{visualization.type}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Layout</p>
                                        <Badge className="bg-[#00654A] text-white">{visualization.layout}</Badge>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Elementos Visuais</p>
                                        <div className="flex flex-wrap gap-2">
                                            {visualization.visual_elements?.map((element, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {element}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {visualization.key_text && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Texto-Chave</p>
                                            <p className="text-[#002D62] font-semibold italic">
                                                "{visualization.key_text}"
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="flex items-center gap-2 text-sm text-[#002D62] hover:text-[#001d42] font-medium"
                                    >
                                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        {expanded ? 'Ocultar' : 'Ver'} Notas de Design
                                    </button>

                                    <AnimatePresence>
                                        {expanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {visualization.design_notes}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </motion.div>
    );
};

export default function MetaphorVisualizer({ data, lang = 'pt' }) {
    const exportAllAsPDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        let isFirstPage = true;

        // Title page
        pdf.setFontSize(24);
        pdf.setTextColor(0, 45, 98);
        pdf.text('Ferramentas de Comunicação', 20, 30);
        pdf.setFontSize(14);
        pdf.setTextColor(51, 63, 72);
        pdf.text('Marcos Troyjo Digital Twin', 20, 40);
        pdf.setFontSize(10);
        pdf.text(new Date().toLocaleDateString('pt-BR'), 20, 50);

        const addSection = (title, content, y) => {
            if (y > 250) {
                pdf.addPage();
                y = 20;
            }
            
            pdf.setFontSize(16);
            pdf.setTextColor(0, 45, 98);
            pdf.text(title, 20, y);
            
            pdf.setFontSize(10);
            pdf.setTextColor(51, 63, 72);
            const lines = pdf.splitTextToSize(content, 170);
            pdf.text(lines, 20, y + 10);
            
            return y + 10 + (lines.length * 5) + 10;
        };

        let currentY = 70;

        // Main Metaphor
        if (data.main_metaphor) {
            pdf.addPage();
            currentY = addSection(
                'Metáfora Principal: ' + data.main_metaphor.title,
                data.main_metaphor.description + '\n\n' + data.main_metaphor.application,
                20
            );
        }

        // Data Storytelling
        if (data.data_storytelling) {
            pdf.addPage();
            currentY = addSection(
                'Storytelling com Dados',
                data.data_storytelling.narrative,
                20
            );
        }

        // Analogies
        if (data.executive_analogies) {
            pdf.addPage();
            currentY = 20;
            data.executive_analogies.forEach((analogy, index) => {
                currentY = addSection(
                    `Analogia ${index + 1}: ${analogy.analogy}`,
                    `${analogy.context}\n\nDica: ${analogy.usage_tip}`,
                    currentY
                );
            });
        }

        // Impact Phrase
        if (data.impact_phrase) {
            pdf.addPage();
            pdf.setFontSize(20);
            pdf.setTextColor(0, 45, 98);
            const phraseText = typeof data.impact_phrase === 'string' ? data.impact_phrase : data.impact_phrase.text;
            const lines = pdf.splitTextToSize(phraseText, 170);
            pdf.text(lines, 105, 148, { align: 'center' });
        }

        pdf.save('troyjo_metaphors_presentation.pdf');
    };

    const translations = {
        pt: {
            title: 'Ferramentas de Comunicação Visual',
            mainMetaphor: 'Metáfora Principal',
            storytelling: 'Storytelling com Dados',
            analogies: 'Analogias Executivas',
            impactPhrase: 'Frase de Impacto',
            exportAll: 'Exportar Tudo (PDF)',
            dataPoints: 'Pontos de Dados'
        },
        en: {
            title: 'Visual Communication Tools',
            mainMetaphor: 'Main Metaphor',
            storytelling: 'Data Storytelling',
            analogies: 'Executive Analogies',
            impactPhrase: 'Impact Phrase',
            exportAll: 'Export All (PDF)',
            dataPoints: 'Data Points'
        }
    };

    const t = translations[lang];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-[#B8860B]" />
                    <h2 className="text-2xl font-bold text-[#002D62]">{t.title}</h2>
                </div>
                <Button
                    onClick={exportAllAsPDF}
                    className="bg-[#002D62] hover:bg-[#001d42] gap-2"
                >
                    <FileImage className="w-4 h-4" />
                    {t.exportAll}
                </Button>
            </div>

            <div className="space-y-6">
                {/* Main Metaphor */}
                {data.main_metaphor && (
                    <VisualizationCard
                        type="metaphor"
                        title={data.main_metaphor.title}
                        content={data.main_metaphor.description}
                        visualization={data.main_metaphor.visualization}
                        index={0}
                    />
                )}

                {/* Data Storytelling */}
                {data.data_storytelling && (
                    <VisualizationCard
                        type="storytelling"
                        title={t.storytelling}
                        content={data.data_storytelling.narrative}
                        visualization={data.data_storytelling.visualization}
                        index={1}
                    />
                )}

                {/* Executive Analogies */}
                {data.executive_analogies?.map((analogy, index) => (
                    <VisualizationCard
                        key={index}
                        type="analogy"
                        title={analogy.analogy}
                        content={`${analogy.context}\n\nDica: ${analogy.usage_tip}`}
                        visualization={analogy.visualization}
                        index={index + 2}
                    />
                ))}

                {/* Impact Phrase */}
                {data.impact_phrase && (
                    <VisualizationCard
                        type="impact"
                        title={t.impactPhrase}
                        content={typeof data.impact_phrase === 'string' ? data.impact_phrase : data.impact_phrase.text}
                        visualization={typeof data.impact_phrase === 'object' ? data.impact_phrase.visualization : null}
                        index={10}
                    />
                )}
            </div>
        </div>
    );
}