import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import EmailVerification from '@/components/auth/EmailVerification';

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

export default function VerificationGate({ children }) {
    const { isVerified, loading, refresh } = useEmailVerification();
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    if (loading) return null;

    if (!isVerified) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <EmailVerification onVerified={refresh} />
                </div>
            </div>
        );
    }

    return children;
}