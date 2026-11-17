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
