import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
