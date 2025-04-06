import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),

    // 按需引入NaiveUi且自动创建组件声明
    Components({
      dts: true,
      resolvers: [NaiveUiResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@examples': fileURLToPath(new URL('./examples', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia', 'naive-ui', '@boe/utils-es'],
      input: ['src/index.ts'],
    },
    target: 'modules',
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      name: 'boe-layout',
      fileName: (format) => `boe-layout.${format}.js`,
    },
  },
})
