// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          assetFileNames: "_astro/[name].[hash][extname]",
        },
      },
    },
  },
  site: "https://phoz07.github.io",
  base: "./physical-computing",
  image: {
    service: {
      entrypoint: "astro:assets/services/sharp",
    },
  },
  build: {
    assets: "_astro",
  },
});
