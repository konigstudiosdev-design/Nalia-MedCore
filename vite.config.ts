import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const emitSourcemaps = mode === 'development'

  return {
    base: '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
      outDir: 'dist-web',
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Nalia MedCore - Plataforma Médica',
          short_name: 'Nalia MedCore',
          description: 'Plataforma médica modular SaaS PWA',
          theme_color: '#005f73',
          background_color: '#080808',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
            { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
    },
  }
})
