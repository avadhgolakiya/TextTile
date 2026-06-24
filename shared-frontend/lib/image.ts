const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://texttile.onrender.com';

export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

export function getFullImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  const uploadsIdx = trimmed.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    const filename = trimmed.substring(uploadsIdx + '/uploads/'.length);
    return `${API_BASE}/uploads/${filename}`;
  }
  
  return trimmed;
}

export function getWhatsAppThumbnailUrl(url?: string | null): string {
  const fullUrl = getFullImageUrl(url);
  if (!fullUrl) return '';
  
  // If it's a Cloudinary URL, inject transformations to ensure WhatsApp generates a preview
  // WhatsApp requires images < ~300KB for link previews
  if (fullUrl.includes('res.cloudinary.com') && fullUrl.includes('/image/upload/')) {
    return fullUrl.replace('/image/upload/', '/image/upload/w_600,q_auto,f_jpg/');
  }
  
  return fullUrl;
}

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.includes('/video/upload/')
  );
}
