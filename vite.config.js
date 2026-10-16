import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Best practice: base relatif agar bisa di-host di subfolder (mis. GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { port: 5173 },
});
