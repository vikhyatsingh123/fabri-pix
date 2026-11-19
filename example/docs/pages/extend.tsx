import type { ComponentType } from 'react';

import './extend.css';
import ComponentsPage from './extend/components';
import HooksPage from './extend/hooks';
import CustomLayoutPage from './extend/layout';
import CustomShapesPage from './extend/shapes';
import CustomToolsPage from './extend/tools';
import TypesPage from './extend/types';
import UtilitiesPage from './extend/utilities';

export const pages: Record<string, ComponentType> = {
	'custom-tools': CustomToolsPage,
	'custom-shapes': CustomShapesPage,
	'custom-layout': CustomLayoutPage,
	'api/hooks': HooksPage,
	'api/components': ComponentsPage,
	'api/types': TypesPage,
	'api/utilities': UtilitiesPage,
};
