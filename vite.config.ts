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
    chunkSizeWarningLimit: 1600, // 경고 제한을 조금 더 늘려줍니다.
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // manualChunks 설정을 제거하거나, 아래처럼 단순화하세요.
        // 복잡한 분리 로직이 오히려 React Context 충돌을 유발할 수 있습니다.
        manualChunks: undefined, 
        
        // 또는 모든 라이브러리를 하나로 묶어 안전하게 처리하려면 아래 주석을 해제하고 사용하세요:
        /*
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        */
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
}));
