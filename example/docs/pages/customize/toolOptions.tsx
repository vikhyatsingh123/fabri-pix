import { useMemo, useRef, useState } from 'react';
import type { ImageEditorController } from 'fabri-pix';

import {
	Callout,
	CodeBlock,
	Demo,
	DemoButton,
	DemoControls,
	DemoEditor,
	DocLink,
	H2,
	H3,
	PageHeader,
	PropTable,
	type PropRow,
} from '../../ui';

const shapeRows = (extra: PropRow[] = []): PropRow[] => [
	{ name: 'fill', type: 'string', default: "'transparent'", description: 'Fill color.' },
	{ name: 'stroke', type: 'string', default: "'#ff0000'", description: 'Border color.' },
	{ name: 'strokeWidth', type: 'number', default: '5', description: 'Border width in image pixels.' },
	...extra,
];

const strokeRows = (width: string): PropRow[] => [
	{ name: 'stroke', type: 'string', default: "'#ff0000'", description: 'Line color.' },
	{ name: 'width', type: 'number', default: width, description: 'Line width.' },
];

const sections: { id: string; title: string; type: string; intro: React.ReactNode; rows: PropRow[] }[] = [
	{
		id: 'text',
		title: 'Text',
		type: 'TextOptions',
		intro: 'Used for every new text. The panel also shows bold, italic, underline, strikethrough, alignment and a font list.',
		rows: [
			{
				name: 'text',
				type: 'string',
				default: "'Add your text here'",
				description: 'Text of a new text object.',
			},
			{ name: 'fill', type: 'string', default: "'#ff0000'", description: 'Text color.' },
			{
				name: 'backgroundColor',
				type: 'string',
				default: "'#ffffff'",
				description: "Background behind the text, '' for none.",
			},
			{ name: 'fontSize', type: 'number', default: '20', description: 'Font size.' },
			{ name: 'fontFamily', type: 'string', default: "'Arial'", description: 'Font of new texts.' },
			{ name: 'fontWeight', type: 'string', default: "'normal'", description: "'normal' or 'bold'." },
			{ name: 'fontStyle', type: 'string', default: "'normal'", description: "'normal' or 'italic'." },
			{ name: 'textAlign', type: 'string', default: "'left'", description: "'left', 'center' or 'right'." },
			{ name: 'underline', type: 'boolean', default: 'false', description: 'Underlined text.' },
			{ name: 'linethrough', type: 'boolean', default: 'false', description: 'Strikethrough text.' },
			{
				name: 'fonts',
				type: 'string[]',
				default:
					"['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS', 'Impact']",
				description:
					'Fonts offered in the font select of the panel. An empty array hides the select. Web fonts must be loaded by your page.',
			},
		],
	},
	{
		id: 'emoji',
		title: 'Emoji',
		type: 'EmojiOptions',
		intro: 'The emoji placed by a click. The emoji picker of the toolbar button changes it.',
		rows: [{ name: 'emoji', type: 'string', default: "'😀'", description: 'Emoji character placed on click.' }],
	},
	{
		id: 'draw',
		title: 'Draw',
		type: 'DrawOptions',
		intro: 'The free-hand brush.',
		rows: [
			{ name: 'color', type: 'string', default: "'#ff0000'", description: 'Brush color.' },
			{ name: 'width', type: 'number', default: '2', description: 'Brush width.' },
		],
	},
	{
		id: 'steps',
		title: 'Steps',
		type: 'StepsOptions',
		intro: 'Numbered step markers: a frame and a round badge with the number.',
		rows: [
			{ name: 'borderColor', type: 'string', default: "'#ff0000'", description: 'Color of the frame.' },
			{
				name: 'backgroundColor',
				type: 'string',
				default: "'#ff0000'",
				description: 'Color of the number badge.',
			},
			{ name: 'fontColor', type: 'string', default: "'#ffffff'", description: 'Color of the number.' },
			{ name: 'fontSize', type: 'number', default: '20', description: 'Size of the number.' },
			{ name: 'strokeWidth', type: 'number', default: '2', description: 'Width of the frame.' },
			{
				name: 'stepNumber',
				type: 'number',
				default: '1',
				description:
					'Number of the next step. Set automatically to the highest number on the canvas + 1 when the tool is activated.',
			},
		],
	},
	{
		id: 'rectangle',
		title: 'Rectangle',
		type: 'RectangleOptions',
		intro: 'Placed centered on the click.',
		rows: shapeRows([
			{ name: 'width', type: 'number', default: '100', description: 'Width of a new rectangle.' },
			{ name: 'height', type: 'number', default: '50', description: 'Height of a new rectangle.' },
		]),
	},
	{
		id: 'circle',
		title: 'Circle',
		type: 'CircleOptions',
		intro: 'Placed centered on the click.',
		rows: shapeRows([{ name: 'radius', type: 'number', default: '50', description: 'Radius of a new circle.' }]),
	},
	{
		id: 'triangle',
		title: 'Triangle',
		type: 'TriangleOptions',
		intro: 'Placed centered on the click.',
		rows: shapeRows([
			{ name: 'width', type: 'number', default: '90', description: 'Width of a new triangle.' },
			{ name: 'height', type: 'number', default: '80', description: 'Height of a new triangle.' },
		]),
	},
	{
		id: 'star',
		title: 'Star',
		type: 'ShapeOptions',
		intro: 'An action tool: the star is added in the middle of the image.',
		rows: shapeRows(),
	},
	{
		id: 'arrow-shape',
		title: 'Arrow shape (arrowShape)',
		type: 'ArrowShapeOptions',
		intro: 'The filled block arrow of the Shapes group.',
		rows: [{ name: 'color', type: 'string', default: "'#ff0000'", description: 'Color of the arrow.' }],
	},
	{
		id: 'comment',
		title: 'Comment',
		type: 'CommentOptions',
		intro: 'A callout box with text, added in the middle of the image.',
		rows: [
			{ name: 'text', type: 'string', default: "'Textbox'", description: 'Text of a new callout.' },
			{ name: 'fill', type: 'string', default: "'#ff0000'", description: 'Box color.' },
			{ name: 'stroke', type: 'string', default: "'#0386b5'", description: 'Border color.' },
			{ name: 'strokeWidth', type: 'number', default: '2', description: 'Border width.' },
			{ name: 'textColor', type: 'string', default: "'#ffffff'", description: 'Text color.' },
			{ name: 'fontSize', type: 'number', default: '20', description: 'Font size.' },
			{ name: 'fontWeight', type: 'string', default: "'normal'", description: "'normal' or 'bold'." },
			{ name: 'fontStyle', type: 'string', default: "'normal'", description: "'normal' or 'italic'." },
		],
	},
	{
		id: 'image',
		title: 'Add Image (image)',
		type: 'ImageToolOptions',
		intro: 'Opens a file picker and adds the chosen file on top of the photo.',
		rows: [
			{
				name: 'accept',
				type: 'string',
				default: "'image/*'",
				description: (
					<>
						<code>accept</code> attribute of the file input, e.g. <code>'image/png,image/svg+xml'</code>.
					</>
				),
			},
		],
	},
	{
		id: 'icon',
		title: 'Icon',
		type: 'IconOptions',
		intro: 'Vector icons from a library of SVG paths.',
		rows: [
			{ name: 'icon', type: 'string', default: "'arrowRight'", description: 'Id of the icon placed on click.' },
			{ name: 'color', type: 'string', default: "'#ff0000'", description: 'Icon color.' },
			{ name: 'size', type: 'number', default: '60', description: 'Size of the longer side in image pixels.' },
			{
				name: 'library',
				type: 'IconShape[]',
				default: 'defaultIconLibrary',
				description: (
					<>
						Icons offered in the dropdown: <code>{'{ id, label, path, fillRule? }'}</code>.{' '}
						<code>path</code> is SVG path data of any view box.
					</>
				),
			},
		],
	},
	{ id: 'line', title: 'Line', type: 'StrokeOptions', intro: 'Straight lines.', rows: strokeRows('3') },
	{ id: 'arrow', title: 'Arrow', type: 'StrokeOptions', intro: 'Lines with an arrow head.', rows: strokeRows('4') },
	{
		id: 'path',
		title: 'Path',
		type: 'StrokeOptions',
		intro: 'Polylines made of clicked points.',
		rows: strokeRows('3'),
	},
	{
		id: 'crop',
		title: 'Crop',
		type: 'CropOptions',
		intro: 'The aspect ratio of the crop area and the ratio buttons of the panel.',
		rows: [
			{
				name: 'ratio',
				type: 'number | null',
				default: 'null',
				description: (
					<>
						Active ratio (width / height), <code>null</code> = free. E.g. <code>16 / 9</code> or{' '}
						<code>1</code>.
					</>
				),
			},
			{
				name: 'ratios',
				type: '{ label: string; value: number | null }[]',
				default: 'Custom, Square, 3:2, 4:3, 5:4, 7:5, 16:9',
				description: (
					<>
						Ratio buttons of the crop panel. Pass your own list to offer other ratios, each button shows its{' '}
						<code>label</code>. The built-in &ldquo;Custom&rdquo; and &ldquo;Square&rdquo; buttons are
						translated through <code>labels.ratioCustom</code> / <code>labels.ratioSquare</code> (see{' '}
						<DocLink to='labels'>labels</DocLink>).
					</>
				),
			},
		],
	},
	{
		id: 'resize',
		title: 'Resize',
		type: 'ResizeOptions',
		intro: 'The size of the exported image.',
		rows: [
			{
				name: 'keepAspect',
				type: 'boolean',
				default: 'true',
				description: 'Whether width and height change together.',
			},
			{
				name: 'presets',
				type: 'number[]',
				default: '[0.25, 0.5, 0.75, 1, 1.5, 2]',
				description: 'Scale buttons of the panel, 1 = original size.',
			},
		],
	},
];

interface DemoDefaults {
	textColor: string;
	fontSize: number;
	drawColor: string;
	drawWidth: number;
	stroke: string;
	square: boolean;
}

function DefaultsDemo() {
	const editorRef = useRef<ImageEditorController>(null);
	const [values, setValues] = useState<DemoDefaults>({
		textColor: '#ffffff',
		fontSize: 32,
		drawColor: '#00aaff',
		drawWidth: 6,
		stroke: '#22c55e',
		square: false,
	});
	const set = (partial: Partial<DemoDefaults>) => setValues((current) => ({ ...current, ...partial }));

	const defaults = useMemo(
		() => ({
			text: {
				fill: values.textColor,
				backgroundColor: '',
				fontSize: values.fontSize,
				fonts: ['Inter', 'Georgia', 'Courier New'],
			},
			draw: { color: values.drawColor, width: values.drawWidth },
			rectangle: { stroke: values.stroke, strokeWidth: 3 },
			circle: { stroke: values.stroke, strokeWidth: 3 },
			crop: { ratio: values.square ? 1 : null },
		}),
		[values],
	);

	const code = `const defaults = {
	text: { fill: '${values.textColor}', backgroundColor: '', fontSize: ${values.fontSize}, fonts: ['Inter', 'Georgia', 'Courier New'] },
	draw: { color: '${values.drawColor}', width: ${values.drawWidth} },
	rectangle: { stroke: '${values.stroke}', strokeWidth: 3 },
	circle: { stroke: '${values.stroke}', strokeWidth: 3 },
	crop: { ratio: ${values.square ? '1' : 'null'} },
};

<ImageEditor src={imageUrl} defaults={defaults} />`;

	return (
		<Demo
			title='Defaults per tool'
			description='Change a value, then use the Text, Draw, Rectangle, Circle or Crop tool. (The demo re-creates the editor when a default changes.)'
			code={code}
		>
			<DemoControls>
				<label>
					Text color{' '}
					<input type='color' value={values.textColor} onChange={(e) => set({ textColor: e.target.value })} />
				</label>
				<label>
					Font size
					<select value={values.fontSize} onChange={(e) => set({ fontSize: Number(e.target.value) })}>
						{[16, 24, 32, 48].map((size) => (
							<option key={size}>{size}</option>
						))}
					</select>
				</label>
				<label>
					Brush{' '}
					<input type='color' value={values.drawColor} onChange={(e) => set({ drawColor: e.target.value })} />
				</label>
				<label>
					Width
					<select value={values.drawWidth} onChange={(e) => set({ drawWidth: Number(e.target.value) })}>
						{[2, 6, 12].map((width) => (
							<option key={width}>{width}</option>
						))}
					</select>
				</label>
				<label>
					Shape border{' '}
					<input type='color' value={values.stroke} onChange={(e) => set({ stroke: e.target.value })} />
				</label>
				<label>
					<input
						type='checkbox'
						checked={values.square}
						onChange={(e) => set({ square: e.target.checked })}
					/>{' '}
					Square crop
				</label>
			</DemoControls>
			<DemoEditor
				key={JSON.stringify(values)}
				ref={editorRef}
				defaults={defaults}
				tools={['text', 'draw', 'rectangle', 'circle', 'crop']}
			/>
		</Demo>
	);
}

function SetToolOptionsDemo() {
	const editorRef = useRef<ImageEditorController>(null);
	const [current, setCurrent] = useState('');
	const show = () => setCurrent(JSON.stringify(editorRef.current?.getToolOptions('draw')));
	return (
		<Demo
			title='Change options at runtime'
			description='The buttons call setToolOptions on the draw tool and activate it. Draw on the image to see the result.'
			code={`const editor = useRef<ImageEditorController>(null);

<ImageEditor ref={editor} src={imageUrl} tools={['draw', 'text']} />

editor.current.setToolOptions('draw', { color: '#f59e0b', width: 10 });
editor.current.setActiveTool('draw');
editor.current.getToolOptions('draw'); // { color: '#f59e0b', width: 10 }`}
		>
			<DemoControls>
				{[
					['Thick amber', { color: '#f59e0b', width: 10 }],
					['Thin blue', { color: '#2563eb', width: 2 }],
					['Marker pink', { color: '#db2777', width: 20 }],
				].map(([label, options]) => (
					<DemoButton
						key={label as string}
						onClick={() => {
							editorRef.current?.setToolOptions('draw', options as Record<string, unknown>);
							editorRef.current?.setActiveTool('draw');
							show();
						}}
					>
						{label as string}
					</DemoButton>
				))}
				{current && <code>getToolOptions('draw') → {current}</code>}
			</DemoControls>
			<DemoEditor ref={editorRef} tools={['draw', 'text']} height={380} />
		</Demo>
	);
}

function ToolOptionsPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Tool defaults'
				lead='Every tool starts with default options: colors, sizes, fonts, crop ratios… Change them with the defaults prop, keyed by tool id.'
			/>

			<H2 id='defaults-prop'>The defaults prop</H2>
			<p>
				<code>defaults</code> is an object whose keys are tool ids and whose values are the options you want to
				change. You only pass what differs, everything else keeps the built-in value.
			</p>
			<CodeBlock
				code={`<ImageEditor
	src={imageUrl}
	defaults={{
		text: { fontSize: 32, fill: '#ffffff', backgroundColor: '#000000', fonts: ['Inter', 'Roboto', 'Georgia'] },
		draw: { color: '#00aaff', width: 4 },
		rectangle: { stroke: '#00aaff', strokeWidth: 3 },
		crop: { ratio: 16 / 9 },
		resize: { presets: [0.5, 1, 2] },
	}}
/>`}
			/>
			<DefaultsDemo />

			<H3 id='how-options-work'>How options behave</H3>
			<ul>
				<li>
					The options of a tool are its <code>defaultOptions</code>, then your <code>defaults</code> on top.
				</li>
				<li>
					The options panel edits the selected object. When nothing is selected it edits the tool&apos;s
					options, so the next object uses them. A value applied to an object is also remembered for the next
					one.
				</li>
				<li>Options are kept for the lifetime of the editor, also across image changes.</li>
			</ul>
			<Callout type='note' title='Changing defaults later'>
				<p>
					When the <code>defaults</code> prop changes, the values that changed are applied to the tool options
					right away. Options the user picked for other keys are kept: changing <code>text.fontSize</code>{' '}
					does not reset a text color the user chose. To start over with all defaults, re-create the editor
					with a new React <code>key</code>.
				</p>
			</Callout>

			<H2 id='at-runtime'>Read and change options at runtime</H2>
			<p>
				The editor controller has <DocLink to='api/controller#gettooloptions'>getToolOptions(id)</DocLink> and{' '}
				<DocLink to='api/controller#settooloptions'>setToolOptions(id, options)</DocLink>. Inside the editor
				(your own components), the <DocLink to='api/hooks#usetooloptions'>useToolOptions</DocLink> hook returns
				the options and a setter and re-renders on changes.
			</p>
			<SetToolOptionsDemo />
			<CodeBlock
				title='Inside a custom component'
				code={`import { useToolOptions, type DrawOptions } from 'fabri-pix';

function BrushSize() {
	const [options, setOptions] = useToolOptions<DrawOptions>('draw');
	return (
		<input
			type='range'
			min={1}
			max={30}
			value={options.width}
			onChange={(event) => setOptions({ width: Number(event.target.value) })}
		/>
	);
}`}
			/>

			<H2 id='reference'>Options of every tool</H2>
			<p>
				All option types are exported for TypeScript: <code>TextOptions</code>, <code>DrawOptions</code>,{' '}
				<code>StepsOptions</code>, <code>RectangleOptions</code>… The tools <code>transform</code>,{' '}
				<code>adjust</code>, <code>filter</code> and <code>redact</code> have no options.
			</p>
			{sections.map((section) => (
				<section key={section.id}>
					<H3 id={`options-${section.id}`}>
						{section.title} <code>{section.type}</code>
					</H3>
					<p>{section.intro}</p>
					<PropTable nameLabel='Option' rows={section.rows} />
				</section>
			))}

			<H2 id='icon-library'>Extending the icon library</H2>
			<p>
				The icon tool ships 12 icons (<code>defaultIconLibrary</code>): arrowRight, arrowLeft, arrowUp,
				arrowDown, check, cancel, heart, location, polygon, star, bubble and warning. Add your own SVG paths or
				replace the list:
			</p>
			<CodeBlock
				code={`import { defaultIconLibrary } from 'fabri-pix';

<ImageEditor
	src={imageUrl}
	defaults={{
		icon: {
			icon: 'logo',
			library: [...defaultIconLibrary, { id: 'logo', label: 'Logo', path: 'M12 2L2 22H22Z' }],
		},
	}}
/>`}
			/>

			<H2 id='crop-ratios'>Custom crop ratios</H2>
			<p>
				A crop panel for portrait photos and banners. Every button shows the <code>label</code> you give it;
				only the built-in &ldquo;Custom&rdquo; and &ldquo;Square&rdquo; labels are replaced by{' '}
				<code>labels.ratioCustom</code> / <code>labels.ratioSquare</code>.
			</p>
			<CodeBlock
				code={`<ImageEditor
	src={avatarUrl}
	tools={['crop', 'transform']}
	defaults={{
		crop: {
			ratio: 4 / 5,
			ratios: [
				{ label: 'Portrait', value: 4 / 5 },
				{ label: 'Banner', value: 3 },
				{ label: 'Free', value: null },
			],
		},
	}}
/>`}
			/>
		</>
	);
}

export default ToolOptionsPage;
