import React from 'react';

export default function TroyjoLogo({ size = 40, className = '' }) {
    return (
        <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/558ec8ea6_logoTroyjoTwin.png"
            alt="Troyjo Twin Logo"
            width={size}
            height={size}
            className={className}
            style={{ objectFit: 'contain' }}
        />
    );
}