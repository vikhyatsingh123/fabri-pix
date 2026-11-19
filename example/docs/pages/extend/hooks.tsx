import {
	DefaultLayout,
	useEditorState,
	useEditorUI,
	useImageEditor,
	useToolOptions,
	type DrawOptions,
} from 'fabri-pix';

import { Callout, CodeBlock, Demo, DemoEditor, DocLink, H2, H3, PageHeader, PropTable } from '../../ui';

// ---------------------------------------------------------------- useEditorState demo

function StatusBar() {
	const state = useEditorState();
	return (
		<div className='ex-status'>
			<span>ready: {String(state.ready)}</span>
			<span>menu: {state.activeMenu ?? 'none'}</span>
			<span>tool: {state.activeTool ?? 'none'}</span>
			<span>zoom: {Math.round(state.zoom * 100)}%</span>
			<span>
				history: {state.history.index + 1} / {state.history.entries.length}
			</span>
			<span>selected: {state.selection.length}</span>
		</div>
	);
}

const statusCode = `import { DefaultLayout, ImageEditor, useEditorState } from 'fabri-pix';

function StatusBar() {
  const state = useEditorState();
  return (
    <div className='status'>
      <span>ready: {String(state.ready)}</span>
      <span>menu: {state.activeMenu ?? 'none'}</span>
      <span>tool: {state.activeTool ?? 'none'}</span>
      <span>zoom: {Math.round(state.zoom * 100)}%</span>
      <span>history: {state.history.index + 1} / {state.history.entries.length}</span>
      <span>selected: {state.selection.length}</span>
    </div>
  );
}

<ImageEditor src={url}>
  <StatusBar />
  <DefaultLayout />
</ImageEditor>`;

// ---------------------------------------------------------------- useImageEditor demo

function QuickActions() {
	const editor = useImageEditor();
	const { ready } = useEditorState();
	return (
		<div className='ex-row'>
			<button type='button' className='ex-button' disabled={!ready} onClick={() => editor.rotateImage(-90)}>
				⟲ Rotate left
			</button>
			<button
				type='button'
				className='ex-button'
				disabled={!ready}
				onClick={() => editor.flipImage('horizontal')}
			>
				⇋ Flip
			</button>
			<button
				type='button'
				className='ex-button'
				disabled={!ready}
				onClick={() => editor.setImageFilter('grayscale', {})}
			>
				Grayscale
			</button>
			<button
				type='button'
				className='ex-button'
				disabled={!ready}
				onClick={() =>
					void editor.addShape('text', { text: 'Hello!', left: 60, top: 60, fontSize: 36, fill: '#e11d48' })
				}
			>
				Add text
			</button>
			<button type='button' className='ex-button' disabled={!ready} onClick={() => editor.reset()}>
				Reset
			</button>
		</div>
	);
}

const actionsCode = `import { DefaultLayout, ImageEditor, useEditorState, useImageEditor } from 'fabri-pix';

function QuickActions() {
  const editor = useImageEditor();
  const { ready } = useEditorState();
  return (
    <div className='row'>
      <button disabled={!ready} onClick={() => editor.rotateImage(-90)}>⟲ Rotate left</button>
      <button disabled={!ready} onClick={() => editor.flipImage('horizontal')}>⇋ Flip</button>
      <button disabled={!ready} onClick={() => editor.setImageFilter('grayscale', {})}>Grayscale</button>
      <button
        disabled={!ready}
        onClick={() => editor.addShape('text', { text: 'Hello!', left: 60, top: 60, fontSize: 36, fill: '#e11d48' })}
      >
        Add text
      </button>
      <button disabled={!ready} onClick={() => editor.reset()}>Reset</button>
    </div>
  );
}

<ImageEditor src={url}>
  <QuickActions />
  <DefaultLayout />
</ImageEditor>`;

// ---------------------------------------------------------------- useToolOptions demo

const penColors = ['#e11d48', '#f59e0b', '#16a34a', '#2563eb', '#111827'];

function PenPalette() {
	const editor = useImageEditor();
	const { activeTool } = useEditorState();
	const [options, setOptions] = useToolOptions<DrawOptions>('draw');
	return (
		<div className='ex-row'>
			<button
				type='button'
				className={`ex-button ${activeTool === 'draw' ? 'ex-button--primary' : ''}`}
				onClick={() => editor.toggleTool('draw')}
			>
				✎ Pen
			</button>
			{penColors.map((color) => (
				<button
					key={color}
					type='button'
					className={`ex-swatch ${options.color === color ? 'active' : ''}`}
					style={{ background: color }}
					aria-label={`Pen color ${color}`}
					onClick={() => setOptions({ color })}
				/>
			))}
			<label className='ex-label'>
				Width {options.width}
				<input
					type='range'
					min={1}
					max={20}
					value={options.width}
					onChange={(event) => setOptions({ width: Number(event.target.value) })}
				/>
			</label>
		</div>
	);
}

const toolOptionsCode = `import { DefaultLayout, ImageEditor, useEditorState, useImageEditor, useToolOptions, type DrawOptions } from 'fabri-pix';

const colors = ['#e11d48', '#f59e0b', '#16a34a', '#2563eb', '#111827'];

function PenPalette() {
  const editor = useImageEditor();
  const { activeTool } = useEditorState();
  const [options, setOptions] = useToolOptions<DrawOptions>('draw');
  return (
    <div className='row'>
      <button aria-pressed={activeTool === 'draw'} onClick={() => editor.toggleTool('draw')}>✎ Pen</button>
      {colors.map((color) => (
        <button
          key={color}
          className={options.color === color ? 'swatch active' : 'swatch'}
          style={{ background: color }}
          onClick={() => setOptions({ color })}
        />
      ))}
      <label>
        Width {options.width}
        <input
          type='range' min={1} max={20} value={options.width}
          onChange={(event) => setOptions({ width: Number(event.target.value) })}
        />
      </label>
    </div>
  );
}

<ImageEditor src={url} tools={['draw', 'text']}>
  <PenPalette />
  <DefaultLayout />
</ImageEditor>`;

const penTools = ['draw', 'text'];

// ---------------------------------------------------------------- useEditorUI demo

function ExportButton() {
	const editor = useImageEditor();
	const ui = useEditorUI();
	const { Button } = ui.components;
	return (
		<div {...ui.slot('actions', 'ex-ui-actions')}>
			<Button onClick={() => void editor.save()}>
				{ui.icons.save}
				<span>{ui.labels.save} (JPEG)</span>
			</Button>
		</div>
	);
}

const uiCode = `import { DefaultLayout, ImageEditor, useEditorUI, useImageEditor } from 'fabri-pix';

function ExportButton() {
  const editor = useImageEditor();
  const ui = useEditorUI();
  // the Button of the editor (or the one passed through \`components\`)
  const { Button } = ui.components;
  return (
    // fp-actions class + classNames.actions + styles.actions of the editor
    <div {...ui.slot('actions', 'my-extra-class')}>
      <Button onClick={() => editor.save()}>
        {ui.icons.save}
        <span>{ui.labels.save} (JPEG)</span>
      </Button>
    </div>
  );
}

<ImageEditor
  src={url}
  labels={{ save: 'Speichern' }}
  layout={{ actions: 'none' }}
  exportOptions={{ format: 'jpeg', quality: 0.9 }}
>
  <DefaultLayout />
  <ExportButton />
</ImageEditor>`;

const uiLabels = { save: 'Speichern' };
const uiLayout = { actions: 'none' as const };
const uiExportOptions = { format: 'jpeg' as const, quality: 0.9 };

export default function HooksPage() {
	return (
		<>
			<PageHeader
				eyebrow='API reference'
				title='Hooks'
				lead='Four hooks connect your own React components to the editor. They work in any component rendered inside <ImageEditor> (as children) or <ImageEditorProvider>.'
			/>
			<Callout type='warning' title='Inside the editor only'>
				<p>
					The hooks read React context, so they throw when used outside the editor:{' '}
					<code>
						fabri-pix: useImageEditor must be used inside &lt;ImageEditorProvider&gt; or &lt;ImageEditor&gt;
					</code>
					. Outside of it, use a <DocLink to='api/controller'>ref</DocLink> instead.
				</p>
			</Callout>

			<H2 id='useimageeditor'>useImageEditor()</H2>
			<CodeBlock lang='ts' code={`function useImageEditor(): ImageEditorController`} />
			<p>
				Returns the editor controller, the same object you get through a <code>ref</code>. Use it to call any{' '}
				<DocLink to='api/controller'>controller method</DocLink>. The controller is created once and never
				changes, so it is safe in dependency arrays. It does not re-render your component; combine it with{' '}
				<code>useEditorState</code> for that.
			</p>
			<Demo title='Your own action buttons' code={actionsCode}>
				<DemoEditor height={480}>
					<QuickActions />
					<DefaultLayout />
				</DemoEditor>
			</Demo>

			<H2 id='useeditorstate'>useEditorState()</H2>
			<CodeBlock lang='ts' code={`function useEditorState(): EditorState`} />
			<p>
				Returns the current state and re-renders the component whenever it changes (built on React’s{' '}
				<code>useSyncExternalStore</code>). The state object is immutable: a change creates a new object.
			</p>
			<Demo
				title='A live status bar'
				description={<p>Pick tools, select objects, zoom in and undo, and watch the values change.</p>}
				code={statusCode}
			>
				<DemoEditor height={480}>
					<StatusBar />
					<DefaultLayout />
				</DemoEditor>
			</Demo>
			<H3 id='editor-state'>EditorState</H3>
			<PropTable
				nameLabel='Field'
				rows={[
					{
						name: 'ready',
						type: 'boolean',
						description: <p>The image (and initial state) is loaded and the editor can be used.</p>,
					},
					{ name: 'loading', type: 'boolean', description: <p>An image is being loaded.</p> },
					{
						name: 'activeMenu',
						type: 'string | null',
						description: <p>Id of the open menu (tab).</p>,
					},
					{
						name: 'activeTool',
						type: 'string | null',
						description: <p>Id of the active toggle tool, or null.</p>,
					},
					{
						name: 'zoom',
						type: 'number',
						description: <p>User zoom from 1 (image fits the view) to 4.</p>,
					},
					{ name: 'panning', type: 'boolean', description: <p>Pan mode is on.</p> },
					{
						name: 'history',
						type: '{ entries: readonly string[]; index: number }',
						description: (
							<p>
								The serialized history entries and the index of the current one. <code>index</code> is 0
								for the initial state, so <code>index &gt; 0</code> means there are changes.
							</p>
						),
					},
					{
						name: 'restoring',
						type: 'boolean',
						description: <p>An undo, redo or history jump is in progress.</p>,
					},
					{
						name: 'selection',
						type: 'readonly FabricObject[]',
						description: <p>The selected objects.</p>,
					},
					{
						name: 'revision',
						type: 'number',
						description: (
							<p>
								Increases whenever objects are changed through the editor (<code>updateObject</code>,{' '}
								<code>setObjectStyle</code>…). Option panels use it to re-render.
							</p>
						),
					},
					{
						name: 'toolOptions',
						type: 'Record<string, ToolOptions>',
						description: <p>Current options of every tool, by tool id.</p>,
					},
				]}
			/>
			<Callout type='tip' title='Outside React'>
				<p>
					The hook is a thin wrapper around <code>editor.subscribe(listener)</code> and{' '}
					<code>editor.getState()</code>, which you can use directly, e.g. with a ref or in a state manager.
				</p>
			</Callout>

			<H2 id='usetooloptions'>useToolOptions(toolId)</H2>
			<CodeBlock
				lang='ts'
				code={`function useToolOptions<O extends ToolOptions = ToolOptions>(toolId: string): [O, (options: Partial<O>) => void]`}
			/>
			<p>
				Returns the current options of a tool and a function that merges new values into them, like{' '}
				<code>useState</code>. Changes apply to the next objects the tool creates, and an active tool sees them
				right away (the draw tool updates its brush). The option types of the built-in tools are exported (
				<code>DrawOptions</code>, <code>TextOptions</code>…), see{' '}
				<DocLink to='tool-options'>Tool defaults</DocLink>.
			</p>
			<Demo
				title='A pen palette outside the toolbar'
				description={<p>Turn on the pen, pick a color and a width, and draw on the photo.</p>}
				code={toolOptionsCode}
			>
				<DemoEditor height={480} tools={penTools}>
					<PenPalette />
					<DefaultLayout />
				</DemoEditor>
			</Demo>

			<H2 id='useeditorui'>useEditorUI()</H2>
			<CodeBlock lang='ts' code={`function useEditorUI(): EditorUIContextValue`} />
			<p>
				Returns everything the built-in components use to render: the resolved labels and icons (defaults merged
				with your props), the components (including replacements), the layout and the class name helper. Use it
				to make your own parts look and read like the rest of the editor.
			</p>
			<Demo
				title='A button that matches the editor'
				description={
					<p>
						Uses the editor’s Button, the translated label and the save icon, and the{' '}
						<code>fp-actions</code> class.
					</p>
				}
				code={uiCode}
			>
				<DemoEditor height={480} labels={uiLabels} layout={uiLayout} exportOptions={uiExportOptions}>
					<DefaultLayout />
					<ExportButton />
				</DemoEditor>
			</Demo>
			<H3 id='editor-ui-context'>EditorUIContextValue</H3>
			<PropTable
				nameLabel='Field'
				rows={[
					{
						name: 'labels',
						type: 'EditorLabels',
						description: <p>All texts, defaults merged with the labels prop.</p>,
					},
					{
						name: 'icons',
						type: 'EditorIcons',
						description: <p>All icons, defaults merged with the icons prop.</p>,
					},
					{
						name: 'components',
						type: 'EditorComponents',
						description: (
							<p>
								<code>Button</code>, <code>ColorPicker</code>, <code>NumberInput</code>,{' '}
								<code>Slider</code>, <code>Select</code> and the layout parts, including your
								replacements (a hidden part is <code>null</code>).
							</p>
						),
					},
					{
						name: 'layout',
						type: 'Required<EditorLayout>',
						description: (
							<p>Positions of menu, header, toolbar, context panel and actions, with defaults.</p>
						),
					},
					{ name: 'actions', type: 'EditorAction[]', description: <p>The buttons of the actions bar.</p> },
					{
						name: 'objectControls',
						type: 'ObjectControl[]',
						description: <p>Controls shown for selected objects.</p>,
					},
					{ name: 'theme', type: 'EditorTheme | undefined', description: <p>The theme prop.</p> },
					{ name: 'unstyled', type: 'boolean', description: <p>The unstyled prop.</p> },
					{
						name: 'onCancel, onExportJson',
						type: 'functions | undefined',
						description: <p>The callbacks of the Cancel and Export JSON actions.</p>,
					},
					{
						name: 'slot(name, ...extraClassNames)',
						type: '{ className, style }',
						description: (
							<p>
								Class name and style of an editor part: the default <code>fp-*</code> class, your{' '}
								<code>classNames[name]</code>, the extra class names, and <code>styles[name]</code>.
								Spread it on an element: <code>{"<div {...ui.slot('toolbar')}>"}</code>.
							</p>
						),
					},
					{
						name: 'toolLabel(tool), toolIcon(tool)',
						type: 'string, ReactNode',
						description: (
							<p>
								Label and icon of a tool, with <code>labels.tools</code> / <code>icons.tools</code>{' '}
								applied.
							</p>
						),
					},
					{
						name: 'menuLabel(menu), menuIcon(menu)',
						type: 'string, ReactNode',
						description: (
							<p>
								Label and icon of a menu or tool group, with <code>labels.menus</code> /{' '}
								<code>icons.menus</code> applied.
							</p>
						),
					},
					{
						name: 'filterLabel(filter)',
						type: 'string',
						description: (
							<p>
								Label of a filter, with <code>labels.filters</code> applied.
							</p>
						),
					},
				]}
			/>
		</>
	);
}
