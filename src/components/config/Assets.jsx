/**
 * Centralized Asset Management
 * - Single source of truth for all image URLs
 * - Easy to update CDN or migration to different storage
 * - Fallback support
 */

const SUPABASE_BASE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5';

export const ASSETS = {
    // Logo & Branding
    LOGO: `${SUPABASE_BASE}/7b4794e58_CapturadeTela2025-12-23s93044PM.png`,
    
    // Hero Images
    HERO_PHOTO: `${SUPABASE_BASE}/8c955389f_Replace_the_transparent_checkered_background_with_-1765063055494.png`,
    HERO_DIGITAL: `${SUPABASE_BASE}/b0d511c23_Edit_the_image_with_a_subtle_integration_of_gold_a-1765055553586.png`,
    
    // Fallback
    FALLBACK_IMAGE: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="18"%3EImage Not Available%3C/text%3E%3C/svg%3E',
    
    // External Assets (Unsplash placeholders for Homepage hero)
    HERO_CAROUSEL: [
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920&q=80',
        'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=1920&q=80'
    ]
};

/**
 * Optimized image component props generator
 * @param {string} src - Image URL from ASSETS
 * @param {string} alt - Alt text for accessibility
 * @returns {object} - Props for <img> tag
 */
export const createImageProps = (src, alt) => ({
    src: src || ASSETS.FALLBACK_IMAGE,
    alt: alt || 'Marcos Troyjo Digital Twin',
    loading: 'lazy',
    onError: (e) => {
        e.target.src = ASSETS.FALLBACK_IMAGE;
        console.error('Image load failed:', src);
    }
});