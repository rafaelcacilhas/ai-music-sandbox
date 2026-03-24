import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({ 
    plugins: [tailwindcss(), sveltekit()],
    assetsInclude: ['**/*.mid', '**/*.midi'],
    server: {
        fs: {
        allow: ['..', './static']
        }
    },
    optimizeDeps: {
        exclude: ['midi-writer-js']
    }
});
