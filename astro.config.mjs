import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://glideup.net',
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
});
