// Renders the pages of the site to html at build time, used by scripts/prerender.mjs

import { renderToString } from 'react-dom/server';

import App from './App';
import { allPages, docsNav, docsPath } from './docs/nav';
import { preloadRoute } from './preload';
import { setServerPath } from './router';

export { docsTitle, HOME_DESCRIPTION, HOME_TITLE } from './seo';

export interface Route {
	path: string;
	title: string;
	/** title of the docs section, `undefined` for pages outside the docs */
	section?: string;
	/** source files of the lazy chunks the page needs (keys of the vite manifest) */
	chunks: string[];
}

export const routes: Route[] = [
	{ path: '/', title: 'FabriPix', chunks: [] },
	...allPages.map((page) => ({
		path: docsPath(page.slug),
		title: page.title,
		section: docsNav.find((section) => section.pages.includes(page))?.title,
		chunks: ['docs/Docs.tsx', `docs/pages/${page.group}.tsx`],
	})),
];

export const render = async (path: string) => {
	setServerPath(path);
	await preloadRoute(path);
	return renderToString(<App />);
};
