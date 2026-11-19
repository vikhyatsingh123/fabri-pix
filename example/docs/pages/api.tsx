import type { ComponentType } from 'react';

import { ControllerPage } from './api/controller';
import { EventsPage } from './api/events';
import { HistoryPage } from './api/history';
import { ImagePage } from './api/image';
import { ObjectsPage } from './api/objects';
import { ImageEditorPropsPage } from './api/props';
import { SelectionPage } from './api/selection';
import { ViewAndExportPage } from './api/viewExport';

export const pages: Record<string, ComponentType> = {
	'api/image-editor': ImageEditorPropsPage,
	'api/controller': ControllerPage,
	'api/history': HistoryPage,
	'api/objects': ObjectsPage,
	'api/selection': SelectionPage,
	'api/image': ImagePage,
	'api/view-and-export': ViewAndExportPage,
	'api/events': EventsPage,
};
