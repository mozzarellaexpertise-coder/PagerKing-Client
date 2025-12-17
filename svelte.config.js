import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),

  kit: {
    // Use static adapter for SPA + Capacitor
    adapter: adapter({
      pages: 'build',        // output folder
      assets: 'build',       // static assets
      fallback: 'index.html' // required for SPA routing
    })
  }
};

export default config;