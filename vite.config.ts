import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // تعريف متغيرات البيئة
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  server: {
    // تحسين الخادم المحلي
    hmr: {
      overlay: false, // إخفاء overlay الأخطاء المزعج
    },
  },
});
