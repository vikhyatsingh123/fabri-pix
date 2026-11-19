import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';

import './docs.css';
import { ArrowRightIcon } from '../icons';
import { Link, scrollToHash } from '../router';
import { allPages, docsNav, docsPath, type DocPage, type PageGroup } from './nav';

type PageModule = { pages: Record<string, ComponentType> };

// every group of pages is its own chunk
const groupLoaders: Record<PageGroup, () => Promise<PageModule>> = {
	start: () => import('./pages/start'),
	customize: () => import('./pages/customize'),
	extend: () => import('./pages/extend'),
	api: () => import('./pages/api'),
};

const lazyPages = new Map<string, ComponentType>();

const getPageComponent = (page: DocPage): ComponentType => {
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
		<header className='doc-header'>
			<p className='doc-eyebrow'>404</p>
			<h1>Page not found</h1>
			<p className='doc-lead'>
				This page does not exist. Pick a topic from the menu or start with the{' '}
				<Link to='/docs'>introduction</Link>.
			</p>
		</header>
	);
}

function Sidebar(props: { current: string; onNavigate: () => void }) {
	const { current, onNavigate } = props;
	const [query, setQuery] = useState('');
	const normalized = query.trim().toLowerCase();
	const sections = useMemo(
		() =>
			docsNav
				.map((section) => ({
					...section,
					pages: section.pages.filter(
						(page) =>
							!normalized ||
							`${page.title} ${page.keywords ?? ''} ${section.title}`.toLowerCase().includes(normalized),
					),
				}))
				.filter((section) => section.pages.length > 0),
		[normalized],
	);

	return (
		<nav className='docs-nav' aria-label='Documentation'>
			<input
				className='docs-search'
				type='search'
				placeholder='Search the docs…'
				aria-label='Search the docs'
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			/>
			{sections.map((section) => (
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
			))}
			{sections.length === 0 && <p className='docs-nav-empty'>Nothing found for “{query}”.</p>}
		</nav>
	);
}

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

	useEffect(() => {
		document.title = page ? `${page.title} · FabriPix docs` : 'Not found · FabriPix docs';
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
				<Sidebar current={slug} onNavigate={() => setMenuOpen(false)} />
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
