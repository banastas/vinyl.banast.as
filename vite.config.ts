import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function googleAnalyticsPlugin() {
  return {
    name: 'google-analytics',
    transformIndexHtml(html: string) {
      if (html.includes('G-ZDMFMRZTBZ')) {
        return html;
      }
      
      const gaCode = `
    <!-- Google tag (gtag.js) -->
    <script type="text/javascript" async src="https://www.googletagmanager.com/gtag/js?id=G-ZDMFMRZTBZ"></script>
    <script type="text/javascript">
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-ZDMFMRZTBZ');
    </script>`;
      
      return html.replace('</head>', `${gaCode}\n  </head>`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), googleAnalyticsPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React DOM
          'react-vendor': ['react', 'react-dom'],
          // Lucide icons
          'icons': ['lucide-react'],
          // Vinyl data
          'data': ['./src/data/vinyls.json'],
          // Utilities
          'utils': [
            './src/utils/bbcodeParser.ts',
            './src/utils/artistNameCleaner.ts'
          ],
          // Core components
          'components': [
            './src/components/VinylDashboard.tsx',
            './src/components/VinylCard.tsx',
            './src/components/TouchTarget.tsx',
            './src/components/FluidTypography.tsx',
            './src/components/LoadingSkeleton.tsx',
            './src/components/ResponsiveImage.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
