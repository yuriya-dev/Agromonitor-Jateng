/**
 * Konfigurasi URL API terpusat.
 * Di local: gunakan http://localhost:5001
 * Di production (Vercel): gunakan NEXT_PUBLIC_API_URL dari environment variable
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const API_BASE = `${API_BASE_URL}/api`;

export default API_BASE_URL;
