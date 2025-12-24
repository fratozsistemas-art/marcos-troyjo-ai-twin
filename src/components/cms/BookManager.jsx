import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function BookManager({ lang = 'pt' }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        year: '',
        description: '',
        cover_url: '',
        purchase_link: '',
        isbn: '',
        order: 0,
        featured: true
    });

    const t = {
        pt: {
            title: 'Gerenciar Livros',
            add: 'Adicionar Livro',
            edit: 'Editar',
            delete: 'Excluir',
            save: 'Salvar',
            cancel: 'Cancelar',
            titleLabel: 'Título',
            year: 'Ano',
            description: 'Descrição',
            coverUrl: 'URL da Capa',
            purchaseLink: 'Link de Compra',
            isbn: 'ISBN',
            order: 'Ordem',
            featured: 'Destacado',
            noBooks: 'Nenhum livro cadastrado'
        },
        en: {
            title: 'Manage Books',
            add: 'Add Book',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            titleLabel: 'Title',
            year: 'Year',
            description: 'Description',
            coverUrl: 'Cover URL',
            purchaseLink: 'Purchase Link',
            isbn: 'ISBN',
            order: 'Order',
            featured: 'Featured',
            noBooks: 'No books registered'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.Book.list('order');
            setBooks(data || []);
        } catch (error) {
            console.error('Error loading books:', error);
            toast.error('Error loading books');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await base44.entities.Book.update(editing.id, formData);
                toast.success(lang === 'pt' ? 'Livro atualizado!' : 'Book updated!');
            } else {
                await base44.entities.Book.create(formData);
                toast.success(lang === 'pt' ? 'Livro criado!' : 'Book created!');
            }
            setDialogOpen(false);
            setEditing(null);
            resetForm();
            loadBooks();
        } catch (error) {
            console.error('Error saving book:', error);
            toast.error('Error saving book');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir este livro?' : 'Delete this book?')) return;
        try {
            await base44.entities.Book.delete(id);
            toast.success(lang === 'pt' ? 'Livro excluído!' : 'Book deleted!');
            loadBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            toast.error('Error deleting book');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            year: '',
            description: '',
            cover_url: '',
            purchase_link: '',
            isbn: '',
            order: 0,
            featured: true
        });
    };

    const openEditDialog = (book) => {
        setEditing(book);
        setFormData({
            title: book.title,
            year: book.year,
            description: book.description,
            cover_url: book.cover_url || '',
            purchase_link: book.purchase_link || '',
            isbn: book.isbn || '',
            order: book.order || 0,
            featured: book.featured !== false
        });
        setDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{text.title}</CardTitle>
                    <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-[#002D62] gap-2">
                        <Plus className="w-4 h-4" />
                        {text.add}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">{text.noBooks}</div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {books.map((book, idx) => (
                            <motion.div
                                key={book.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {book.cover_url && (
                                                <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded">
                                                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-[#002D62] truncate">{book.title}</h3>
                                                <p className="text-sm text-gray-500 mb-2">{book.year}</p>
                                                <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
                                                <div className="flex gap-2 mt-3">
                                                    <Button size="sm" variant="outline" onClick={() => openEditDialog(book)}>
                                                        <Edit2 className="w-3 h-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(book.id)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editing ? text.edit : text.add}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>{text.titleLabel} *</Label>
                                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{text.year} *</Label>
                                    <Input value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                                </div>
                                <div>
                                    <Label>{text.order}</Label>
                                    <Input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                            <div>
                                <Label>{text.description} *</Label>
                                <Textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div>
                                <Label>{text.coverUrl}</Label>
                                <Input value={formData.cover_url} onChange={(e) => setFormData({...formData, cover_url: e.target.value})} />
                            </div>
                            <div>
                                <Label>{text.purchaseLink}</Label>
                                <Input value={formData.purchase_link} onChange={(e) => setFormData({...formData, purchase_link: e.target.value})} />
                            </div>
                            <div>
                                <Label>{text.isbn}</Label>
                                <Input value={formData.isbn} onChange={(e) => setFormData({...formData, isbn: e.target.value})} />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); resetForm(); }}>
                                    <X className="w-4 h-4 mr-2" />
                                    {text.cancel}
                                </Button>
                                <Button onClick={handleSave} className="bg-[#002D62]">
                                    <Save className="w-4 h-4 mr-2" />
                                    {text.save}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}