import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
	// a single bundled index.d.ts instead of one declaration file per component
	plugins: [react(), dts({ rollupTypes: true })],
	build: {
		lib: {
			entry: 'src/index.ts',
			name: 'FabriPix',
			// the package is "type": "module", so the commonjs build needs the .cjs extension to be require()-able
			fileName: (format) => (format === 'cjs' ? 'index.cjs' : `index.${format}.js`),
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			// match sub paths too (react/jsx-runtime), otherwise the react runtime of our dev dependency gets bundled
			// and breaks consumers on a different react version; dependencies are installed by the consumer anyway
			external: [/^react($|\/)/, /^react-dom($|\/)/, /^fabric($|\/)/, /^emoji-picker-react($|\/)/],
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
