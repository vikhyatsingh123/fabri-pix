import type { ComponentType } from 'react';

import { allPages, type PageGroup } from './nav';

export type PageModule = { pages: Record<string, ComponentType> };

// every group of pages is its own chunk
export const groupLoaders: Record<PageGroup, () => Promise<PageModule>> = {
	start: () => import('./pages/start'),
	customize: () => import('./pages/customize'),
	extend: () => import('./pages/extend'),
	api: () => import('./pages/api'),
};

const loadedGroups = new Map<PageGroup, PageModule>();

/** the module of a group, if it was loaded with `preloadPage` */
export const loadedGroup = (group: PageGroup) => loadedGroups.get(group);

/** loads the code of a docs page (by its slug) before it is rendered */
export const preloadPage = async (slug: string) => {
	const page = allPages.find((item) => item.slug === slug);
	if (page && !loadedGroups.has(page.group)) {
		loadedGroups.set(page.group, await groupLoaders[page.group]());
	}
};
