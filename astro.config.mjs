// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { conditions } from './src/data/conditions-data.js';
import { glossaryTerms } from './src/data/glossary-data.js';
import { audiences } from './src/data/audience-data.js';
import { locations } from './src/data/location-data.js';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
  integrations: [
    mdx(),
    sitemap({
      // Exclude any admin/private/API pages from the public sitemap
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/admin/') &&
        !page.includes('/login') &&
        !page.includes('/register') &&
        !page.includes('/profile') &&
        !page.includes('/forgot-password') &&
        !page.includes('/reset-password') &&
        !page.includes('/landing/') &&
        !page.includes('/ruqyah-diagnosis-old/') &&
        !page.includes('/test-posts/'),
      customPages: [
        ...conditions.map(c => `https://ruqyahhealing.com/conditions/${c.slug}`),
        ...glossaryTerms.map(t => `https://ruqyahhealing.com/glossary/${t.slug}`),
        ...audiences.map(a => `https://ruqyahhealing.com/for/${a.slug}`),
        ...locations.map(l => `https://ruqyahhealing.com/location/${l.slug}`),
      ],
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
  site: 'https://ruqyahhealing.com',
  build: {
    inlineStylesheets: 'always',
  },
});
