import { useMemo } from 'react';
import { FabricText, Rect, Shadow } from 'fabric';
import {
	Field,
	generateId,
	placeOnClick,
	textTool,
	usePanel,
	type TextOptions,
	type ToolDefinition,
	type ToolPanelProps,
} from 'fabri-pix';

import {
	Callout,
	CodeBlock,
	Demo,
	DemoEditor,
	DemoLog,
	DocLink,
	H2,
	H3,
	PageHeader,
	PropTable,
	Steps,
	useLog,
} from '../../ui';

// ---------------------------------------------------------------- highlighter (toggle tool)

const HighlighterIcon = () => (
	<svg width='1em' height='1em' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
		<path d='m9 11-6 6v3h9l3-3' />
		<path d='m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4' />
	</svg>
);

interface HighlightOptions {
	color: string;
	height: number;
}

function HighlightPanel(props: ToolPanelProps<HighlightOptions>) {
	const { value, preview, apply, ColorPicker, labels } = usePanel(props);
	return (
		<Field label={labels.color}>
			<ColorPicker
				aria-label={labels.color}
				// the selected rectangle's fill, or the tool default when nothing is selected
				value={value('color', 'fill')}
				// while dragging: change the object without a history entry
				onChange={(color) => preview({ fill: color })}
				// once picked: record a history entry and remember the color for new highlights
				onChangeComplete={(color) => apply({ color }, { fill: color })}
			/>
		</Field>
	);
}

const highlightTool: ToolDefinition<HighlightOptions> = {
	id: 'highlight',
	label: 'Highlight',
	icon: <HighlighterIcon />,
	defaultOptions: { color: '#ffe600', height: 28 },
	// selecting one of these objects shows the OptionsPanel
	shapeTypes: ['highlight'],
	activate: (context) => {
		context.setCursor('crosshair');
		// calls back with the image coordinates of every click on an empty area
		placeOnClick(context, ({ x, y }) => {
			const { color, height } = context.options;
			const rect = new Rect({
				left: x - 80,
				top: y - height / 2,
				width: 160,
				height,
				fill: color,
				opacity: 0.4,
				strokeWidth: 0,
			});
			// `id` and `shapeType` are saved in the JSON
			rect.set({ id: generateId(), shapeType: 'highlight' });
			context.canvas.add(rect); // recorded in the history automatically
			context.canvas.setActiveObject(rect);
		});
	},
	OptionsPanel: HighlightPanel,
};

const highlightTools = ['rectangle', 'text', highlightTool];

const highlightCode = `import { Rect } from 'fabric';
import {
  Field, generateId, ImageEditor, placeOnClick, usePanel,
  type ToolDefinition, type ToolPanelProps,
} from 'fabri-pix';

interface HighlightOptions {
  color: string;
  height: number;
}

function HighlightPanel(props: ToolPanelProps<HighlightOptions>) {
  const { value, preview, apply, ColorPicker, labels } = usePanel(props);
  return (
    <Field label={labels.color}>
      <ColorPicker
        aria-label={labels.color}
        // the selected rectangle's fill, or the tool default when nothing is selected
        value={value('color', 'fill')}
        // while dragging: change the object without a history entry
        onChange={(color) => preview({ fill: color })}
        // once picked: record a history entry and remember the color for new highlights
        onChangeComplete={(color) => apply({ color }, { fill: color })}
      />
    </Field>
  );
}

const highlightTool: ToolDefinition<HighlightOptions> = {
  id: 'highlight',
  label: 'Highlight',
  icon: <HighlighterIcon />,
  defaultOptions: { color: '#ffe600', height: 28 },
  // selecting one of these objects shows the OptionsPanel
  shapeTypes: ['highlight'],
  activate: (context) => {
    context.setCursor('crosshair');
    // calls back with the image coordinates of every click on an empty area
    placeOnClick(context, ({ x, y }) => {
      const { color, height } = context.options;
      const rect = new Rect({
        left: x - 80, top: y - height / 2, width: 160, height,
        fill: color, opacity: 0.4, strokeWidth: 0,
      });
      // \`id\` and \`shapeType\` are saved in the JSON
      rect.set({ id: generateId(), shapeType: 'highlight' });
      context.canvas.add(rect); // recorded in the history automatically
      context.canvas.setActiveObject(rect);
    });
  },
  OptionsPanel: HighlightPanel,
};

// defined outside the component, so the editor isn't reconfigured on every render
const tools = ['rectangle', 'text', highlightTool];

export default function App() {
  return (
    <div style={{ height: 600 }}>
      <ImageEditor src={url} tools={tools} />
    </div>
  );
}`;

// ---------------------------------------------------------------- watermark (action tool)

const StampIcon = () => (
	<svg width='1em' height='1em' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
		<path d='M5 22h14M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z' />
		<path d='M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13' />
	</svg>
);

const watermarkTool: ToolDefinition<{ text: string }> = {
	id: 'watermark',
	label: 'Watermark',
	icon: <StampIcon />,
	// runs once per click instead of staying active
	type: 'action',
	defaultOptions: { text: '© FabriPix' },
	shapeTypes: ['watermark'],
	run: (context) => {
		// the size of the photo in image coordinates
		const { width, height } = context.editor.getSceneSize();
		const text = new FabricText(context.options.text, {
			fontSize: 28,
			fontWeight: 'bold',
			fill: '#ffffff',
			opacity: 0.75,
			shadow: new Shadow({ color: 'rgba(0, 0, 0, 0.5)', blur: 6 }),
		});
		text.set({
			left: width - text.width - 24,
			top: height - text.height - 20,
			id: generateId(),
			shapeType: 'watermark',
		});
		context.canvas.add(text);
	},
};

const watermarkTools = ['text', 'arrow', watermarkTool];

const watermarkCode = `import { FabricText, Shadow } from 'fabric';
import { generateId, type ToolDefinition } from 'fabri-pix';

const watermarkTool: ToolDefinition<{ text: string }> = {
  id: 'watermark',
  label: 'Watermark',
  icon: <StampIcon />,
  // runs once per click instead of staying active
  type: 'action',
  defaultOptions: { text: '© FabriPix' },
  shapeTypes: ['watermark'],
  run: (context) => {
    // the size of the photo in image coordinates
    const { width, height } = context.editor.getSceneSize();
    const text = new FabricText(context.options.text, {
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#ffffff',
      opacity: 0.75,
      shadow: new Shadow({ color: 'rgba(0, 0, 0, 0.5)', blur: 6 }),
    });
    text.set({
      left: width - text.width - 24,
      top: height - text.height - 20,
      id: generateId(),
      shapeType: 'watermark',
    });
    context.canvas.add(text);
  },
};

const tools = ['text', 'arrow', watermarkTool];

<ImageEditor src={url} tools={tools} />`;

// ---------------------------------------------------------------- overriding a built-in tool

const captionTool: ToolDefinition<TextOptions> = {
	...textTool,
	label: 'Caption',
	defaultOptions: {
		...textTool.defaultOptions!,
		text: 'Caption',
		fill: '#ffffff',
		backgroundColor: '#111827',
		fontSize: 28,
	},
};

const captionTools = ['rectangle', 'arrow', captionTool];

const captionCode = `import { textTool, type TextOptions, type ToolDefinition } from 'fabri-pix';

// same id ('text') as the built-in tool, so it replaces it
const captionTool: ToolDefinition<TextOptions> = {
  ...textTool,
  label: 'Caption',
  defaultOptions: {
    ...textTool.defaultOptions!,
    text: 'Caption',
    fill: '#ffffff',
    backgroundColor: '#111827',
    fontSize: 28,
  },
};

const tools = ['rectangle', 'arrow', captionTool];

<ImageEditor src={url} tools={tools} />`;

// ---------------------------------------------------------------- lifecycle demo

const lifecycleCode = `const loggerTool: ToolDefinition = {
  id: 'logger',
  label: 'Logger',
  activate: (context) => {
    log('activate');
    context.on('mouse:down', (event) => {
      const { x, y } = context.canvas.getScenePoint(event.e);
      log(\`click at \${Math.round(x)}, \${Math.round(y)}\`);
    });
    // called when the tool stops, with the reason why
    return (reason) => log(\`cleanup: \${reason}\`);
  },
};`;

function LifecycleDemo() {
	const { entries, log, clear } = useLog();
	const tools = useMemo(() => {
		const loggerTool: ToolDefinition = {
			id: 'logger',
			label: 'Logger',
			activate: (context) => {
				log('activate');
				context.on('mouse:down', (event) => {
					const { x, y } = context.canvas.getScenePoint(event.e);
					log(`click at ${Math.round(x)}, ${Math.round(y)}`);
				});
				// called when the tool stops, with the reason why
				return (reason) => log(`cleanup: ${reason}`);
			},
		};
		return ['rectangle', 'text', loggerTool];
	}, [log]);
	return (
		<>
			<DemoEditor height={420} tools={tools} />
			<DemoLog entries={entries} onClear={clear} placeholder='Click "Logger", then click the photo' />
		</>
	);
}

// ---------------------------------------------------------------- page

export default function CustomToolsPage() {
	return (
		<>
			<PageHeader
				eyebrow='Extending'
				title='Custom tools'
				lead='A tool is a plain object. Give it an id, a label and an activate function, pass it to the tools prop, and it shows up in the toolbar next to the built-in tools.'
			/>

			<H2 id='what-is-a-tool'>What is a tool?</H2>
			<p>
				Every button in the toolbar is a <strong>tool</strong>: Text, Draw, Crop and Redact are all built with
				the same <code>ToolDefinition</code> object you can write yourself. There are two kinds:
			</p>
			<ul>
				<li>
					<strong>Toggle tools</strong> (the default) stay active after a click and handle canvas input until
					the user picks another tool, e.g. Draw or Rectangle. They implement <code>activate</code>.
				</li>
				<li>
					<strong>Action tools</strong> (<code>type: &apos;action&apos;</code>) run once when clicked and
					never become “active”, e.g. Comment adds a callout in the middle of the image. They implement{' '}
					<code>run</code>.
				</li>
			</ul>
			<p>
				A tool can also have an <strong>options panel</strong> (shown while it is active and when one of its
				objects is selected) and a <strong>custom toolbar button</strong>.
			</p>

			<H2 id='first-tool'>Your first tool, step by step</H2>
			<Steps>
				<li>
					<p>
						<strong>Describe the tool.</strong> <code>id</code> must be unique (using the id of a built-in
						tool replaces it), <code>label</code> and <code>icon</code> are shown in the toolbar.
					</p>
					<CodeBlock
						code={`const highlightTool: ToolDefinition<{ color: string }> = {
  id: 'highlight',
  label: 'Highlight',
  icon: <HighlighterIcon />,
  defaultOptions: { color: '#ffe600' },
};`}
					/>
				</li>
				<li>
					<p>
						<strong>
							Handle input in <code>activate</code>.
						</strong>{' '}
						It receives a <a href='#tool-context'>context</a> with the Fabric.js canvas and helpers.
						Listeners added through <code>context.on</code> are removed automatically when the tool is
						deactivated.
					</p>
					<CodeBlock
						code={`activate: (context) => {
  context.setCursor('crosshair');
  context.on('mouse:down', (event) => {
    if (context.canvas.findTarget(event.e)) return; // clicked an object
    const { x, y } = context.canvas.getScenePoint(event.e);
    const rect = new Rect({ left: x, top: y, width: 160, height: 28, fill: context.options.color, opacity: 0.4 });
    rect.set({ id: generateId(), shapeType: 'highlight' });
    context.canvas.add(rect);
  });
},`}
					/>
				</li>
				<li>
					<p>
						<strong>Tag the objects it creates</strong> with a <code>shapeType</code> and list it in{' '}
						<code>shapeTypes</code>. Selecting such an object later shows the tool’s options panel. Give
						every object a unique <code>id</code> too (<code>generateId()</code>), the history panel and
						copy &amp; paste rely on it.
					</p>
				</li>
				<li>
					<p>
						<strong>Pass it to the editor.</strong> Strings are built-in tools, objects are your own. Tools
						that you don’t place in a <DocLink to='tools-and-menus'>menu</DocLink> are added to the first
						menu.
					</p>
					<CodeBlock code={`<ImageEditor src={url} tools={['rectangle', 'text', highlightTool]} />`} />
				</li>
			</Steps>

			<Demo
				title='A highlighter tool with an options panel'
				description={
					<p>
						Pick <strong>Highlight</strong> in the toolbar and click the photo. Select a highlight to change
						its color, then undo and redo: custom objects take part in the history automatically.
					</p>
				}
				code={highlightCode}
			>
				<DemoEditor height={460} tools={highlightTools} />
			</Demo>

			<Callout type='tip' title='Define tools outside your component'>
				<p>
					The editor compares <code>tools</code>, <code>menus</code>, <code>defaults</code>,{' '}
					<code>shapes</code> and <code>filters</code> by their content, so writing the arrays inline is fine.
					A tool <em>definition</em> object (and its functions) created inside a component is new on every
					render though, which reconfigures the editor each time. Define tools at module level or with{' '}
					<code>useMemo</code>.
				</p>
			</Callout>

			<H2 id='lifecycle'>Lifecycle: activate and cleanup</H2>
			<p>
				<code>activate(context)</code> runs when the user selects the tool. It may return a{' '}
				<strong>cleanup function</strong> which runs when the tool stops. The cleanup gets the{' '}
				<strong>reason</strong>, so a tool can decide whether to keep or throw away unfinished work (the crop
				tool applies the crop on <code>switch</code> but not on <code>restore</code>):
			</p>
			<PropTable
				nameLabel='Reason'
				rows={[
					{
						name: "'switch'",
						description: (
							<p>
								Another tool or menu was selected, or the tool was toggled off. Also used while the
								image is exported or rotated: the tool is stopped and started again right afterwards, so
								pending work is applied first.
							</p>
						),
					},
					{
						name: "'pause'",
						description: <p>Pan mode was turned on. The tool is activated again when pan mode ends.</p>,
					},
					{
						name: "'restore'",
						description: (
							<p>
								The canvas content is about to be replaced: undo, redo, a history jump,{' '}
								<code>reset()</code>, <code>clearAnnotations()</code> or <code>loadState()</code>. The
								tool is resumed afterwards. Objects you are still drawing will be gone.
							</p>
						),
					},
					{
						name: "'dispose'",
						description: <p>The editor unmounts or a new image is loaded. The tool is not resumed.</p>,
					},
				]}
			/>
			<p>
				After your cleanup ran, the editor removes every listener added through <code>context.on</code>,{' '}
				<code>context.listen</code> and <code>context.onOptionsChange</code>, and resets the canvas: drawing
				mode off, drag-to-select on, objects selectable again and the default cursor. You only need to undo
				things you changed yourself. If <code>activate</code> throws, the error goes to <code>onError</code> and
				the tool is not activated.
			</p>
			<Demo
				title='Watch the lifecycle'
				description={
					<p>
						Select <strong>Logger</strong>, click the photo, then switch to Text, undo, or zoom in and press
						the pan button. Every activation and cleanup is printed below.
					</p>
				}
				code={lifecycleCode}
			>
				<LifecycleDemo />
			</Demo>

			<H2 id='action-tools'>Action tools</H2>
			<p>
				With <code>type: &apos;action&apos;</code> the toolbar button calls <code>run(context)</code> once per
				click. <code>run</code> may be async (an error from a rejected promise goes to <code>onError</code>).
				Listeners registered through the context are removed once <code>run</code> finished.
			</p>
			<Demo
				title='Add a watermark with one click'
				description={
					<p>
						Press <strong>Watermark</strong> in the toolbar. The text is placed at the bottom right of the
						photo, then try Save in the actions bar: it is part of the exported image.
					</p>
				}
				code={watermarkCode}
			>
				<DemoEditor height={440} tools={watermarkTools} />
			</Demo>

			<H2 id='tool-definition'>ToolDefinition reference</H2>
			<CodeBlock
				lang='ts'
				code={`interface ToolDefinition<O extends ToolOptions = ToolOptions> {
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
}`}
			/>
			<PropTable
				nameLabel='Property'
				rows={[
					{
						name: 'id',
						type: 'string',
						required: true,
						description: (
							<p>
								Unique id. Used in <code>tools</code>, <code>menus</code>, <code>defaults</code>,{' '}
								<code>labels.tools</code> and <code>icons.tools</code>. The id of a built-in tool
								replaces that tool.
							</p>
						),
					},
					{
						name: 'label',
						type: 'string',
						required: true,
						description: (
							<p>
								Text of the toolbar button (can be translated through <code>labels.tools</code>).
							</p>
						),
					},
					{ name: 'icon', type: 'ReactNode', description: <p>Icon of the toolbar button.</p> },
					{
						name: 'type',
						type: "'toggle' | 'action'",
						default: "'toggle'",
						description: <p>Toggle tools stay active, action tools run once per click.</p>,
					},
					{
						name: 'defaultOptions',
						type: 'O',
						description: (
							<p>
								Initial options. The <code>defaults</code> prop is merged on top, the result is{' '}
								<code>context.options</code>.
							</p>
						),
					},
					{
						name: 'shapeTypes',
						type: 'string[]',
						description: (
							<p>
								The <code>shapeType</code>s of the objects this tool creates. When exactly one such
								object is selected, this tool’s <code>OptionsPanel</code> is shown for it.
							</p>
						),
					},
					{
						name: 'activate',
						type: '(context) => void | cleanup',
						description: (
							<p>Toggle tools: called when the tool is selected. May return a cleanup function.</p>
						),
					},
					{
						name: 'run',
						type: '(context) => void | Promise<void>',
						description: <p>Action tools: called on every click of the toolbar button.</p>,
					},
					{
						name: 'OptionsPanel',
						type: 'ComponentType<ToolPanelProps<O>>',
						description: <p>Options UI, rendered in the context panel.</p>,
					},
					{
						name: 'ToolbarButton',
						type: 'ComponentType<ToolButtonProps>',
						description: <p>Replaces the default toolbar button, e.g. to open a picker.</p>,
					},
				]}
			/>

			<H2 id='tool-context'>ToolContext reference</H2>
			<p>
				<code>activate</code> and <code>run</code> receive a context. Everything you register through it is
				cleaned up for you.
			</p>
			<PropTable
				nameLabel='Member'
				rows={[
					{
						name: 'editor',
						type: 'ImageEditorController',
						description: (
							<p>
								The editor, e.g. <code>editor.addShape()</code>, <code>editor.getSceneSize()</code>. See
								the <DocLink to='api/controller'>controller API</DocLink>.
							</p>
						),
					},
					{ name: 'canvas', type: 'Canvas', description: <p>The Fabric.js canvas.</p> },
					{ name: 'tool', type: 'ToolDefinition<O>', description: <p>The tool itself.</p> },
					{
						name: 'options',
						type: 'O (read only)',
						description: (
							<p>
								The current options: <code>defaultOptions</code>, the <code>defaults</code> prop and
								changes from the options panel. It is a getter, so reading it inside an event handler
								always returns the latest values.
							</p>
						),
					},
					{
						name: 'setOptions',
						type: '(options: Partial<O>) => void',
						description: <p>Changes the options (the panel re-renders).</p>,
					},
					{
						name: 'on',
						type: '(eventName, handler) => void',
						description: (
							<p>
								Adds a Fabric.js canvas listener (<code>mouse:down</code>, <code>mouse:move</code>,{' '}
								<code>path:created</code>…), removed when the tool stops.
							</p>
						),
					},
					{
						name: 'listen',
						type: '(target, type, handler) => void',
						description: (
							<p>
								Adds a DOM listener to <code>window</code>, <code>document</code> or an element, removed
								when the tool stops.
							</p>
						),
					},
					{
						name: 'onOptionsChange',
						type: '(handler: (options: O) => void) => void',
						description: (
							<p>
								Called when the options change while the tool is active (e.g. to update a brush color).
							</p>
						),
					},
					{
						name: 'setCursor',
						type: '(cursor: string) => void',
						description: <p>Any CSS cursor, shown over empty canvas areas.</p>,
					},
					{
						name: 'setSelectionEnabled',
						type: '(enabled: boolean) => void',
						description: (
							<p>Turns Fabric’s drag-to-select box off (useful while you draw by dragging) or on.</p>
						),
					},
					{
						name: 'setInteractive',
						type: '(interactive: boolean) => void',
						description: (
							<p>
								<code>false</code> makes all objects unselectable and clears the selection (the Filter
								and Adjust tools use it).
							</p>
						),
					},
				]}
			/>

			<H2 id='options-panel'>Options panel</H2>
			<p>
				The <code>OptionsPanel</code> component is rendered in the context panel in two situations:
			</p>
			<ul>
				<li>
					The tool is active and nothing is selected: <code>target</code> is <code>null</code> and the panel
					edits the tool’s options (the defaults for the next object).
				</li>
				<li>
					Exactly one object whose <code>shapeType</code> is in <code>shapeTypes</code> is selected (the tool
					does not need to be active): <code>target</code> is that object and the panel should edit it.
				</li>
			</ul>
			<H3 id='tool-panel-props'>ToolPanelProps</H3>
			<PropTable
				rows={[
					{ name: 'editor', type: 'ImageEditorController', description: <p>The editor.</p> },
					{ name: 'tool', type: 'ToolDefinition<O>', description: <p>The tool.</p> },
					{
						name: 'target',
						type: 'FabricObject | null',
						description: (
							<p>
								The selected object of this tool, or <code>null</code> when editing defaults.
							</p>
						),
					},
					{ name: 'options', type: 'O', description: <p>The tool’s current options.</p> },
					{
						name: 'setOptions',
						type: '(options: Partial<O>) => void',
						description: <p>Changes the tool’s options.</p>,
					},
				]}
			/>
			<H3 id='use-panel'>The usePanel helper</H3>
			<p>
				All built-in panels use <code>usePanel(props)</code>. It handles the “selected object or defaults” logic
				and the history for you:
			</p>
			<PropTable
				nameLabel='Returns'
				rows={[
					{
						name: 'value(key, objectKey?)',
						type: 'any',
						description: (
							<p>
								Reads <code>target[objectKey]</code> when an object is selected, otherwise{' '}
								<code>options[key]</code>. <code>objectKey</code> defaults to <code>key</code>.
							</p>
						),
					},
					{
						name: 'preview(objectProps, object?)',
						type: 'void',
						description: (
							<p>
								Sets properties on the selected object <strong>without</strong> a history entry. Use it
								while a color or slider is being dragged.
							</p>
						),
					},
					{
						name: 'apply(optionValues, objectProps?, object?)',
						type: 'void',
						description: (
							<p>
								Sets <code>objectProps</code> on the selected object and records a history entry, then
								saves <code>optionValues</code> as the tool’s options so the next object uses them too.
							</p>
						),
					},
					{
						name: 'Button, ColorPicker, NumberInput, Slider, Select',
						type: 'components',
						description: (
							<p>
								The UI primitives, including the ones replaced through the{' '}
								<DocLink to='custom-components'>components prop</DocLink>.
							</p>
						),
					},
					{
						name: 'labels, icons, ui',
						type: 'object',
						description: (
							<p>
								Texts and icons (with the user’s overrides) and the whole{' '}
								<DocLink to='api/hooks#useeditorui'>UI context</DocLink>.
							</p>
						),
					},
				]}
			/>
			<p>
				Without <code>usePanel</code>, change objects with{' '}
				<DocLink to='api/objects#updateobject'>
					<code>editor.updateObject(target, props, {'{ commit: true }'})</code>
				</DocLink>
				, which also re-renders the panels.
			</p>

			<H2 id='toolbar-button'>Custom toolbar button</H2>
			<p>
				<code>ToolbarButton</code> replaces the button in the toolbar. It receives the tool, whether it is
				active, and the default click handler (which toggles or runs the tool). The emoji and icon tools use it
				to open a picker.
			</p>
			<PropTable
				rows={[
					{ name: 'tool', type: 'ToolDefinition', description: <p>The tool.</p> },
					{ name: 'active', type: 'boolean', description: <p>Whether the tool is active.</p> },
					{
						name: 'onClick',
						type: '() => void',
						description: <p>Toggles a toggle tool, runs an action tool.</p>,
					},
				]}
			/>
			<CodeBlock
				code={`import { useEditorUI, useToolOptions, type ToolButtonProps } from 'fabri-pix';

function StickerButton({ tool, active, onClick }: ToolButtonProps) {
  const { components: { Button } } = useEditorUI();
  const [options, setOptions] = useToolOptions<{ sticker: string }>(tool.id);
  return (
    <span>
      <Button slot='toolButton' active={active} onClick={onClick}>{options.sticker} Sticker</Button>
      {['⭐', '🔥', '✅'].map((sticker) => (
        <Button key={sticker} onClick={() => setOptions({ sticker })}>{sticker}</Button>
      ))}
    </span>
  );
}

const stickerTool: ToolDefinition<{ sticker: string }> = {
  id: 'sticker',
  label: 'Sticker',
  defaultOptions: { sticker: '⭐' },
  ToolbarButton: StickerButton,
  activate: (context) => { /* ... */ },
};`}
			/>

			<H2 id='history'>History, saving and restoring</H2>
			<p>You rarely have to think about the history:</p>
			<ul>
				<li>
					Adding, modifying (moving, scaling, rotating) or removing an object on the canvas records a history
					entry automatically.
				</li>
				<li>
					Changing properties in code does not fire Fabric.js events. Use{' '}
					<code>editor.updateObject(object, props, {'{ commit: true }'})</code> or call{' '}
					<DocLink to='api/history#commit'>
						<code>editor.commit()</code>
					</DocLink>{' '}
					afterwards.
				</li>
				<li>
					Several changes that should be undone as one step go inside{' '}
					<DocLink to='api/history#withouthistory'>
						<code>editor.withoutHistory(() =&gt; …)</code>
					</DocLink>
					, followed by one <code>editor.commit()</code>.
				</li>
				<li>
					<code>id</code> and <code>shapeType</code> are saved in the JSON together with Fabric’s own
					properties. On undo, redo and <code>initialState</code>, objects without a{' '}
					<DocLink to='custom-shapes'>shape definition</DocLink> are re-created with Fabric’s own
					deserialization, which works for all built-in Fabric.js classes (Rect, Circle, Path, FabricText,
					Group…).
				</li>
				<li>
					For objects that are drawn by dragging, or made of several parts, add a{' '}
					<DocLink to='custom-shapes'>shape definition</DocLink> to control when the entry is recorded and how
					the parts are deleted together.
				</li>
			</ul>

			<H2 id='helpers'>Helpers for tools</H2>
			<PropTable
				nameLabel='Helper'
				rows={[
					{
						name: 'placeOnClick(context, place)',
						type: 'void',
						description: (
							<p>
								Clears the selection and calls <code>place({'{ x, y }'})</code> with the image
								coordinates of every click on an empty area (clicks on objects select them as usual).
								Used by the rectangle, circle, triangle, star and text tools.
							</p>
						),
					},
					{
						name: 'followCursor(context, cursor)',
						type: 'void',
						description: (
							<p>
								Shows <code>cursor()</code> over empty areas and a move cursor over objects, updated on
								every mouse move.
							</p>
						),
					},
					{
						name: 'createCursorCache()',
						type: '(key, draw) => string',
						description: (
							<p>
								Returns a function that creates a cursor image by drawing on a canvas, and only redraws
								when <code>key</code> changes. <code>draw(ctx, element)</code> must return a CSS cursor
								value.
							</p>
						),
					},
					{
						name: 'usePanel(props)',
						type: 'object',
						description: (
							<p>
								For options panels, see <a href='#use-panel'>above</a>.
							</p>
						),
					},
				]}
			/>
			<CodeBlock
				code={`import { createCursorCache, followCursor, placeOnClick } from 'fabri-pix';

activate: (context) => {
  const cursor = createCursorCache();
  // a colored dot as cursor, redrawn only when the color changes
  followCursor(context, () =>
    cursor(context.options.color, (ctx, element) => {
      element.width = 20;
      element.height = 20;
      ctx.fillStyle = context.options.color;
      ctx.beginPath();
      ctx.arc(10, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      return \`url(\${element.toDataURL()}) 10 10, crosshair\`;
    }),
  );
  placeOnClick(context, ({ x, y }) => {
    void context.editor.addShape('circle', { left: x - 20, top: y - 20, radius: 20, fill: context.options.color });
  });
},`}
			/>

			<H2 id='override-built-in'>Changing a built-in tool</H2>
			<p>
				All built-in tool definitions are exported (<code>textTool</code>, <code>drawTool</code>,{' '}
				<code>cropTool</code>… see <DocLink to='api/utilities#built-in-tools'>the full list</DocLink>). Spread
				one and change what you need. Because the id stays the same, it replaces the original everywhere,
				including in the default menus.
			</p>
			<Demo
				title='The text tool as a “Caption” tool'
				description={
					<p>
						Pick <strong>Caption</strong> and click the photo: new texts are white on dark with a bigger
						font.
					</p>
				}
				code={captionCode}
			>
				<DemoEditor height={440} tools={captionTools} />
			</Demo>
			<Callout title='Only want different defaults or a different name?'>
				<p>
					You don’t need a new definition for that: use{' '}
					<DocLink to='tool-options'>
						<code>defaults</code>
					</DocLink>{' '}
					(<code>{'defaults={{ text: { fontSize: 28 } }}'}</code>) and{' '}
					<DocLink to='labels'>
						<code>labels.tools</code>
					</DocLink>{' '}
					(<code>{"labels={{ tools: { text: 'Caption' } }}"}</code>). Override the definition when you want
					different behaviour, e.g. your own <code>OptionsPanel</code>.
				</p>
			</Callout>
		</>
	);
}
