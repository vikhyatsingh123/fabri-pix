import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `yarn dev:local` runs the demo against the library source in ../src instead of the published package
const useLocalSource = process.env.FABRIPIX_SOURCE === 'local';

export default defineConfig({
	plugins: [react()],
	base: '/',
	server: {
		port: 3000,
	},
	build: {
		// scripts/prerender.mjs reads which css / js files each page needs
		manifest: true,
	},
	ssr: {
		// the build-time render (entry-server.tsx) bundles everything with the browser builds of the packages, so fabric
		// does not need its node dependencies (jsdom, canvas)
		noExternal: true,
		resolve: {
			conditions: ['browser'],
			externalConditions: ['browser'],
		},
	},
	resolve: {
		alias: useLocalSource
			? [
					{ find: 'fabri-pix/dist/fabri-pix.css', replacement: path.resolve(__dirname, '../src/styles/index.css') },
					{ find: /^fabri-pix$/, replacement: path.resolve(__dirname, '../src/index.ts') },
				]
			: [],
		// one copy of react / fabric when the library source is used
		dedupe: ['react', 'react-dom', 'fabric'],
	},
});
