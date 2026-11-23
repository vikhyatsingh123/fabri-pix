// Runs after `vite build` and `vite build --ssr entry-server.tsx`: writes the html of every page (so search engines and
// link previews get the real content and their own title / description), the 404 page, sitemap.xml and robots.txt.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDist = path.join(root, 'dist-ssr');

const SITE_URL = (process.env.SITE_URL ?? 'https://fabri-pix.vercel.app').replace(/\/+$/, '');
const SITE_NAME = 'FabriPix';
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const GITHUB_URL = 'https://github.com/vikhyatsingh123/fabri-pix';
const NPM_URL = 'https://www.npmjs.com/package/fabri-pix';

const escapeHtml = (value) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const decodeHtml = (value) =>
	value
		.replace(/<[^>]+>/g, '')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;|&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim();

const truncate = (value, length = 160) => {
	if (value.length <= length) {
		return value;
	}
	const cut = value.slice(0, length - 1);
	return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
};

// the lead paragraph under the title of a docs page is its description
const leadOf = (html) => {
	const match = html.match(/<p class="doc-lead">([\s\S]*?)<\/p>/);
	return match ? decodeHtml(match[1]) : '';
};

/** the css and js files a lazy chunk needs, following its static imports */
const chunkFiles = (manifest, keys) => {
	const css = new Set();
	const js = new Set();
	const visit = (key) => {
		const chunk = manifest[key];
		if (!chunk || js.has(chunk.file)) {
			return;
		}
		js.add(chunk.file);
		chunk.css?.forEach((file) => css.add(file));
		chunk.imports?.forEach(visit);
	};
	keys.forEach(visit);
	// files of the entry are already in the template
	const entry = manifest['index.html'];
	js.delete(entry.file);
	entry.css?.forEach((file) => css.delete(file));
	return { css: [...css], js: [...js] };
};

const urlOf = (routePath) => `${SITE_URL}${routePath === '/' ? '/' : routePath}`;

const fileOf = (routePath) => (routePath === '/' ? 'index.html' : `${routePath.slice(1)}.html`);

const structuredData = (route, title, description) => {
	if (route.path === '/') {
		return [
			{
				'@context': 'https://schema.org',
				'@type': 'SoftwareSourceCode',
				name: 'FabriPix',
				alternateName: 'fabri-pix',
				description,
				url: urlOf('/'),
				codeRepository: GITHUB_URL,
				programmingLanguage: ['TypeScript', 'React'],
				runtimePlatform: 'Web browser',
				license: 'https://opensource.org/licenses/MIT',
				author: { '@type': 'Person', name: 'Vikhyat Singh' },
				sameAs: [GITHUB_URL, NPM_URL],
				image: OG_IMAGE,
			},
			{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: urlOf('/') },
		];
	}
	const crumbs = [
		{ name: 'Docs', url: urlOf('/docs') },
		...(route.path === '/docs' ? [] : [{ name: route.title, url: urlOf(route.path) }]),
	];
	return [
		{
			'@context': 'https://schema.org',
			'@type': 'TechArticle',
			headline: title,
			description,
			url: urlOf(route.path),
			image: OG_IMAGE,
			author: { '@type': 'Person', name: 'Vikhyat Singh' },
			isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: urlOf('/') },
			about: { '@type': 'SoftwareSourceCode', name: 'FabriPix', codeRepository: GITHUB_URL },
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: crumbs.map((crumb, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: crumb.name,
				item: crumb.url,
			})),
		},
	];
};

const headTags = ({ title, description, url, data, noindex, files }) =>
	[
		`<title>${escapeHtml(title)}</title>`,
		`<meta name="description" content="${escapeHtml(description)}" />`,
		noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`,
		`<meta property="og:type" content="${url === urlOf('/') ? 'website' : 'article'}" />`,
		`<meta property="og:site_name" content="${SITE_NAME}" />`,
		`<meta property="og:title" content="${escapeHtml(title)}" />`,
		`<meta property="og:description" content="${escapeHtml(description)}" />`,
		`<meta property="og:url" content="${url}" />`,
		`<meta property="og:image" content="${OG_IMAGE}" />`,
		'<meta property="og:image:width" content="1200" />',
		'<meta property="og:image:height" content="630" />',
		'<meta property="og:image:alt" content="FabriPix, a React image editor" />',
		'<meta name="twitter:card" content="summary_large_image" />',
		`<meta name="twitter:title" content="${escapeHtml(title)}" />`,
		`<meta name="twitter:description" content="${escapeHtml(description)}" />`,
		`<meta name="twitter:image" content="${OG_IMAGE}" />`,
		...files.css.map((file) => `<link rel="stylesheet" crossorigin href="/${file}" />`),
		...files.js.map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />`),
		...(data ? [`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`] : []),
	]
		.map((tag) => `\t\t${tag}`)
		.join('\n');

const main = async () => {
	const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
	const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite', 'manifest.json'), 'utf8'));
	const { render, routes, docsTitle, HOME_TITLE, HOME_DESCRIPTION } = await import(pathToFileURL(path.join(ssrDist, 'entry-server.mjs')).href);

	if (!template.includes('<!--seo-->')) {
		throw new Error('prerender: index.html has no <!--seo--> marker');
	}
	const page = (html, head) =>
		template
			// the title and description of the template are replaced by the ones of the page
			.replace(/\s*<title>[\s\S]*?<\/title>/, '')
			.replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, '')
			.replace('<!--seo-->', head.trimStart())
			.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

	// a page which cannot be rendered still gets its own head, its content is then rendered in the browser only
	const renderSafely = async (routePath) => {
		try {
			return await render(routePath);
		} catch (error) {
			console.warn(`prerender: ${routePath} is rendered in the browser only (${error.message})`);
			return '';
		}
	};

	const written = [];
	for (const route of routes) {
		const html = await renderSafely(route.path);
		const isHome = route.path === '/';
		const title = isHome ? HOME_TITLE : docsTitle(route.title);
		const description = isHome
			? HOME_DESCRIPTION
			: truncate(leadOf(html) || `${route.title}: documentation of FabriPix, the customizable React image editor.`);
		const url = urlOf(route.path);
		const head = headTags({
			title,
			description,
			url,
			data: structuredData(route, isHome ? 'FabriPix' : route.title, description),
			files: chunkFiles(manifest, route.chunks),
		});
		const file = path.join(dist, fileOf(route.path));
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, page(html, head));
		written.push(route.path);
	}

	// unknown paths (vercel serves 404.html with status 404)
	fs.writeFileSync(
		path.join(dist, '404.html'),
		page(
			await renderSafely('/404'),
			headTags({
				title: 'Page not found · FabriPix',
				description: HOME_DESCRIPTION,
				url: urlOf('/404'),
				noindex: true,
				files: { css: [], js: [] },
			}),
		),
	);

	const today = new Date().toISOString().slice(0, 10);
	fs.writeFileSync(
		path.join(dist, 'sitemap.xml'),
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${written
			.map(
				(routePath) =>
					`  <url><loc>${urlOf(routePath)}</loc><lastmod>${today}</lastmod><priority>${
						routePath === '/' ? '1.0' : routePath === '/docs' ? '0.9' : '0.7'
					}</priority></url>`,
			)
			.join('\n')}\n</urlset>\n`,
	);
	fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

	// build-only files
	fs.rmSync(path.join(dist, '.vite'), { recursive: true, force: true });
	fs.rmSync(ssrDist, { recursive: true, force: true });

	console.log(`prerender: ${written.length} pages, 404.html, sitemap.xml, robots.txt (${SITE_URL})`);
};

main().then(
	// timers of the rendered editor would keep node running
	() => process.exit(0),
	(error) => {
		console.error(error);
		process.exit(1);
	},
);
