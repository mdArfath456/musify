// Central app configuration.
// Set VITE_API_URL in a .env file when deploying (e.g. to Vercel) so the
// frontend never has a hardcoded backend URL baked into the bundle.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
