import { defineConfig } from 'vite';

// 상대 경로(base: './')로 빌드해야 Netlify 등 서브경로 배포에서도 자산 로딩이 깨지지 않습니다.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false
  }
});
