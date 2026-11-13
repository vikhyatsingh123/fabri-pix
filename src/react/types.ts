/**
 * @author Vikhyat Singh
 * @description Public types of the react components
 */

import type {
	ButtonHTMLAttributes,
	ComponentType,
	CSSProperties,
	ReactNode,
} from 'react';

import type { ImageEditorOptions } from '../core/types';

export interface EditorLabels {
	undo: string;
	redo: string;
	history: string;
	zoomIn: string;
	zoomOut: string;
	fit: string;
	pan: string;
	reset: string;
	cancel: string;
	save: string;
	exportJson: string;
	delete: string;
	more: string;
	fill: string;
	stroke: string;
	text: string;
	size: string;
	bold: string;
	italic: string;
	alignLeft: string;
	alignCenter: string;
	alignRight: string;
	stepNumber: string;
	emoji: string;
	initialState: string;
	created: string;
	modified: string;
	deleted: string;
	cropApplied: string;
	cropRemoved: string;
	imageEdited: string;
	loading: string;
	underline: string;
	strikethrough: string;
	font: string;
	color: string;
	rotateLeft: string;
	rotateRight: string;
	rotation: string;
	flipHorizontal: string;
	flipVertical: string;
	resetImage: string;
	ratio: string;
	ratioCustom: string;
	ratioSquare: string;
	apply: string;
	load: string;
	deleteAll: string;
	clearFilters: string;
}

export interface EditorIcons {
	undo: ReactNode;
	redo: ReactNode;
	history: ReactNode;
	zoomIn: ReactNode;
	zoomOut: ReactNode;
	pan: ReactNode;
	reset: ReactNode;
	cancel: ReactNode;
	save: ReactNode;
	exportJson: ReactNode;
	delete: ReactNode;
	dropdown: ReactNode;
	check: ReactNode;
	fill: ReactNode;
	stroke: ReactNode;
	text: ReactNode;
	bold: ReactNode;
	italic: ReactNode;
	alignLeft: ReactNode;
	alignCenter: ReactNode;
	alignRight: ReactNode;
	stepNumber: ReactNode;
	underline: ReactNode;
	strikethrough: ReactNode;
	rotateLeft: ReactNode;
	rotateRight: ReactNode;
	flipHorizontal: ReactNode;
	flipVertical: ReactNode;
	load: ReactNode;
	deleteAll: ReactNode;
}

/** parts of the editor which accept a class name / style through `classNames` / `styles` */
export type EditorSlot =
	| 'root'
	| 'header'
	| 'body'
	| 'menu'
	| 'menuItem'
	| 'stage'
	| 'toolbar'
	| 'toolButton'
	| 'contextPanel'
	| 'actions'
	| 'button'
	| 'dropdown'
	| 'dropdownContent'
	| 'historyPanel'
	| 'historyItem'
	| 'divider'
	| 'field'
	| 'colorPicker'
	| 'numberInput'
	| 'textInput'
	| 'segmented'
	| 'slider'
	| 'select'
	| 'filterList'
	| 'iconGrid';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** pressed / selected state (active tool, bold text...) */
	active?: boolean;
	/** destructive action (delete) */
	danger?: boolean;
	/** which part of the editor renders the button, lets one custom Button render differently */
	slot?: EditorSlot;
}

export interface ColorPickerProps {
	value: string | undefined;
	/** called while the color is being picked (live preview) */
	onChange: (color: string) => void;
	/** called once the color is picked, used to record history */
	onChangeComplete?: (color: string) => void;
	'aria-label'?: string;
}

export interface NumberInputProps {
	value: number | string | undefined;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	'aria-label'?: string;
}

export interface SliderProps {
	value: number;
	min: number;
	max: number;
	step?: number;
	/** called while dragging */
	onChange: (value: number) => void;
	/** called once the value is chosen, used to record history */
	onChangeComplete?: (value: number) => void;
	'aria-label'?: string;
}

export interface SelectProps {
	value: string | undefined;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
	'aria-label'?: string;
}

export interface EditorComponents {
	/** used for every button of the editor */
	Button: ComponentType<ButtonProps>;
	ColorPicker: ComponentType<ColorPickerProps>;
	NumberInput: ComponentType<NumberInputProps>;
	Slider: ComponentType<SliderProps>;
	Select: ComponentType<SelectProps>;
	/** layout parts, pass a component to replace or `null` to hide them */
	Header: ComponentType | null;
	MenuBar: ComponentType | null;
	Toolbar: ComponentType | null;
	ContextPanel: ComponentType | null;
	Actions: ComponentType | null;
}

/** values of the CSS variables used by the default styles */
export interface EditorTheme {
	primary?: string;
	background?: string;
	surface?: string;
	text?: string;
	mutedText?: string;
	border?: string;
	hover?: string;
	active?: string;
	danger?: string;
	success?: string;
	stageBackground?: string;
	radius?: string;
	fontFamily?: string;
	fontSize?: string;
}

/** `load` opens another image, `deleteAll` removes the annotations, `reset` also the crop and image adjustments */
export type EditorAction = 'load' | 'deleteAll' | 'reset' | 'cancel' | 'exportJson' | 'save';

export type EditorPosition = 'top' | 'bottom' | 'none';

export interface EditorLayout {
	/** menu tabs (Annotate / Crop / Redact), default 'left' */
	menu?: 'left' | 'right' | 'top' | 'bottom' | 'none';
	/** history and zoom controls, default 'top' */
	header?: EditorPosition;
	/** tools of the active menu, default 'bottom' */
	toolbar?: EditorPosition;
	/** options of the selected object / active tool, default 'bottom' */
	contextPanel?: EditorPosition;
	/** reset / save buttons, default 'bottom' */
	actions?: EditorPosition;
}

export interface EditorUIOptions {
	classNames?: Partial<Record<EditorSlot, string>>;
	styles?: Partial<Record<EditorSlot, CSSProperties>>;
	icons?: Partial<EditorIcons> & {
		tools?: Record<string, ReactNode>;
		menus?: Record<string, ReactNode>;
	};
	labels?: Partial<EditorLabels> & {
		tools?: Record<string, string>;
		menus?: Record<string, string>;
		filters?: Record<string, string>;
	};
	components?: Partial<EditorComponents>;
	theme?: EditorTheme;
	/** removes the default colors, borders and spacing, keeps only the layout */
	unstyled?: boolean;
	layout?: EditorLayout;
	/** buttons in the actions bar, default ['reset', 'save'] (+ 'cancel' when `onCancel` is set) */
	actions?: EditorAction[];
	onCancel?: () => void;
	/** called by the Export JSON button, the JSON is downloaded when not provided */
	onExportJson?: (json: Record<string, any>) => void;
}

export interface ImageEditorProviderProps extends ImageEditorOptions, EditorUIOptions {
	children?: ReactNode;
}

export interface ImageEditorProps extends ImageEditorProviderProps {
	className?: string;
	style?: CSSProperties;
	/** defaults to 100% of the parent */
	width?: number | string;
	/** defaults to 100% of the parent */
	height?: number | string;
}
