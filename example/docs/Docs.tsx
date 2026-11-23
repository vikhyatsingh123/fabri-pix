import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ComponentType,
	type ReactNode,
} from 'react';

import './docs.css';
import { ArrowRightIcon } from '../icons';
import { docsTitle } from '../seo';
import { Link, navigate, scrollToHash } from '../router';
import { allPages, docsNav, docsPath, type DocPage } from './nav';
import { groupLoaders, loadedGroup } from './pages';
import { loadSearchIndex, searchDocs, type SearchEntry, type SearchResult } from './search';

const lazyPages = new Map<string, ComponentType>();

const getPageComponent = (page: DocPage): ComponentType => {
	const loaded = loadedGroup(page.group);
	if (loaded) {
		return loaded.pages[page.slug] ?? MissingPage;
	}
	let component = lazyPages.get(page.slug);
	if (!component) {
		component = lazy(async () => {
			const module = await groupLoaders[page.group]();
			return { default: module.pages[page.slug] ?? MissingPage };
		});
		lazyPages.set(page.slug, component);
	}
	return component;
};

function MissingPage() {
	return <p className='doc-lead'>This page is being written.</p>;
}

function NotFound() {
	return (
		<>
			<header className='doc-header'>
				<p className='doc-eyebrow'>404</p>
				<h1>Page not found</h1>
				<p className='doc-lead'>
					This page does not exist. Pick a topic from the menu or start with the{' '}
					<Link to='/docs'>introduction</Link>.
				</p>
			</header>
		</>
	);
}

const resultPath = (entry: SearchEntry) => `${docsPath(entry.page.slug)}${entry.anchor ? `#${entry.anchor}` : ''}`;

/** the snippet with the words of the query marked */
function Highlighted(props: { text: string; query: string }) {
	const { text, query } = props;
	const terms = query
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean)
		.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	if (terms.length === 0) {
		return <>{text}</>;
	}
	const parts = text.split(new RegExp(`(${terms.join('|')})`, 'gi'));
	return <>{parts.map((part, index): ReactNode => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part))}</>;
}

/** full-text results: the index (every page rendered to text) is built on the first search */
function SearchResults(props: {
	query: string;
	activeIndex: number;
	onResults: (results: SearchResult[]) => void;
	onNavigate: () => void;
}) {
	const { query, activeIndex, onResults, onNavigate } = props;
	const [index, setIndex] = useState<SearchEntry[] | null>(null);

	useEffect(() => {
		let cancelled = false;
		void loadSearchIndex().then((entries) => !cancelled && setIndex(entries));
		return () => {
			cancelled = true;
		};
	}, []);

	const results = useMemo(() => (index ? searchDocs(index, query) : []), [index, query]);
	useEffect(() => onResults(results), [results, onResults]);

	if (!index) {
		return <p className='docs-nav-empty'>Searching…</p>;
	}
	if (results.length === 0) {
		return <p className='docs-nav-empty'>Nothing found for “{query}”.</p>;
	}
	return (
		<ul className='search-results' role='listbox' aria-label='Search results'>
			{results.map((result, position) => (
				<li
					key={`${result.entry.page.slug}#${result.entry.anchor}`}
					role='option'
					aria-selected={position === activeIndex}
				>
					<Link
						to={resultPath(result.entry)}
						className={position === activeIndex ? 'active' : ''}
						onClick={onNavigate}
					>
						<span className='search-result-page'>{result.entry.page.title}</span>
						<span className='search-result-title'>
							<Highlighted text={result.entry.heading ?? result.entry.page.title} query={query} />
						</span>
						{result.snippet && (
							<span className='search-result-snippet'>
								<Highlighted text={result.snippet} query={query} />
							</span>
						)}
					</Link>
				</li>
			))}
		</ul>
	);
}

function Sidebar(props: { current: string; onNavigate: () => void; onFocusSearch: () => void }) {
	const { current, onNavigate, onFocusSearch } = props;
	const [query, setQuery] = useState('');
	const [activeIndex, setActiveIndex] = useState(0);
	const resultsRef = useRef<SearchResult[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const searching = query.trim().length >= 2;

	// "/" or ⌘K / Ctrl+K focuses the search
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const typing = !!target?.closest('input, textarea, select, [contenteditable="true"]');
			if (
				(event.key === '/' && !typing) ||
				(event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))
			) {
				event.preventDefault();
				onFocusSearch();
				inputRef.current?.focus();
				inputRef.current?.select();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onFocusSearch]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		const results = resultsRef.current;
		if (event.key === 'ArrowDown' && results.length > 0) {
			event.preventDefault();
			setActiveIndex((index) => Math.min(results.length - 1, index + 1));
		} else if (event.key === 'ArrowUp' && results.length > 0) {
			event.preventDefault();
			setActiveIndex((index) => Math.max(0, index - 1));
		} else if (event.key === 'Enter' && results[activeIndex]) {
			event.preventDefault();
			navigate(resultPath(results[activeIndex].entry));
			onNavigate();
		} else if (event.key === 'Escape') {
			setQuery('');
		}
	};

	return (
		<nav className='docs-nav' aria-label='Documentation'>
			<div className='docs-search-wrap'>
				<input
					ref={inputRef}
					className='docs-search'
					type='search'
					placeholder='Search the docs…'
					aria-label='Search the docs'
					value={query}
					// the index is built in the background as soon as the search is used
					onFocus={() => void loadSearchIndex()}
					onKeyDown={handleKeyDown}
					onChange={(event) => {
						setQuery(event.target.value);
						setActiveIndex(0);
					}}
				/>
				{!query && <kbd className='docs-search-key'>/</kbd>}
			</div>
			{searching ? (
				<SearchResults
					query={query.trim()}
					activeIndex={activeIndex}
					onResults={(results) => {
						resultsRef.current = results;
					}}
					onNavigate={onNavigate}
				/>
			) : (
				docsNav.map((section) => (
					<div key={section.title} className='docs-nav-section'>
						<p className='docs-nav-title'>{section.title}</p>
						<ul>
							{section.pages.map((page) => (
								<li key={page.slug}>
									<Link
										to={docsPath(page.slug)}
										className={page.slug === current ? 'active' : ''}
										aria-current={page.slug === current ? 'page' : undefined}
										onClick={onNavigate}
									>
										{page.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))
			)}
		</nav>
	);
}

/** "On this page": the h2 / h3 headings of the rendered article, highlighting the one in view */
function TableOfContents(props: { articleRef: React.RefObject<HTMLElement | null>; slug: string }) {
	const { articleRef, slug } = props;
	const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		const article = articleRef.current;
		if (!article) {
			return;
		}
		const collect = () => {
			const elements = Array.from(article.querySelectorAll<HTMLElement>('h2[id], h3[id]')).filter(
				(element) => !element.closest('.demo, .api-method'),
			);
			setHeadings(
				elements.map((element) => ({
					id: element.id,
					text: (element.textContent ?? '').replace(/#$/, ''),
					level: element.tagName === 'H2' ? 2 : 3,
				})),
			);
		};
		collect();
		// lazy pages render after the layout
		const observer = new MutationObserver(collect);
		observer.observe(article, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, [articleRef, slug]);

	useEffect(() => {
		if (headings.length === 0) {
			return;
		}
		const handleScroll = () => {
			let current: string | null = headings[0]?.id ?? null;
			for (const heading of headings) {
				const element = document.getElementById(heading.id);
				if (element && element.getBoundingClientRect().top < 120) {
					current = heading.id;
				}
			}
			setActiveId(current);
		};
		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [headings]);

	if (headings.length < 2) {
		return null;
	}
	return (
		<nav className='docs-toc' aria-label='On this page'>
			<p className='docs-nav-title'>On this page</p>
			<ul>
				{headings.map((heading) => (
					<li key={heading.id} className={heading.level === 3 ? 'toc-sub' : ''}>
						<a
							href={`#${heading.id}`}
							className={heading.id === activeId ? 'active' : ''}
							onClick={(event) => {
								event.preventDefault();
								window.history.replaceState(null, '', `#${heading.id}`);
								scrollToHash(`#${heading.id}`);
							}}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

export default function Docs(props: { path: string }) {
	const slug = props.path.replace(/^\/docs\/?/, '');
	const pageIndex = allPages.findIndex((page) => page.slug === slug);
	const page = pageIndex >= 0 ? allPages[pageIndex] : undefined;
	const previous = pageIndex > 0 ? allPages[pageIndex - 1] : undefined;
	const next = pageIndex >= 0 && pageIndex < allPages.length - 1 ? allPages[pageIndex + 1] : undefined;
	const section = docsNav.find((item) => item.pages.includes(page as DocPage));
	const articleRef = useRef<HTMLElement>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	// on phones the search lives in the collapsed menu
	const openMenu = useCallback(() => setMenuOpen(true), []);

	useEffect(() => {
		document.title = docsTitle(page ? page.title : 'Not found');
		setMenuOpen(false);
	}, [page]);

	const Page = page ? getPageComponent(page) : NotFound;

	return (
		<div className={`docs ${page?.wide ? 'docs--wide' : ''}`}>
			<aside className={`docs-sidebar ${menuOpen ? 'open' : ''}`}>
				<button
					type='button'
					className='docs-menu-toggle'
					aria-expanded={menuOpen}
					onClick={() => setMenuOpen((open) => !open)}
				>
					<span>
						{section?.title ?? 'Docs'} <span className='docs-menu-sep'>/</span> {page?.title ?? 'Not found'}
					</span>
					<span aria-hidden='true'>{menuOpen ? '✕' : '☰'}</span>
				</button>
				<Sidebar current={slug} onNavigate={() => setMenuOpen(false)} onFocusSearch={openMenu} />
			</aside>

			<article className='docs-article' ref={articleRef}>
				<Suspense fallback={<div className='docs-loading'>Loading…</div>}>
					<Page />
				</Suspense>

				{page && (
					<nav className='docs-pager' aria-label='Previous and next page'>
						{previous ? (
							<Link className='pager-link' to={docsPath(previous.slug)}>
								<span className='pager-label'>Previous</span>
								<span className='pager-title'>{previous.title}</span>
							</Link>
						) : (
							<span />
						)}
						{next && (
							<Link className='pager-link pager-link--next' to={docsPath(next.slug)}>
								<span className='pager-label'>Next</span>
								<span className='pager-title'>
									{next.title} <ArrowRightIcon />
								</span>
							</Link>
						)}
					</nav>
				)}
			</article>

			{!page?.wide && <TableOfContents articleRef={articleRef} slug={slug} />}
		</div>
	);
}
