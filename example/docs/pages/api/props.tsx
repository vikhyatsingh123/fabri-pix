import {
	Callout,
	CodeBlock,
	Demo,
	DemoLog,
	DemoEditor,
	DocLink,
	H2,
	H3,
	PageHeader,
	PropTable,
	useLog,
	type PropRow,
} from '../../ui';

const imageProps: PropRow[] = [
	{
		name: 'src',
		type: 'string | Blob | null',
		description: (
			<>
				<p>
					The image to edit: a URL, a data URL or a <code>Blob</code> / <code>File</code> (e.g. from an{' '}
					<code>{'<input type="file">'}</code>). Changing it loads the new image and starts a new history.
				</p>
			</>
		),
	},
	{
		name: 'crossOrigin',
		type: "'anonymous' | 'use-credentials' | null",
		default: "'anonymous'",
		description: (
			<p>
				Used to load <code>src</code>. Images from another origin need CORS headers, otherwise the browser
				refuses to export the edited image. <code>null</code> loads without CORS (fine for same-origin images).
			</p>
		),
	},
	{
		name: 'initialState',
		type: 'object | string | null',
		description: (
			<p>
				JSON from <code>onSave</code>, <code>onExportJson</code> or <code>editor.toJSON()</code> to continue
				editing: annotations, crop, rotation, filters and output size are restored. Read when an image is loaded
				(the first <code>src</code> and every <code>src</code> change). See{' '}
				<DocLink to='editor-state'>Editor state &amp; JSON</DocLink>.
			</p>
		),
	},
	{
		name: 'historyLimit',
		type: 'number',
		default: '50',
		description: <p>Maximum number of undo steps. Older entries are dropped.</p>,
	},
	{
		name: 'exportOptions',
		type: 'ExportOptions',
		default: "{ format: 'png', quality: 1 }",
		description: (
			<p>
				Defaults for every export (Save button, <code>editor.save()</code>, <code>editor.exportImage()</code>):{' '}
				<code>format</code> (<code>'png' | 'jpeg' | 'webp'</code>), <code>quality</code> (0–1, jpeg/webp),{' '}
				<code>multiplier</code> (default: original image resolution) and <code>maxPixels</code> (default 16 000
				000). See <DocLink to='api/view-and-export#exportimage'>exportImage</DocLink>.
			</p>
		),
	},
];

const toolProps: PropRow[] = [
	{
		name: 'tools',
		type: '(string | ToolDefinition)[]',
		default: 'all built-in tools',
		description: (
			<p>
				The tools to show, by id. A <code>ToolDefinition</code> object adds your own tool; one with the id of a
				built-in tool replaces it. Menus without a visible tool are hidden. See{' '}
				<DocLink to='tools-and-menus'>Tools &amp; menus</DocLink> and{' '}
				<DocLink to='custom-tools'>Custom tools</DocLink>.
			</p>
		),
	},
	{
		name: 'menus',
		type: 'MenuDefinition[]',
		default: 'Annotate, Crop, Rotate, Resize, Adjust, Filter, Redact',
		description: (
			<p>
				The menu tabs and which tools each one contains (groups are shown as a dropdown). A menu's{' '}
				<code>defaultTool</code> is activated when the menu opens.
			</p>
		),
	},
	{
		name: 'defaults',
		type: 'Record<toolId, options>',
		description: (
			<p>
				Default options per tool, merged over the tool's own defaults, e.g.{' '}
				<code>{'{ text: { fontSize: 32 }, crop: { ratio: 1 } }'}</code>. See{' '}
				<DocLink to='tool-options'>Tool defaults</DocLink>.
			</p>
		),
	},
	{
		name: 'shapes',
		type: 'ShapeDefinition[]',
		description: (
			<p>
				Additional or replacement object definitions: how objects of a <code>shapeType</code> are created,
				restored, deleted and recorded. See <DocLink to='custom-shapes'>Custom shapes</DocLink>.
			</p>
		),
	},
	{
		name: 'filters',
		type: 'FilterDefinition[]',
		description: (
			<p>
				Additional filters (Filter menu, or the Adjust menu with <code>group: 'adjust'</code>). A definition
				with the id of a built-in filter replaces it. See{' '}
				<DocLink to='filters'>Filters &amp; adjustments</DocLink>.
			</p>
		),
	},
	{
		name: 'keyboardShortcuts',
		type: 'boolean | Partial<Record<EditorShortcut, string[] | null>>',
		default: 'true',
		description: (
			<p>
				<code>false</code> turns all shortcuts off; an object rebinds (<code>{"{ duplicate: ['mod+j'] }"}</code>
				) or disables (<code>{'{ selectAll: null }'}</code>) single ones. See{' '}
				<DocLink to='keyboard-shortcuts'>Keyboard shortcuts</DocLink>.
			</p>
		),
	},
	{
		name: 'gestures',
		type: 'boolean',
		default: 'true',
		description: (
			<p>
				Pinch to zoom and two-finger pan on touch screens, ⌘/Ctrl + wheel (or a trackpad pinch) to zoom and the
				wheel to pan while zoomed in. <code>false</code> turns them off; double taps still work as double
				clicks. See <DocLink to='touch-and-mobile'>Phones, tablets &amp; gestures</DocLink>.
			</p>
		),
	},
];

const callbackProps: PropRow[] = [
	{
		name: 'onSave',
		type: '(result: { blob: Blob; json: object }) => void',
		description: (
			<p>
				Called by the Save button and <code>editor.save()</code> with the exported image and the editor state.{' '}
				<strong>Without it the image is downloaded.</strong>
			</p>
		),
	},
	{
		name: 'onCancel',
		type: '() => void',
		description: (
			<p>
				Called by the Cancel button. Setting it adds <code>'cancel'</code> to the default actions (
				<code>['cancel', 'reset', 'save']</code>).
			</p>
		),
	},
	{
		name: 'onExportJson',
		type: '(json: object) => void',
		description: (
			<p>
				Called by the Export JSON button (<code>actions</code> must contain <code>'exportJson'</code>). Without
				it the JSON is downloaded as a file.
			</p>
		),
	},
	{
		name: 'onChange',
		type: '(json: object) => void',
		description: (
			<p>
				Called after every change: a new history entry, undo, redo, a history jump or <code>loadState</code>.
				Receives <code>editor.toJSON()</code>, handy for autosave.
			</p>
		),
	},
	{
		name: 'onReady',
		type: '(editor: ImageEditorController) => void',
		description: (
			<p>
				The image (and <code>initialState</code>) is loaded. Called again after every new <code>src</code>.{' '}
				<code>editor.canvas</code> is the Fabric.js canvas.
			</p>
		),
	},
	{
		name: 'onToolChange',
		type: '(toolId: string | null) => void',
		description: (
			<p>
				The active tool changed (<code>null</code>: no tool).
			</p>
		),
	},
	{
		name: 'onSelectionChange',
		type: '(objects: readonly FabricObject[]) => void',
		description: <p>The selected objects changed (empty array: nothing selected).</p>,
	},
	{
		name: 'onError',
		type: '(error: unknown) => void',
		description: (
			<p>
				Loading the image, restoring a state, a tool or the export failed. Without it (and without an{' '}
				<code>error</code> listener) errors are logged to the console.
			</p>
		),
	},
];

const uiProps: PropRow[] = [
	{
		name: 'actions',
		type: "('load' | 'deleteAll' | 'reset' | 'cancel' | 'exportJson' | 'save')[]",
		default: "['reset', 'save']",
		description: (
			<p>
				Buttons of the actions bar, in this order. <code>load</code> opens another image, <code>deleteAll</code>{' '}
				removes the annotations, <code>reset</code> also removes the crop, rotation, filters and resize. See{' '}
				<DocLink to='layout'>Layout &amp; actions</DocLink>.
			</p>
		),
	},
	{
		name: 'layout',
		type: 'EditorLayout',
		default: "{ menu: 'left', header: 'top', toolbar: 'bottom', contextPanel: 'bottom', actions: 'bottom' }",
		description: (
			<p>
				Where each part is placed. <code>menu</code>: <code>'left' | 'right' | 'top' | 'bottom' | 'none'</code>,
				the others <code>'top' | 'bottom' | 'none'</code>.
			</p>
		),
	},
	{
		name: 'objectControls',
		type: "('opacity' | 'shadow' | 'dashed' | 'cornerRadius' | 'layers' | 'duplicate' | 'delete')[]",
		default: 'all, in this order',
		description: <p>Controls shown in the options panel when objects are selected.</p>,
	},
	{
		name: 'labels',
		type: 'Partial<EditorLabels> & { tools?, menus?, filters? }',
		description: (
			<p>
				Texts of the UI (translations). <code>labels.tools</code>, <code>labels.menus</code> and{' '}
				<code>labels.filters</code> are keyed by id. See{' '}
				<DocLink to='labels'>Labels &amp; translations</DocLink>.
			</p>
		),
	},
	{
		name: 'icons',
		type: 'Partial<EditorIcons> & { tools?, menus? }',
		description: (
			<p>
				Icons of the UI as React nodes, <code>icons.tools</code> / <code>icons.menus</code> keyed by id. See{' '}
				<DocLink to='icons'>Icons</DocLink>.
			</p>
		),
	},
	{
		name: 'theme',
		type: 'EditorTheme',
		description: (
			<p>
				Colors, radius and font: <code>primary</code>, <code>background</code>, <code>surface</code>,{' '}
				<code>text</code>, <code>mutedText</code>, <code>border</code>, <code>hover</code>, <code>active</code>,{' '}
				<code>danger</code>, <code>success</code>, <code>stageBackground</code>, <code>radius</code>,{' '}
				<code>fontFamily</code>, <code>fontSize</code>. Sets the <code>--fp-*</code> CSS variables. See{' '}
				<DocLink to='theming'>Theme &amp; styling</DocLink>.
			</p>
		),
	},
	{
		name: 'classNames',
		type: 'Partial<Record<EditorSlot, string>>',
		description: (
			<p>
				Extra class name per part (<code>root</code>, <code>toolbar</code>, <code>button</code>,{' '}
				<code>stage</code>…), added next to the default <code>fp-*</code> class.
			</p>
		),
	},
	{
		name: 'styles',
		type: 'Partial<Record<EditorSlot, CSSProperties>>',
		description: <p>Inline styles per part.</p>,
	},
	{
		name: 'unstyled',
		type: 'boolean',
		default: 'false',
		description: (
			<p>Removes the default colors, borders and spacing, keeps the layout. For Tailwind, CSS modules…</p>
		),
	},
	{
		name: 'components',
		type: 'Partial<EditorComponents>',
		description: (
			<p>
				Replaces the primitives used everywhere (<code>Button</code>, <code>ColorPicker</code>,{' '}
				<code>NumberInput</code>, <code>Slider</code>, <code>Select</code>) or layout parts (<code>Header</code>
				, <code>MenuBar</code>, <code>Toolbar</code>, <code>ContextPanel</code>, <code>Actions</code>;{' '}
				<code>null</code> hides one). See <DocLink to='custom-components'>Your own components</DocLink>.
			</p>
		),
	},
	{
		name: 'children',
		type: 'ReactNode',
		description: (
			<p>
				Replaces the default layout. Arrange the exported building blocks yourself. See{' '}
				<DocLink to='custom-layout'>Custom layout</DocLink>.
			</p>
		),
	},
];

const sizeProps: PropRow[] = [
	{
		name: 'width',
		type: 'number | string',
		default: "'100%'",
		description: <p>Width of the editor. Numbers are pixels.</p>,
	},
	{
		name: 'height',
		type: 'number | string',
		default: "'100%'",
		description: (
			<p>
				Height of the editor. The default fills the parent, so <strong>the parent needs a height</strong>.
			</p>
		),
	},
	{ name: 'className', type: 'string', description: <p>Class name of the root element.</p> },
	{ name: 'style', type: 'CSSProperties', description: <p>Inline style of the root element.</p> },
	{
		name: 'ref',
		type: 'Ref<ImageEditorController>',
		description: (
			<p>
				Gives you the <DocLink to='api/controller'>editor controller</DocLink> to control the editor from code.
			</p>
		),
	},
];

const demoCode = `import { useRef } from 'react';
import { ImageEditor, type ImageEditorController } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

export function PhotoEditor({ url }: { url: string }) {
  const editor = useRef<ImageEditorController>(null);

  return (
    <div style={{ height: 520 }}>
      <ImageEditor
        ref={editor}
        src={url}
        tools={['crop', 'transform', 'adjust', 'filter', 'text', 'draw', 'arrow', 'rectangle']}
        defaults={{
          text: { fontSize: 28, fill: '#ffffff', backgroundColor: '#2563eb' },
          draw: { color: '#2563eb', width: 4 },
        }}
        labels={{ save: 'Done', menus: { annotate: 'Draw' } }}
        layout={{ menu: 'top' }}
        actions={['reset', 'exportJson', 'save']}
        objectControls={['opacity', 'layers', 'delete']}
        historyLimit={30}
        exportOptions={{ format: 'jpeg', quality: 0.9 }}
        onReady={() => console.log('ready')}
        onToolChange={(tool) => console.log('tool', tool)}
        onChange={(json) => console.log('change', json.objects.length)}
        onExportJson={(json) => console.log('json', json)}
        onSave={({ blob }) => console.log('saved', blob)}
      />
    </div>
  );
}`;

function PropsDemo() {
	const { entries, log, clear } = useLog();
	return (
		<Demo
			title='An editor configured with many props'
			description={
				<p>
					Fewer tools, custom defaults, a top menu, three actions and callbacks. Every callback writes to the
					output below.
				</p>
			}
			code={demoCode}
		>
			<DemoEditor
				height={500}
				tools={['crop', 'transform', 'adjust', 'filter', 'text', 'draw', 'arrow', 'rectangle']}
				defaults={{
					text: { fontSize: 28, fill: '#ffffff', backgroundColor: '#2563eb' },
					draw: { color: '#2563eb', width: 4 },
				}}
				labels={{ save: 'Done', menus: { annotate: 'Draw' } }}
				layout={{ menu: 'top' }}
				actions={['reset', 'exportJson', 'save']}
				objectControls={['opacity', 'layers', 'delete']}
				historyLimit={30}
				exportOptions={{ format: 'jpeg', quality: 0.9 }}
				onReady={() => log('onReady')}
				onToolChange={(tool) => log('onToolChange', tool)}
				onChange={(json) => log('onChange', `${json.objects?.length ?? 0} objects`)}
				onExportJson={(json) => log('onExportJson', json)}
				onSave={({ blob }) => log('onSave', blob)}
			/>
			<DemoLog entries={entries} onClear={clear} placeholder='Use the editor, the callbacks are logged here' />
		</Demo>
	);
}

export function ImageEditorPropsPage() {
	return (
		<>
			<PageHeader
				eyebrow='API reference'
				title={<code>{'<ImageEditor>'}</code>}
				lead='The ready-to-use editor. Every prop is optional except the image. This page lists all of them; the guides explain each area in depth.'
			/>

			<CodeBlock
				code={`import { ImageEditor } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

<div style={{ height: 600 }}>
  <ImageEditor src={url} onSave={({ blob, json }) => upload(blob, json)} />
</div>`}
			/>

			<Callout title='The editor fills its parent'>
				<p>
					<code>width</code> and <code>height</code> default to <code>100%</code>. Give the parent a height
					(or pass <code>height</code>), otherwise the editor collapses.
				</p>
			</Callout>

			<PropsDemo />

			<H2 id='image-and-state'>Image &amp; state</H2>
			<PropTable rows={imageProps} />

			<H2 id='tools'>Tools, menus &amp; behaviour</H2>
			<PropTable rows={toolProps} />

			<H2 id='callbacks'>Callbacks</H2>
			<p>
				Callbacks can change on every render; the editor always calls the latest one. The same notifications are
				also available as <DocLink to='api/events'>events</DocLink> through <code>editor.on()</code>.
			</p>
			<PropTable rows={callbackProps} />

			<H2 id='ui'>User interface</H2>
			<PropTable rows={uiProps} />

			<H2 id='size'>Size, root element &amp; ref</H2>
			<PropTable rows={sizeProps} />

			<H2 id='updating-props'>Changing props</H2>
			<p>The editor is created once. Changing props later works like this:</p>
			<ul>
				<li>
					<code>src</code>: the new image is loaded and the history starts again. The current{' '}
					<code>initialState</code> prop is applied to it, so clear <code>initialState</code> when the new
					image should start empty.
				</li>
				<li>
					<code>tools</code>, <code>menus</code>, <code>defaults</code>, <code>shapes</code>,{' '}
					<code>filters</code>: applied right away when their content changes (inline arrays are fine).
					Changed <code>defaults</code> values update the tool options, other options the user picked are
					kept. Tool, shape and filter definitions created inside a component are new objects on every render,
					so define those outside of it.
				</li>
				<li>Callbacks, UI props and the theme: applied on the next render.</li>
				<li>
					<code>initialState</code> alone: ignored until the next image load. Use{' '}
					<DocLink to='api/history#loadstate'>editor.loadState(json)</DocLink> to load a state into the open
					image.
				</li>
			</ul>

			<H2 id='provider'>
				<code>{'<ImageEditorProvider>'}</code>
			</H2>
			<p>
				<code>ImageEditor</code> is <code>ImageEditorProvider</code> plus a root element and the default layout.
				The provider accepts the same props except <code>width</code>, <code>height</code>,{' '}
				<code>className</code> and <code>style</code>, renders no markup itself and makes the editor available
				to the hooks of everything inside. Use it to build your own layout:
			</p>
			<CodeBlock
				code={`import { ImageEditorProvider, EditorRoot, EditorCanvas, Toolbar, Actions } from 'fabri-pix';

<ImageEditorProvider ref={editor} src={url} onSave={upload}>
  <EditorRoot height={600}>
    <EditorCanvas />
    <Toolbar />
    <Actions />
  </EditorRoot>
</ImageEditorProvider>`}
			/>
			<p>
				Passing <code>children</code> to <code>ImageEditor</code> does the same inside the default root element.
				See <DocLink to='custom-layout'>Custom layout &amp; headless UI</DocLink>.
			</p>

			<H3 id='typescript'>TypeScript</H3>
			<p>All prop types are exported:</p>
			<CodeBlock
				code={`import type {
  ImageEditorProps,        // <ImageEditor> props
  ImageEditorProviderProps, // <ImageEditorProvider> props
  ImageEditorOptions,      // the editor options (everything that isn't UI)
  EditorUIOptions,         // the UI options
  ImageEditorController,   // the ref
} from 'fabri-pix';`}
				lang='ts'
			/>
		</>
	);
}
