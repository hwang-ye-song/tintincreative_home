import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // DB.env 파일도 로드 (환경 변수 우선순위: .env > DB.env)
  const dbEnvPath = path.resolve(__dirname, "DB.env");
  let dbEnv: Record<string, string> = {};
  if (fs.existsSync(dbEnvPath)) {
    const dbEnvContent = fs.readFileSync(dbEnvPath, "utf-8");
    dbEnvContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          dbEnv[key.trim()] = valueParts.join("=").trim();
        }
      }
    });
  }

  // 기본 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), "");
  
  // DB.env의 값으로 덮어쓰기 (환경 변수가 없을 때만)
  Object.keys(dbEnv).forEach((key) => {
    if (!env[key]) {
      env[key] = dbEnv[key];
    }
  });

  return {
    server: {
      host: "::",
      port: 8080,
    },
    define: {
      // 환경 변수를 클라이언트에서 사용할 수 있도록 정의
      "import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY": JSON.stringify(
        env.VITE_TOSS_PAYMENTS_CLIENT_KEY || process.env.VITE_TOSS_PAYMENTS_CLIENT_KEY || ""
      ),
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
  };
});
