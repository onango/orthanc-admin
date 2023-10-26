import { defineConfig, resolveBaseUrl } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import dotenv from 'dotenv';
import fs from 'fs';
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: './src/assets',
  base: '',
  plugins: [
    vue(),
    // auto import Element Plus
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve('src'),
      api: resolve('src/admin/api'),
      assets: resolve('src/admin/assets'),
      components: resolve('src/components'),
      utils: resolve('src/admin/utils'),
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8042',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/ui/api'), // Rewrite the URL
      },
      '/orthanc': {
        target: 'http://localhost:8042',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/orthanc/, ''), // Rewrite the URL
      },
      '/admin-api': {
        target: 'http://localhost/php-seed',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/admin-api/, ''), // Rewrite the URL
      },
      '/v1-': {
        target: 'http://localhost/php-seed',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1-/, ''), // Rewrite the URL
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'token-landing.html'),
        retrieve: resolve(__dirname, 'retrieve-and-view.html'),
      },
    },
  },
  css: {
    postcss: {
      // to avoid this warning: https://github.com/vitejs/vite/discussions/5079
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === 'charset') {
                atRule.remove();
              }
            },
          },
        },
      ],
    },
  },
});
