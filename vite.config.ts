import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	build: {
		lib: {
			entry: 'src/index.ts',
			name: 'FabriPix',
			fileName: (format) => `index.${format}.js`,
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: ['react', 'react-dom', 'fabric'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					fabric: 'fabric',
				},
			},
		},
	},
});
