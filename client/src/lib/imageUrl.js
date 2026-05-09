// Resolves image/upload paths relative to the API server.
// In development: empty string (Vite proxy handles /uploads → localhost:3001)
// In production: Railway URL prefix (set via VITE_API_URL env var)
const API_BASE = import.meta.env.VITE_API_URL || '';

export function getImageUrl(path) {
  if (!path) return '/placeholder.jpg';
  // Already absolute (http/https) — don't prefix
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export default API_BASE;
