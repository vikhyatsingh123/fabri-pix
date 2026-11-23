// Structure of the documentation. `group` is the file in ./pages which exports the page (lazy loaded per group).

export type PageGroup = 'start' | 'customize' | 'extend' | 'api';

export interface DocPage {
	/** path after /docs/, '' is the introduction */
	slug: string;
	title: string;
	group: PageGroup;
	/** extra words the sidebar search matches */
	keywords?: string;
	/** pages with a live editor next to the content (the API pages) don't show the "On this page" column */
	wide?: boolean;
}

export interface DocSection {
	title: string;
	pages: DocPage[];
}

export const docsNav: DocSection[] = [
	{
		title: 'Getting started',
		pages: [
			{ slug: '', title: 'Introduction', group: 'start', keywords: 'overview features' },
			{ slug: 'installation', title: 'Installation', group: 'start', keywords: 'npm yarn pnpm next.js ssr css' },
			{ slug: 'quick-start', title: 'Quick start', group: 'start', keywords: 'usage size height example' },
			{
				slug: 'loading-images',
				title: 'Loading images',
				group: 'start',
				keywords: 'src url blob file upload cors crossorigin',
			},
			{
				slug: 'saving-and-exporting',
				title: 'Saving & exporting',
				group: 'start',
				keywords: 'onsave export png jpeg webp quality download blob upload',
			},
			{
				slug: 'editor-state',
				title: 'Editor state & JSON',
				group: 'start',
				keywords: 'initialstate tojson restore autosave coordinates scene onchange',
			},
		],
	},
	{
		title: 'Customization',
		pages: [
			{
				slug: 'tools-and-menus',
				title: 'Tools & menus',
				group: 'customize',
				keywords: 'tools menus groups toolbar tabs',
			},
			{
				slug: 'tool-options',
				title: 'Tool defaults',
				group: 'customize',
				keywords: 'defaults options color font size stroke crop ratio',
			},
			{ slug: 'labels', title: 'Labels & translations', group: 'customize', keywords: 'i18n texts language' },
			{ slug: 'icons', title: 'Icons', group: 'customize', keywords: 'svg icon library' },
			{
				slug: 'theming',
				title: 'Theme & styling',
				group: 'customize',
				keywords: 'theme css variables classnames styles unstyled tailwind dark',
			},
			{
				slug: 'layout',
				title: 'Layout & actions',
				group: 'customize',
				keywords: 'position menu toolbar header actions objectcontrols buttons',
			},
			{
				slug: 'custom-components',
				title: 'Your own components',
				group: 'customize',
				keywords: 'button colorpicker slider select numberinput design system mui',
			},
			{
				slug: 'keyboard-shortcuts',
				title: 'Keyboard shortcuts',
				group: 'customize',
				keywords: 'keys hotkeys copy paste duplicate undo',
			},
			{
				slug: 'touch-and-mobile',
				title: 'Phones, tablets & gestures',
				group: 'customize',
				keywords: 'touch mobile phone tablet ipad pinch zoom pan gestures trackpad wheel responsive narrow',
			},
			{
				slug: 'filters',
				title: 'Filters & adjustments',
				group: 'customize',
				keywords: 'brightness contrast sepia grayscale custom filter',
			},
		],
	},
	{
		title: 'Extending',
		pages: [
			{
				slug: 'custom-tools',
				title: 'Custom tools',
				group: 'extend',
				keywords: 'tooldefinition toolcontext activate run optionspanel plugin',
			},
			{
				slug: 'custom-shapes',
				title: 'Custom shapes',
				group: 'extend',
				keywords: 'shapedefinition restore create helper transient',
			},
			{
				slug: 'custom-layout',
				title: 'Custom layout & headless UI',
				group: 'extend',
				keywords: 'provider children building blocks hooks own ui',
			},
		],
	},
	{
		title: 'API reference',
		pages: [
			{
				slug: 'api/image-editor',
				title: '<ImageEditor> props',
				group: 'api',
				keywords: 'props imageeditorprovider',
			},
			{
				slug: 'api/controller',
				title: 'Editor controller',
				group: 'api',
				wide: true,
				keywords:
					'ref imageeditorcontroller canvas setactivetool setmenu gettooloptions settooloptions getstate subscribe',
			},
			{
				slug: 'api/history',
				title: 'History & state',
				group: 'api',
				wide: true,
				keywords: 'undo redo gotohistory canundo commit withouthistory tojson loadstate setsource',
			},
			{
				slug: 'api/objects',
				title: 'Objects',
				group: 'api',
				wide: true,
				keywords: 'addshape addimage updateobject deleteobject deleteselection clearannotations reset',
			},
			{
				slug: 'api/selection',
				title: 'Selection, layers & styles',
				group: 'api',
				wide: true,
				keywords: 'selectall deselect nudge copy cut paste duplicate arrange bring send opacity shadow dashed',
			},
			{
				slug: 'api/image',
				title: 'Rotate, filters & size',
				group: 'api',
				wide: true,
				keywords: 'rotateimage flipimage setimagefilter setoutputsize resize getnaturalsize',
			},
			{
				slug: 'api/view-and-export',
				title: 'Zoom & export',
				group: 'api',
				wide: true,
				keywords: 'setzoom zoomin zoomout fittoview setpanning exportimage save',
			},
			{
				slug: 'api/events',
				title: 'Events',
				group: 'api',
				keywords: 'on change ready historychange toolchange selectionchange zoomchange error',
			},
			{
				slug: 'api/hooks',
				title: 'Hooks',
				group: 'extend',
				keywords: 'useimageeditor useeditorstate usetooloptions useeditorui',
			},
			{
				slug: 'api/components',
				title: 'Components',
				group: 'extend',
				keywords: 'editorroot editorcanvas toolbar toolbutton contextpanel historycontrols primitives',
			},
			{
				slug: 'api/types',
				title: 'Types',
				group: 'extend',
				keywords: 'typescript editorstate exportoptions saveresult menudefinition',
			},
			{
				slug: 'api/utilities',
				title: 'Constants & utilities',
				group: 'extend',
				keywords: 'defaultshortcuts builtintools defaultmenus builtinfilters shapetype generateid downloadblob',
			},
		],
	},
	{
		title: 'Help',
		pages: [
			{
				slug: 'troubleshooting',
				title: 'Troubleshooting & FAQ',
				group: 'start',
				keywords: 'cors tainted ssr next.js height blank error',
			},
			{ slug: 'migration', title: 'Upgrading from 2.x', group: 'start', keywords: 'migration 3.0 breaking' },
		],
	},
];

export const allPages: DocPage[] = docsNav.flatMap((section) => section.pages);

export const docsPath = (slug: string) => (slug ? `/docs/${slug}` : '/docs');
