import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        register: resolve(__dirname, "src/pages/auth/register/register.html"),
        adminHome: resolve(__dirname, "src/admin/home/home.html"),
        ordersAdmin: resolve(__dirname, "src/admin/orders/orders.html"),
        clientOrder: resolve(__dirname, "src/client/orders/orders.html"),
        cart: resolve(__dirname, "src/pages/store/cart/cart.html"),
        orders: resolve(__dirname, "src/pages/store/orders/orders.html"),
      },
    },
  },
  base: "./",
});
