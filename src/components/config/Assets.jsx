/**
 * Centralized Asset Configuration
 * 
 * Manages all external asset URLs to prevent hardcoded URLs
 * scattered across the codebase.
 */

const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_URL || 
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public';

const BASE_PATH = 'base44-prod/public/69335f9184b5ddfb48500fe5';

export const ASSETS = {
  LOGO_MAIN: `${STORAGE_BASE_URL}/${BASE_PATH}/7b4794e58_CapturadeTela2025-12-23s93044PM.png`,
  LOGO_ALT: `${STORAGE_BASE_URL}/${BASE_PATH}/558ec8ea6_logoTroyjoTwin.png`,
  HERO_PORTRAIT: `${STORAGE_BASE_URL}/${BASE_PATH}/8c955389f_Replace_the_transparent_checkered_background_with_-1765063055494.png`,
};

export function getAssetUrl(filename, path = BASE_PATH) {
  return `${STORAGE_BASE_URL}/${path}/${filename}`;
}

export function isValidAssetUrl(url) {
  if (!url) return false;
  
  const allowedDomains = [
    'supabase.co',
    'unsplash.com',
    'images.unsplash.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}