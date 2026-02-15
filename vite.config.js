import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────────
// PROXY SETUP — Why this is needed
//
// Both APIs live on IIIT servers / LAN.  A browser can't call them
// directly because they don't send CORS headers for external origins.
// Vite's dev proxy tunnels the request server-side (no CORS issue).
//
//   /api/recipe/*  →  http://cosylab.iiitd.edu.in:6969/*
//   /api/flavor/*  →  http://192.168.1.92:9208/*
//
// apiConfig.js already uses these /api/* paths when the VITE_*_URL
// env vars are not set, so nothing else needs to change.
// ─────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // RecipeDB — public IIIT server
      '/api/recipe': {
        target: 'http://cosylab.iiitd.edu.in:6969',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/recipe/, ''),
      },
      // FlavorDB — LAN server (must be on IIIT network / VPN)
      '/api/flavor': {
        target: 'http://192.168.1.92:9208',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/flavor/, ''),
      },
    },
  },
})