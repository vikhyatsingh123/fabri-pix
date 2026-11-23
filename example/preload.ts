// The html of every page is rendered at build time (scripts/prerender.mjs). The code of a docs page is loaded before
// the first render, so the browser replaces that html with the same page, without a "Loading…" state in between.

type DocsModule = typeof import('./docs/Docs');

let docsModule: DocsModule | undefined;

/** the docs module, if it is loaded */
export const loadedDocs = () => docsModule;

export const isDocsPath = (path: string) => path === '/docs' || path.startsWith('/docs/');

export const preloadRoute = async (path: string) => {
	if (!isDocsPath(path)) {
		return;
	}
	const [docs, pages] = await Promise.all([import('./docs/Docs'), import('./docs/pages')]);
	await pages.preloadPage(path.replace(/^\/docs\/?/, ''));
	docsModule = docs;
};
