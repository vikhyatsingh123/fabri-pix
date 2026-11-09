/**
 * @author Vikhyat Singh
 * @description Framework independent editor core. It owns the fabric canvas, the tools, the history and the view.
 * The react components are a thin layer on top of it and everything they do is available through its methods.
 */

import { ActiveSelection, Canvas, FabricImage, FabricObject, Point, Rect, TMat2D, util } from 'fabric';

import { builtInShapes } from './shapes';
import { blobToDataUrl, downloadBlob, isTypingTarget } from './dom';
import {
	CUSTOM_OBJECT_PROPERTIES,
	generateId,
	MAX_ZOOM,
	MIN_ZOOM,
	SCENE_REFERENCE_SIZE,
	ShapeType,
	ZOOM_STEP,
} from './constants';
import {
	EditorEvents,
	EditorState,
	ExportOptions,
	HistoryState,
	ImageEditorOptions,
	MenuDefinition,
	MenuItem,
	SaveResult,
	ShapeDefinition,
	ToolContext,
	ToolDeactivateReason,
	ToolDefinition,
	ToolOptions,
} from './types';

const DEFAULT_HISTORY_LIMIT = 50;
const DEFAULT_MAX_EXPORT_PIXELS = 16_000_000;

/** built-in tools and menus, injected by the react layer (they contain react icons / panels) */
export interface EditorRegistry {
	tools: ToolDefinition<any>[];
	menus: MenuDefinition[];
}

type Listener<T> = (payload: T) => void;

interface ToolSession {
	id: string;
	cleanup: (reason: ToolDeactivateReason) => void;
}

// the keyboard shortcuts only apply to the editor the user interacted with last (several editors on one page)
let lastInteractedEditor: ImageEditorController | null = null;

const roundZoom = (value: number) => Math.round(value * 100) / 100;

export class ImageEditorController {
	/** the fabric canvas, `null` until the editor canvas is mounted */
	canvas: Canvas | null = null;

	private options: ImageEditorOptions;
	private registry: EditorRegistry;
	private state: EditorState;
	private subscribers = new Set<() => void>();
	private eventListeners = new Map<keyof EditorEvents, Set<Listener<any>>>();
	private optionListeners = new Map<string, Set<(options: ToolOptions) => void>>();

	private tools = new Map<string, ToolDefinition<any>>();
	private customToolIds: string[] = [];
	private visibleToolIds: Set<string> | null = null;
	private menus: MenuDefinition[] = [];
	private shapes = new Map<string, ShapeDefinition>();

	private toolSession: ToolSession | null = null;
	private pausedTool: string | null = null;
	private historySuspended = 0;
	private loadToken = 0;
	private sceneSize = { ...SCENE_REFERENCE_SIZE };
	private viewSize = { width: 0, height: 0 };
	private fitZoom = 1;
	private panState = { dragging: false, x: 0, y: 0 };

	constructor(options: ImageEditorOptions = {}, registry: EditorRegistry = { tools: [], menus: [] }) {
		this.options = options;
		this.registry = registry;
		this.configure();
		this.state = {
			ready: false,
			loading: false,
			activeMenu: this.menus[0]?.id ?? null,
			activeTool: null,
			zoom: MIN_ZOOM,
			panning: false,
			history: { entries: [], index: -1 },
			restoring: false,
			selection: [],
			revision: 0,
			toolOptions: this.createInitialToolOptions({}),
		};
	}

	// ---------------------------------------------------------------- configuration

	/** updates the options (callbacks, tools, menus...), called by the react provider on every render */
	setOptions(options: ImageEditorOptions) {
		const previous = this.options;
		this.options = options;
		if (
			previous.tools !== options.tools ||
			previous.menus !== options.menus ||
			previous.shapes !== options.shapes ||
			previous.defaults !== options.defaults
		) {
			this.configure();
			const activeTool = this.state.activeTool;
			if (activeTool && !this.isToolVisible(activeTool)) {
				this.setActiveTool(null);
			}
			this.setState({
				toolOptions: this.createInitialToolOptions(this.state.toolOptions),
				activeMenu: this.menus.some((menu) => menu.id === this.state.activeMenu)
					? this.state.activeMenu
					: (this.menus[0]?.id ?? null),
			});
		}
	}

	getOptions(): ImageEditorOptions {
		return this.options;
	}

	private configure() {
		this.tools = new Map(this.registry.tools.map((tool) => [tool.id, tool]));
		this.customToolIds = [];
		for (const tool of this.options.tools ?? []) {
			if (typeof tool !== 'string') {
				if (!this.registry.tools.some((builtIn) => builtIn.id === tool.id)) {
					this.customToolIds.push(tool.id);
				}
				this.tools.set(tool.id, tool);
			}
		}
		this.visibleToolIds = this.options.tools
			? new Set(this.options.tools.map((tool) => (typeof tool === 'string' ? tool : tool.id)))
			: null;

		this.shapes = new Map([...builtInShapes, ...(this.options.shapes ?? [])].map((shape) => [shape.type, shape]));
		this.menus = this.resolveMenus();
	}

	private isToolVisible(id: string) {
		return this.tools.has(id) && (!this.visibleToolIds || this.visibleToolIds.has(id));
	}

	private resolveMenus(): MenuDefinition[] {
		const used = new Set<string>();
		const resolved = (this.options.menus ?? this.registry.menus).map((menu) => {
			const tools = menu.tools
				.map((item): MenuItem | null => {
					if (typeof item === 'string') {
						return this.isToolVisible(item) ? item : null;
					}
					const groupTools = item.tools.filter((id) => this.isToolVisible(id));
					return groupTools.length > 0 ? { ...item, tools: groupTools } : null;
				})
				.filter((item): item is MenuItem => item !== null);
			tools.forEach((item) => (typeof item === 'string' ? [item] : item.tools).forEach((id) => used.add(id)));
			return {
				...menu,
				tools,
				defaultTool: menu.defaultTool && this.isToolVisible(menu.defaultTool) ? menu.defaultTool : undefined,
			};
		});

		// custom tools which are not part of any menu are shown in the first one
		const unplaced = this.customToolIds.filter((id) => this.isToolVisible(id) && !used.has(id));
		if (unplaced.length > 0) {
			if (resolved.length > 0) {
				resolved[0] = { ...resolved[0], tools: [...resolved[0].tools, ...unplaced] };
			} else {
				resolved.push({ id: 'tools', label: 'Tools', tools: unplaced, defaultTool: undefined });
			}
		}

		return resolved.filter((menu) => menu.tools.length > 0);
	}

	private createInitialToolOptions(current: Readonly<Record<string, ToolOptions>>) {
		const toolOptions: Record<string, ToolOptions> = { ...current };
		this.tools.forEach((tool, id) => {
			if (!toolOptions[id]) {
				toolOptions[id] = { ...(tool.defaultOptions ?? {}), ...(this.options.defaults?.[id] ?? {}) };
			}
		});
		return toolOptions;
	}

	// ---------------------------------------------------------------- state & events

	getState = (): EditorState => this.state;

	/** subscribe to state changes (compatible with react's useSyncExternalStore) */
	subscribe = (listener: () => void): (() => void) => {
		this.subscribers.add(listener);
		return () => {
			this.subscribers.delete(listener);
		};
	};

	private setState(partial: Partial<EditorState>) {
		this.state = { ...this.state, ...partial };
		this.subscribers.forEach((listener) => listener());
	}

	/** listen to editor events, returns a function which removes the listener */
	on<K extends keyof EditorEvents>(event: K, listener: Listener<EditorEvents[K]>): () => void {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, new Set());
		}
		this.eventListeners.get(event)!.add(listener);
		return () => {
			this.eventListeners.get(event)?.delete(listener);
		};
	}

	private hasListeners(event: keyof EditorEvents) {
		return (this.eventListeners.get(event)?.size ?? 0) > 0;
	}

	private emit<K extends keyof EditorEvents>(event: K, payload: EditorEvents[K]) {
		try {
			switch (event) {
				case 'ready':
					this.options.onReady?.(this);
					break;
				case 'change':
					this.options.onChange?.((payload as EditorEvents['change']).json);
					break;
				case 'toolChange':
					this.options.onToolChange?.((payload as EditorEvents['toolChange']).tool);
					break;
				case 'selectionChange':
					this.options.onSelectionChange?.((payload as EditorEvents['selectionChange']).objects);
					break;
				case 'error':
					this.options.onError?.((payload as EditorEvents['error']).error);
					break;
			}
		} catch (error) {
			console.error(error);
		}
		this.eventListeners.get(event)?.forEach((listener) => {
			try {
				listener(payload);
			} catch (error) {
				console.error(error);
			}
		});
	}

	private reportError(error: unknown) {
		if (!this.options.onError && !this.hasListeners('error')) {
			console.error(error);
		}
		this.emit('error', { error });
	}

	// ---------------------------------------------------------------- lifecycle

	/** creates the fabric canvas on the given element and loads the image, returns a function that disposes it */
	attach(element: HTMLCanvasElement): () => void {
		FabricObject.customProperties = CUSTOM_OBJECT_PROPERTIES;
		const canvas = new Canvas(element);
		this.canvas = canvas;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		lastInteractedEditor ??= this;

		canvas.on('object:added', this.handleObjectAdded);
		canvas.on('object:modified', this.handleObjectModified);
		canvas.on('object:removed', this.handleObjectRemoved);
		canvas.on('selection:created', this.handleSelectionChange);
		canvas.on('selection:updated', this.handleSelectionChange);
		canvas.on('selection:cleared', this.handleSelectionChange);
		canvas.on('mouse:down', this.handleCanvasMouseDown);
		window.addEventListener('keyup', this.handleKeyUp);

		this.applyViewport();
		void this.load();

		return () => this.detach(canvas);
	}

	private detach(canvas: Canvas) {
		if (this.canvas !== canvas) {
			return;
		}
		this.loadToken++;
		this.deactivateTool('dispose');
		this.stopPanHandlers();
		window.removeEventListener('keyup', this.handleKeyUp);
		if (lastInteractedEditor === this) {
			lastInteractedEditor = null;
		}
		canvas.off();
		this.canvas = null;
		void canvas.dispose();
		this.setState({ ready: false, loading: false, activeTool: null, panning: false, selection: [] });
	}

	/** loads another image (and optionally a state), the history starts again */
	async setSource(src: ImageEditorOptions['src'], initialState?: ImageEditorOptions['initialState']) {
		this.options = { ...this.options, src, initialState: initialState ?? null };
		await this.load();
	}

	private async load() {
		const canvas = this.canvas;
		if (!canvas) {
			return;
		}

		const token = ++this.loadToken;
		this.deactivateTool('dispose');
		this.stopPanHandlers();
		this.pausedTool = null;
		this.setState({ ready: false, loading: true, zoom: MIN_ZOOM, panning: false });

		this.historySuspended++;
		try {
			canvas.discardActiveObject();
			canvas.clear();
			canvas.clipPath = undefined;
			this.sceneSize = { ...SCENE_REFERENCE_SIZE };

			const { src, initialState } = this.options;
			if (src) {
				try {
					const url = typeof src === 'string' ? src : await blobToDataUrl(src);
					const crossOrigin = this.options.crossOrigin === undefined ? 'anonymous' : this.options.crossOrigin;
					const image = await FabricImage.fromURL(url, { crossOrigin });
					if (token !== this.loadToken) {
						return;
					}
					const scale = Math.min(
						SCENE_REFERENCE_SIZE.width / image.width,
						SCENE_REFERENCE_SIZE.height / image.height,
					);
					image.scaleX = scale;
					image.scaleY = scale;
					canvas.backgroundImage = image;
					this.sceneSize = { width: image.width * scale, height: image.height * scale };
				} catch (error) {
					if (token !== this.loadToken) {
						return;
					}
					this.reportError(error);
				}
			}

			if (initialState) {
				const json = typeof initialState === 'string' ? JSON.parse(initialState) : initialState;
				// deep copy so that the consumer's object is never mutated
				if (Object.keys(json).length > 0 && !(await this.restoreState(JSON.parse(JSON.stringify(json)), token))) {
					return;
				}
			}
		} catch (error) {
			this.reportError(error);
		} finally {
			this.historySuspended--;
		}

		if (token !== this.loadToken || this.canvas !== canvas) {
			return;
		}

		this.applyViewport();
		const history: HistoryState = { entries: [this.serialize()], index: 0 };
		const activeMenu = this.menus.some((menu) => menu.id === this.state.activeMenu)
			? this.state.activeMenu
			: (this.menus[0]?.id ?? null);
		this.setState({ ready: true, loading: false, history, activeMenu, selection: [] });
		this.emit('historyChange', { history });

		const defaultTool = this.getMenu(activeMenu)?.defaultTool;
		if (defaultTool) {
			this.setActiveTool(defaultTool);
		}
		this.emit('ready', { editor: this });
	}

	// ---------------------------------------------------------------- serialization & history

	/** the canvas as JSON (can be passed to `initialState` / `loadState` later) */
	toJSON(): Record<string, any> {
		const json: any = this.canvas?.toJSON() ?? {};
		if (json.objects) {
			json.objects = json.objects.filter((obj: any) => !this.isTransientType(obj.shapeType));
		}
		return json;
	}

	// the background image source (often a large data url) is the same for every state,
	// so it is not stored again in each history entry
	private serialize(): string {
		const json = this.toJSON();
		if (json.backgroundImage) {
			json.backgroundImage = { ...json.backgroundImage, src: undefined };
		}
		return JSON.stringify(json);
	}

	/** records the current canvas as a new history entry (identical states are ignored) */
	commit = (): void => {
		if (!this.canvas || this.historySuspended > 0 || !this.state.ready) {
			return;
		}

		const entry = this.serialize();
		const { entries, index } = this.state.history;
		if (entries[index] === entry) {
			return;
		}

		let nextEntries = [...entries.slice(0, index + 1), entry];
		const limit = Math.max(1, this.options.historyLimit ?? DEFAULT_HISTORY_LIMIT);
		if (nextEntries.length > limit + 1) {
			nextEntries = nextEntries.slice(nextEntries.length - (limit + 1));
		}

		const history: HistoryState = { entries: nextEntries, index: nextEntries.length - 1 };
		this.setState({ history });
		this.emit('historyChange', { history });
		this.emitChange();
	};

	private emitChange() {
		if (this.options.onChange || this.hasListeners('change')) {
			this.emit('change', { json: this.toJSON() });
		}
	}

	/** runs `callback` without recording history entries for the changes it makes */
	withoutHistory<T>(callback: () => T): T {
		this.historySuspended++;
		try {
			return callback();
		} finally {
			this.historySuspended--;
		}
	}

	canUndo() {
		return !this.state.restoring && this.state.history.index > 0;
	}

	canRedo() {
		return !this.state.restoring && this.state.history.index < this.state.history.entries.length - 1;
	}

	undo() {
		return this.goToHistory(this.state.history.index - 1);
	}

	redo() {
		return this.goToHistory(this.state.history.index + 1);
	}

	/** restores the history entry with the given index */
	async goToHistory(index: number) {
		const { entries } = this.state.history;
		if (!this.canvas || this.state.restoring || index < 0 || index >= entries.length) {
			return;
		}
		if (index === this.state.history.index) {
			return;
		}

		this.setState({ restoring: true });
		const tool = this.suspendTool('restore');
		try {
			if (await this.restoreState(JSON.parse(entries[index]))) {
				const history: HistoryState = { entries, index };
				this.setState({ history });
				this.emit('historyChange', { history });
				this.emitChange();
			}
		} catch (error) {
			this.reportError(error);
		} finally {
			this.setState({ restoring: false });
			this.resumeTool(tool);
		}
	}

	/** replaces the canvas content with the given JSON and starts a new history */
	async loadState(json: Record<string, any> | string) {
		const canvas = this.canvas;
		if (!canvas) {
			return;
		}
		const data = typeof json === 'string' ? JSON.parse(json) : JSON.parse(JSON.stringify(json));
		await this.withToolSuspended('restore', async () => {
			if (await this.restoreState(data)) {
				const history: HistoryState = { entries: [this.serialize()], index: 0 };
				this.setState({ history });
				this.emit('historyChange', { history });
				this.emitChange();
			}
		});
	}

	private async restoreState(json: any, token = this.loadToken): Promise<boolean> {
		const canvas = this.canvas;
		if (!canvas) {
			return false;
		}
		const isStale = () => this.canvas !== canvas || token !== this.loadToken;

		this.historySuspended++;
		try {
			const existingBackgroundImage = canvas.backgroundImage;
			canvas.clear();

			if (existingBackgroundImage) {
				canvas.backgroundImage = existingBackgroundImage;
			} else if (json.backgroundImage?.src) {
				const image = await FabricImage.fromURL(json.backgroundImage.src, {
					crossOrigin: this.options.crossOrigin === undefined ? 'anonymous' : this.options.crossOrigin,
				});
				if (isStale()) {
					return false;
				}
				image.set({
					flipX: json.backgroundImage.flipX,
					flipY: json.backgroundImage.flipY,
					width: json.backgroundImage.width,
					height: json.backgroundImage.height,
					scaleX: json.backgroundImage.scaleX,
					scaleY: json.backgroundImage.scaleY,
				});
				canvas.backgroundImage = image;
				this.sceneSize = { width: image.width * image.scaleX, height: image.height * image.scaleY };
			}

			canvas.clipPath = json.clipPath
				? new Rect({
						left: json.clipPath.left,
						top: json.clipPath.top,
						width: json.clipPath.width * json.clipPath.scaleX,
						height: json.clipPath.height * json.clipPath.scaleY,
						absolutePositioned: true,
					})
				: undefined;

			// one by one so that asynchronously loaded objects (images) keep their stacking order
			for (const data of json.objects ?? []) {
				await this.restoreObject(data, canvas);
				if (isStale()) {
					return false;
				}
			}

			this.applyViewport();
			return true;
		} finally {
			this.historySuspended--;
		}
	}

	private async restoreObject(data: any, canvas: Canvas) {
		const shape = this.shapes.get(data.shapeType);
		if (shape?.restore) {
			await shape.restore(data, { editor: this, canvas });
			return;
		}
		// objects of custom tools without a restore function: fabric's own deserialization
		const [object] = await util.enlivenObjects<FabricObject>([data]);
		if (object) {
			canvas.add(object);
		}
	}

	// ---------------------------------------------------------------- canvas events

	private handleObjectAdded = (event: { target: FabricObject }) => {
		if (this.historySuspended > 0) {
			return;
		}
		const shape = this.getShape((event.target as any)?.shapeType);
		if (shape && (shape.helper || shape.transient || shape.recordOnAdd === false)) {
			return;
		}
		this.commit();
	};

	private handleObjectModified = (event: { target: FabricObject }) => {
		if (this.historySuspended > 0) {
			return;
		}
		const shape = this.getShape((event.target as any)?.shapeType);
		if (shape && (shape.transient || (shape.helper && !shape.recordModifications))) {
			return;
		}
		this.commit();
	};

	private handleObjectRemoved = (event: { target: FabricObject }) => {
		if (this.historySuspended > 0) {
			return;
		}
		const shape = this.getShape((event.target as any)?.shapeType);
		if (shape && (shape.helper || shape.transient)) {
			return;
		}
		// removing an object which was never recorded (e.g. an empty drawing) results in an identical state
		this.commit();
	};

	private handleSelectionChange = () => {
		const objects = this.canvas?.getActiveObjects() ?? [];
		this.setState({ selection: objects });
		this.emit('selectionChange', { objects });
	};

	private handleCanvasMouseDown = () => {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		lastInteractedEditor = this;
	};

	private handleKeyUp = (event: KeyboardEvent) => {
		if (event.key !== 'Backspace' && event.key !== 'Delete') {
			return;
		}
		if (this.options.keyboardShortcuts === false || lastInteractedEditor !== this || isTypingTarget(event.target)) {
			return;
		}

		const activeObject = this.canvas?.getActiveObject() as any;
		if (
			!activeObject ||
			activeObject.isEditing ||
			activeObject._objects?.[1]?._objects?.[1]?.isEditing ||
			activeObject.shapeType === ShapeType.COMMENT_BOX_TEXTBOX
		) {
			return;
		}
		this.deleteSelection();
	};

	// ---------------------------------------------------------------- tools & menus

	getTool(id: string): ToolDefinition<any> | undefined {
		return this.tools.get(id);
	}

	/** all registered tools (including hidden ones) */
	getTools(): ToolDefinition<any>[] {
		return [...this.tools.values()];
	}

	/** the tool whose objects have the given shapeType */
	getToolForShape(shapeType: string | undefined): ToolDefinition<any> | undefined {
		if (!shapeType) {
			return undefined;
		}
		return this.getTools().find((tool) => tool.shapeTypes?.includes(shapeType));
	}

	/** visible menus with their visible tools */
	getMenus(): MenuDefinition[] {
		return this.menus;
	}

	getMenu(id: string | null | undefined): MenuDefinition | undefined {
		return this.menus.find((menu) => menu.id === id);
	}

	getShape(type: string | undefined): ShapeDefinition | undefined {
		return type ? this.shapes.get(type) : undefined;
	}

	/** registers (or replaces) a shape definition */
	registerShape(shape: ShapeDefinition) {
		this.shapes.set(shape.type, shape);
	}

	setMenu(id: string) {
		if (!this.canvas || !this.state.ready || id === this.state.activeMenu) {
			return;
		}
		const menu = this.getMenu(id);
		if (!menu) {
			return;
		}
		this.setPanning(false, false);
		this.deactivateTool('switch');
		this.setState({ activeMenu: id });
		this.emit('menuChange', { menu: id });
		if (menu.defaultTool) {
			this.setActiveTool(menu.defaultTool);
		}
	}

	/** activates a toggle tool (or runs an action tool), `null` deactivates the current tool */
	setActiveTool(id: string | null) {
		if (!this.canvas || !this.state.ready) {
			return;
		}
		if (this.state.panning) {
			this.setPanning(false, false);
		}
		if (id === this.state.activeTool) {
			return;
		}

		const tool = id ? this.tools.get(id) : undefined;
		if (id && !tool) {
			console.warn(`fabri-pix: unknown tool "${id}"`);
			return;
		}

		const previous = this.deactivateTool('switch', true);
		if (tool?.type === 'action') {
			this.runTool(tool);
		} else if (tool) {
			this.activateTool(tool);
		}
		if (previous !== this.state.activeTool) {
			this.emit('toolChange', { tool: this.state.activeTool });
		}
	}

	/** activates the tool, or deactivates it when it is already active */
	toggleTool(id: string) {
		this.setActiveTool(this.state.activeTool === id ? null : id);
	}

	private activateTool(tool: ToolDefinition<any>) {
		const { context, dispose } = this.createToolContext(tool);
		let cleanup: void | ((reason: ToolDeactivateReason) => void);
		try {
			cleanup = tool.activate?.(context);
		} catch (error) {
			dispose(true);
			this.reportError(error);
			return;
		}

		this.toolSession = {
			id: tool.id,
			cleanup: (reason) => {
				try {
					if (typeof cleanup === 'function') {
						cleanup(reason);
					}
				} catch (error) {
					this.reportError(error);
				} finally {
					dispose(true);
				}
			},
		};
		this.setState({ activeTool: tool.id });
	}

	private runTool(tool: ToolDefinition<any>) {
		const { context, dispose } = this.createToolContext(tool);
		try {
			const result = tool.run?.(context);
			if (result instanceof Promise) {
				result.catch((error) => this.reportError(error)).finally(() => dispose(false));
			} else {
				dispose(false);
			}
		} catch (error) {
			dispose(false);
			this.reportError(error);
		}
	}

	/** returns the id of the tool that was active */
	private deactivateTool(reason: ToolDeactivateReason, silent = false): string | null {
		const session = this.toolSession;
		if (!session) {
			return null;
		}
		this.toolSession = null;
		session.cleanup(reason);
		this.setState({ activeTool: null });
		if (!silent) {
			this.emit('toolChange', { tool: null });
		}
		return session.id;
	}

	// temporary deactivation (undo, reset, export...): no toolChange events, the same tool is resumed afterwards
	private suspendTool(reason: ToolDeactivateReason): string | null {
		return this.deactivateTool(reason, true);
	}

	private resumeTool(id: string | null) {
		const tool = id ? this.tools.get(id) : undefined;
		if (tool && this.canvas && !this.toolSession && !this.state.panning) {
			this.activateTool(tool);
		}
	}

	private async withToolSuspended<T>(reason: ToolDeactivateReason, callback: () => Promise<T> | T): Promise<T> {
		const tool = this.suspendTool(reason);
		try {
			return await callback();
		} finally {
			this.resumeTool(tool);
		}
	}

	private createToolContext<O extends ToolOptions>(tool: ToolDefinition<O>) {
		const canvas = this.canvas!;
		const canvasListeners: [string, (event: any) => void][] = [];
		const domListeners: [EventTarget, string, (event: any) => void][] = [];
		const unsubscribers: (() => void)[] = [];
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const editor = this;

		const context: ToolContext<O> = {
			editor,
			canvas,
			tool,
			get options() {
				return editor.getToolOptions<O>(tool.id);
			},
			setOptions: (options) => this.setToolOptions(tool.id, options),
			on: (eventName, handler) => {
				(canvas as any).on(eventName, handler);
				canvasListeners.push([eventName, handler]);
			},
			listen: (target, type, handler) => {
				target.addEventListener(type, handler);
				domListeners.push([target, type, handler]);
			},
			onOptionsChange: (handler) => {
				unsubscribers.push(this.onToolOptionsChange(tool.id, handler as (options: ToolOptions) => void));
			},
			setCursor: (cursor) => {
				canvas.defaultCursor = cursor;
				canvas.setCursor(cursor);
			},
			setSelectionEnabled: (enabled) => {
				canvas.selection = enabled;
			},
		};

		const dispose = (resetCanvas: boolean) => {
			canvasListeners.forEach(([eventName, handler]) => (canvas as any).off(eventName, handler));
			domListeners.forEach(([target, type, handler]) => target.removeEventListener(type, handler));
			unsubscribers.forEach((unsubscribe) => unsubscribe());
			if (resetCanvas) {
				canvas.isDrawingMode = false;
				canvas.selection = true;
				canvas.defaultCursor = 'default';
				canvas.setCursor('default');
			}
		};

		return { context, dispose };
	}

	getToolOptions<O extends ToolOptions = ToolOptions>(id: string): O {
		return (this.state.toolOptions[id] ?? {}) as O;
	}

	setToolOptions<O extends ToolOptions = ToolOptions>(id: string, options: Partial<O>) {
		const next = { ...this.getToolOptions(id), ...options };
		this.setState({ toolOptions: { ...this.state.toolOptions, [id]: next } });
		this.optionListeners.get(id)?.forEach((listener) => listener(next));
	}

	private onToolOptionsChange(id: string, listener: (options: ToolOptions) => void) {
		if (!this.optionListeners.has(id)) {
			this.optionListeners.set(id, new Set());
		}
		this.optionListeners.get(id)!.add(listener);
		return () => {
			this.optionListeners.get(id)?.delete(listener);
		};
	}

	// ---------------------------------------------------------------- objects

	/** the size of the image in canvas (object) coordinates */
	getSceneSize() {
		return { ...this.sceneSize };
	}

	getSceneCenter() {
		return { x: this.sceneSize.width / 2, y: this.sceneSize.height / 2 };
	}

	/** adds an object using its shape definition, e.g. `addShape('rectangle', { left, top, width, height, ... })` */
	async addShape(type: string, data: Record<string, any>) {
		const canvas = this.canvas;
		const shape = this.getShape(type);
		if (!canvas || !shape?.create) {
			console.warn(`fabri-pix: shape "${type}" can't be created`);
			return;
		}
		await shape.create({ id: generateId(), ...data }, { editor: this, canvas });
		// some shapes are only recorded by their tool once drawing is finished, record programmatic ones right away
		this.commit();
	}

	/** adds an image (URL, data URL or Blob) on top of the photo, scaled to fit into half of it */
	async addImage(src: string | Blob) {
		const url = typeof src === 'string' ? src : await blobToDataUrl(src);
		await this.addShape(ShapeType.CUSTOM_SHAPE, {
			src: url,
			angle: 0,
			fill: 'transparent',
			scaleX: 1,
			scaleY: 1,
		});
	}

	/** sets properties of an object, re-renders and optionally records a history entry */
	updateObject(object: FabricObject, properties: Record<string, any>, { commit = false } = {}) {
		object.set(properties);
		object.setCoords();
		this.notifyObjectChanged({ commit });
	}

	/** call after changing objects directly: re-renders the canvas and the option panels */
	notifyObjectChanged({ commit = false } = {}) {
		this.canvas?.requestRenderAll();
		this.setState({ revision: this.state.revision + 1 });
		if (commit) {
			this.commit();
		}
	}

	/** removes the object together with its helper objects (arrow head, blur...) */
	deleteObject(object: FabricObject) {
		const canvas = this.canvas;
		if (!canvas || !object) {
			return;
		}
		const related = this.getShape((object as any).shapeType)?.getRelatedObjects?.(object, canvas) ?? [];
		canvas.remove(...related.filter((obj) => obj !== object), object);
		canvas.requestRenderAll();
	}

	/** removes the selected objects as a single history entry, returns the removed objects */
	deleteSelection(): FabricObject[] {
		const canvas = this.canvas;
		const activeObject = canvas?.getActiveObject();
		if (!canvas || !activeObject) {
			return [];
		}

		const targets = activeObject instanceof ActiveSelection ? activeObject.getObjects() : [activeObject];
		canvas.discardActiveObject();
		this.withoutHistory(() => targets.forEach((object) => this.deleteObject(object)));
		this.commit();
		return targets;
	}

	/** removes every annotation and the crop (one history entry) */
	reset() {
		const canvas = this.canvas;
		if (!canvas) {
			return;
		}
		const tool = this.suspendTool('restore');
		this.withoutHistory(() => {
			canvas.discardActiveObject();
			canvas.remove(...canvas.getObjects());
			canvas.clipPath = undefined;
		});
		canvas.requestRenderAll();
		this.commit();
		this.resumeTool(tool);
	}

	private isTransientType(type: string | undefined) {
		return !!this.getShape(type)?.transient;
	}

	// ---------------------------------------------------------------- view

	/** size of the area the canvas is shown in, the image is fitted into it */
	setViewportSize(width: number, height: number) {
		if (width === this.viewSize.width && height === this.viewSize.height) {
			return;
		}
		this.viewSize = { width, height };
		this.applyViewport();
	}

	private applyViewport() {
		const canvas = this.canvas;
		if (!canvas) {
			return;
		}
		const { width: sceneWidth, height: sceneHeight } = this.sceneSize;
		const { width: viewWidth, height: viewHeight } = this.viewSize;
		const fit = viewWidth > 0 && viewHeight > 0 ? Math.min(viewWidth / sceneWidth, viewHeight / sceneHeight) : 1;
		this.fitZoom = fit;

		canvas.setDimensions({
			width: Math.max(1, Math.floor(sceneWidth * fit)),
			height: Math.max(1, Math.floor(sceneHeight * fit)),
		});
		canvas.setViewportTransform([fit, 0, 0, fit, 0, 0]);
		if (this.state.zoom > MIN_ZOOM) {
			canvas.zoomToPoint(new Point(canvas.getWidth() / 2, canvas.getHeight() / 2), fit * this.state.zoom);
		}
		canvas.requestRenderAll();
	}

	/** user zoom, 1 = fit (1 - 4) */
	setZoom(zoom: number) {
		const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, roundZoom(zoom)));
		if (next === this.state.zoom) {
			return;
		}
		this.setState({ zoom: next });
		if (next <= MIN_ZOOM) {
			this.setPanning(false);
		}
		this.applyViewport();
		this.emit('zoomChange', { zoom: next });
	}

	zoomIn() {
		this.setZoom(this.state.zoom + ZOOM_STEP);
	}

	zoomOut() {
		this.setZoom(this.state.zoom - ZOOM_STEP);
	}

	fitToView() {
		this.setZoom(MIN_ZOOM);
	}

	/** pan mode: dragging the canvas moves the view, the active tool is paused meanwhile */
	setPanning(enabled: boolean, resumeTool = true) {
		const canvas = this.canvas;
		if (!canvas || enabled === this.state.panning) {
			return;
		}

		if (enabled) {
			if (this.state.zoom <= MIN_ZOOM) {
				return;
			}
			this.pausedTool = this.deactivateTool('pause');
			canvas.on('mouse:down', this.handlePanMouseDown);
			canvas.on('mouse:move', this.handlePanMouseMove);
			canvas.on('mouse:up', this.handlePanMouseUp);
			canvas.selection = false;
			canvas.defaultCursor = 'grab';
			this.setState({ panning: true });
			return;
		}

		this.stopPanHandlers();
		canvas.selection = true;
		canvas.defaultCursor = 'default';
		this.setState({ panning: false });
		const pausedTool = this.pausedTool;
		this.pausedTool = null;
		if (resumeTool && pausedTool) {
			this.setActiveTool(pausedTool);
		}
	}

	togglePanning() {
		this.setPanning(!this.state.panning);
	}

	private stopPanHandlers() {
		this.panState.dragging = false;
		this.canvas?.off('mouse:down', this.handlePanMouseDown);
		this.canvas?.off('mouse:move', this.handlePanMouseMove);
		this.canvas?.off('mouse:up', this.handlePanMouseUp);
	}

	private handlePanMouseDown = (event: any) => {
		if (this.canvas?.findTarget(event.e)) {
			return;
		}
		this.panState = { dragging: true, x: event.e.clientX, y: event.e.clientY };
	};

	private handlePanMouseMove = (event: any) => {
		if (!this.panState.dragging || !this.canvas) {
			return;
		}
		this.canvas.relativePan(new Point(event.e.clientX - this.panState.x, event.e.clientY - this.panState.y));
		this.panState.x = event.e.clientX;
		this.panState.y = event.e.clientY;
		this.canvas.requestRenderAll();
	};

	private handlePanMouseUp = () => {
		this.panState.dragging = false;
	};

	// ---------------------------------------------------------------- export

	/** exports the edited image (at the original image resolution by default) */
	exportImage(options: ExportOptions = {}): Promise<Blob> {
		// lets tools finish pending work first (e.g. the crop tool applies the crop rectangle)
		return this.withToolSuspended('switch', () => this.renderImage(options));
	}

	private async renderImage(options: ExportOptions = {}): Promise<Blob> {
		const canvas = this.canvas;
		if (!canvas) {
			throw new Error('fabri-pix: the editor is not mounted');
		}

		const {
			format = 'png',
			quality = 1,
			multiplier: customMultiplier,
			maxPixels = DEFAULT_MAX_EXPORT_PIXELS,
		} = { ...this.options.exportOptions, ...options };
		const clipPath = canvas.clipPath;
		const area = clipPath
			? {
					left: clipPath.left,
					top: clipPath.top,
					width: clipPath.width * clipPath.scaleX,
					height: clipPath.height * clipPath.scaleY,
				}
			: { left: 0, top: 0, ...this.sceneSize };

		const backgroundScale = canvas.backgroundImage?.scaleX;
		let multiplier =
			customMultiplier ?? (backgroundScale ? 1 / backgroundScale : Math.max(1, window.devicePixelRatio || 1));
		const exportPixels = area.width * area.height * multiplier * multiplier;
		if (exportPixels > maxPixels) {
			multiplier *= Math.sqrt(maxPixels / exportPixels);
		}

		canvas.discardActiveObject();
		const viewportTransform = [...canvas.viewportTransform] as TMat2D;
		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		let blobPromise: Promise<Blob | null>;
		try {
			// toBlob paints synchronously, only the encoding is async, so the view is restored right away
			blobPromise = canvas.toBlob({
				format,
				quality,
				multiplier,
				...area,
				filter: (object: any) => !this.isTransientType(object.shapeType),
			});
		} finally {
			canvas.setViewportTransform(viewportTransform);
		}

		const blob = await blobPromise;
		if (!blob) {
			throw new Error('fabri-pix: unable to export the image');
		}
		return blob;
	}

	/** exports the image and the JSON, calls `onSave` or downloads the image */
	async save(): Promise<SaveResult | null> {
		try {
			// the JSON is taken while the tool is suspended, so that it contains the applied crop
			const result: SaveResult = await this.withToolSuspended('switch', async () => ({
				blob: await this.renderImage(),
				json: this.toJSON(),
			}));
			if (this.options.onSave) {
				this.options.onSave(result);
			} else {
				const extension = result.blob.type.split('/')[1] ?? 'png';
				downloadBlob(result.blob, `edited-image-${Date.now()}.${extension}`);
			}
			this.emit('save', result);
			return result;
		} catch (error) {
			// e.g. an image from a server without CORS headers taints the canvas
			this.reportError(error);
			return null;
		}
	}

	/** current fit zoom (canvas pixels per scene unit at zoom 1) */
	getFitZoom() {
		return this.fitZoom;
	}
}
