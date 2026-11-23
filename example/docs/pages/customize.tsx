import type { ComponentType } from 'react';

import CustomComponentsPage from './customize/components';
import FiltersPage from './customize/filters';
import IconsPage from './customize/icons';
import LabelsPage from './customize/labels';
import LayoutPage from './customize/layout';
import ShortcutsPage from './customize/shortcuts';
import ThemingPage from './customize/theming';
import ToolOptionsPage from './customize/toolOptions';
import ToolsAndMenusPage from './customize/toolsAndMenus';
import TouchPage from './customize/touch';

export const pages: Record<string, ComponentType> = {
	'tools-and-menus': ToolsAndMenusPage,
	'tool-options': ToolOptionsPage,
	labels: LabelsPage,
	icons: IconsPage,
	theming: ThemingPage,
	layout: LayoutPage,
	'custom-components': CustomComponentsPage,
	'keyboard-shortcuts': ShortcutsPage,
	'touch-and-mobile': TouchPage,
	filters: FiltersPage,
};
