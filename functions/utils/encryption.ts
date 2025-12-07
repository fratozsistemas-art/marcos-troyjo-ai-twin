// Encryption utilities for sensitive data
const ALGORITHM = 'AES-GCM';

async function getEncryptionKey() {
    // In production, use a secure key management system
    const keyMaterial = new TextEncoder().encode(
        Deno.env.get('ENCRYPTION_KEY') || 'default-encryption-key-change-me-in-production'
    );
    
    const key = await crypto.subtle.importKey(
        'raw',
        await crypto.subtle.digest('SHA-256', keyMaterial),
        { name: ALGORITHM, length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
    
    return key;
}

export async function encryptData(plaintext) {
    try {
        const key = await getEncryptionKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        
        const ciphertext = await crypto.subtle.encrypt(
            { name: ALGORITHM, iv },
            key,
            encoder.encode(plaintext)
        );
        
        // Combine IV and ciphertext
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        
        // Return as base64
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Encryption failed');
    }
}

export async function decryptData(encryptedData) {
    try {
        const key = await getEncryptionKey();
        const decoder = new TextDecoder();
        
        // Decode from base64
        const combined = new Uint8Array(
            atob(encryptedData).split('').map(char => char.charCodeAt(0))
        );
        
        // Extract IV and ciphertext
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);
        
        const plaintext = await crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            ciphertext
        );
        
        return decoder.decode(plaintext);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Decryption failed');
    }
}

export function hashData(data) {
    const encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(data))
        .then(hash => {
            const hashArray = Array.from(new Uint8Array(hash));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        });
}