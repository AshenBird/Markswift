import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import jsx from "@vitejs/plugin-vue-jsx";
import path from "path";

// const getPath = (p: string) => path.resolve(__dirname, "../../../", p);
export default defineConfig({
  plugins: [vue(), jsx()],
  resolve: {
    // 别名
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
