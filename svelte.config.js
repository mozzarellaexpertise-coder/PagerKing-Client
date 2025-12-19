import adapter from '@sveltejs/adapter-auto'; // Change this from adapter-static
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // adapter-auto will detect Vercel and enable the API routes automatically
    adapter: adapter()
  }
};

export default config;