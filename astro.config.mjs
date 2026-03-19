// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://ruqyah-healing.pages.dev',
  build: {
    inlineStylesheets: 'always',
  },
});