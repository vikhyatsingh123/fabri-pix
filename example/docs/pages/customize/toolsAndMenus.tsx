import { useState } from 'react';
import type { MenuDefinition } from 'fabri-pix';

import {
	Callout,
	CodeBlock,
	Demo,
	DemoControls,
	DemoEditor,
	DocLink,
	H2,
	H3,
	PageHeader,
	PropTable,
	Table,
} from '../../ui';

const builtInTools: { id: string; label: string; kind: string; menu: string; description: string }[] = [
	{
		id: 'steps',
		label: 'Steps',
		kind: 'toggle',
		menu: 'Annotate',
		description: 'Drag a frame around an area, a numbered badge is added at its corner. Numbers count up.',
	},
	{
		id: 'rectangle',
		label: 'Rectangle',
		kind: 'toggle',
		menu: 'Annotate › Shapes',
		description: 'Click to place a rectangle.',
	},
	{
		id: 'circle',
		label: 'Circle',
		kind: 'toggle',
		menu: 'Annotate › Shapes',
		description: 'Click to place a circle.',
	},
	{
		id: 'triangle',
		label: 'Triangle',
		kind: 'toggle',
		menu: 'Annotate › Shapes',
		description: 'Click to place a triangle.',
	},
	{
		id: 'arrowShape',
		label: 'Arrow',
		kind: 'toggle',
		menu: 'Annotate › Shapes',
		description: 'Click to place a filled block arrow shape.',
	},
	{
		id: 'star',
		label: 'Star',
		kind: 'action',
		menu: 'Annotate › Shapes',
		description: 'Adds a star in the middle of the image.',
	},
	{
		id: 'comment',
		label: 'Comment',
		kind: 'action',
		menu: 'Annotate › Shapes',
		description: 'Adds a callout box with editable text in the middle of the image.',
	},
	{
		id: 'image',
		label: 'Add Image',
		kind: 'action',
		menu: 'Annotate › Shapes',
		description: 'Opens a file picker and adds the chosen image (a logo, a sticker…) on top of the photo.',
	},
	{
		id: 'icon',
		label: 'Icon',
		kind: 'toggle, own button',
		menu: 'Annotate',
		description: 'Click to place an icon. The button has a dropdown to choose the icon from the icon library.',
	},
	{
		id: 'emoji',
		label: 'Emoji',
		kind: 'toggle, own button',
		menu: 'Annotate',
		description: 'Click to place an emoji. The button opens an emoji picker (loaded on first use).',
	},
	{ id: 'text', label: 'Text', kind: 'toggle', menu: 'Annotate', description: 'Click to add an editable text.' },
	{ id: 'draw', label: 'Draw', kind: 'toggle', menu: 'Annotate', description: 'Free-hand drawing with a brush.' },
	{ id: 'line', label: 'Line', kind: 'toggle', menu: 'Annotate', description: 'Drag to draw a straight line.' },
	{
		id: 'arrow',
		label: 'Arrow',
		kind: 'toggle',
		menu: 'Annotate',
		description: 'Drag to draw an arrow (line with an arrow head).',
	},
	{
		id: 'path',
		label: 'Path',
		kind: 'toggle',
		menu: 'Annotate',
		description: 'Click to add points of a polyline. Double-click, press Escape or switch tools to finish it.',
	},
	{
		id: 'crop',
		label: 'Crop',
		kind: 'toggle',
		menu: 'Crop',
		description: 'Crop the image, freely or with a fixed aspect ratio.',
	},
	{
		id: 'transform',
		label: 'Rotate & Flip',
		kind: 'toggle',
		menu: 'Rotate',
		description: 'Rotate in 90° steps or to any angle, flip horizontally or vertically.',
	},
	{
		id: 'resize',
		label: 'Resize',
		kind: 'toggle',
		menu: 'Resize',
		description: 'Change the pixel size of the exported image.',
	},
	{
		id: 'adjust',
		label: 'Adjust',
		kind: 'toggle',
		menu: 'Adjust',
		description: 'Brightness, contrast, saturation, vibrance, hue and gamma sliders.',
	},
	{
		id: 'filter',
		label: 'Filter',
		kind: 'toggle',
		menu: 'Filter',
		description: 'Effects like grayscale, sepia, vintage, blur, pixelate, tint…',
	},
	{
		id: 'redact',
		label: 'Redact',
		kind: 'toggle',
		menu: 'Redact',
		description: 'Drag over sensitive parts to blur them. The blur is part of the exported image.',
	},
];

const defaultMenusRows = [
	[
		'annotate',
		'Annotate',
		'—',
		'steps, Shapes group (rectangle, circle, triangle, arrowShape, star, comment, image), icon, emoji, text, draw, line, arrow, path',
	],
	['crop', 'Crop', 'crop', 'crop'],
	['transform', 'Rotate', 'transform', 'transform'],
	['resize', 'Resize', 'resize', 'resize'],
	['adjust', 'Adjust', 'adjust', 'adjust'],
	['filter', 'Filter', 'filter', 'filter'],
	['redact', 'Redact', 'redact', 'redact'],
];

const pickableTools = builtInTools.map((tool) => tool.id);

function ToolPickerDemo() {
	const [selected, setSelected] = useState<string[]>(['text', 'draw', 'arrow', 'rectangle', 'crop', 'redact']);
	// a stable array per selection, so the editor only reconfigures when it changes
	const toggle = (id: string) =>
		setSelected((current) =>
			current.includes(id)
				? current.filter((item) => item !== id)
				: pickableTools.filter((tool) => [...current, id].includes(tool)),
		);
	const code = `<ImageEditor
	src={imageUrl}
	tools={[${selected.map((id) => `'${id}'`).join(', ')}]}
/>`;
	return (
		<Demo
			title='Pick the tools'
			description='Tick tools on and off. Menus without any visible tool disappear, and so does the menu bar when only one menu is left.'
			code={code}
		>
			<DemoControls>
				{pickableTools.map((id) => (
					<label key={id}>
						<input type='checkbox' checked={selected.includes(id)} onChange={() => toggle(id)} />
						{id}
					</label>
				))}
			</DemoControls>
			<DemoEditor tools={selected} />
		</Demo>
	);
}

const customMenus: MenuDefinition[] = [
	{
		id: 'mark',
		label: 'Mark up',
		tools: [
			'arrow',
			'text',
			{ id: 'shapes', label: 'Shapes', tools: ['rectangle', 'circle', 'star'] },
			{ id: 'stickers', label: 'Stickers', tools: ['icon', 'emoji'] },
		],
	},
	{ id: 'crop', label: 'Crop', tools: ['crop'], defaultTool: 'crop' },
	{ id: 'privacy', label: 'Privacy', tools: ['redact'], defaultTool: 'redact' },
];

const customMenusCode = `import type { MenuDefinition } from 'fabri-pix';

// defined outside the component, so the array is not re-created on every render
const menus: MenuDefinition[] = [
	{
		id: 'mark',
		label: 'Mark up',
		tools: [
			'arrow',
			'text',
			// a group is one toolbar button with a dropdown
			{ id: 'shapes', label: 'Shapes', tools: ['rectangle', 'circle', 'star'] },
			{ id: 'stickers', label: 'Stickers', tools: ['icon', 'emoji'] },
		],
	},
	// defaultTool is activated as soon as the menu is opened
	{ id: 'crop', label: 'Crop', tools: ['crop'], defaultTool: 'crop' },
	{ id: 'privacy', label: 'Privacy', tools: ['redact'], defaultTool: 'redact' },
];

<ImageEditor src={imageUrl} menus={menus} />`;

function ToolsAndMenusPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Tools & menus'
				lead='Choose which tools the editor offers and how they are grouped. Two props do it: tools decides what is available, menus decides where it is shown.'
			/>

			<H2 id='how-it-works'>How tools and menus work</H2>
			<p>
				A <strong>tool</strong> is one thing the user can do: draw, add text, crop, blur… Every tool has an{' '}
				<strong>id</strong> like <code>'text'</code> or <code>'crop'</code>. A <strong>menu</strong> is a tab in
				the menu bar (Annotate, Crop, Rotate…). When a menu is opened, the toolbar shows the tools of that menu.
			</p>
			<ul>
				<li>
					<code>tools</code>: which tools exist at all. Leave it out to get all 21 built-in tools.
				</li>
				<li>
					<code>menus</code>: the tabs, their order and which tools each one contains. Leave it out to get the
					default menus.
				</li>
			</ul>
			<p>
				The two work together: a menu only shows the tools that are also in <code>tools</code>.
			</p>

			<H2 id='choose-tools'>Choose the tools</H2>
			<p>
				Pass an array of tool ids. Only these tools are shown, in the menus they belong to. Everything else (the
				history, zoom, saving) keeps working.
			</p>
			<CodeBlock code={`<ImageEditor src={imageUrl} tools={['text', 'draw', 'arrow', 'crop']} />`} />
			<ToolPickerDemo />
			<Callout type='tip' title='Inline arrays are fine'>
				<p>
					The editor compares <code>tools</code> and <code>menus</code> by content, so a new array literal on
					every render does not reconfigure anything. Only custom tool <em>definitions</em> should be created
					outside your component (or with <code>useMemo</code>), because a new definition object is a
					different tool.
				</p>
			</Callout>

			<H3 id='custom-tool-entries'>Custom tools in the list</H3>
			<p>
				Besides ids, <code>tools</code> accepts tool <strong>definitions</strong> (objects). A definition with a
				new id adds your own tool; a definition with the id of a built-in tool replaces it. Your own tools that
				are not part of any menu are shown in the first menu.
			</p>
			<CodeBlock
				code={`import { textTool, type ToolDefinition } from 'fabri-pix';

const highlightTool: ToolDefinition = { id: 'highlight', label: 'Highlight', activate: (context) => { /* … */ } };

<ImageEditor
	src={imageUrl}
	tools={[
		'draw',
		highlightTool, // a new tool, shown in the first menu
		{ ...textTool, label: 'Write' }, // replaces the built-in text tool
	]}
/>`}
			/>
			<p>
				Writing tools is explained in <DocLink to='custom-tools'>Custom tools</DocLink>.
			</p>

			<H2 id='built-in-tools'>Built-in tools</H2>
			<p>
				<strong>toggle</strong> tools stay active until another tool is chosen (click the button again to turn
				it off). <strong>action</strong> tools run once when their button is clicked. Tools marked{' '}
				<em>own button</em> render a custom toolbar button with a dropdown.
			</p>
			<Table
				head={['Id', 'Label', 'Kind', 'Default menu', 'What it does']}
				rows={builtInTools.map((tool) => [
					<code key='id'>{tool.id}</code>,
					tool.label,
					tool.kind,
					tool.menu,
					tool.description,
				])}
			/>
			<Callout>
				<p>
					All built-in definitions are exported (<code>textTool</code>, <code>cropTool</code>,{' '}
					<code>redactTool</code>…) together with <code>builtInTools</code>, the full list. See{' '}
					<DocLink to='api/utilities'>Constants & utilities</DocLink>.
				</p>
			</Callout>

			<H2 id='default-menus'>Default menus</H2>
			<Table
				head={['Menu id', 'Label', 'defaultTool', 'Tools']}
				rows={defaultMenusRows.map(([id, label, defaultTool, tools]) => [
					<code key='id'>{id}</code>,
					label,
					defaultTool === '—' ? '—' : <code key='d'>{defaultTool}</code>,
					tools,
				])}
			/>
			<p>
				The default menus are exported as <code>defaultMenus</code>, so you can start from them:
			</p>
			<CodeBlock
				code={`import { defaultMenus } from 'fabri-pix';

// the default menus without Resize, and Crop moved to the front
const menus = [
	defaultMenus.find((menu) => menu.id === 'crop')!,
	...defaultMenus.filter((menu) => menu.id !== 'crop' && menu.id !== 'resize'),
];`}
			/>

			<H2 id='custom-menus'>Arrange your own menus</H2>
			<p>
				Pass <code>menus</code> to decide the tabs yourself. Each item in a menu&apos;s <code>tools</code> is
				either a tool id or a <strong>group</strong>: an object with its own <code>id</code>, <code>label</code>{' '}
				and <code>tools</code>. A group is shown as one toolbar button with a dropdown, like the default Shapes
				button.
			</p>
			<Demo title='Three custom menus with groups' code={customMenusCode}>
				<DemoEditor menus={customMenus} />
			</Demo>

			<H3 id='menu-definition'>MenuDefinition</H3>
			<PropTable
				nameLabel='Property'
				rows={[
					{
						name: 'id',
						type: 'string',
						required: true,
						description: 'Unique id. Also the key for labels.menus and icons.menus.',
					},
					{ name: 'label', type: 'string', required: true, description: 'Text of the tab.' },
					{ name: 'icon', type: 'ReactNode', description: 'Icon of the tab.' },
					{
						name: 'tools',
						type: '(string | ToolGroup)[]',
						required: true,
						description: 'Tool ids and groups shown in the toolbar while the menu is open, in this order.',
					},
					{
						name: 'defaultTool',
						type: 'string',
						description: (
							<>
								Tool activated automatically when the menu is opened, e.g. <code>'crop'</code>. A menu
								whose only tool is its default tool shows an empty toolbar (the options panel is
								enough).
							</>
						),
					},
				]}
			/>

			<H3 id='tool-group'>ToolGroup</H3>
			<PropTable
				nameLabel='Property'
				rows={[
					{
						name: 'id',
						type: 'string',
						required: true,
						description: 'Unique id, also used as key in labels.menus / icons.menus.',
					},
					{ name: 'label', type: 'string', required: true, description: 'Text of the group button.' },
					{ name: 'icon', type: 'ReactNode', description: 'Icon of the group button.' },
					{ name: 'tools', type: 'string[]', required: true, description: 'Tool ids in the dropdown.' },
				]}
			/>
			<p>
				Clicking the group button activates the first toggle tool of the group (or opens the dropdown if the
				group only has action tools). While one of its tools is active, the button shows that tool.
			</p>

			<H2 id='rules'>Rules worth knowing</H2>
			<ul>
				<li>Menus that end up without any visible tool are hidden.</li>
				<li>
					When only one menu is left, the menu bar is hidden completely:{' '}
					<code>tools={`{['text', 'draw']}`}</code> gives a single toolbar without tabs.
				</li>
				<li>Groups without any visible tool are removed; a group keeps only its visible tools.</li>
				<li>A defaultTool which is not visible is ignored.</li>
				<li>
					Custom tools (definitions in <code>tools</code>) that no menu mentions are appended to the first
					menu. If there are no menus at all, a menu called <em>Tools</em> is created for them.
				</li>
				<li>
					Switching tools or menus from code:{' '}
					<DocLink to='api/controller#setactivetool'>setActiveTool</DocLink>,{' '}
					<DocLink to='api/controller#toggletool'>toggleTool</DocLink> and{' '}
					<DocLink to='api/controller#setmenu'>setMenu</DocLink>.
				</li>
				<li>
					Rename tools and menus with <DocLink to='labels'>labels.tools / labels.menus</DocLink>, change their
					icons with <DocLink to='icons'>icons.tools / icons.menus</DocLink>.
				</li>
			</ul>
		</>
	);
}

export default ToolsAndMenusPage;
