import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const translations = {
    pt: {
        title: 'Criar Novo Site',
        description: 'Configure as informações do seu novo site',
        siteName: 'Nome do Site',
        domain: 'Domínio',
        phpVersion: 'Versão PHP',
        sslEnabled: 'SSL Habilitado',
        yes: 'Sim',
        no: 'Não',
        cancel: 'Cancelar',
        create: 'Criar Site',
        creating: 'Criando...'
    },
    en: {
        title: 'Create New Site',
        description: 'Configure your new site information',
        siteName: 'Site Name',
        domain: 'Domain',
        phpVersion: 'PHP Version',
        sslEnabled: 'SSL Enabled',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
        create: 'Create Site',
        creating: 'Creating...'
    }
};

export default function CreateSiteDialog({ open, onOpenChange, onCreateSite, loading, lang = 'pt' }) {
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        phpVersion: '8.2',
        sslEnabled: true
    });
    const t = translations[lang];

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateSite(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t.siteName}</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="my-awesome-site"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="domain">{t.domain}</Label>
                        <Input
                            id="domain"
                            value={formData.domain}
                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            placeholder="example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phpVersion">{t.phpVersion}</Label>
                        <Select
                            value={formData.phpVersion}
                            onValueChange={(value) => setFormData({ ...formData, phpVersion: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7.4">PHP 7.4</SelectItem>
                                <SelectItem value="8.0">PHP 8.0</SelectItem>
                                <SelectItem value="8.1">PHP 8.1</SelectItem>
                                <SelectItem value="8.2">PHP 8.2</SelectItem>
                                <SelectItem value="8.3">PHP 8.3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ssl">{t.sslEnabled}</Label>
                        <Select
                            value={formData.sslEnabled.toString()}
                            onValueChange={(value) => setFormData({ ...formData, sslEnabled: value === 'true' })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">{t.yes}</SelectItem>
                                <SelectItem value="false">{t.no}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t.cancel}
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#002D62]">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t.creating}
                                </>
                            ) : (
                                t.create
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}