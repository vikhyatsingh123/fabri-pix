import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { preloadRoute } from './preload';

const container = document.getElementById('root')!;
const render = () =>
	createRoot(container).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);

// the html of the page is already there (rendered at build time), the docs code is loaded before it is replaced
preloadRoute(window.location.pathname.replace(/\/+$/, '') || '/').then(render, render);
