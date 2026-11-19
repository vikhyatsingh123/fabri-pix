import { ContextPanel, EditorCanvas, HistoryPanel, ToolButton, useEditorState, useImageEditor } from 'fabri-pix';

import { Callout, CodeBlock, Demo, DemoEditor, DocLink, H2, H3, PageHeader, Table } from '../../ui';

const layoutTools: string[] = ['rectangle', 'arrow', 'text', 'draw', 'redact'];

function SideBar() {
	const editor = useImageEditor();
	const { ready, history, restoring } = useEditorState();
	return (
		<aside className='ex-sidebar'>
			{layoutTools.map((id) => (
				<ToolButton key={id} toolId={id} />
			))}
			<hr />
			<button
				type='button'
				className='ex-button'
				disabled={!ready || restoring || history.index <= 0}
				onClick={() => void editor.undo()}
			>
				Undo
			</button>
			<button type='button' className='ex-button' disabled={!ready} onClick={() => editor.rotateImage(90)}>
				Rotate
			</button>
			<button
				type='button'
				className='ex-button ex-button--primary'
				disabled={!ready || history.index === 0}
				onClick={() => void editor.save()}
			>
				Save
			</button>
		</aside>
	);
}

function MyLayout() {
	return (
		<>
			<div className='ex-layout'>
				<SideBar />
				<EditorCanvas />
				<div className='ex-history'>
					<p className='ex-history-title'>History</p>
					<HistoryPanel />
				</div>
			</div>
			<ContextPanel />
		</>
	);
}

const layoutCode = `import {
  ContextPanel, EditorCanvas, HistoryPanel, ImageEditor, ToolButton,
  useEditorState, useImageEditor,
} from 'fabri-pix';

const tools = ['rectangle', 'arrow', 'text', 'draw', 'redact'];

function SideBar() {
  const editor = useImageEditor();
  const { ready, history, restoring } = useEditorState();
  return (
    <aside className='sidebar'>
      {tools.map((id) => (
        <ToolButton key={id} toolId={id} />
      ))}
      <hr />
      <button disabled={!ready || restoring || history.index <= 0} onClick={() => editor.undo()}>
        Undo
      </button>
      <button disabled={!ready} onClick={() => editor.rotateImage(90)}>
        Rotate
      </button>
      <button disabled={!ready || history.index === 0} onClick={() => editor.save()}>
        Save
      </button>
    </aside>
  );
}

export default function App() {
  return (
    <div style={{ height: 600 }}>
      {/* children replace the default layout */}
      <ImageEditor src={url} onSave={upload}>
        <div className='layout'>
          <SideBar />
          <EditorCanvas />
          <div className='history'>
            <p>History</p>
            <HistoryPanel />
          </div>
        </div>
        <ContextPanel />
      </ImageEditor>
    </div>
  );
}

/* CSS
.layout { display: flex; flex: 1; min-height: 0; gap: 12px; }
.sidebar { display: flex; flex-direction: column; gap: 4px; width: 150px; }
.history { width: 180px; overflow: auto; }
*/`;

export default function CustomLayoutPage() {
	return (
		<>
			<PageHeader
				eyebrow='Extending'
				title='Custom layout & headless UI'
				lead='Every part of the default UI is an exported component. Arrange them your own way, mix them with your own components, or skip them and build the whole interface on the editor API.'
			/>

			<H2 id='three-levels'>Three levels of control</H2>
			<Table
				head={['Approach', 'Use it when', 'You write']}
				rows={[
					[
						<strong key='a'>Props</strong>,
						'The default UI is fine, but parts should move, hide or look different.',
						<span key='c'>
							<DocLink to='layout'>layout</DocLink>, <DocLink to='theming'>theme</DocLink>,{' '}
							<DocLink to='custom-components'>components</DocLink>
						</span>,
					],
					[
						<strong key='a'>Children of ImageEditor</strong>,
						'You want your own arrangement, keeping the root element, size and theme of the editor.',
						'Building blocks + your own components',
					],
					[
						<strong key='a'>ImageEditorProvider</strong>,
						'The editor is spread over your page (canvas in one place, controls in a toolbar elsewhere) or fully headless.',
						'Everything outside the canvas',
					],
				]}
			/>

			<H2 id='children'>Children of ImageEditor</H2>
			<p>
				When <code>&lt;ImageEditor&gt;</code> has children, they replace the default layout. The editor still
				renders its root element (sized to the parent, with the theme variables), and every component inside can
				use the editor hooks.
			</p>
			<Demo
				title='A sidebar layout with a permanent history list'
				description={
					<p>
						Tool buttons in a sidebar, the history always visible on the right, and your own Undo / Rotate /
						Save buttons built with the hooks.
					</p>
				}
				code={layoutCode}
			>
				<DemoEditor height={500} tools={layoutTools}>
					<MyLayout />
				</DemoEditor>
			</Demo>
			<Callout type='tip' title='Sizing'>
				<p>
					The root is a flex column. <code>&lt;EditorCanvas&gt;</code> grows to fill the free space (
					<code>flex: 1</code>) and fits the photo into it. When you wrap it in your own row, give that row{' '}
					<code>flex: 1</code> and <code>min-height: 0</code>, as in the CSS above.
				</p>
			</Callout>

			<H2 id='provider'>ImageEditorProvider</H2>
			<p>
				<code>&lt;ImageEditorProvider&gt;</code> creates the editor and shares it through React context, but
				renders no element of its own. It takes the same props as <code>&lt;ImageEditor&gt;</code> except{' '}
				<code>className</code>, <code>style</code>, <code>width</code> and <code>height</code>, and accepts a{' '}
				<code>ref</code> to the controller. Put it high enough in the tree that all your controls are inside.
			</p>
			<CodeBlock
				code={`import { EditorCanvas, EditorRoot, ImageEditorProvider, Toolbar } from 'fabri-pix';

function PhotoPage({ src }) {
  return (
    <ImageEditorProvider src={src} onSave={upload} theme={{ primary: '#7c3aed' }}>
      <PageHeader>
        {/* your app's header, with editor controls in it */}
        <SaveButton />
      </PageHeader>

      <main>
        {/* EditorRoot applies the theme variables, the root class and the size */}
        <EditorRoot height={600}>
          <EditorCanvas />
          <Toolbar />
        </EditorRoot>
      </main>
    </ImageEditorProvider>
  );
}`}
			/>
			<p>
				<code>&lt;ImageEditor&gt;</code> is exactly that: a provider with an <code>&lt;EditorRoot&gt;</code>{' '}
				inside, rendering <code>&lt;DefaultLayout&gt;</code> when it has no children.
			</p>
			<Callout type='warning' title='Mount one EditorCanvas per provider'>
				<p>
					The editor attaches to the canvas element of <code>&lt;EditorCanvas&gt;</code> when it mounts and
					loads the image then. Without it, the editor never becomes <code>ready</code>. Render exactly one
					per provider.
				</p>
			</Callout>

			<H2 id='building-blocks'>Building blocks</H2>
			<p>
				These are the parts of the default layout. All of them must be rendered inside the provider. Details and
				props are in the <DocLink to='api/components'>components reference</DocLink>.
			</p>
			<Table
				head={['Component', 'Renders']}
				rows={[
					[<code key='c'>EditorRoot</code>, 'The outer element: theme variables, root class / style, size.'],
					[<code key='c'>EditorCanvas</code>, 'The canvas. Fills the available space and fits the image.'],
					[
						<code key='c'>DefaultLayout</code>,
						'The complete default arrangement, configured by the layout prop.',
					],
					[<code key='c'>Header</code>, 'HistoryControls and ZoomControls.'],
					[<code key='c'>MenuBar</code>, 'The menu tabs (hidden when there is only one menu).'],
					[<code key='c'>Toolbar</code>, 'The tools of the active menu.'],
					[<code key='c'>ToolButton</code>, 'The button of one tool, by toolId.'],
					[<code key='c'>ToolGroupButton</code>, 'Several tools behind one button with a dropdown.'],
					[<code key='c'>HistoryControls</code>, 'History dropdown, Undo and Redo.'],
					[<code key='c'>HistoryPanel</code>, 'The list of history entries.'],
					[<code key='c'>ZoomControls</code>, 'Zoom in, Fit, Zoom out and Pan.'],
					[
						<code key='c'>ContextPanel</code>,
						'Options of the active tool / selected object, plus ObjectControls.',
					],
					[
						<code key='c'>ObjectControls</code>,
						'Opacity, shadow, dashes, corners, layers, duplicate, delete.',
					],
					[<code key='c'>Actions</code>, 'The action buttons (Reset, Save…).'],
				]}
			/>

			<H2 id='hooks'>Hooks</H2>
			<p>
				Your own components talk to the editor through four hooks (see the{' '}
				<DocLink to='api/hooks'>hooks reference</DocLink>):
			</p>
			<ul>
				<li>
					<code>useImageEditor()</code> returns the controller: call <code>undo()</code>,{' '}
					<code>setActiveTool()</code>, <code>exportImage()</code>…
				</li>
				<li>
					<code>useEditorState()</code> returns the state and re-renders on every change: ready, active tool,
					zoom, history, selection.
				</li>
				<li>
					<code>useToolOptions(toolId)</code> returns a tool’s options and a setter.
				</li>
				<li>
					<code>useEditorUI()</code> returns labels, icons, components and class name helpers, to make your
					components match the editor.
				</li>
			</ul>
			<CodeBlock
				code={`function SaveButton() {
  const editor = useImageEditor();
  const { ready, history } = useEditorState();
  return (
    <button disabled={!ready || history.index === 0} onClick={() => editor.save()}>
      Save
    </button>
  );
}`}
			/>

			<H2 id='headless'>Fully headless</H2>
			<p>
				You can skip every UI part except <code>&lt;EditorCanvas&gt;</code> and drive the editor only through
				the controller. Tools still work: <code>editor.setActiveTool(&apos;draw&apos;)</code> activates drawing
				on the canvas, whatever your buttons look like.
			</p>
			<CodeBlock
				code={`import { EditorCanvas, ImageEditorProvider, useEditorState, useImageEditor } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

const tools = ['draw', 'text', 'arrow'];

function Controls() {
  const editor = useImageEditor();
  const { activeTool, ready } = useEditorState();
  return (
    <div className='my-controls'>
      {tools.map((id) => (
        <MyToggle key={id} pressed={activeTool === id} disabled={!ready} onClick={() => editor.toggleTool(id)}>
          {id}
        </MyToggle>
      ))}
      <MyButton onClick={() => editor.setImageFilter('grayscale', {})}>Black & white</MyButton>
      <MyButton onClick={async () => download(await editor.exportImage({ format: 'jpeg' }))}>Download</MyButton>
    </div>
  );
}

export function HeadlessEditor({ src }) {
  return (
    <ImageEditorProvider src={src} tools={tools}>
      <Controls />
      <div style={{ height: 500, display: 'flex' }}>
        <EditorCanvas />
      </div>
    </ImageEditorProvider>
  );
}`}
			/>
			<H3 id='headless-notes'>Things to keep in mind</H3>
			<ul>
				<li>
					Tool option panels are rendered by <code>&lt;ContextPanel&gt;</code>. Leave it out and change
					options through <code>useToolOptions</code> or <code>editor.setToolOptions</code> instead.
				</li>
				<li>
					Keyboard shortcuts work without any UI. Turn them off with{' '}
					<code>keyboardShortcuts={'{false}'}</code>.
				</li>
				<li>
					Import the stylesheet anyway: it positions the canvas inside <code>&lt;EditorCanvas&gt;</code>.
					Theme variables and <code>unstyled</code> only apply inside <code>&lt;EditorRoot&gt;</code>.
				</li>
			</ul>
		</>
	);
}
