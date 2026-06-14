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

