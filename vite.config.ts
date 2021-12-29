import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import path from "path";

// const getPath = (p: string) => path.resolve(__dirname, "../../../", p);
export default defineConfig({
  plugins: [vue(), jsx()],
  build:{
    assetsInlineLimit:0,
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'markswift',
      fileName: (format) => `markswift.${format}.js`
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  resolve: {
    // 别名
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
