import { defineConfig } from "vite";
import { resolve } from "path";
import dotenv from "dotenv";
dotenv.config({ path: resolve(__dirname, '../.env') });
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        //d:aplicaion/dist/
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        register: resolve(__dirname, "src/pages/auth/register/register.html"),
        adminHome: resolve(__dirname, "src/admin/home/home.html"),
        // clientHome: resolve(__dirname, "src/client/home/home.html"),
        clientOrder: resolve(__dirname, "src/client/orders/orders.html"),

      },
    },
  },
  base: "./",
});
