/**
 * API Configuration — Foodoscope / IIIT-D Cosylab
 *
 * In DEVELOPMENT the Vite proxy (vite.config.js) routes:
 *   /api/recipe/*  →  http://cosylab.iiitd.edu.in:6969/*
 *   /api/flavor/*  →  http://192.168.1.92:9208/*
 *
 * This avoids CORS entirely — the browser only ever talks to localhost.
 *
 * In PRODUCTION set these env vars so the app calls the real servers:
 *   VITE_RECIPE_DB_URL = http://cosylab.iiitd.edu.in:6969
 *   VITE_FLAVOR_DB_URL = http://192.168.1.92:9208
 *
 * API key: get from https://www.foodoscope.com/ → Profile dashboard
 *   VITE_API_KEY = <your key>
 */

export const API_CONFIG = {
  // ── RecipeDB ──────────────────────────────────────────────
  // Falls back to the Vite proxy path when VITE_RECIPE_DB_URL is not set
  RECIPE_DB_BASE: import.meta.env.VITE_RECIPE_DB_URL || '/api/recipe',
  RECIPE_DB_PATH: '/recipe2-api',

  // ── FlavorDB ──────────────────────────────────────────────
  // 192.168.1.92 is IIIT LAN — only reachable on IIIT WiFi / VPN
  // Falls back to the Vite proxy path in dev so CORS is handled
  FLAVOR_DB_BASE: import.meta.env.VITE_FLAVOR_DB_URL || '/api/flavor',
  FLAVOR_DB_PATH: '/flavordb',

  // ── Auth ──────────────────────────────────────────────────
  RECIPE_DB_KEY: import.meta.env.VITE_RECIPE_DB_KEY || import.meta.env.VITE_API_KEY || '',
  FLAVOR_DB_KEY: import.meta.env.VITE_FLAVOR_DB_KEY || import.meta.env.VITE_API_KEY || '',
};

export const getRecipeDbUrl = () => `${API_CONFIG.RECIPE_DB_BASE}${API_CONFIG.RECIPE_DB_PATH}`;
export const getFlavorDbUrl = () => `${API_CONFIG.FLAVOR_DB_BASE}${API_CONFIG.FLAVOR_DB_PATH}`;