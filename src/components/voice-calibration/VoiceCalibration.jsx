import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle, AlertCircle, TrendingUp, BookOpen, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceCalibration({ lang = 'pt' }) {
    const [positions, setPositions] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('positions');

    const [newPosition, setNewPosition] = useState({
        topic: '',
        position: '',
        source: '',
        source_url: '',
        confidence: 80,
        date: '',
        keywords: '',
        category: 'other',
        quote: ''
    });

    const t = {
        pt: {
            title: 'Calibração de Voz Troyjo',
            positions: 'Posições Documentadas',
            prompts: 'Versões de Prompt',
            addPosition: 'Nova Posição',
            topic: 'Tópico',
            position: 'Posição de Troyjo',
            source: 'Fonte',
            sourceUrl: 'URL da Fonte',
            confidence: 'Confiança (%)',
            date: 'Data',
            keywords: 'Palavras-chave (separadas por vírgula)',
            category: 'Categoria',
            quote: 'Citação Literal',
            save: 'Salvar',
            cancel: 'Cancelar',
            success: 'Posição salva com sucesso!',
            noPositions: 'Nenhuma posição documentada ainda',
            noPrompts: 'Nenhuma versão de prompt registrada'
        },
        en: {
            title: 'Troyjo Voice Calibration',
            positions: 'Documented Positions',
            prompts: 'Prompt Versions',
            addPosition: 'New Position',
            topic: 'Topic',
            position: "Troyjo's Position",
            source: 'Source',
            sourceUrl: 'Source URL',
            confidence: 'Confidence (%)',
            date: 'Date',
            keywords: 'Keywords (comma separated)',
            category: 'Category',
            quote: 'Literal Quote',
            save: 'Save',
            cancel: 'Cancel',
            success: 'Position saved successfully!',
            noPositions: 'No documented positions yet',
            noPrompts: 'No prompt versions registered'
        }
    }[lang];

    const categories = {
        brics: { label: 'BRICS', icon: '🌍' },
        trade: { label: lang === 'pt' ? 'Comércio' : 'Trade', icon: '📊' },
        china: { label: lang === 'pt' ? 'China' : 'China', icon: '🇨🇳' },
        competitiveness: { label: lang === 'pt' ? 'Competitividade' : 'Competitiveness', icon: '📈' },
        energy: { label: lang === 'pt' ? 'Energia' : 'Energy', icon: '⚡' },
        agriculture: { label: lang === 'pt' ? 'Agricultura' : 'Agriculture', icon: '🌾' },
        diplomacy: { label: lang === 'pt' ? 'Diplomacia' : 'Diplomacy', icon: '🤝' },
        finance: { label: lang === 'pt' ? 'Finanças' : 'Finance', icon: '💰' },
        development: { label: lang === 'pt' ? 'Desenvolvimento' : 'Development', icon: '🏗️' },
        other: { label: lang === 'pt' ? 'Outros' : 'Other', icon: '📝' }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [posData, promptData] = await Promise.all([
                base44.entities.KnownPosition.list('-created_date'),
                base44.entities.PromptVersion.list('-created_date')
            ]);
            setPositions(posData || []);
            setPrompts(promptData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePosition = async () => {
        if (!newPosition.topic || !newPosition.position || !newPosition.source) {
            toast.error(lang === 'pt' ? 'Preencha os campos obrigatórios' : 'Fill required fields');
            return;
        }

        try {
            const keywords = newPosition.keywords.split(',').map(k => k.trim()).filter(k => k);
            await base44.entities.KnownPosition.create({
                ...newPosition,
                keywords,
                date: newPosition.date || null,
                source_url: newPosition.source_url || null,
                quote: newPosition.quote || null
            });

            setNewPosition({
                topic: '',
                position: '',
                source: '',
                source_url: '',
                confidence: 80,
                date: '',
                keywords: '',
                category: 'other',
                quote: ''
            });

            await loadData();
            toast.success(t.success);
        } catch (error) {
            console.error('Error saving position:', error);
            toast.error('Error saving position');
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 90) return 'bg-green-100 text-green-800';
        if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Star className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>
                    {lang === 'pt' 
                        ? 'Sistema de calibração para garantir fidelidade à voz de Marcos Troyjo'
                        : 'Calibration system to ensure fidelity to Marcos Troyjo\'s voice'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="positions">
                            <BookOpen className="w-4 h-4 mr-2" />
                            {t.positions}
                        </TabsTrigger>
                        <TabsTrigger value="prompts">
                            <FileText className="w-4 h-4 mr-2" />
                            {t.prompts}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="positions" className="space-y-4 mt-4">
                        {/* Add Position Form */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    {t.addPosition}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <Label>{t.topic} *</Label>
                                        <Input
                                            value={newPosition.topic}
                                            onChange={(e) => setNewPosition({...newPosition, topic: e.target.value})}
                                            placeholder="Ex: Expansão dos BRICS"
                                        />
                                    </div>
                                    <div>
                                        <Label>{t.category} *</Label>
                                        <Select
                                            value={newPosition.category}
                                            onValueChange={(value) => setNewPosition({...newPosition, category: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(categories).map(([key, val]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {val.icon} {val.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label>{t.position} *</Label>
                                    <Textarea
                                        value={newPosition.position}
                                        onChange={(e) => setNewPosition({...newPosition, position: e.target.value})}
                                        placeholder="Ex: Favorável à expansão com ênfase em governança e critérios claros de admissão"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label>{t.quote}</Label>
                                    <Textarea
                                        value={newPosition.quote}
                                        onChange={(e) => setNewPosition({...newPosition, quote: e.target.value})}
                                        placeholder="Citação literal de Troyjo sobre este tópico"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <Label>{t.source} *</Label>
                                        <Input
                                            value={newPosition.source}
                                            onChange={(e) => setNewPosition({...newPosition, source: e.target.value})}
                                            placeholder="Ex: Discurso Shanghai 2022"
                                        />
                                    </div>
                                    <div>
                                        <Label>{t.sourceUrl}</Label>
                                        <Input
                                            type="url"
                                            value={newPosition.source_url}
                                            onChange={(e) => setNewPosition({...newPosition, source_url: e.target.value})}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <Label>{t.date}</Label>
                                        <Input
                                            type="date"
                                            value={newPosition.date}
                                            onChange={(e) => setNewPosition({...newPosition, date: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t.confidence}</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newPosition.confidence}
                                            onChange={(e) => setNewPosition({...newPosition, confidence: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{t.keywords}</Label>
                                    <Input
                                        value={newPosition.keywords}
                                        onChange={(e) => setNewPosition({...newPosition, keywords: e.target.value})}
                                        placeholder="brics, expansão, governança, ndb"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setNewPosition({
                                            topic: '', position: '', source: '', source_url: '',
                                            confidence: 80, date: '', keywords: '', category: 'other', quote: ''
                                        })}
                                    >
                                        {t.cancel}
                                    </Button>
                                    <Button onClick={handleSavePosition} className="bg-[#002D62]">
                                        {t.save}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Positions List */}
                        {positions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>{t.noPositions}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {positions.map((pos) => (
                                    <Card key={pos.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{categories[pos.category]?.icon}</span>
                                                    <div>
                                                        <h4 className="font-semibold text-[#002D62]">{pos.topic}</h4>
                                                        <Badge className={getConfidenceColor(pos.confidence)}>
                                                            {pos.confidence}% confiança
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{categories[pos.category]?.label}</Badge>
                                            </div>
                                            
                                            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                                                <strong>Posição:</strong> {pos.position}
                                            </p>
                                            
                                            {pos.quote && (
                                                <p className="text-sm text-gray-600 italic mb-2 pl-3 border-l-2 border-blue-300">
                                                    "{pos.quote}"
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                <span>📄 {pos.source}</span>
                                                {pos.date && <span>📅 {new Date(pos.date).toLocaleDateString()}</span>}
                                                {pos.source_url && (
                                                    <a 
                                                        href={pos.source_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        🔗 Fonte
                                                    </a>
                                                )}
                                            </div>
                                            
                                            {pos.keywords?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {pos.keywords.map((kw, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {kw}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="prompts" className="mt-4">
                        {prompts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>{t.noPrompts}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {prompts.map((prompt) => (
                                    <Card key={prompt.id}>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                                    <h4 className="font-semibold text-[#002D62]">{prompt.version}</h4>
                                                </div>
                                                <Badge className={
                                                    prompt.status === 'active' ? 'bg-green-600' :
                                                    prompt.status === 'testing' ? 'bg-yellow-600' :
                                                    'bg-gray-600'
                                                }>
                                                    {prompt.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{prompt.changes}</p>
                                            {prompt.test_results?.avg_score && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span>Score médio: {prompt.test_results.avg_score.toFixed(2)}/5.0</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}