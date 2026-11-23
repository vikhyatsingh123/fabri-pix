import { createElement } from 'react';

import { allPages, type DocPage } from './nav';
import { groupLoaders } from './pages';

/** one searchable part of a page: its introduction, or the text under one heading */
export interface SearchEntry {
	page: DocPage;
	/** heading of the section, `null` for the text before the first heading */
	heading: string | null;
	/** id of the heading, used as the link anchor */
	anchor: string | null;
	text: string;
	code: string;
}

export interface SearchResult {
	entry: SearchEntry;
	score: number;
	/** a short excerpt around the first match */
	snippet: string;
}

// parts of a rendered page which are not documentation text
const SKIPPED = '.demo-preview, .demo-log, .demo-toggle, .demo-badge, .anchor, .copy-button, .run-button, .doc-eyebrow';

const BLOCKS = new Set(['P', 'LI', 'TD', 'TH', 'TR', 'DIV', 'PRE', 'SECTION', 'FIGURE', 'H4', 'BR']);

/** splits the rendered html of a page into its sections */
const indexPage = (page: DocPage, html: string): SearchEntry[] => {
	const body = new DOMParser().parseFromString(html, 'text/html').body;
	body.querySelectorAll(SKIPPED).forEach((element) => element.remove());

	const entries: SearchEntry[] = [];
	let current: SearchEntry = { page, heading: null, anchor: null, text: '', code: '' };
	// in document order: every h2 / h3 with an id starts a new section
	const visit = (node: Node, inCode: boolean) => {
		if (node.nodeType === Node.TEXT_NODE) {
			if (inCode) {
				current.code += node.textContent;
			} else {
				current.text += node.textContent;
			}
			return;
		}
		if (node.nodeType !== Node.ELEMENT_NODE) {
			return;
		}
		const element = node as Element;
		if (element.tagName === 'H1') {
			// the page title is matched through the navigation entry
			return;
		}
		if (/^H[23]$/.test(element.tagName) && element.id) {
			entries.push(current);
			current = { page, heading: (element.textContent ?? '').trim(), anchor: element.id, text: '', code: '' };
			return;
		}
		element.childNodes.forEach((child) => visit(child, inCode || element.tagName === 'PRE'));
		// words of neighbouring blocks (table cells, list items, paragraphs) must not run together
		if (BLOCKS.has(element.tagName)) {
			current.text += ' ';
			current.code += ' ';
		}
	};
	visit(body, false);
	entries.push(current);

	const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
	return entries
		.map((entry) => ({ ...entry, text: clean(entry.text), code: clean(entry.code) }))
		.filter((entry) => entry.heading || entry.text || entry.code);
};

let indexPromise: Promise<SearchEntry[]> | null = null;

/**
 * Renders every docs page to html (in the browser, without effects, so the live demos stay placeholders) and splits
 * it into sections. Built once, on the first search.
 */
export const loadSearchIndex = (): Promise<SearchEntry[]> => {
	indexPromise ??= (async () => {
		const [{ renderToString }, ...modules] = await Promise.all([
			import('react-dom/server'),
			...Object.entries(groupLoaders).map(async ([group, load]) => ({ group, module: await load() })),
		]);
		return allPages.flatMap((page) => {
			const component = modules.find((item) => item.group === page.group)?.module.pages[page.slug];
			if (!component) {
				return [];
			}
			try {
				return indexPage(page, renderToString(createElement(component)));
			} catch (error) {
				console.warn(`docs search: could not index "${page.title}"`, error);
				return [];
			}
		});
	})();
	return indexPromise;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const excerpt = (source: string, terms: string[]) => {
	const lower = source.toLowerCase();
	const index = Math.min(...terms.map((term) => lower.indexOf(term)).filter((position) => position >= 0));
	if (!Number.isFinite(index)) {
		return source.slice(0, 140);
	}
	const start = Math.max(0, index - 50);
	const end = Math.min(source.length, index + 110);
	return `${start > 0 ? '…' : ''}${source.slice(start, end).trim()}${end < source.length ? '…' : ''}`;
};

/** finds the sections containing every word of the query, best matches first */
export const searchDocs = (index: SearchEntry[], query: string, limit = 20): SearchResult[] => {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	if (terms.length === 0) {
		return [];
	}
	const perPage = new Map<string, number>();
	return index
		.map((entry) => {
			const title = entry.page.title.toLowerCase();
			const heading = (entry.heading ?? '').toLowerCase();
			const keywords = entry.heading ? '' : (entry.page.keywords ?? '').toLowerCase();
			const text = entry.text.toLowerCase();
			const code = entry.code.toLowerCase();
			let score = 0;
			for (const term of terms) {
				const wordStart = new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}`);
				const termScore =
					(heading.includes(term) ? (wordStart.test(heading) ? 12 : 8) : 0) +
					(title.includes(term) ? (entry.heading ? 3 : 10) : 0) +
					(keywords.includes(term) ? 5 : 0) +
					(code.includes(term) ? 2 : 0) +
					(text.includes(term) ? (wordStart.test(text) ? 2 : 1) : 0);
				if (termScore === 0) {
					// every word has to match somewhere
					return null;
				}
				score += termScore;
			}
			const source = text && terms.some((term) => text.includes(term)) ? entry.text : entry.code || entry.text;
			return { entry, score, snippet: excerpt(source, terms) };
		})
		.filter((result): result is SearchResult => result !== null)
		.sort((a, b) => b.score - a.score)
		.filter((result) => {
			// at most three sections of the same page
			const count = perPage.get(result.entry.page.slug) ?? 0;
			perPage.set(result.entry.page.slug, count + 1);
			return count < 3;
		})
		.slice(0, limit);
};
