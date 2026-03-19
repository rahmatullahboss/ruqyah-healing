// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  output: 'static',
  site: 'https://ruqyah-healing.pages.dev',
  build: {
    inlineStylesheets: 'always',
  },
});