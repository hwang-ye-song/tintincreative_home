import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 경고 제한을 늘리고, 문제를 일으키는 manualChunks 설정을 제거합니다.
    chunkSizeWarningLimit: 1600,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 기본 설정 사용 (Vite가 자동으로 최적화하도록 함)
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
}));
