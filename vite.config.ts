import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Conditionally include visualizer only when in analyze mode
  const getVisualizerPlugin = async () => {
    if (mode === 'analyze') {
      try {
        const { visualizer } = await import('rollup-plugin-visualizer');
        return visualizer({
          filename: 'dist/report.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        });
      } catch {
        console.warn('rollup-plugin-visualizer not available, skipping bundle analysis');
        return null;
      }
    }
    return null;
  };

  return {
    plugins: [
      react(),
      getVisualizerPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB limit for large icons
        },
        includeAssets: ['favicon.ico'],
        manifest: {
          name: 'BENIRAGE CMS',
          short_name: 'BENIRAGE',
          description: 'BENIRAGE Community Management System',
          theme_color: '#1e40af'
        }
      })
    ].filter(Boolean),
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      port: 3000,
      host: true,
      cors: true,
      hmr: false,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@pages': resolve(__dirname, './src/pages'),
        '@utils': resolve(__dirname, './src/utils'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@services': resolve(__dirname, './src/services'),
        '@styles': resolve(__dirname, './src/styles'),
        '@config': resolve(__dirname, './src/config'),
      },
    },
    build: {
      target: 'esnext',
      minify: mode === 'production',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
            icons: ['lucide-react']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    },
    define: {
      __APP_ENV__: JSON.stringify(process.env.APP_ENV),
      __SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL),
      __SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@supabase/supabase-js',
        'lucide-react'
      ]
    }
  };
});