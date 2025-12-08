import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Trash2, Edit, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/components/rbac/PermissionGate';

export default function KnownPositionsManager({ lang = 'pt' }) {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        topic: '',
        position: '',
        source: '',
        source_url: '',
        category: 'brics',
        confidence: 80,
        quote: ''
    });
    const { can, hasPrivilege } = usePermissions();

    const hasAccess = can('documents', 'create') || hasPrivilege('troyjo_revision');

    useEffect(() => {
        if (hasAccess) {
            loadPositions();
        }
    }, [hasAccess]);

    const loadPositions = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.KnownPosition.list('-created_date', 100);
            setPositions(data);
        } catch (error) {
            console.error('Error loading positions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await base44.entities.KnownPosition.update(editing.id, formData);
                toast.success(lang === 'pt' ? 'Posição atualizada!' : 'Position updated!');
            } else {
                await base44.entities.KnownPosition.create(formData);
                toast.success(lang === 'pt' ? 'Posição criada!' : 'Position created!');
            }
            setFormData({
                topic: '',
                position: '',
                source: '',
                source_url: '',
                category: 'brics',
                confidence: 80,
                quote: ''
            });
            setEditing(null);
            loadPositions();
        } catch (error) {
            console.error('Error saving position:', error);
            toast.error('Error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir esta posição?' : 'Delete this position?')) return;
        
        try {
            await base44.entities.KnownPosition.delete(id);
            toast.success(lang === 'pt' ? 'Posição excluída!' : 'Position deleted!');
            loadPositions();
        } catch (error) {
            console.error('Error deleting position:', error);
            toast.error('Error');
        }
    };

    if (!hasAccess) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                        {lang === 'pt' ? 'Acesso restrito a administradores e curadores' : 'Access restricted to administrators and curators'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const t = {
        pt: {
            title: 'Posições Documentadas',
            add: 'Adicionar Posição',
            topic: 'Tópico',
            position: 'Posição',
            source: 'Fonte',
            sourceUrl: 'URL da Fonte',
            category: 'Categoria',
            confidence: 'Confiança (%)',
            quote: 'Citação',
            save: 'Salvar',
            cancel: 'Cancelar'
        },
        en: {
            title: 'Documented Positions',
            add: 'Add Position',
            topic: 'Topic',
            position: 'Position',
            source: 'Source',
            sourceUrl: 'Source URL',
            category: 'Category',
            confidence: 'Confidence (%)',
            quote: 'Quote',
            save: 'Save',
            cancel: 'Cancel'
        }
    };

    const text = t[lang];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {text.title}
                        <Badge className="ml-2">Admin Only</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>{text.topic}</Label>
                            <Input
                                value={formData.topic}
                                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>{text.category}</Label>
                            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="brics">BRICS</SelectItem>
                                    <SelectItem value="trade">Trade</SelectItem>
                                    <SelectItem value="china">China</SelectItem>
                                    <SelectItem value="competitiveness">Competitiveness</SelectItem>
                                    <SelectItem value="energy">Energy</SelectItem>
                                    <SelectItem value="agriculture">Agriculture</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>{text.position}</Label>
                        <Textarea
                            value={formData.position}
                            onChange={(e) => setFormData({...formData, position: e.target.value})}
                            rows={3}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label>{text.source}</Label>
                            <Input
                                value={formData.source}
                                onChange={(e) => setFormData({...formData, source: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>{text.sourceUrl}</Label>
                            <Input
                                value={formData.source_url}
                                onChange={(e) => setFormData({...formData, source_url: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>{text.quote}</Label>
                        <Textarea
                            value={formData.quote}
                            onChange={(e) => setFormData({...formData, quote: e.target.value})}
                            rows={2}
                        />
                    </div>

                    <div className="flex gap-2">
                        {editing && (
                            <Button variant="outline" onClick={() => {
                                setEditing(null);
                                setFormData({
                                    topic: '',
                                    position: '',
                                    source: '',
                                    source_url: '',
                                    category: 'brics',
                                    confidence: 80,
                                    quote: ''
                                });
                            }}>
                                {text.cancel}
                            </Button>
                        )}
                        <Button onClick={handleSave} className="bg-[#002D62]">
                            {editing ? text.save : text.add}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {positions.map((pos) => (
                    <Card key={pos.id}>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-semibold text-[#002D62]">{pos.topic}</h4>
                                    <Badge variant="outline" className="mt-1">{pos.category}</Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => {
                                        setEditing(pos);
                                        setFormData(pos);
                                    }}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(pos.id)}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-[#333F48] mb-2">{pos.position}</p>
                            {pos.quote && (
                                <blockquote className="text-sm italic text-[#333F48]/70 border-l-2 border-[#B8860B] pl-3 my-2">
                                    "{pos.quote}"
                                </blockquote>
                            )}
                            <p className="text-xs text-[#333F48]/60">
                                {lang === 'pt' ? 'Fonte:' : 'Source:'} {pos.source}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}