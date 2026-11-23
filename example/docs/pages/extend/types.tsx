import { Callout, CodeBlock, DocLink, H2, H3, PageHeader, Table } from '../../ui';

export default function TypesPage() {
	return (
		<>
			<PageHeader
				eyebrow='API reference'
				title='Types'
				lead='FabriPix is written in TypeScript and exports every public type. Import them with `import type`; they add nothing to your bundle.'
			/>
			<CodeBlock
				code={`import type { EditorState, ImageEditorProps, SaveResult, ToolDefinition } from 'fabri-pix';`}
			/>

			<H2 id='overview'>Overview</H2>
			<Table
				head={['Group', 'Types']}
				rows={[
					[
						<a key='a' href='#component-props'>
							Component props
						</a>,
						'ImageEditorProps, ImageEditorProviderProps, ImageEditorOptions, EditorUIOptions, EditorRootProps',
					],
					[
						<a key='a' href='#state-and-events'>
							State &amp; events
						</a>,
						'EditorState, HistoryState, EditorEvents, SaveResult, ExportOptions',
					],
					[
						<a key='a' href='#tools-and-menus'>
							Tools &amp; menus
						</a>,
						'ToolDefinition, ToolContext, ToolOptions, ToolDeactivateReason, ToolPanelProps, ToolButtonProps, MenuDefinition, MenuItem, ToolGroup',
					],
					[
						<a key='a' href='#shapes-filters-styles'>
							Shapes, filters &amp; styles
						</a>,
						'ShapeDefinition, ShapeContext, FilterDefinition, FilterControl, ObjectStyle, FlipDirection, LayerDirection, EditorShortcut',
					],
					[
						<a key='a' href='#ui'>
							UI
						</a>,
						'EditorLabels, EditorIcons, EditorTheme, EditorLayout, EditorPosition, EditorAction, ObjectControl, EditorSlot, EditorComponents, EditorUIContextValue',
					],
					[
						<a key='a' href='#primitive-props'>
							Primitive props
						</a>,
						'ButtonProps, ColorPickerProps, NumberInputProps, SliderProps, SelectProps, SegmentedOption, DropdownProps',
					],
					[
						<a key='a' href='#tool-option-types'>
							Tool options
						</a>,
						'TextOptions, DrawOptions, StrokeOptions, StepsOptions, ShapeOptions, RectangleOptions…',
					],
					[<span key='a'>Other</span>, 'EditorRegistry'],
				]}
			/>

			<H2 id='component-props'>Component props</H2>
			<p>
				<code>ImageEditorProps</code> is everything <code>&lt;ImageEditor&gt;</code> accepts. It is built from
				the editor options (behaviour) and the UI options (looks). Every prop is described on the{' '}
				<DocLink to='api/image-editor'>props page</DocLink>.
			</p>
			<CodeBlock
				lang='ts'
				code={`interface ImageEditorProps extends ImageEditorProviderProps {
  className?: string;
  style?: CSSProperties;
  width?: number | string; // default 100% of the parent
  height?: number | string; // default 100% of the parent
}

interface ImageEditorProviderProps extends ImageEditorOptions, EditorUIOptions {
  children?: ReactNode;
}

/** behaviour: what new ImageEditorController(options) accepts */
interface ImageEditorOptions {
  src?: string | Blob | null;
  crossOrigin?: 'anonymous' | 'use-credentials' | null;
  initialState?: Record<string, any> | string | null;
  tools?: (string | ToolDefinition<any>)[];
  menus?: MenuDefinition[];
  defaults?: Record<string, ToolOptions>;
  shapes?: ShapeDefinition[];
  filters?: FilterDefinition<any>[];
  exportOptions?: ExportOptions;
  historyLimit?: number;
  keyboardShortcuts?: boolean | Partial<Record<EditorShortcut, string[] | null>>;
  /** pinch zoom, two-finger pan, ⌘/Ctrl + wheel zoom, wheel pan (default true) */
  gestures?: boolean;
  onReady?: (editor: ImageEditorController) => void;
  onSave?: (result: SaveResult) => void;
  onChange?: (json: Record<string, any>) => void;
  onToolChange?: (tool: string | null) => void;
  onSelectionChange?: (objects: readonly FabricObject[]) => void;
  onError?: (error: unknown) => void;
}

/** looks */
interface EditorUIOptions {
  classNames?: Partial<Record<EditorSlot, string>>;
  styles?: Partial<Record<EditorSlot, CSSProperties>>;
  icons?: Partial<EditorIcons> & { tools?: Record<string, ReactNode>; menus?: Record<string, ReactNode> };
  labels?: Partial<EditorLabels> & {
    tools?: Record<string, string>;
    menus?: Record<string, string>;
    filters?: Record<string, string>;
  };
  components?: Partial<EditorComponents>;
  theme?: EditorTheme;
  unstyled?: boolean;
  layout?: EditorLayout;
  actions?: EditorAction[];
  objectControls?: ObjectControl[];
  onCancel?: () => void;
  onExportJson?: (json: Record<string, any>) => void;
}

/** props of <EditorRoot> */
interface EditorRootProps {
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  children?: ReactNode;
}`}
			/>

			<H2 id='state-and-events'>State &amp; events</H2>
			<H3 id='editor-state'>EditorState</H3>
			<p>
				Returned by <code>editor.getState()</code> and{' '}
				<DocLink to='api/hooks#useeditorstate'>useEditorState()</DocLink>, where each field is explained.
			</p>
			<CodeBlock
				lang='ts'
				code={`interface EditorState {
  ready: boolean;
  loading: boolean;
  activeMenu: string | null;
  activeTool: string | null;
  zoom: number; // 1 = image fits the view, up to 4
  panning: boolean;
  history: HistoryState;
  restoring: boolean;
  selection: readonly FabricObject[];
  revision: number;
  toolOptions: Readonly<Record<string, ToolOptions>>;
}

interface HistoryState {
  entries: readonly string[]; // serialized canvas states
  index: number;
}`}
			/>
			<H3 id='editor-events'>EditorEvents</H3>
			<p>
				The payloads of <code>editor.on(event, listener)</code>, see <DocLink to='api/events'>Events</DocLink>.
			</p>
			<CodeBlock
				lang='ts'
				code={`interface EditorEvents {
  ready: { editor: ImageEditorController };
  change: { json: Record<string, any> };
  historyChange: { history: HistoryState };
  toolChange: { tool: string | null };
  menuChange: { menu: string | null };
  selectionChange: { objects: readonly FabricObject[] };
  zoomChange: { zoom: number };
  save: SaveResult;
  error: { error: unknown };
}`}
			/>
			<H3 id='export-types'>SaveResult and ExportOptions</H3>
			<CodeBlock
				lang='ts'
				code={`interface SaveResult {
  blob: Blob; // the exported image
  json: Record<string, any>; // the editing state, for initialState
}

interface ExportOptions {
  format?: 'png' | 'jpeg' | 'webp'; // default 'png'
  quality?: number; // 0 - 1 for jpeg / webp, default 1
  multiplier?: number; // scale, default: the original image resolution
  maxPixels?: number; // default 16 000 000
}`}
			/>

			<H2 id='tools-and-menus'>Tools &amp; menus</H2>
			<p>
				Explained step by step in <DocLink to='custom-tools'>Custom tools</DocLink> and{' '}
				<DocLink to='tools-and-menus'>Tools &amp; menus</DocLink>.
			</p>
			<CodeBlock
				lang='ts'
				code={`type ToolOptions = Record<string, any>;

type ToolDeactivateReason = 'switch' | 'pause' | 'restore' | 'dispose';

interface ToolDefinition<O extends ToolOptions = ToolOptions> {
  id: string;
  label: string;
  icon?: ReactNode;
  type?: 'toggle' | 'action';
  defaultOptions?: O;
  shapeTypes?: string[];
  activate?: (context: ToolContext<O>) => void | ((reason: ToolDeactivateReason) => void);
  run?: (context: ToolContext<O>) => void | Promise<void>;
  OptionsPanel?: ComponentType<ToolPanelProps<O>>;
  ToolbarButton?: ComponentType<ToolButtonProps>;
}

interface ToolContext<O extends ToolOptions = ToolOptions> {
  editor: ImageEditorController;
  canvas: Canvas;
  tool: ToolDefinition<O>;
  readonly options: O;
  setOptions(options: Partial<O>): void;
  on(eventName: string, handler: (event: any) => void): void;
  listen(target: EventTarget, type: string, handler: (event: any) => void): void;
  onOptionsChange(handler: (options: O) => void): void;
  setCursor(cursor: string): void;
  setSelectionEnabled(enabled: boolean): void;
  setInteractive(interactive: boolean): void;
}

interface ToolPanelProps<O extends ToolOptions = ToolOptions> {
  editor: ImageEditorController;
  tool: ToolDefinition<O>;
  target: FabricObject | null; // null: the panel edits the tool defaults
  options: O;
  setOptions: (options: Partial<O>) => void;
}

interface ToolButtonProps {
  tool: ToolDefinition;
  active: boolean;
  onClick: () => void;
}

interface MenuDefinition {
  id: string;
  label: string;
  icon?: ReactNode;
  tools: MenuItem[];
  defaultTool?: string; // activated when the menu opens
}

type MenuItem = string | ToolGroup;

interface ToolGroup {
  id: string;
  label: string;
  icon?: ReactNode;
  tools: string[];
}`}
			/>

			<H2 id='shapes-filters-styles'>Shapes, filters &amp; styles</H2>
			<CodeBlock
				lang='ts'
				code={`interface ShapeDefinition {
  type: string;
  label?: string;
  create?: (data: any, context: ShapeContext) => void | Promise<void>;
  restore?: (data: any, context: ShapeContext) => void | Promise<void>;
  getRelatedObjects?: (object: FabricObject, canvas: Canvas) => FabricObject[];
  helper?: boolean;
  recordModifications?: boolean;
  transient?: boolean;
  recordOnAdd?: boolean;
}

interface ShapeContext {
  editor: ImageEditorController;
  canvas: Canvas;
}

interface FilterDefinition<O extends Record<string, any> = Record<string, any>> {
  id: string;
  label: string;
  group?: 'filter' | 'adjust'; // default 'filter'
  neutral?: O; // adjust: options at which it has no effect
  defaultOptions?: O;
  controls?: FilterControl[];
  create: (options: O) => any; // returns a fabric.js filter
}

interface FilterControl {
  key: string;
  type?: 'range' | 'color' | 'select'; // default 'range'
  min?: number;
  max?: number;
  step?: number;
  options?: string[]; // for 'select'
}

interface ObjectStyle {
  opacity?: number;
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number } | null;
  dashed?: boolean;
  cornerRadius?: number; // rectangles only
}

type FlipDirection = 'horizontal' | 'vertical';

type LayerDirection = 'forward' | 'backward' | 'front' | 'back';

type EditorShortcut =
  | 'undo' | 'redo' | 'delete' | 'copy' | 'cut' | 'paste' | 'duplicate'
  | 'selectAll' | 'deselect'
  | 'nudgeLeft' | 'nudgeRight' | 'nudgeUp' | 'nudgeDown'
  | 'bringForward' | 'sendBackward' | 'bringToFront' | 'sendToBack';`}
			/>
			<p>
				More: <DocLink to='custom-shapes'>Custom shapes</DocLink>, <DocLink to='filters'>Filters</DocLink>,{' '}
				<DocLink to='api/selection'>object styles and layers</DocLink>,{' '}
				<DocLink to='keyboard-shortcuts'>Keyboard shortcuts</DocLink>.
			</p>

			<H2 id='ui'>UI</H2>
			<CodeBlock
				lang='ts'
				code={`interface EditorTheme {
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

type EditorPosition = 'top' | 'bottom' | 'none';

interface EditorLayout {
  menu?: 'left' | 'right' | 'top' | 'bottom' | 'none'; // default 'left'
  header?: EditorPosition; // default 'top'
  toolbar?: EditorPosition; // default 'bottom'
  contextPanel?: EditorPosition; // default 'bottom'
  actions?: EditorPosition; // default 'bottom'
}

type EditorAction = 'load' | 'deleteAll' | 'reset' | 'cancel' | 'exportJson' | 'save';

type ObjectControl = 'opacity' | 'shadow' | 'dashed' | 'cornerRadius' | 'layers' | 'duplicate' | 'delete';

type EditorSlot =
  | 'root' | 'header' | 'body' | 'menu' | 'menuItem' | 'stage' | 'toolbar' | 'toolButton'
  | 'contextPanel' | 'actions' | 'button' | 'dropdown' | 'dropdownContent' | 'historyPanel'
  | 'historyItem' | 'divider' | 'field' | 'colorPicker' | 'numberInput' | 'textInput'
  | 'segmented' | 'slider' | 'select' | 'filterList' | 'iconGrid' | 'objectControls';

interface EditorComponents {
  Button: ComponentType<ButtonProps>;
  ColorPicker: ComponentType<ColorPickerProps>;
  NumberInput: ComponentType<NumberInputProps>;
  Slider: ComponentType<SliderProps>;
  Select: ComponentType<SelectProps>;
  // layout parts: a component replaces them, null hides them
  Header: ComponentType | null;
  MenuBar: ComponentType | null;
  Toolbar: ComponentType | null;
  ContextPanel: ComponentType | null;
  Actions: ComponentType | null;
}`}
			/>
			<p>
				<code>EditorLabels</code> and <code>EditorIcons</code> list every text and icon of the UI; their keys
				are in <DocLink to='labels'>Labels &amp; translations</DocLink> and <DocLink to='icons'>Icons</DocLink>.{' '}
				<code>EditorUIContextValue</code> is described with{' '}
				<DocLink to='api/hooks#useeditorui'>useEditorUI</DocLink>.
			</p>

			<H2 id='primitive-props'>Primitive props</H2>
			<p>
				Implement these to <DocLink to='custom-components'>replace the primitives</DocLink> with your own
				components.
			</p>
			<CodeBlock
				lang='ts'
				code={`interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
  slot?: EditorSlot;
}

interface ColorPickerProps {
  value: string | undefined;
  onChange: (color: string) => void;
  onChangeComplete?: (color: string) => void;
  'aria-label'?: string;
}

interface NumberInputProps {
  value: number | string | undefined;
  onChange: (value: number) => void;
  onChangeComplete?: (value: number) => void;
  min?: number;
  max?: number;
  'aria-label'?: string;
}

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeComplete?: (value: number) => void;
  'aria-label'?: string;
}

interface SelectProps {
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  'aria-label'?: string;
}

interface SegmentedOption {
  value: string;
  label: ReactNode;
  title?: string;
}

interface DropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom';
}`}
			/>

			<H2 id='tool-option-types'>Tool option types</H2>
			<p>
				The options of the built-in tools, for typing <code>defaults</code>, <code>useToolOptions</code> and{' '}
				<code>editor.getToolOptions</code>. Their default values are listed in{' '}
				<DocLink to='tool-options'>Tool defaults</DocLink>.
			</p>
			<CodeBlock
				code={`import type { DrawOptions, TextOptions } from 'fabri-pix';

const [pen, setPen] = useToolOptions<DrawOptions>('draw');
const text = editor.getToolOptions<TextOptions>('text');`}
			/>
			<Table
				head={['Type', 'Tool ids', 'Fields']}
				rows={[
					[
						<code key='t'>TextOptions</code>,
						'text',
						'fill, backgroundColor, fontSize, fontStyle, fontWeight, fontFamily, textAlign, underline, linethrough, text, fonts',
					],
					[<code key='t'>DrawOptions</code>, 'draw', 'color, width'],
					[<code key='t'>EmojiOptions</code>, 'emoji', 'emoji'],
					[<code key='t'>StrokeOptions</code>, 'arrow, line, path', 'stroke, width'],
					[
						<code key='t'>StepsOptions</code>,
						'steps',
						'borderColor, backgroundColor, fontColor, fontSize, strokeWidth, stepNumber',
					],
					[<code key='t'>ShapeOptions</code>, 'star', 'fill, stroke, strokeWidth'],
					[<code key='t'>RectangleOptions</code>, 'rectangle', 'ShapeOptions + width, height'],
					[<code key='t'>CircleOptions</code>, 'circle', 'ShapeOptions + radius'],
					[<code key='t'>TriangleOptions</code>, 'triangle', 'ShapeOptions + width, height'],
					[<code key='t'>ArrowShapeOptions</code>, 'arrowShape', 'color'],
					[
						<code key='t'>CommentOptions</code>,
						'comment',
						'fill, stroke, strokeWidth, textColor, fontSize, fontStyle, fontWeight, text',
					],
					[<code key='t'>IconOptions</code>, 'icon', 'icon, color, size, library (IconShape[])'],
					[<code key='t'>IconShape</code>, '—', 'id, label, path, fillRule?'],
					[<code key='t'>ImageToolOptions</code>, 'image', 'accept'],
					[<code key='t'>CropOptions</code>, 'crop', 'ratio (number | null), ratios (CropRatio[])'],
					[<code key='t'>CropRatio</code>, '—', 'label, value (number | null)'],
					[<code key='t'>ResizeOptions</code>, 'resize', 'keepAspect, presets'],
				]}
			/>

			<H2 id='editor-registry'>EditorRegistry</H2>
			<p>
				The second argument of <code>new ImageEditorController(options, registry)</code>: the built-in tools and
				menus. The React components pass <code>builtInTools</code> and <code>defaultMenus</code>; you only need
				it when you create a controller yourself.
			</p>
			<CodeBlock
				lang='ts'
				code={`interface EditorRegistry {
  tools: ToolDefinition<any>[];
  menus: MenuDefinition[];
}`}
			/>
			<Callout title='Fabric.js types'>
				<p>
					<code>Canvas</code> and <code>FabricObject</code> in these signatures are the classes of the{' '}
					<code>fabric</code> package (version 6), import them from there.
				</p>
			</Callout>
		</>
	);
}
