/**
 * @author Vikhyat Singh
 * @description Public types of the editor core
 */

import type { Canvas, FabricObject } from 'fabric';
import type { ComponentType, ReactNode } from 'react';

import type { ImageEditorController } from './controller';

export type ToolOptions = Record<string, any>;

/** Why a tool is being deactivated, lets a tool decide whether to keep or apply its pending work */
export type ToolDeactivateReason =
	/** another tool / menu was selected or the tool was toggled off */
	| 'switch'
	/** temporarily, e.g. while pan mode is on, the tool is activated again afterwards */
	| 'pause'
	/** the canvas is restored from history (undo / redo / reset), the canvas content is replaced */
	| 'restore'
	/** the editor is unmounted or a new image is loaded */
	| 'dispose';

export interface ToolContext<O extends ToolOptions = ToolOptions> {
	editor: ImageEditorController;
	canvas: Canvas;
	tool: ToolDefinition<O>;
	/** current options of the tool (defaults merged with the `defaults` prop and changes from the options panel) */
	readonly options: O;
	setOptions(options: Partial<O>): void;
	/** canvas event listener, removed automatically when the tool is deactivated */
	on(eventName: string, handler: (event: any) => void): void;
	/** DOM event listener (window, document, element), removed automatically when the tool is deactivated */
	listen(target: EventTarget, type: string, handler: (event: any) => void): void;
	/** called when the options of this tool change while it is active */
	onOptionsChange(handler: (options: O) => void): void;
	/** cursor shown over empty canvas areas while the tool is active */
	setCursor(cursor: string): void;
	/** enables / disables fabric's drag-to-select box while the tool is active */
	setSelectionEnabled(enabled: boolean): void;
	/** `false` makes objects unselectable while the tool is active (e.g. while adjusting the photo) */
	setInteractive(interactive: boolean): void;
}

export interface ToolButtonProps {
	tool: ToolDefinition;
	active: boolean;
	onClick: () => void;
}

export interface ToolPanelProps<O extends ToolOptions = ToolOptions> {
	editor: ImageEditorController;
	tool: ToolDefinition<O>;
	/** the selected object of this tool, `null` when the panel edits the tool defaults (nothing selected) */
	target: FabricObject | null;
	options: O;
	setOptions: (options: Partial<O>) => void;
}

export interface ToolDefinition<O extends ToolOptions = ToolOptions> {
	id: string;
	label: string;
	icon?: ReactNode;
	/**
	 * `toggle` (default): stays active and handles canvas input until another tool is selected.
	 * `action`: runs once when clicked (e.g. add a star in the middle of the image).
	 */
	type?: 'toggle' | 'action';
	defaultOptions?: O;
	/** `shapeType`s of the objects this tool creates, its options panel is shown when one of them is selected */
	shapeTypes?: string[];
	/** called when a toggle tool is activated, may return a cleanup function */
	activate?: (context: ToolContext<O>) => void | ((reason: ToolDeactivateReason) => void);
	/** called when an action tool is clicked */
	run?: (context: ToolContext<O>) => void | Promise<void>;
	/** options UI shown for the active tool and for selected objects of this tool */
	OptionsPanel?: ComponentType<ToolPanelProps<O>>;
	/** replaces the default toolbar button (e.g. the emoji tool renders a picker) */
	ToolbarButton?: ComponentType<ToolButtonProps>;
}

export interface ShapeContext {
	editor: ImageEditorController;
	canvas: Canvas;
}

/** Describes objects with a given `shapeType`: how they are created, restored, deleted and tracked */
export interface ShapeDefinition {
	type: string;
	/** name shown in the history panel */
	label?: string;
	/** adds a new object to the canvas (used by `editor.addShape`) */
	create?: (data: any, context: ShapeContext) => void | Promise<void>;
	/** re-creates an object from its JSON (undo / redo / initial state), defaults to fabric's own deserialization */
	restore?: (data: any, context: ShapeContext) => void | Promise<void>;
	/** objects which are removed together with this one (e.g. the head of an arrow) */
	getRelatedObjects?: (object: FabricObject, canvas: Canvas) => FabricObject[];
	/** part of another object: adding / removing it does not create a history entry */
	helper?: boolean;
	/** helper whose modifications (e.g. text edits) are recorded */
	recordModifications?: boolean;
	/** editing UI only: never recorded and never part of the exported image */
	transient?: boolean;
	/** the tool records the history entry itself once the object is complete, not when it is added */
	recordOnAdd?: boolean;
}

export interface FilterControl {
	/** key in the filter options */
	key: string;
	/** slider (default), color picker or select */
	type?: 'range' | 'color' | 'select';
	min?: number;
	max?: number;
	step?: number;
	/** values for `type: 'select'` */
	options?: string[];
}

/** An image filter shown in the Filter menu, applied to the photo */
export interface FilterDefinition<O extends Record<string, any> = Record<string, any>> {
	id: string;
	label: string;
	defaultOptions?: O;
	/** inputs shown in the filter panel to change the options */
	controls?: FilterControl[];
	/** creates the fabric.js filter */
	create: (options: O) => any;
}

export type FlipDirection = 'horizontal' | 'vertical';

export interface ToolGroup {
	id: string;
	label: string;
	icon?: ReactNode;
	tools: string[];
}

export type MenuItem = string | ToolGroup;

export interface MenuDefinition {
	id: string;
	label: string;
	icon?: ReactNode;
	/** tool ids (or groups of tool ids shown as a dropdown) shown in the toolbar while this menu is open */
	tools: MenuItem[];
	/** tool which is activated automatically when the menu is opened (e.g. crop) */
	defaultTool?: string;
}

export interface ExportOptions {
	format?: 'png' | 'jpeg' | 'webp';
	/** 0 - 1, for jpeg / webp */
	quality?: number;
	/** scale of the exported image, defaults to the original image resolution */
	multiplier?: number;
	/** upper limit of exported pixels, browsers fail to create larger canvases (default 16 000 000) */
	maxPixels?: number;
}

export interface SaveResult {
	blob: Blob;
	json: Record<string, any>;
}

export interface HistoryState {
	/** serialized canvas states */
	entries: readonly string[];
	index: number;
}

export interface EditorState {
	/** the image (and initial state) is loaded and the editor can be used */
	ready: boolean;
	loading: boolean;
	activeMenu: string | null;
	activeTool: string | null;
	/** user zoom, 1 = image fits the view */
	zoom: number;
	panning: boolean;
	history: HistoryState;
	/** an undo / redo / history jump is in progress */
	restoring: boolean;
	selection: readonly FabricObject[];
	/** increases whenever selected objects are changed through the editor, used to re-render option panels */
	revision: number;
	toolOptions: Readonly<Record<string, ToolOptions>>;
}

export interface EditorEvents {
	ready: { editor: ImageEditorController };
	/** the canvas content changed (a new history entry was recorded) */
	change: { json: Record<string, any> };
	historyChange: { history: HistoryState };
	toolChange: { tool: string | null };
	menuChange: { menu: string | null };
	selectionChange: { objects: readonly FabricObject[] };
	zoomChange: { zoom: number };
	save: SaveResult;
	error: { error: unknown };
}

export interface ImageEditorOptions {
	/** image to edit: URL, data URL, Blob / File */
	src?: string | Blob | null;
	/** crossOrigin used to load `src`, needed to export images from other origins (default 'anonymous') */
	crossOrigin?: 'anonymous' | 'use-credentials' | null;
	/** previously exported JSON (`editor.toJSON()` / `onSave`) to continue editing */
	initialState?: Record<string, any> | string | null;
	/**
	 * Tools to show, by id. Custom tool definitions are registered and shown as well, a definition with the id of a
	 * built-in tool replaces it. Defaults to all built-in tools.
	 */
	tools?: (string | ToolDefinition<any>)[];
	/** menus (tabs) and the tools they contain, defaults to Annotate / Crop / Redact */
	menus?: MenuDefinition[];
	/** default options per tool id, e.g. `{ text: { fontSize: 32 } }` */
	defaults?: Record<string, ToolOptions>;
	/** additional / replacement shape definitions */
	shapes?: ShapeDefinition[];
	/** image filters of the Filter menu, a definition with the id of a built-in filter replaces it */
	filters?: FilterDefinition<any>[];
	exportOptions?: ExportOptions;
	/** maximum number of undo steps (default 50) */
	historyLimit?: number;
	/** delete the selection with the Delete / Backspace key (default true) */
	keyboardShortcuts?: boolean;
	onReady?: (editor: ImageEditorController) => void;
	/** called by `editor.save()` (the Save button), the image is downloaded when not provided */
	onSave?: (result: SaveResult) => void;
	onChange?: (json: Record<string, any>) => void;
	onToolChange?: (tool: string | null) => void;
	onSelectionChange?: (objects: readonly FabricObject[]) => void;
	onError?: (error: unknown) => void;
}
