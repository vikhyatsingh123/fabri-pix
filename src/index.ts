import './styles/index.css';

// ready to use editor and the provider for custom layouts
export { ImageEditor, ImageEditorProvider } from './react/ImageEditor';

// building blocks of the default layout
export {
	Actions,
	ContextPanel,
	DefaultLayout,
	EditorCanvas,
	EditorRoot,
	Header,
	HistoryControls,
	HistoryPanel,
	MenuBar,
	ToolButton,
	Toolbar,
	ToolGroupButton,
	ZoomControls,
} from './react/components';
export type { EditorRootProps } from './react/components';

// UI primitives (replaceable through the `components` prop)
export { Button, ColorPicker, cx, Divider, Dropdown, Field, NumberInput, Segmented, toHexColor } from './react/ui';
export type { DropdownProps, SegmentedOption } from './react/ui';

// hooks
export { useEditorState, useEditorUI, useImageEditor, useToolOptions } from './react/context';
export type { EditorUIContextValue } from './react/context';

export { defaultIcons, defaultLabels } from './react/defaults';

// editor core
export { ImageEditorController } from './core/controller';
export type { EditorRegistry } from './core/controller';
export { builtInShapes } from './core/shapes';
export { generateId, MAX_ZOOM, MIN_ZOOM, SCENE_REFERENCE_SIZE, ShapeType } from './core/constants';
export { downloadBlob } from './core/dom';

// built-in tools, their option panels and helpers for custom tools
export * from './tools';

export type * from './core/types';
export type * from './react/types';
