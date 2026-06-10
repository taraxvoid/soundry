import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://omahasoundry.com',
  integrations: [sitemap()],
  output: 'static',
})
