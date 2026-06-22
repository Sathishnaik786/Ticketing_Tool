import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('@fullcalendar')) return 'vendor-calendar';
            if (id.includes('@tiptap')) return 'vendor-editor';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('@tanstack/react-query')) return 'vendor-query';
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
          }
          if (id.includes('/modules/payroll/')) return 'module-payroll';
          if (id.includes('/modules/executive-analytics/')) return 'module-analytics';
          if (id.includes('/modules/knowledge-management/')) return 'module-knowledge';
          if (id.includes('/modules/notification-center/')) return 'module-notifications';
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && visualizer({
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
      open: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: false,
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
}));
