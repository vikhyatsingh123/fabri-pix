import { useState } from 'react';
import {
	Actions,
	Button,
	ColorPicker,
	ContextPanel,
	DefaultLayout,
	Divider,
	Dropdown,
	EditorCanvas,
	Field,
	Header,
	MenuBar,
	NumberInput,
	Segmented,
	Select,
	Slider,
	Toolbar,
	useEditorUI,
} from 'fabri-pix';

import { Callout, CodeBlock, Demo, DemoEditor, DocLink, H2, H3, PageHeader, PropTable } from '../../ui';

// ---------------------------------------------------------------- arrangement demo

function TopLayout() {
	return (
		<>
			<div className='ex-row ex-row--between'>
				<MenuBar />
				<Header />
			</div>
			<Toolbar />
			<EditorCanvas />
			<ContextPanel />
			<Actions />
		</>
	);
}

const arrangementCode = `import { Actions, ContextPanel, EditorCanvas, Header, ImageEditor, MenuBar, Toolbar } from 'fabri-pix';

<ImageEditor src={url} layout={{ menu: 'top' }} actions={['reset', 'save']}>
  <div className='row'>
    <MenuBar />
    <Header />
  </div>
  <Toolbar />
  <EditorCanvas />
  <ContextPanel />
  <Actions />
</ImageEditor>`;

// ---------------------------------------------------------------- primitives demo

function PrimitivesPanel() {
	const ui = useEditorUI();
	const [color, setColor] = useState('#2563eb');
	const [size, setSize] = useState(24);
	const [opacity, setOpacity] = useState(0.8);
	const [align, setAlign] = useState('left');
	const [font, setFont] = useState('Georgia');
	const [open, setOpen] = useState(false);
	return (
		<div {...ui.slot('contextPanel')}>
			<Field icon={ui.icons.fill} label='Color'>
				<ColorPicker aria-label='Color' value={color} onChange={setColor} />
			</Field>
			<Divider />
			<Field label='Size'>
				<NumberInput aria-label='Size' min={8} max={96} value={size} onChange={setSize} />
			</Field>
			<Divider />
			<Field label='Opacity'>
				<Slider aria-label='Opacity' min={0} max={1} step={0.05} value={opacity} onChange={setOpacity} />
			</Field>
			<Divider />
			<Segmented
				value={align}
				onChange={setAlign}
				options={[
					{ value: 'left', label: ui.icons.alignLeft, title: 'Left' },
					{ value: 'center', label: ui.icons.alignCenter, title: 'Center' },
					{ value: 'right', label: ui.icons.alignRight, title: 'Right' },
				]}
			/>
			<Divider />
			<Select
				aria-label='Font'
				value={font}
				onChange={setFont}
				options={['Arial', 'Georgia', 'Courier New'].map((value) => ({ value, label: value }))}
			/>
			<Divider />
			<Dropdown
				open={open}
				onOpenChange={setOpen}
				trigger={
					<Button active={open} onClick={() => setOpen(!open)}>
						More {ui.icons.dropdown}
					</Button>
				}
			>
				<div className='fp-dropdown-list'>
					<Button onClick={() => setOpen(false)}>First item</Button>
					<Button danger onClick={() => setOpen(false)}>
						{ui.icons.delete} Remove
					</Button>
				</div>
			</Dropdown>
		</div>
	);
}

const primitivesCode = `import {
  Button, ColorPicker, Divider, Dropdown, Field, NumberInput, Segmented, Select, Slider, useEditorUI,
} from 'fabri-pix';

function PrimitivesPanel() {
  const ui = useEditorUI();
  const [color, setColor] = useState('#2563eb');
  const [size, setSize] = useState(24);
  const [opacity, setOpacity] = useState(0.8);
  const [align, setAlign] = useState('left');
  const [font, setFont] = useState('Georgia');
  const [open, setOpen] = useState(false);
  return (
    <div {...ui.slot('contextPanel')}>
      <Field icon={ui.icons.fill} label='Color'>
        <ColorPicker aria-label='Color' value={color} onChange={setColor} />
      </Field>
      <Divider />
      <Field label='Size'>
        <NumberInput aria-label='Size' min={8} max={96} value={size} onChange={setSize} />
      </Field>
      <Divider />
      <Field label='Opacity'>
        <Slider aria-label='Opacity' min={0} max={1} step={0.05} value={opacity} onChange={setOpacity} />
      </Field>
      <Divider />
      <Segmented
        value={align}
        onChange={setAlign}
        options={[
          { value: 'left', label: ui.icons.alignLeft, title: 'Left' },
          { value: 'center', label: ui.icons.alignCenter, title: 'Center' },
          { value: 'right', label: ui.icons.alignRight, title: 'Right' },
        ]}
      />
      <Divider />
      <Select
        aria-label='Font'
        value={font}
        onChange={setFont}
        options={['Arial', 'Georgia', 'Courier New'].map((value) => ({ value, label: value }))}
      />
      <Divider />
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={<Button active={open} onClick={() => setOpen(!open)}>More {ui.icons.dropdown}</Button>}
      >
        <div className='fp-dropdown-list'>
          <Button onClick={() => setOpen(false)}>First item</Button>
          <Button danger onClick={() => setOpen(false)}>{ui.icons.delete} Remove</Button>
        </div>
      </Dropdown>
    </div>
  );
}

<ImageEditor src={url}>
  <DefaultLayout />
  <PrimitivesPanel />
</ImageEditor>`;

function PrimitivesDemo() {
	return (
		<DemoEditor height={540}>
			<DefaultLayout />
			<PrimitivesPanel />
		</DemoEditor>
	);
}

const noProps = <p className='ex-muted'>No props.</p>;

export default function ComponentsPage() {
	return (
		<>
			<PageHeader
				eyebrow='API reference'
				title='Components'
				lead='The building blocks of the default UI and the small primitives they are made of. Combine them in your own layout or use them in your own panels.'
			/>
			<Callout type='warning' title='Render them inside the editor'>
				<p>
					All components below read the editor from React context. Render them as children of{' '}
					<code>&lt;ImageEditor&gt;</code> or inside <code>&lt;ImageEditorProvider&gt;</code>. See{' '}
					<DocLink to='custom-layout'>Custom layout</DocLink> for complete examples.
				</p>
			</Callout>

			<H2 id='editors'>Editors</H2>
			<H3 id='image-editor'>ImageEditor</H3>
			<p>
				The ready-to-use editor: a provider, an <code>EditorRoot</code>, and the <code>DefaultLayout</code> (or
				your children). All props are documented on the <DocLink to='api/image-editor'>props page</DocLink>.
			</p>
			<H3 id='image-editor-provider'>ImageEditorProvider</H3>
			<p>
				Creates the editor and provides it to its children, without rendering any element. Same props as{' '}
				<code>ImageEditor</code> except <code>className</code>, <code>style</code>, <code>width</code> and{' '}
				<code>height</code>. Accepts a <code>ref</code> to the <DocLink to='api/controller'>controller</DocLink>
				.
			</p>

			<H2 id='layout-parts'>Layout parts</H2>
			<Demo title='The parts in a different order' code={arrangementCode}>
				<DemoEditor height={520} layout={{ menu: 'top' }} actions={['reset', 'save']}>
					<TopLayout />
				</DemoEditor>
			</Demo>

			<H3 id='editor-root'>EditorRoot</H3>
			<p>
				The outer element (<code>fp-root</code>, a flex column). It sets the theme CSS variables, applies{' '}
				<code>classNames.root</code> / <code>styles.root</code> and the <code>fp-unstyled</code> class, and
				sizes itself (100% of the parent by default).
			</p>
			<PropTable
				rows={[
					{ name: 'width', type: 'number | string', default: "'100%'", description: <p>Width.</p> },
					{ name: 'height', type: 'number | string', default: "'100%'", description: <p>Height.</p> },
					{ name: 'className', type: 'string', description: <p>Extra class name.</p> },
					{
						name: 'style',
						type: 'CSSProperties',
						description: <p>Inline style, applied after the theme variables.</p>,
					},
					{ name: 'children', type: 'ReactNode', description: <p>The content.</p> },
				]}
			/>

			<H3 id='editor-canvas'>EditorCanvas</H3>
			<p>
				The canvas area (<code>fp-stage</code>). It creates the canvas element, attaches the editor (which then
				loads the image), watches its own size and fits the photo into it. Shows the loading label while an
				image loads. Render exactly one per editor.
			</p>
			<PropTable
				rows={[
					{ name: 'className', type: 'string', description: <p>Extra class name.</p> },
					{ name: 'style', type: 'CSSProperties', description: <p>Inline style.</p> },
				]}
			/>

			<H3 id='default-layout'>DefaultLayout</H3>
			<p>
				The complete default UI. It places <code>Header</code>, <code>Actions</code>, <code>Toolbar</code> and{' '}
				<code>ContextPanel</code> above or below the canvas, and <code>MenuBar</code> next to it, following the{' '}
				<DocLink to='layout'>layout prop</DocLink>. Uses the replacements from <code>components</code> (a part
				set to <code>null</code> is skipped). Useful when you only want to add something:{' '}
				<code>{'<><MyBanner /><DefaultLayout /></>'}</code>.
			</p>
			{noProps}

			<H3 id='header'>Header</H3>
			<p>
				<code>HistoryControls</code>, a divider and <code>ZoomControls</code> in a <code>fp-header</code> row.
			</p>
			{noProps}

			<H3 id='menu-bar'>MenuBar</H3>
			<p>
				A button per menu (tab). Clicking one calls <code>editor.setMenu(id)</code>. Renders nothing when there
				is only one menu. Its class includes <code>fp-menu--{'{position}'}</code> from <code>layout.menu</code>.
			</p>
			{noProps}

			<H3 id='toolbar'>Toolbar</H3>
			<p>
				The tools of the active menu: a <code>ToolButton</code> per tool id and a <code>ToolGroupButton</code>{' '}
				per group. Empty for menus whose only tool is activated automatically (Crop, Redact…).
			</p>
			{noProps}

			<H3 id='tool-button'>ToolButton</H3>
			<p>
				The button of one tool, with its label and icon (after <code>labels.tools</code> /{' '}
				<code>icons.tools</code>). Clicking toggles the tool (or runs an action tool). If the tool has a{' '}
				<code>ToolbarButton</code>, that is rendered instead. Renders nothing for unknown ids.
			</p>
			<PropTable
				rows={[{ name: 'toolId', type: 'string', required: true, description: <p>Id of the tool.</p> }]}
			/>
			<CodeBlock code={`<ToolButton toolId='text' />`} />

			<H3 id='tool-group-button'>ToolGroupButton</H3>
			<p>
				Several tools behind one button. The main button activates the first toggle tool of the group (or turns
				the active one off), the arrow opens a dropdown with all of them.
			</p>
			<PropTable
				rows={[
					{
						name: 'group',
						type: 'ToolGroup',
						required: true,
						description: (
							<p>
								<code>{'{ id, label, icon?, tools: string[] }'}</code>
							</p>
						),
					},
				]}
			/>
			<CodeBlock
				code={`<ToolGroupButton group={{ id: 'shapes', label: 'Shapes', tools: ['rectangle', 'circle', 'triangle'] }} />`}
			/>

			<H3 id='history-controls'>HistoryControls</H3>
			<p>
				A history button (opens a <code>HistoryPanel</code> in a dropdown), Undo and Redo.
			</p>
			{noProps}

			<H3 id='history-panel'>HistoryPanel</H3>
			<p>
				The list of history entries with a description of each change (“Rectangle Created”, “Crop Applied”,
				“Image Edited”…). Clicking an entry calls <code>editor.goToHistory(index)</code>. Object names come from
				the <code>label</code> of the <DocLink to='custom-shapes'>shape definitions</DocLink>.
			</p>
			<PropTable
				rows={[
					{
						name: 'onSelect',
						type: '() => void',
						description: <p>Called after an entry was clicked, e.g. to close a popover.</p>,
					},
				]}
			/>

			<H3 id='zoom-controls'>ZoomControls</H3>
			<p>Zoom in, Fit, Zoom out, a divider and the Pan toggle (enabled once zoomed in).</p>
			{noProps}

			<H3 id='context-panel'>ContextPanel</H3>
			<p>
				The options area. When exactly one object is selected it shows the <code>OptionsPanel</code> of the tool
				that created it (found through <code>shapeTypes</code>); with nothing selected, the panel of the active
				tool. Below that it shows <code>ObjectControls</code> whenever annotations are selected.
			</p>
			{noProps}

			<H3 id='object-controls'>ObjectControls</H3>
			<p>
				Opacity, shadow, dashed stroke, corner radius, layer order, duplicate and delete for the selected
				objects, in the order of the <DocLink to='layout'>objectControls prop</DocLink>. Controls an object
				doesn’t support (e.g. corners on a circle) are hidden.
			</p>
			{noProps}

			<H3 id='actions'>Actions</H3>
			<p>
				The buttons listed in the <code>actions</code> prop: <code>load</code> opens a file picker and loads the
				image, <code>deleteAll</code> calls <code>clearAnnotations()</code>, <code>reset</code> calls{' '}
				<code>reset()</code>, <code>cancel</code> calls <code>onCancel</code>, <code>exportJson</code> calls{' '}
				<code>onExportJson</code> (or downloads the JSON) and <code>save</code> calls <code>editor.save()</code>
				. Each button has an <code>fp-action-{'{name}'}</code> class.
			</p>
			{noProps}

			<H2 id='primitives'>Primitives</H2>
			<p>
				The small controls used by every panel. They read their class names and styles from the editor, so they
				follow the theme. <code>Button</code>, <code>ColorPicker</code>, <code>NumberInput</code>,{' '}
				<code>Slider</code> and <code>Select</code> can be replaced through the{' '}
				<DocLink to='custom-components'>components prop</DocLink>; inside your panels, take them from{' '}
				<code>useEditorUI().components</code> to get the replacements too.
			</p>
			<Demo
				title='All primitives in a custom panel'
				description={<p>Every control below is a fabri-pix primitive, styled by the editor theme.</p>}
				code={primitivesCode}
			>
				<PrimitivesDemo />
			</Demo>

			<H3 id='button'>Button</H3>
			<p>
				A <code>&lt;button type=&quot;button&quot;&gt;</code> with the <code>fp-button</code> class. Accepts all
				button attributes plus:
			</p>
			<PropTable
				rows={[
					{
						name: 'active',
						type: 'boolean',
						description: (
							<p>
								Pressed state: adds <code>fp-button--active</code> and <code>aria-pressed</code>.
							</p>
						),
					},
					{
						name: 'danger',
						type: 'boolean',
						description: (
							<p>
								Destructive action: adds <code>fp-button--danger</code>.
							</p>
						),
					},
					{
						name: 'slot',
						type: 'EditorSlot',
						default: "'button'",
						description: (
							<p>
								Which part renders the button (<code>toolButton</code>, <code>menuItem</code>,{' '}
								<code>historyItem</code>…). Adds that part’s class and style, and lets a custom Button
								render differently per place.
							</p>
						),
					},
				]}
			/>

			<H3 id='color-picker'>ColorPicker</H3>
			<p>
				A native color input. Any CSS color can be passed; it is shown as hex (see <code>toHexColor</code>).
				When the value is partly transparent (e.g. <code>rgba(255, 0, 0, 0.4)</code>), a picked color keeps that
				transparency and is passed to <code>onChange</code> as <code>rgba()</code>.
			</p>
			<PropTable
				rows={[
					{ name: 'value', type: 'string | undefined', required: true, description: <p>The color.</p> },
					{
						name: 'onChange',
						type: '(color: string) => void',
						required: true,
						description: <p>Called while the color is being picked (live preview).</p>,
					},
					{
						name: 'onChangeComplete',
						type: '(color: string) => void',
						description: <p>Called once the color is picked. Use it to record history.</p>,
					},
					{ name: 'aria-label', type: 'string', description: <p>Accessible name.</p> },
				]}
			/>

			<H3 id='number-input'>NumberInput</H3>
			<p>An integer input, clamped to min / max.</p>
			<PropTable
				rows={[
					{
						name: 'value',
						type: 'number | string | undefined',
						required: true,
						description: <p>The value.</p>,
					},
					{
						name: 'onChange',
						type: '(value: number) => void',
						required: true,
						description: <p>Called on every valid change.</p>,
					},
					{
						name: 'onChangeComplete',
						type: '(value: number) => void',
						description: <p>Called on blur and on Enter.</p>,
					},
					{ name: 'min, max', type: 'number', description: <p>Limits.</p> },
					{ name: 'aria-label', type: 'string', description: <p>Accessible name.</p> },
				]}
			/>

			<H3 id='slider'>Slider</H3>
			<p>A range input.</p>
			<PropTable
				rows={[
					{ name: 'value', type: 'number', required: true, description: <p>The value.</p> },
					{ name: 'min, max', type: 'number', required: true, description: <p>Range.</p> },
					{ name: 'step', type: 'number', default: '1', description: <p>Step.</p> },
					{
						name: 'onChange',
						type: '(value: number) => void',
						required: true,
						description: <p>Called while dragging.</p>,
					},
					{
						name: 'onChangeComplete',
						type: '(value: number) => void',
						description: <p>Called once the thumb is released.</p>,
					},
					{ name: 'aria-label', type: 'string', description: <p>Accessible name.</p> },
				]}
			/>

			<H3 id='select'>Select</H3>
			<PropTable
				rows={[
					{ name: 'value', type: 'string | undefined', required: true, description: <p>Selected value.</p> },
					{
						name: 'options',
						type: '{ value: string; label: string }[]',
						required: true,
						description: <p>The choices.</p>,
					},
					{
						name: 'onChange',
						type: '(value: string) => void',
						required: true,
						description: <p>Called with the new value.</p>,
					},
					{ name: 'aria-label', type: 'string', description: <p>Accessible name.</p> },
				]}
			/>

			<H3 id='field'>Field</H3>
			<p>An optional icon and label followed by controls, used to group the inputs of a panel.</p>
			<PropTable
				rows={[
					{ name: 'icon', type: 'ReactNode', description: <p>Icon before the label.</p> },
					{ name: 'label', type: 'string', description: <p>Label text.</p> },
					{ name: 'children', type: 'ReactNode', required: true, description: <p>The controls.</p> },
				]}
			/>

			<H3 id='segmented'>Segmented</H3>
			<p>A group of buttons of which one is active.</p>
			<PropTable
				rows={[
					{ name: 'value', type: 'string | undefined', required: true, description: <p>Active value.</p> },
					{
						name: 'options',
						type: 'SegmentedOption[]',
						required: true,
						description: (
							<p>
								<code>{'{ value: string; label: ReactNode; title?: string }'}</code>, <code>title</code>{' '}
								is also the accessible name.
							</p>
						),
					},
					{
						name: 'onChange',
						type: '(value: string) => void',
						required: true,
						description: <p>Called with the clicked value.</p>,
					},
				]}
			/>

			<H3 id='dropdown'>Dropdown</H3>
			<p>
				A trigger with a popup. It closes on a click outside and on <code>Escape</code>; opening is up to you.
				The popup is rendered into the editor root (a React portal) and positioned next to the trigger, so a
				toolbar that scrolls sideways on narrow screens does not cut it off. It stays inside the editor&rsquo;s
				width.
			</p>
			<PropTable
				rows={[
					{ name: 'open', type: 'boolean', required: true, description: <p>Whether the popup is shown.</p> },
					{
						name: 'onOpenChange',
						type: '(open: boolean) => void',
						required: true,
						description: <p>Called with false on outside clicks and Escape.</p>,
					},
					{ name: 'trigger', type: 'ReactNode', required: true, description: <p>The toggle button(s).</p> },
					{ name: 'children', type: 'ReactNode', required: true, description: <p>The popup content.</p> },
					{
						name: 'placement',
						type: "'top' | 'bottom'",
						default: "'top'",
						description: <p>Where the popup opens relative to the trigger.</p>,
					},
				]}
			/>

			<H3 id='divider'>Divider</H3>
			<p>
				A separator (<code>fp-divider</code>) between groups of controls. No props.
			</p>

			<H3 id='helpers'>cx and toHexColor</H3>
			<CodeBlock
				code={`import { cx, toHexColor } from 'fabri-pix';

cx('fp-button', active && 'is-active', undefined); // 'fp-button is-active'

toHexColor('#fa0'); // '#ffaa00'
toHexColor('rgba(37, 99, 235, 0.5)'); // '#2563eb' (alpha is dropped)
toHexColor('transparent'); // '#000000'`}
			/>
		</>
	);
}
