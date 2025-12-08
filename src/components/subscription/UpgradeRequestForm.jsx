import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UpgradeRequestForm({ open, onOpenChange, plan = 'pro', lang = 'pt' }) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        company: '',
        role: '',
        use_case: ''
    });

    const t = {
        pt: {
            title: plan === 'pro' ? 'Solicitar Plano Pro' : 'Solicitar Plano Enterprise',
            description: 'Preencha seus dados e nossa equipe entrará em contato via WhatsApp',
            fullName: 'Nome completo',
            phone: 'Telefone (WhatsApp)',
            company: 'Empresa/Organização',
            role: 'Cargo/Função',
            useCase: 'Como você planeja usar o Troyjo Twin?',
            submit: 'Enviar solicitação',
            cancel: 'Cancelar',
            successTitle: 'Solicitação enviada!',
            successMessage: 'Nossa equipe CAIO.Vision entrará em contato via WhatsApp em até 24 horas.',
            close: 'Fechar'
        },
        en: {
            title: plan === 'pro' ? 'Request Pro Plan' : 'Request Enterprise Plan',
            description: 'Fill in your details and our team will contact you via WhatsApp',
            fullName: 'Full name',
            phone: 'Phone (WhatsApp)',
            company: 'Company/Organization',
            role: 'Role/Position',
            useCase: 'How do you plan to use Troyjo Twin?',
            submit: 'Send request',
            cancel: 'Cancel',
            successTitle: 'Request sent!',
            successMessage: 'Our CAIO.Vision team will contact you via WhatsApp within 24 hours.',
            close: 'Close'
        }
    };

    const text = t[lang];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await base44.auth.me();

            await base44.entities.SubscriptionRequest.create({
                user_email: user.email,
                full_name: formData.full_name,
                phone: formData.phone,
                company: formData.company,
                role: formData.role,
                requested_plan: plan,
                use_case: formData.use_case,
                status: 'pending'
            });

            // Send notification email to team
            await base44.integrations.Core.SendEmail({
                to: 'team@caio.vision',
                subject: `Nova solicitação de ${plan.toUpperCase()} - ${formData.full_name}`,
                body: `
                    <h2>Nova Solicitação de Upgrade</h2>
                    <p><strong>Plano:</strong> ${plan.toUpperCase()}</p>
                    <p><strong>Nome:</strong> ${formData.full_name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>WhatsApp:</strong> ${formData.phone}</p>
                    <p><strong>Empresa:</strong> ${formData.company}</p>
                    <p><strong>Cargo:</strong> ${formData.role}</p>
                    <p><strong>Caso de Uso:</strong></p>
                    <p>${formData.use_case}</p>
                    <hr>
                    <p><small>Enviar resposta via WhatsApp para: ${formData.phone}</small></p>
                `
            });

            setSubmitted(true);
            toast.success(text.successTitle);
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSubmitted(false);
        setFormData({
            full_name: '',
            phone: '',
            company: '',
            role: '',
            use_case: ''
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                {!submitted ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>{text.title}</DialogTitle>
                            <DialogDescription>{text.description}</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="full_name">{text.fullName} *</Label>
                                <Input
                                    id="full_name"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">{text.phone} *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    placeholder="+55 11 99999-9999"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>

                            <div>
                                <Label htmlFor="company">{text.company}</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                />
                            </div>

                            <div>
                                <Label htmlFor="role">{text.role}</Label>
                                <Input
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                />
                            </div>

                            <div>
                                <Label htmlFor="use_case">{text.useCase}</Label>
                                <Textarea
                                    id="use_case"
                                    rows={3}
                                    value={formData.use_case}
                                    onChange={(e) => setFormData({...formData, use_case: e.target.value})}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                                    {text.cancel}
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1 bg-[#002D62]">
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                    )}
                                    {text.submit}
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#002D62] mb-2">
                            {text.successTitle}
                        </h3>
                        <p className="text-[#333F48]/70 mb-6">
                            {text.successMessage}
                        </p>
                        <Button onClick={handleClose} className="bg-[#002D62]">
                            {text.close}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}