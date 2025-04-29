import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	base: '/',
	server: {
		port: 3000,
	},
	build: {
		rollupOptions: {
			external: ['fabric', 'emoji-picker-react'],
			output: {
				globals: {
					fabric: 'fabric',
					'emoji-picker-react': 'EmojiPicker',
				},
			},
		},
	},
});
