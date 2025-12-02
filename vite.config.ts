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
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React와 React-DOM은 반드시 같은 청크에 포함 (createContext 에러 방지)
          if (id.includes('node_modules')) {
            // React 관련 모든 패키지를 하나의 청크로 묶기
            if (
              id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('scheduler') ||
              id.includes('react-router') ||
              id.includes('@tanstack/react-query') ||
              id.includes('react-helmet') ||
              id.includes('react-hook-form') ||
              id.includes('react-markdown')
            ) {
              return 'vendor-react';
            }
            // Radix UI는 React에 의존하므로 별도 청크
            if (id.includes('@radix-ui')) {
              return 'vendor-radix-ui';
            }
            // 아이콘 라이브러리
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // 나머지 vendor
            return 'vendor';
          }
        },
      },
    },
  },
}));
