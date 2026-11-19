import {
	builtInFilters,
	builtInShapes,
	builtInTools,
	defaultIconLibrary,
	defaultMenus,
	defaultShortcuts,
	MAX_ZOOM,
	MIN_ZOOM,
	SCENE_REFERENCE_SIZE,
	ShapeType,
} from 'fabri-pix';

import { Callout, CodeBlock, DocLink, H2, H3, PageHeader, Table } from '../../ui';

const codeList = (items: string[]) =>
	items.map((item, index) => (
		<span key={item}>
			{index > 0 && ', '}
			<code>{item}</code>
		</span>
	));

export default function UtilitiesPage() {
	return (
		<>
			<PageHeader
				eyebrow='API reference'
				title='Constants & utilities'
				lead='The default configuration of the editor and a few helpers. Use them to extend the defaults instead of copying them.'
			/>

			<H2 id='default-shortcuts'>defaultShortcuts</H2>
			<p>
				The default key bindings, keyed by action. <code>mod</code> is ⌘ on macOS and Ctrl elsewhere. Pass
				changes through <DocLink to='keyboard-shortcuts'>keyboardShortcuts</DocLink>.
			</p>
			<Table
				head={['Action', 'Keys']}
				rows={Object.entries(defaultShortcuts).map(([action, keys]) => [
					<code key='a'>{action}</code>,
					<span key='k'>{codeList(keys)}</span>,
				])}
			/>
			<CodeBlock
				code={`import { defaultShortcuts } from 'fabri-pix';

// add a second binding, keep the default one
<ImageEditor src={url} keyboardShortcuts={{ duplicate: [...defaultShortcuts.duplicate, 'mod+j'] }} />`}
			/>

			<H2 id='built-in-tools'>builtInTools and the tool definitions</H2>
			<p>
				<code>builtInTools</code> is the array of all {builtInTools.length} built-in tool definitions. Each one
				is also exported on its own, so you can spread and change it (see{' '}
				<DocLink to='custom-tools#override-built-in'>Changing a built-in tool</DocLink>), and so are their
				option panels for use in your own tools.
			</p>
			<Table
				head={['Id', 'Export', 'Type', 'Options panel']}
				rows={[
					['steps', 'stepsTool', 'toggle', 'StepsPanel'],
					['rectangle', 'rectangleTool', 'toggle', 'ShapesPanel'],
					['circle', 'circleTool', 'toggle', 'ShapesPanel'],
					['triangle', 'triangleTool', 'toggle', 'ShapesPanel'],
					['arrowShape', 'arrowShapeTool', 'toggle', 'ArrowShapePanel'],
					['star', 'starTool', 'action', 'ShapesPanel'],
					['comment', 'commentTool', 'action', 'CommentPanel'],
					['image', 'imageTool', 'action', '—'],
					['icon', 'iconTool', 'toggle', 'IconPanel (+ IconToolButton)'],
					['emoji', 'emojiTool', 'toggle', '— (EmojiToolButton)'],
					['text', 'textTool', 'toggle', 'TextPanel'],
					['draw', 'drawTool', 'toggle', 'DrawPanel'],
					['line', 'lineTool', 'toggle', 'StrokePanel'],
					['arrow', 'arrowTool', 'toggle', 'StrokePanel'],
					['path', 'pathTool', 'toggle', 'StrokePanel'],
					['crop', 'cropTool', 'toggle', 'CropPanel'],
					['transform', 'transformTool', 'toggle', 'TransformPanel'],
					['resize', 'resizeTool', 'toggle', 'ResizePanel'],
					['adjust', 'adjustTool', 'toggle', 'AdjustPanel'],
					['filter', 'filterTool', 'toggle', 'FilterPanel'],
					['redact', 'redactTool', 'toggle', '—'],
				].map(([id, name, type, panel]) => [
					<code key='i'>{id}</code>,
					<code key='n'>{name}</code>,
					type,
					panel,
				])}
			/>
			<CodeBlock
				code={`import { builtInTools, ShapesPanel, type ToolDefinition } from 'fabri-pix';

// ids of all built-in tools
const ids = builtInTools.map((tool) => tool.id);

// every built-in tool except redact
<ImageEditor src={url} tools={ids.filter((id) => id !== 'redact')} />

// reuse a built-in panel (fill, stroke color and width) in your own tool
const myShapeTool: ToolDefinition = { id: 'myShape', label: 'My shape', OptionsPanel: ShapesPanel, /* ... */ };`}
			/>
			<Callout title='Verify against your version'>
				<p>
					The ids of the built-in tools in this version are: {codeList(builtInTools.map((tool) => tool.id))}.
				</p>
			</Callout>

			<H2 id='default-menus'>defaultMenus</H2>
			<p>
				The default menus (tabs). Pass your own through <DocLink to='tools-and-menus'>menus</DocLink>, e.g. to
				add one to the defaults.
			</p>
			<Table
				head={['Id', 'Label', 'Tools', 'Default tool']}
				rows={defaultMenus.map((menu) => [
					<code key='i'>{menu.id}</code>,
					menu.label,
					<span key='t'>
						{codeList(
							menu.tools.map((item) =>
								typeof item === 'string' ? item : `${item.id}: [${item.tools.join(', ')}]`,
							),
						)}
					</span>,
					menu.defaultTool ? <code key='d'>{menu.defaultTool}</code> : '—',
				])}
			/>
			<CodeBlock
				code={`import { defaultMenus, type MenuDefinition } from 'fabri-pix';

const menus: MenuDefinition[] = [
  ...defaultMenus,
  { id: 'brand', label: 'Brand', tools: ['watermark', 'logo'] },
];

<ImageEditor src={url} menus={menus} tools={[...builtInIds, watermarkTool, logoTool]} />`}
			/>

			<H2 id='built-in-filters'>builtInFilters</H2>
			<p>
				All filter definitions in the order they are applied. <code>group: &apos;adjust&apos;</code> filters are
				the sliders of the Adjust menu, the others are in the Filter menu. See{' '}
				<DocLink to='filters'>Filters &amp; adjustments</DocLink>.
			</p>
			<Table
				head={['Id', 'Label', 'Group', 'Default options']}
				rows={builtInFilters.map((filter) => [
					<code key='i'>{filter.id}</code>,
					filter.label,
					filter.group ?? 'filter',
					filter.defaultOptions ? <code key='o'>{JSON.stringify(filter.defaultOptions)}</code> : '—',
				])}
			/>

			<H2 id='built-in-shapes'>builtInShapes</H2>
			<p>
				The <DocLink to='custom-shapes'>shape definitions</DocLink> of the built-in objects (
				{builtInShapes.length} in total), including helpers and the editing UI. A definition in the{' '}
				<code>shapes</code> prop with the same <code>type</code> replaces the built-in one.
			</p>

			<H2 id='shape-type'>ShapeType</H2>
			<p>
				The <code>shapeType</code> values of the built-in objects. They are stored in saved JSON and never
				change. Use them to find objects or to call <code>addShape</code>.
			</p>
			<CodeBlock
				code={`import { ShapeType } from 'fabri-pix';

const texts = editor.canvas.getObjects().filter((object) => object.shapeType === ShapeType.TEXT);
await editor.addShape(ShapeType.RECTANGLE, { left: 40, top: 40, width: 200, height: 100 });`}
			/>
			<Table
				head={['Key', 'Value', 'Kind']}
				rows={Object.entries(ShapeType).map(([key, value]) => {
					const definition = builtInShapes.find((shape) => shape.type === value);
					const kind = !definition
						? '—'
						: definition.transient
							? 'editing UI'
							: definition.helper
								? 'part of another object'
								: `object${definition.create ? ', addShape' : ''}`;
					return [<code key='k'>{key}</code>, <code key='v'>{`'${value}'`}</code>, kind];
				})}
			/>

			<H2 id='icon-library'>defaultIconLibrary</H2>
			<p>The icons of the Icon tool, as 24 × 24 SVG paths. Extend or replace them through the tool’s defaults:</p>
			<CodeBlock
				code={`import { defaultIconLibrary, type IconShape } from 'fabri-pix';

const logo: IconShape = { id: 'logo', label: 'Logo', path: 'M12 2L2 22H22Z' };

<ImageEditor src={url} defaults={{ icon: { library: [...defaultIconLibrary, logo], icon: 'logo' } }} />`}
			/>
			<div className='ex-icons'>
				{defaultIconLibrary.map((icon) => (
					<figure key={icon.id} className='ex-icon'>
						<svg viewBox='0 0 24 24' width='28' height='28' aria-hidden='true'>
							<path d={icon.path} fill='currentColor' fillRule={icon.fillRule ?? 'nonzero'} />
						</svg>
						<figcaption>
							<code>{icon.id}</code>
						</figcaption>
					</figure>
				))}
			</div>

			<H2 id='labels-and-icons'>defaultLabels and defaultIcons</H2>
			<p>
				All default texts and icons of the UI. You never need to pass them back in (the <code>labels</code> and{' '}
				<code>icons</code> props are merged on top), but they are handy to build on:
			</p>
			<CodeBlock
				code={`import { defaultIcons, defaultLabels } from 'fabri-pix';

// reuse an icon of the editor in your own button
<button>{defaultIcons.save} {defaultLabels.save}</button>`}
			/>
			<p>
				The keys are listed in <DocLink to='labels'>Labels &amp; translations</DocLink> and{' '}
				<DocLink to='icons'>Icons</DocLink>.
			</p>

			<H2 id='scene-size'>SCENE_REFERENCE_SIZE</H2>
			<p>
				<code>
					{'{'} width: {SCENE_REFERENCE_SIZE.width}, height: {SCENE_REFERENCE_SIZE.height} {'}'}
				</code>
				. Every image is scaled to fit into this box when it loads, and object coordinates are relative to it.
				This is why saved JSON looks the same on every screen. The visible size is applied on top as a zoom. Use{' '}
				<code>editor.getSceneSize()</code> for the exact size of the current image in these coordinates (see{' '}
				<DocLink to='editor-state'>Editor state &amp; JSON</DocLink>).
			</p>

			<H2 id='zoom-limits'>MIN_ZOOM and MAX_ZOOM</H2>
			<p>
				The range of <code>editor.setZoom()</code>: {MIN_ZOOM} (the image fits the view) to {MAX_ZOOM}.
			</p>

			<H2 id='functions'>Functions</H2>
			<H3 id='generate-id'>generateId()</H3>
			<p>
				Returns a unique id for a new object: <code>crypto.randomUUID()</code> where available, a random string
				otherwise (e.g. on plain http).
			</p>
			<CodeBlock code={`rect.set({ id: generateId(), shapeType: 'highlight' });`} />

			<H3 id='download-blob'>downloadBlob(blob, fileName)</H3>
			<p>
				Downloads a Blob as a file. The Save button uses it when there is no <code>onSave</code>.
			</p>
			<CodeBlock
				code={`import { downloadBlob } from 'fabri-pix';

const blob = await editor.exportImage({ format: 'webp', quality: 0.8 });
downloadBlob(blob, 'photo.webp');`}
			/>

			<H3 id='apply-crop-mask'>applyCropMask(canvas)</H3>
			<p>
				Turns the crop rectangle that is currently drawn into the crop of the image (a clip path) and removes
				the rectangle. Returns <code>false</code> when no crop rectangle exists. The crop tool calls it when you
				leave it; you only need it in a replacement crop panel.
			</p>
			<CodeBlock
				code={`import { applyCropMask } from 'fabri-pix';

if (applyCropMask(editor.canvas!)) {
  editor.commit();
}`}
			/>

			<H3 id='cx-hex'>cx(...classNames) and toHexColor(color)</H3>
			<p>
				<code>cx</code> joins class names and skips falsy values. <code>toHexColor</code> converts{' '}
				<code>#rgb</code>, <code>#rrggbb</code> and <code>rgb()</code> / <code>rgba()</code> colors to{' '}
				<code>#rrggbb</code> for color inputs (alpha is dropped, anything else becomes <code>#000000</code>).
			</p>
			<CodeBlock
				code={`cx('fp-button', isActive && 'fp-button--active'); // 'fp-button fp-button--active'
toHexColor('rgb(255, 0, 0)'); // '#ff0000'`}
			/>

			<H3 id='tool-helpers'>Tool helpers</H3>
			<p>
				<code>placeOnClick</code>, <code>followCursor</code>, <code>createCursorCache</code> and{' '}
				<code>usePanel</code> are described in <DocLink to='custom-tools#helpers'>Custom tools</DocLink>.
			</p>
		</>
	);
}
