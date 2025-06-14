// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dns from 'dns';
import http from 'http'; // 引入 http 模組，用於 agent

// 強制 Node.js 優先使用 IPv4
dns.setDefaultResultOrder('ipv4first');

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 酒店相關 API
      '/api/hotels': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false, // 如果你的後端沒有使用有效的 HTTPS 證書，設為 false
        ws: true, // 如果你的後端有 WebSocket，設為 true
        agent: new http.Agent({ keepAlive: true, keepAliveMsecs: 20000 }), // 保持連線
        rewrite: (path) => path.replace(/^\/api/, ''), // 將 /api/hotels/xxx 轉發為 /hotels/xxx
        // 舉例：前端請求 /api/hotels/search 會轉發到 http://127.0.0.1:3000/hotels/search
      },

      // 用戶或認證相關 API (假設路徑是 /auth 開頭)
      '/auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        agent: new http.Agent({ keepAlive: true, keepAliveMsecs: 20000 }),
        // 注意：這裡假設後端接收 /auth/login 就是 /auth/login，所以不需要 rewrite
        // 如果後端接收 /login，則需要 rewrite: (path) => path.replace(/^\/auth/, '')
      },

      // 如果還有其他路徑前綴，可以繼續添加
      '/someOtherFunction': {
        target: 'http://127.0.0.1:3000', // 或指向另一個後端服務，例如 'http://127.0.0.1:4000'
        changeOrigin: true,
        secure: false,
        ws: true,
        agent: new http.Agent({ keepAlive: true, keepAliveMsecs: 20000 }),
        // rewrite: (path) => path.replace(/^\/someOtherFunction/, ''), // 根據需求決定是否 rewrite
      },

      // 一個更廣泛的 /api 代理，作為備用或如果你所有 API 都帶 /api 但不確定更細的路徑
      // 需注意：如果 /api/hotels 已經配置了，這個更廣泛的 /api 會在 /api/hotels 之後才被考慮
      // 或者，如果你的所有 API 都帶 /api 前綴，並且後端也不需要這個 /api 前綴
      // 可以只用一個廣泛的 /api 配置，並加入 rewrite
      // 例如：前端請求 /api/hotels/search 會轉發到 http://127.0.0.1:3000/hotels/search
      // 例如：前端請求 /api/users/profile 會轉發到 http://127.0.0.1:3000/users/profile
      '/api': { // 這是你目前已有的，但現在可以考慮是否讓它更通用
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        agent: new http.Agent({ keepAlive: true, keepAliveMsecs: 20000 }),
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
