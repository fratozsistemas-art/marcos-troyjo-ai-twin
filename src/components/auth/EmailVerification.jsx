import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function useEmailVerification() {
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkVerification();
    }, []);

    const checkVerification = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const verifications = await base44.entities.EmailVerification.filter({
                user_email: user.email,
                verified: true
            });
            setIsVerified(verifications.length > 0);
        } catch (error) {
            console.error('Error checking verification:', error);
            setIsVerified(false);
        } finally {
            setLoading(false);
        }
    };

    return { isVerified, loading, refresh: checkVerification };
}

export default function EmailVerification({ onVerified }) {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(5);
    const lang = localStorage.getItem('troyjo_lang') || 'pt';

    const t = {
        pt: {
            title: 'Verificar Email',
            description: 'Para iniciar seu trial de 7 dias, precisamos verificar seu email',
            emailLabel: 'Seu email',
            emailPlaceholder: 'Digite seu email',
            sendCode: 'Enviar Código',
            codeSent: 'Código enviado! Verifique seu email.',
            enterCode: 'Digite o código de 6 dígitos',
            verify: 'Verificar',
            resend: 'Reenviar código',
            verified: 'Email verificado com sucesso!',
            invalidCode: 'Código inválido',
            expired: 'Código expirado',
            tooMany: 'Muitas tentativas. Solicite um novo código.',
            orUseOAuth: 'Ou use:'
        },
        en: {
            title: 'Verify Email',
            description: 'To start your 7-day trial, we need to verify your email',
            emailLabel: 'Your email',
            emailPlaceholder: 'Enter your email',
            sendCode: 'Send Code',
            codeSent: 'Code sent! Check your email.',
            enterCode: 'Enter 6-digit code',
            verify: 'Verify',
            resend: 'Resend code',
            verified: 'Email verified successfully!',
            invalidCode: 'Invalid code',
            expired: 'Code expired',
            tooMany: 'Too many attempts. Request a new code.',
            orUseOAuth: 'Or use:'
        }
    };

    const text = t[lang];

    const handleSendCode = async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error(lang === 'pt' ? 'Email inválido' : 'Invalid email');
            return;
        }
        
        setSending(true);
        try {
            await base44.functions.invoke('sendVerificationCode', { email });
            setCodeSent(true);
            setAttemptsLeft(5);
            toast.success(text.codeSent);
        } catch (error) {
            console.error('Error sending code:', error);
            toast.error('Error');
        } finally {
            setSending(false);
        }
    };

    const handleVerify = async () => {
        if (code.length !== 6) return;
        
        setVerifying(true);
        try {
            const response = await base44.functions.invoke('verifyEmailCode', { code });
            
            if (response.data.verified) {
                toast.success(text.verified);
                if (onVerified) onVerified();
            }
        } catch (error) {
            const errorData = error.response?.data;
            
            if (errorData?.attempts_left !== undefined) {
                setAttemptsLeft(errorData.attempts_left);
            }
            
            if (error.response?.status === 400) {
                toast.error(errorData?.error === 'Code expired' ? text.expired : text.invalidCode);
            } else if (error.response?.status === 429) {
                toast.error(text.tooMany);
            } else {
                toast.error('Error');
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleOAuthGoogle = async () => {
        try {
            await base44.auth.redirectToLogin(window.location.pathname);
        } catch (error) {
            toast.error('Erro ao redirecionar para login');
        }
    };

    const handleOAuthLinkedIn = async () => {
        try {
            await base44.auth.redirectToLogin(window.location.pathname);
        } catch (error) {
            toast.error('Erro ao redirecionar para login');
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    {text.title}
                </CardTitle>
                <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!codeSent ? (
                    <>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                {text.emailLabel}
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={text.emailPlaceholder}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                            />
                        </div>
                        <Button 
                            onClick={handleSendCode} 
                            disabled={sending || !email}
                            className="w-full bg-[#002D62] hover:bg-[#001d42]"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4 mr-2" />
                            )}
                            {text.sendCode}
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-800">{text.codeSent}</span>
                        </div>

                        <div>
                            <Input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder={text.enterCode}
                                className="text-center text-2xl tracking-widest font-mono"
                                maxLength={6}
                            />
                            {attemptsLeft < 5 && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-amber-700">
                                    <AlertCircle className="w-3 h-3" />
                                    {lang === 'pt' ? `${attemptsLeft} tentativas restantes` : `${attemptsLeft} attempts left`}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                onClick={handleVerify} 
                                disabled={verifying || code.length !== 6}
                                className="flex-1 bg-[#002D62] hover:bg-[#001d42]"
                            >
                                {verifying ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                {text.verify}
                            </Button>
                            <Button 
                                onClick={handleSendCode} 
                                disabled={sending}
                                variant="outline"
                            >
                                {text.resend}
                            </Button>
                        </div>
                    </>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">{text.orUseOAuth}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleOAuthGoogle}
                        className="gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleOAuthLinkedIn}
                        className="gap-2"
                    >
                        <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}