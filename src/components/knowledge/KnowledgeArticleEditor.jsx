import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Save, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function KnowledgeArticleEditor({ article, open, onClose, onSaved }) {
    const [form, setForm] = useState({
        title: '',
        summary: '',
        body: '',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [linking, setLinking] = useState(false);
    const [relatedArticles, setRelatedArticles] = useState([]);

    useEffect(() => {
        if (article) {
            setForm({
                title: article.title || '',
                summary: article.summary || '',
                body: article.body || '',
                tags: article.tags || []
            });
            setRelatedArticles(article.related_articles || []);
        } else {
            setForm({ title: '', summary: '', body: '', tags: ['knowledge-base', 'ai-generated'] });
            setRelatedArticles([]);
        }
    }, [article]);

    const addTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
    };

    const autoLinkArticles = async () => {
        setLinking(true);
        try {
            const response = await base44.functions.invoke('autoLinkKnowledgeArticles', {
                article_id: article?.id,
                article_content: form.body,
                article_title: form.title
            });
            
            if (response.data.related_article_ids) {
                setRelatedArticles(response.data.related_article_ids);
                toast.success(`${response.data.related_article_ids.length} artigos relacionados encontrados`);
            }
        } catch (error) {
            console.error('Error linking:', error);
            toast.error('Erro ao vincular artigos');
        } finally {
            setLinking(false);
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.body) {
            toast.error('Título e conteúdo são obrigatórios');
            return;
        }

        setSaving(true);
        try {
            const data = {
                ...form,
                type: 'knowledge_base',
                status: 'publicado',
                quality_tier: 'curator_approved',
                related_articles: relatedArticles
            };

            if (article?.id) {
                await base44.entities.Article.update(article.id, data);
                toast.success('Artigo atualizado');
            } else {
                await base44.entities.Article.create(data);
                toast.success('Artigo criado');
            }

            onSaved();
            onClose();
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {article ? 'Editar Artigo' : 'Novo Artigo de Conhecimento'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Título</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Título do artigo..."
                        />
                    </div>

                    <div>
                        <Label>Resumo</Label>
                        <Textarea
                            value={form.summary}
                            onChange={(e) => setForm({ ...form, summary: e.target.value })}
                            placeholder="Resumo executivo..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Conteúdo (Markdown)</Label>
                        <Textarea
                            value={form.body}
                            onChange={(e) => setForm({ ...form, body: e.target.value })}
                            placeholder="Conteúdo completo em Markdown..."
                            rows={12}
                            className="font-mono text-sm"
                        />
                    </div>

                    <div>
                        <Label>Tags</Label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                placeholder="Adicionar tag..."
                            />
                            <Button onClick={addTag} size="sm">Adicionar</Button>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {form.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="gap-1">
                                    {tag}
                                    <button onClick={() => removeTag(tag)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={autoLinkArticles}
                            disabled={linking || !form.body}
                        >
                            {linking ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <LinkIcon className="w-4 h-4 mr-2" />
                            )}
                            Auto-vincular Artigos
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Salvar
                            </Button>
                        </div>
                    </div>

                    {relatedArticles.length > 0 && (
                        <div className="pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-2">
                                {relatedArticles.length} artigos relacionados vinculados
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}