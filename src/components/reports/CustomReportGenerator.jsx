import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Calendar as CalendarIcon, Download, Loader2, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CustomReportGenerator({ lang = 'pt' }) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [persona, setPersona] = useState('executivo');
    const [format, setFormat] = useState('pdf');
    const [customPrompt, setCustomPrompt] = useState('');
    const [generating, setGenerating] = useState(false);

    const t = {
        pt: {
            title: 'Gerador de Relatórios Personalizados',
            description: 'Crie relatórios sob medida com análise do Digital Twin',
            period: 'Período de Análise',
            startDate: 'Data Inicial',
            endDate: 'Data Final',
            topics: 'Tópicos de Interesse',
            topicsPlaceholder: 'Selecione tópicos',
            persona: 'Persona do Relatório',
            format: 'Formato de Exportação',
            customInstructions: 'Instruções Adicionais (opcional)',
            customPlaceholder: 'Ex: Foque em impactos para o setor agrícola brasileiro...',
            generate: 'Gerar Relatório',
            generating: 'Gerando relatório...',
            success: 'Relatório gerado com sucesso!',
            error: 'Erro ao gerar relatório',
            selectTopics: 'Selecione pelo menos um tópico',
            selectDates: 'Selecione o período',
            availableTopics: [
                'Comércio Internacional',
                'BRICS',
                'Relações EUA-China',
                'Economia Brasileira',
                'Competitividade Global',
                'ESG e Sustentabilidade',
                'Tecnologia e Inovação',
                'Energia',
                'Agricultura',
                'Geopolítica',
                'Diplomacia Econômica',
                'Mercados Emergentes'
            ],
            personas: [
                { value: 'executivo', label: 'Executivo', desc: 'Conciso, estratégico, foco em decisão' },
                { value: 'academico', label: 'Acadêmico', desc: 'Profundo, com referências e análise teórica' },
                { value: 'diplomatico', label: 'Diplomático', desc: 'Nuançado, equilibrado, contextual' },
                { value: 'jornalistico', label: 'Jornalístico', desc: 'Claro, factual, acessível ao público geral' }
            ]
        },
        en: {
            title: 'Custom Report Generator',
            description: 'Create tailored reports with Digital Twin analysis',
            period: 'Analysis Period',
            startDate: 'Start Date',
            endDate: 'End Date',
            topics: 'Topics of Interest',
            topicsPlaceholder: 'Select topics',
            persona: 'Report Persona',
            format: 'Export Format',
            customInstructions: 'Additional Instructions (optional)',
            customPlaceholder: 'E.g., Focus on impacts for Brazilian agriculture sector...',
            generate: 'Generate Report',
            generating: 'Generating report...',
            success: 'Report generated successfully!',
            error: 'Error generating report',
            selectTopics: 'Select at least one topic',
            selectDates: 'Select period',
            availableTopics: [
                'International Trade',
                'BRICS',
                'US-China Relations',
                'Brazilian Economy',
                'Global Competitiveness',
                'ESG and Sustainability',
                'Technology and Innovation',
                'Energy',
                'Agriculture',
                'Geopolitics',
                'Economic Diplomacy',
                'Emerging Markets'
            ],
            personas: [
                { value: 'executivo', label: 'Executive', desc: 'Concise, strategic, decision-focused' },
                { value: 'academico', label: 'Academic', desc: 'Deep, with references and theoretical analysis' },
                { value: 'diplomatico', label: 'Diplomatic', desc: 'Nuanced, balanced, contextual' },
                { value: 'jornalistico', label: 'Journalistic', desc: 'Clear, factual, accessible to general public' }
            ]
        }
    };

    const text = t[lang];

    const toggleTopic = (topic) => {
        setSelectedTopics(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            toast.error(text.selectDates);
            return;
        }
        if (selectedTopics.length === 0) {
            toast.error(text.selectTopics);
            return;
        }

        setGenerating(true);
        try {
            const response = await base44.functions.invoke('generateCustomReport', {
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd'),
                topics: selectedTopics,
                persona: persona,
                format: format,
                custom_instructions: customPrompt,
                language: lang
            });

            // Download file
            const blob = new Blob([response.data], { 
                type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            toast.success(text.success);
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(text.error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#002D62]" />
                    {text.title}
                </CardTitle>
                <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Period Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>{text.startDate}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, 'PPP') : text.startDate}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label>{text.endDate}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, 'PPP') : text.endDate}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Topics */}
                <div>
                    <Label className="mb-3 block">{text.topics}</Label>
                    <div className="flex flex-wrap gap-2">
                        {text.availableTopics.map((topic) => (
                            <Badge
                                key={topic}
                                variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
                                className={`cursor-pointer transition-all ${
                                    selectedTopics.includes(topic)
                                        ? 'bg-[#002D62] hover:bg-[#001d42]'
                                        : 'hover:border-[#002D62]'
                                }`}
                                onClick={() => toggleTopic(topic)}
                            >
                                {topic}
                                {selectedTopics.includes(topic) && (
                                    <X className="w-3 h-3 ml-1" />
                                )}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Persona */}
                <div>
                    <Label>{text.persona}</Label>
                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                        {text.personas.map((p) => (
                            <div
                                key={p.value}
                                onClick={() => setPersona(p.value)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    persona === p.value
                                        ? 'border-[#00654A] bg-[#00654A]/5'
                                        : 'border-gray-200 hover:border-[#00654A]/30'
                                }`}
                            >
                                <h4 className="font-semibold text-[#002D62] text-sm">{p.label}</h4>
                                <p className="text-xs text-gray-600 mt-1">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Format */}
                <div>
                    <Label>{text.format}</Label>
                    <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="docx">DOCX (Word)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Custom Instructions */}
                <div>
                    <Label>{text.customInstructions}</Label>
                    <Textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder={text.customPlaceholder}
                        className="h-24"
                    />
                </div>

                {/* Generate Button */}
                <Button
                    onClick={handleGenerate}
                    disabled={generating || !startDate || !endDate || selectedTopics.length === 0}
                    className="w-full bg-[#002D62] hover:bg-[#001d42]"
                    size="lg"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {text.generating}
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            {text.generate}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}