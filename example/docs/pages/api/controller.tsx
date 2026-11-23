import { Circle } from 'fabric';

import { ApiMethod, ApiPlayground, Callout, CodeBlock, DocLink, H2, PageHeader, PropTable } from '../../ui';

const stateRows = [
	{
		name: 'ready',
		type: 'boolean',
		description: 'The image (and initial state) is loaded and the editor can be used.',
	},
	{ name: 'loading', type: 'boolean', description: 'An image is being loaded.' },
	{ name: 'activeMenu', type: 'string | null', description: 'Id of the open menu tab.' },
	{
		name: 'activeTool',
		type: 'string | null',
		description: 'Id of the active toggle tool, `null` when none is active.',
	},
	{ name: 'zoom', type: 'number', description: 'User zoom, 1 = the image fits the view (1 – 4).' },
	{ name: 'panning', type: 'boolean', description: 'Pan mode is on.' },
	{
		name: 'history',
		type: '{ entries: readonly string[]; index: number }',
		description: 'Serialized states and the index of the current one. `index` 0 is the loaded state.',
	},
	{ name: 'restoring', type: 'boolean', description: 'An undo / redo / history jump is in progress.' },
	{ name: 'selection', type: 'readonly FabricObject[]', description: 'The selected objects.' },
	{
		name: 'revision',
		type: 'number',
		description:
			'Increases whenever selected objects are changed through the editor, used to re-render option panels.',
	},
	{
		name: 'toolOptions',
		type: 'Record<toolId, options>',
		description: 'Current options of every tool (defaults + `defaults` prop + changes).',
	},
].map((row) => ({ ...row, description: <span>{row.description}</span> }));

export function ControllerPage() {
	return (
		<ApiPlayground>
			<PageHeader
				eyebrow='API reference'
				title='Editor controller'
				lead='ImageEditorController is the object behind the editor. Every button of the UI calls one of its methods, and you can call them too.'
			/>

			<H2 id='getting-the-controller'>Getting the controller</H2>
			<p>There are three ways, use whichever fits where your code lives:</p>
			<CodeBlock
				code={`// 1. a ref, from the component that renders the editor
const editor = useRef<ImageEditorController>(null);
<ImageEditor ref={editor} src={url} />
editor.current?.undo();

// 2. the hook, from any component inside <ImageEditor> / <ImageEditorProvider>
function UndoButton() {
  const editor = useImageEditor();
  return <button onClick={() => editor.undo()}>Undo</button>;
}

// 3. the onReady callback, once the image is loaded
<ImageEditor src={url} onReady={(editor) => editor.setActiveTool('text')} />`}
			/>
			<Callout type='warning' title='Wait until the editor is ready'>
				<p>
					Most methods do nothing until the image is loaded and <code>editor.getState().ready</code> is{' '}
					<code>true</code> (and <code>editor.canvas</code> is <code>null</code> before the canvas is
					mounted). Use <code>onReady</code>, the <code>ready</code> event or{' '}
					<code>useEditorState().ready</code>.
				</p>
			</Callout>
			<p>
				The methods are documented by topic: <DocLink to='api/history'>history &amp; state</DocLink>,{' '}
				<DocLink to='api/objects'>objects</DocLink>,{' '}
				<DocLink to='api/selection'>selection, layers &amp; styles</DocLink>,{' '}
				<DocLink to='api/image'>rotate, filters &amp; size</DocLink>,{' '}
				<DocLink to='api/view-and-export'>zoom &amp; export</DocLink> and{' '}
				<DocLink to='api/events'>events</DocLink>. This page covers the controller itself, its state, tools and
				menus.
			</p>

			<H2 id='canvas-and-options'>Canvas &amp; options</H2>

			<ApiMethod
				name='canvas'
				signature='editor.canvas: Canvas | null'
				example={`const canvas = editor.canvas;
// anything Fabric.js can do
return canvas.getObjects().map((object) => object.shapeType);`}
				run={(editor) => editor.canvas!.getObjects().map((object) => (object as any).shapeType)}
			>
				<p>
					The <a href='https://fabricjs.com/'>Fabric.js</a> <code>Canvas</code>, <code>null</code> until the
					editor canvas is mounted. Use it for anything the controller does not cover. The photo is{' '}
					<code>canvas.backgroundImage</code>, annotations are the canvas objects; every object created by the
					editor has a <code>shapeType</code> and an <code>id</code>.
				</p>
				<p>
					Objects you add or change with Fabric directly are recorded in the history when Fabric fires{' '}
					<code>object:added</code>, <code>object:modified</code> or <code>object:removed</code>. After{' '}
					<code>object.set(…)</code> call{' '}
					<DocLink to='api/objects#notifyobjectchanged'>notifyObjectChanged</DocLink> or use{' '}
					<DocLink to='api/objects#updateobject'>updateObject</DocLink>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getOptions'
				signature='editor.getOptions(): ImageEditorOptions'
				returns='ImageEditorOptions'
				example={`const options = editor.getOptions();
return Object.keys(options);`}
				run={(editor) => Object.keys(editor.getOptions())}
			>
				<p>
					The current editor options: the non-UI props of <code>{'<ImageEditor>'}</code> (<code>src</code>,{' '}
					<code>tools</code>, <code>defaults</code>, callbacks…).
				</p>
			</ApiMethod>

			<ApiMethod
				name='setOptions'
				signature='editor.setOptions(options: ImageEditorOptions): void'
				params={[
					{
						name: 'options',
						type: 'ImageEditorOptions',
						description: 'The complete options. They replace the current ones, they are not merged.',
					},
				]}
				example={`// only when you create the controller yourself (no <ImageEditor>)
const editor = new ImageEditorController({ src: url, historyLimit: 20 });
editor.setOptions({ ...editor.getOptions(), historyLimit: 100 });`}
			>
				<p>
					Replaces the options. When the content of <code>tools</code>, <code>menus</code>,{' '}
					<code>shapes</code>, <code>filters</code> or <code>defaults</code> changed, the tools are
					reconfigured: a hidden active tool is deactivated, new tools get their default options and changed{' '}
					<code>defaults</code> values are applied to the tool options (other options the user changed are
					kept). Arrays and plain objects are compared by content, functions and components by identity.
				</p>
				<Callout type='warning'>
					<p>
						<code>{'<ImageEditor>'}</code> calls <code>setOptions</code> with its props on every render, so
						values you set this way are overwritten. With the component, change the props instead.
					</p>
				</Callout>
			</ApiMethod>

			<H2 id='state'>State</H2>
			<p>
				The editor keeps a small immutable state object. A new object is created on every change, so it can be
				compared by reference (React's <code>useSyncExternalStore</code> works out of the box; that is what{' '}
				<DocLink to='api/hooks#useeditorstate'>useEditorState</DocLink> does).
			</p>
			<PropTable rows={stateRows} nameLabel='Field' />

			<ApiMethod
				name='getState'
				signature='editor.getState(): EditorState'
				returns='EditorState'
				example={`const { ready, activeMenu, activeTool, zoom, history, selection } = editor.getState();
return { ready, activeMenu, activeTool, zoom, undoSteps: history.index, selected: selection.length };`}
				run={(editor) => {
					const { ready, activeMenu, activeTool, zoom, history, selection } = editor.getState();
					return {
						ready,
						activeMenu,
						activeTool,
						zoom,
						undoSteps: history.index,
						selected: selection.length,
					};
				}}
			>
				<p>The current state. Bound to the editor, so it can be passed around as a function.</p>
			</ApiMethod>

			<ApiMethod
				name='subscribe'
				signature='editor.subscribe(listener: () => void): () => void'
				returns='() => void (unsubscribe)'
				params={[{ name: 'listener', type: '() => void', description: 'Called after every state change.' }]}
				example={`let changes = 0;
const unsubscribe = editor.subscribe(() => changes++);
editor.zoomIn();
editor.fitToView();
unsubscribe();
return changes;`}
				run={(editor) => {
					let changes = 0;
					const unsubscribe = editor.subscribe(() => changes++);
					editor.zoomIn();
					editor.fitToView();
					unsubscribe();
					return changes;
				}}
			>
				<p>
					Listens to state changes (no payload, read <code>getState()</code>). Compatible with{' '}
					<code>useSyncExternalStore(editor.subscribe, editor.getState)</code>. For specific happenings (a
					change, a save…) use <DocLink to='api/events'>events</DocLink> instead.
				</p>
			</ApiMethod>

			<H2 id='tools-and-menus'>Tools &amp; menus</H2>

			<ApiMethod
				name='setMenu'
				signature='editor.setMenu(id: string): void'
				params={[{ name: 'id', type: 'string', description: "Menu id, e.g. 'annotate', 'crop', 'adjust'." }]}
				example={`editor.setMenu('adjust');
return editor.getState().activeMenu;`}
				run={(editor) => {
					editor.setMenu('adjust');
					return editor.getState().activeMenu;
				}}
			>
				<p>
					Opens a menu tab: turns pan mode off, deactivates the current tool, emits <code>menuChange</code>{' '}
					and activates the menu's <code>defaultTool</code> (e.g. Crop starts cropping). Does nothing before
					the editor is ready, for the open menu or for an unknown / hidden menu.
				</p>
			</ApiMethod>

			<ApiMethod
				name='setActiveTool'
				signature='editor.setActiveTool(id: string | null): void'
				params={[
					{
						name: 'id',
						type: 'string | null',
						description: 'Tool id (e.g. "text", "draw", "crop"), `null` deactivates the current tool.',
					},
				]}
				example={`editor.setMenu('annotate');
editor.setActiveTool('draw');
return editor.getState().activeTool;`}
				run={(editor) => {
					editor.setMenu('annotate');
					editor.setActiveTool('draw');
					return editor.getState().activeTool;
				}}
			>
				<p>
					Activates a toggle tool, which then handles canvas input until another tool is chosen. An{' '}
					<code>action</code> tool (Comment, Add Image) runs once instead and no tool stays active. Emits{' '}
					<code>toolChange</code>. Unknown ids log a warning; it does nothing before the editor is ready.
				</p>
				<p>
					It does not switch the menu: call <code>setMenu</code> first if the tool's toolbar button should be
					visible.
				</p>
			</ApiMethod>

			<ApiMethod
				name='toggleTool'
				signature='editor.toggleTool(id: string): void'
				params={[{ name: 'id', type: 'string', description: 'Tool id.' }]}
				example={`editor.toggleTool('arrow'); // on
editor.toggleTool('arrow'); // off again
return editor.getState().activeTool;`}
				run={(editor) => {
					editor.toggleTool('arrow');
					editor.toggleTool('arrow');
					return editor.getState().activeTool;
				}}
			>
				<p>
					Activates the tool, or deactivates it when it is already active. This is what the toolbar buttons
					do.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getTool'
				signature='editor.getTool(id: string): ToolDefinition | undefined'
				returns='ToolDefinition | undefined'
				example={`const tool = editor.getTool('text');
return { id: tool.id, label: tool.label, defaults: tool.defaultOptions };`}
				run={(editor) => {
					const tool = editor.getTool('text')!;
					return { id: tool.id, label: tool.label, defaults: tool.defaultOptions };
				}}
			>
				<p>
					The definition of a registered tool (built-in or from the <code>tools</code> prop), also when it is
					hidden.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getTools'
				signature='editor.getTools(): ToolDefinition[]'
				returns='ToolDefinition[]'
				example={`return editor.getTools().map((tool) => tool.id);`}
				run={(editor) => editor.getTools().map((tool) => tool.id)}
			>
				<p>
					All registered tools, including those hidden by the <code>tools</code> prop. Use{' '}
					<code>getMenus()</code> for the visible ones.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getToolForShape'
				signature='editor.getToolForShape(shapeType: string | undefined): ToolDefinition | undefined'
				returns='ToolDefinition | undefined'
				example={`// which tool's options panel belongs to a selected object?
return editor.getToolForShape('advanced_arrow')?.id;`}
				run={(editor) => editor.getToolForShape('advanced_arrow')?.id}
			>
				<p>
					The tool that lists the <code>shapeType</code> in its <code>shapeTypes</code>. The options panel
					uses it to show the right panel for a selected object.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getMenus'
				signature='editor.getMenus(): MenuDefinition[]'
				returns='MenuDefinition[]'
				example={`return editor.getMenus().map((menu) => ({
  id: menu.id,
  tools: menu.tools.map((item) => (typeof item === 'string' ? item : item.id)),
}));`}
				run={(editor) =>
					editor.getMenus().map((menu) => ({
						id: menu.id,
						tools: menu.tools.map((item) => (typeof item === 'string' ? item : item.id)),
					}))
				}
			>
				<p>
					The visible menus with only their visible tools. Menus without visible tools are left out, and
					custom tools that are in no menu are appended to the first one.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getMenu'
				signature='editor.getMenu(id: string | null | undefined): MenuDefinition | undefined'
				returns='MenuDefinition | undefined'
				example={`return editor.getMenu('crop');`}
				run={(editor) => {
					const menu = editor.getMenu('crop');
					return menu && { id: menu.id, label: menu.label, tools: menu.tools, defaultTool: menu.defaultTool };
				}}
			>
				<p>A visible menu by id.</p>
			</ApiMethod>

			<ApiMethod
				name='getToolOptions'
				signature='editor.getToolOptions<O>(id: string): O'
				returns='O'
				example={`return editor.getToolOptions('text');`}
				run={(editor) => editor.getToolOptions('text')}
			>
				<p>
					The current options of a tool: its defaults, merged with the <code>defaults</code> prop and changes
					made in its options panel. Also in <code>getState().toolOptions</code>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='setToolOptions'
				signature='editor.setToolOptions<O>(id: string, options: Partial<O>): void'
				params={[
					{ name: 'id', type: 'string', description: 'Tool id.' },
					{
						name: 'options',
						type: 'Partial<O>',
						description: 'Options to change, merged with the current ones.',
					},
				]}
				example={`editor.setToolOptions('rectangle', { stroke: '#16a34a', strokeWidth: 8 });
editor.setMenu('annotate');
editor.setActiveTool('rectangle'); // click the image to place one
return editor.getToolOptions('rectangle');`}
				run={(editor) => {
					editor.setToolOptions('rectangle', { stroke: '#16a34a', strokeWidth: 8 });
					editor.setMenu('annotate');
					editor.setActiveTool('rectangle');
					return editor.getToolOptions('rectangle');
				}}
			>
				<p>
					Changes the options used for <strong>new</strong> objects of a tool (existing objects keep their
					look; change them with <DocLink to='api/objects#updateobject'>updateObject</DocLink>). An active
					tool is notified through <code>context.onOptionsChange</code>. Not recorded in the history.
				</p>
			</ApiMethod>

			<H2 id='shapes'>Shapes</H2>

			<ApiMethod
				name='getShape'
				signature='editor.getShape(type: string | undefined): ShapeDefinition | undefined'
				returns='ShapeDefinition | undefined'
				example={`const shape = editor.getShape('blur');
return { label: shape.label, helper: !!shape.helper, transient: !!shape.transient, recordOnAdd: shape.recordOnAdd };`}
				run={(editor) => {
					const shape = editor.getShape('blur')!;
					return {
						label: shape.label,
						helper: !!shape.helper,
						transient: !!shape.transient,
						recordOnAdd: shape.recordOnAdd,
					};
				}}
			>
				<p>
					The definition of a <code>shapeType</code>: how it is created, restored and recorded. See{' '}
					<DocLink to='custom-shapes'>Custom shapes</DocLink>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='registerShape'
				signature='editor.registerShape(shape: ShapeDefinition): void'
				params={[
					{
						name: 'shape',
						type: 'ShapeDefinition',
						description:
							'Definition to add or replace (by type). It stays registered when the editor is reconfigured, and wins over the shapes prop for the same type.',
					},
				]}
				example={`import { Circle } from 'fabric';

editor.registerShape({
  type: 'badge',
  label: 'Badge',
  create: (data, { canvas }) => {
    const badge = new Circle({ left: data.left, top: data.top, radius: 30, fill: '#2563eb' });
    badge.set({ shapeType: 'badge', id: data.id });
    canvas.add(badge);
  },
});
await editor.addShape('badge', { left: 220, top: 160 });
return editor.getShape('badge').label;`}
				run={async (editor) => {
					editor.registerShape({
						type: 'badge',
						label: 'Badge',
						create: (data, { canvas }) => {
							const badge = new Circle({ left: data.left, top: data.top, radius: 30, fill: '#2563eb' });
							badge.set({ shapeType: 'badge', id: data.id });
							canvas.add(badge as any);
						},
					});
					await editor.addShape('badge', { left: 220, top: 160 });
					return editor.getShape('badge')!.label;
				}}
			>
				<p>
					Adds or replaces a shape definition at runtime. Prefer the <code>shapes</code> prop: shapes
					registered this way are dropped when the <code>tools</code>, <code>menus</code>, <code>shapes</code>
					, <code>filters</code> or <code>defaults</code> props change, because the definitions are rebuilt
					from the props then.
				</p>
			</ApiMethod>

			<H2 id='keyboard'>Keyboard</H2>

			<ApiMethod
				name='getShortcut'
				signature='editor.getShortcut(action: EditorShortcut): string[] | null'
				returns='string[] | null'
				params={[
					{
						name: 'action',
						type: 'EditorShortcut',
						description:
							"'undo', 'redo', 'delete', 'copy', 'cut', 'paste', 'duplicate', 'selectAll', 'deselect', 'nudgeLeft', 'nudgeRight', 'nudgeUp', 'nudgeDown', 'bringForward', 'sendBackward', 'bringToFront', 'sendToBack'",
					},
				]}
				example={`return {
  duplicate: editor.getShortcut('duplicate'),
  redo: editor.getShortcut('redo'),
};`}
				run={(editor) => ({ duplicate: editor.getShortcut('duplicate'), redo: editor.getShortcut('redo') })}
			>
				<p>
					The key combinations of a shortcut after applying the <code>keyboardShortcuts</code> prop, or{' '}
					<code>null</code> when it is disabled. Useful to show the keys in tooltips. See{' '}
					<DocLink to='keyboard-shortcuts'>Keyboard shortcuts</DocLink>.
				</p>
			</ApiMethod>

			<H2 id='scene'>Scene coordinates</H2>
			<p>
				Images are scaled into a box of 1000 × 508 units when they are loaded. Object positions (and the saved
				JSON) use these scene units, whatever the size of the screen; the visible size is a viewport zoom on
				top. Rotating the photo by 90° swaps the scene's width and height.
			</p>

			<ApiMethod
				name='getSceneSize'
				signature='editor.getSceneSize(): { width: number; height: number }'
				returns='{ width, height }'
				example={`return editor.getSceneSize();`}
				run={(editor) => editor.getSceneSize()}
			>
				<p>
					Size of the photo in scene units (the bounding box of the rotated photo). Use it to place objects
					with <DocLink to='api/objects#addshape'>addShape</DocLink>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getSceneCenter'
				signature='editor.getSceneCenter(): { x: number; y: number }'
				returns='{ x, y }'
				example={`const { x, y } = editor.getSceneCenter();
await editor.addShape('circle', { left: x - 50, top: y - 50, radius: 50 });
return { x, y };`}
				run={async (editor) => {
					const { x, y } = editor.getSceneCenter();
					await editor.addShape('circle', { left: x - 50, top: y - 50, radius: 50 });
					return { x, y };
				}}
			>
				<p>The center of the photo in scene units.</p>
			</ApiMethod>

			<ApiMethod
				name='getFitZoom'
				signature='editor.getFitZoom(): number'
				returns='number'
				example={`// screen pixels per scene unit at zoom 1
return editor.getFitZoom();`}
				run={(editor) => editor.getFitZoom()}
			>
				<p>
					The scale that fits the scene into the view (canvas pixels per scene unit at zoom 1). Multiply by{' '}
					<code>getState().zoom</code> for the current scale.
				</p>
			</ApiMethod>

			<H2 id='advanced'>Advanced</H2>

			<ApiMethod
				name='constructor'
				id='constructor'
				signature='new ImageEditorController(options?: ImageEditorOptions, registry?: EditorRegistry)'
				example={`import { ImageEditorController, builtInTools, defaultMenus } from 'fabri-pix';

// what <ImageEditorProvider> does internally
const editor = new ImageEditorController({ src: url }, { tools: builtInTools, menus: defaultMenus });`}
			>
				<p>
					You only need this to use the editor without React components. <code>registry</code> holds the
					built-in tools and menus (they contain React icons and panels, so the core does not import them);
					without it the editor has no tools.
				</p>
			</ApiMethod>

			<ApiMethod
				name='attach'
				signature='editor.attach(element: HTMLCanvasElement): () => void'
				returns='() => void (detach)'
				params={[{ name: 'element', type: 'HTMLCanvasElement', description: 'A canvas element in the page.' }]}
				example={`const element = document.createElement('canvas');
container.appendChild(element);
const detach = editor.attach(element); // creates the Fabric canvas and loads src
editor.setViewportSize(container.clientWidth, container.clientHeight);
// later
detach();`}
			>
				<p>
					Creates the Fabric canvas on the element, starts listening to keyboard and clipboard events and
					loads the image. The returned function disposes the canvas and removes all listeners.{' '}
					<code>{'<EditorCanvas>'}</code> does this for you, together with{' '}
					<DocLink to='api/view-and-export#setviewportsize'>setViewportSize</DocLink> on resize.
				</p>
			</ApiMethod>
		</ApiPlayground>
	);
}
