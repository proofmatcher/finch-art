// Images are served as static assets from client/public/uploads/
// This works on both local dev (Vite serves them) and Vercel (CDN serves them).
// Only API calls need the Railway URL prefix (handled via axios.defaults.baseURL in main.jsx).

export function getImageUrl(path) {
  if (!path) return '/placeholder.jpg';
  // Already absolute (http/https) — return as-is
  if (path.startsWith('http')) return path;
  // Relative path → served from Vite public dir / Vercel CDN
  return path;
}

export default getImageUrl;
