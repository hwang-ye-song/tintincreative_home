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
    chunkSizeWarningLimit: 1000, // 청크 크기 경고 한계를 1MB로 설정
    target: 'esnext', // 최신 ES 기능 사용
    minify: 'esbuild', // esbuild로 최소화 (더 빠름)
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화
    rollupOptions: {
      output: {
        // 청크 파일명 포맷
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // React를 명시적으로 하나의 청크로 묶기 (createContext 에러 방지)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React 코어를 반드시 같은 청크에 포함
            if (
              id.includes('/react/') || 
              id.includes('/react-dom/') ||
              id.includes('/scheduler/')
            ) {
              return 'vendor-react';
            }
            // React 관련 라이브러리들도 같은 청크에 포함
            if (
              id.includes('/react-router') ||
              id.includes('/@tanstack/react-query') ||
              id.includes('/react-helmet') ||
              id.includes('/react-hook-form')
            ) {
              return 'vendor-react';
            }
          }
          // 나머지는 Vite가 자동으로 처리
          return null;
        },
      },
    },
  },
}));
