import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

// a tiny history router: the landing page lives at `/`, the documentation at `/docs/...`

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	window.addEventListener('popstate', listener);
	return () => {
		listeners.delete(listener);
		window.removeEventListener('popstate', listener);
	};
};

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

const getPath = () => normalizePath(window.location.pathname);

// the page rendered at build time (see entry-server.tsx)
let serverPath = '/';

export const setServerPath = (path: string) => {
	serverPath = normalizePath(path);
};

export const usePath = () =>
	useSyncExternalStore(subscribe, getPath, () => (typeof window === 'undefined' ? serverPath : getPath()));

/** scrolls to the element of the url hash, or to the top */
export const scrollToHash = (hash = window.location.hash) => {
	const id = decodeURIComponent(hash.replace(/^#/, ''));
	if (!id) {
		window.scrollTo({ top: 0 });
		return;
	}
	// the page may still be rendering (lazy loaded docs pages)
	let attempts = 0;
	const tryScroll = () => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ block: 'start' });
		} else if (attempts++ < 20) {
			setTimeout(tryScroll, 50);
		}
	};
	tryScroll();
};

export const navigate = (to: string) => {
	const url = new URL(to, window.location.href);
	const samePage = url.pathname === window.location.pathname;
	window.history.pushState(null, '', url.pathname + url.search + url.hash);
	listeners.forEach((listener) => listener());
	if (samePage && url.hash) {
		scrollToHash(url.hash);
	} else {
		// after the new page rendered
		requestAnimationFrame(() => scrollToHash(url.hash));
	}
};

/** an `<a>` which navigates without reloading the page for links within the site */
export function Link(props: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
	const { to, onClick, ...rest } = props;
	const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
		onClick?.(event);
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			rest.target === '_blank'
		) {
			return;
		}
		event.preventDefault();
		navigate(to);
	};
	return <a href={to} onClick={handleClick} {...rest} />;
}
