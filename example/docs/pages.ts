import type { ComponentType } from 'react';

import type { PageGroup } from './nav';

export type PageModule = { pages: Record<string, ComponentType> };

// every group of pages is its own chunk
export const groupLoaders: Record<PageGroup, () => Promise<PageModule>> = {
	start: () => import('./pages/start'),
	customize: () => import('./pages/customize'),
	extend: () => import('./pages/extend'),
	api: () => import('./pages/api'),
};
