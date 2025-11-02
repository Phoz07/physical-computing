import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  
  site: 'https://your-username.github.io',
  base: '/physical-computing',
  
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  
  build: {
    assets: '_astro',
  },
  
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          assetFileNames: '_astro/[name].[hash][extname]'
        }
      }
    }
  }
});