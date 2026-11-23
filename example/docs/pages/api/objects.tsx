import { ApiMethod, ApiPlayground, Callout, CodeBlock, DocLink, H2, H3, PageHeader, Table } from '../../ui';
import { describe, ensureSelection, lastObject, objectCount } from './shared';

const LOGO_SVG =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='80'%3E%3Crect width='240' height='80' rx='16' fill='%232563eb'/%3E%3Ctext x='120' y='52' font-family='Arial' font-size='32' font-weight='700' fill='white' text-anchor='middle'%3EFabriPix%3C/text%3E%3C/svg%3E";

const c = (text: string) => <code>{text}</code>;

const shapeRows = [
	[
		c('rectangle'),
		<>
			{c('left')}, {c('top')}, {c('width')} (100), {c('height')} (50), {c('fill')} ('transparent'), {c('stroke')}{' '}
			('#ff0000'), {c('strokeWidth')} (5), {c('rx')} / {c('ry')} (0), {c('angle')}
		</>,
		'Selected after adding.',
	],
	[
		c('circle'),
		<>
			{c('left')}, {c('top')}, {c('radius')} (50), {c('fill')}, {c('stroke')}, {c('strokeWidth')}
		</>,
		'left / top is the top-left of the bounding box.',
	],
	[
		c('triangle'),
		<>
			{c('left')}, {c('top')}, {c('width')} (90), {c('height')} (80), {c('fill')}, {c('stroke')},{' '}
			{c('strokeWidth')}, any Fabric <code>Triangle</code> option
		</>,
		'',
	],
	[
		c('star'),
		<>
			{c('left')}, {c('top')}, {c('width')} (90), {c('height')} (95), {c('fill')}, {c('stroke')},{' '}
			{c('strokeWidth')}
		</>,
		'',
	],
	[
		c('text'),
		<>
			{c('text')} ('Text'), {c('left')}, {c('top')}, {c('fill')} ('#000000'), {c('backgroundColor')} (''),{' '}
			{c('fontFamily')} ('Arial'), {c('fontSize')} (20), {c('fontWeight')}, {c('fontStyle')}, {c('textAlign')},{' '}
			{c('underline')}, {c('linethrough')}
		</>,
		'Editable text (double click).',
	],
	[
		c('emoji'),
		<>
			{c('text')} ('😀'), {c('left')}, {c('top')}, {c('fontSize')} (40), {c('scaleX')} / {c('scaleY')}
		</>,
		'Size it with fontSize (or scale).',
	],
	[
		c('icon'),
		<>
			<strong>{c('path')}</strong> (SVG path data, required), {c('size')} (60, longer side), {c('left')} /{' '}
			{c('top')} (the <em>center</em>), {c('fill')} ('#ff0000'), {c('fillRule')}
		</>,
		<>
			Paths from <code>defaultIconLibrary</code> work too.
		</>,
	],
	[
		c('line'),
		<>
			{c('points')} ([x1, y1, x2, y2], default [0, 0, 100, 0]), {c('stroke')} ('#ff0000'), {c('strokeWidth')} (3)
		</>,
		'',
	],
	[
		c('advanced_arrow'),
		<>
			<strong>{c('points')}</strong> ([{'{ x, y }'}, {'{ x, y }'}], required), {c('stroke')} ('#ff0000'),{' '}
			{c('strokeWidth')} (4)
		</>,
		'The Arrow tool. The head is a separate helper object.',
	],
	[
		c('line_path'),
		<>
			<strong>{c('points')}</strong> (2 or more {'{ x, y }'}, required), {c('stroke')} ('#ff0000'),{' '}
			{c('strokeWidth')} (3)
		</>,
		'The Path tool (a polyline).',
	],
	[
		c('blur'),
		<>
			{c('left')}, {c('top')}, {c('width')} (100), {c('height')} (50)
		</>,
		'A redacted area, blurred right away.',
	],
	[
		c('comment_box'),
		<>
			{c('left')}, {c('top')}, {c('fill')} ('#ff0000'), {c('stroke')} ('#0386b5'), {c('strokeWidth')} (2),{' '}
			{c('scaleX')} / {c('scaleY')}, {c('test')}: {'{ text, fill, fontSize, fontStyle, fontWeight, textAlign }'}
		</>,
		'A callout with a text, 100 × 50 at scale 1 (size it with scaleX / scaleY). The text options are nested in test.',
	],
	[
		c('custom_shape'),
		<>
			<strong>{c('src')}</strong> (URL / data URL, required)
		</>,
		<>
			Use <a href='#addimage'>addImage</a>: fitted into half the photo and centered.
		</>,
	],
	[
		c('arrow'),
		<>
			{c('left')}, {c('top')}, {c('color')} ('#ff0000'), {c('angle')}, {c('scaleX')} / {c('scaleY')}
		</>,
		'The Shapes → Arrow tool: a block arrow pointing right (rotate it with angle).',
	],
	[
		c('steps_creator'),
		<>
			{c('left')}, {c('top')}, {c('number')} (1), {c('width')} / {c('height')} (0), {c('backgroundColor')}{' '}
			('#ff0000'), {c('borderColor')} ('#ff0000'), {c('fontColor')} ('#ffffff'), {c('fontSize')} (20),{' '}
			{c('strokeWidth')} (2)
		</>,
		'The Steps tool: a numbered badge. With a width and height it also draws a frame, with the badge at its top-left corner.',
	],
	[
		c('draw'),
		<>
			<strong>{c('path')}</strong> (SVG path data, required), {c('stroke')} ('#ff0000'), {c('strokeWidth')} (2)
		</>,
		'A free drawing, like the Draw tool makes.',
	],
];

export function ObjectsPage() {
	return (
		<ApiPlayground>
			<PageHeader
				eyebrow='API reference'
				title='Objects'
				lead='Add, change and remove annotations from code: shapes, text, arrows, images, blur areas and more.'
			/>

			<H2 id='coordinates'>Coordinates</H2>
			<p>
				Positions and sizes are in <strong>scene units</strong>: the photo is scaled into a box of 1000 × 508
				when it loads, whatever its pixel size and the size of the screen. A 4000 × 3000 photo is 677 × 508
				units, so <code>left: 0, top: 0</code> is its top-left corner and the center is at (338, 254). Get the
				actual size with <DocLink to='api/controller#getscenesize'>getSceneSize()</DocLink>. Because of this,
				saved JSON shows the same result on every screen.
			</p>
			<p>
				Annotations are Fabric.js objects on <code>editor.canvas</code>. Each one has a <code>shapeType</code>{' '}
				(which kind of annotation it is) and a unique <code>id</code>.
			</p>

			<H2 id='adding'>Adding objects</H2>

			<ApiMethod
				name='addShape'
				signature='editor.addShape(type: string, data: Record<string, any>): Promise<void>'
				returns='Promise<void>'
				params={[
					{
						name: 'type',
						type: 'string',
						description: 'The shapeType, see the table below (or a custom shape definition).',
					},
					{
						name: 'data',
						type: 'object',
						description: 'Position, size and style. Missing values use the defaults in the table.',
					},
				]}
				example={`await editor.addShape('rectangle', {
  left: 60, top: 60, width: 220, height: 120,
  stroke: '#2563eb', strokeWidth: 4, rx: 12,
});
await editor.addShape('text', {
  left: 80, top: 200, text: 'Look here', fontSize: 32, fill: '#ffffff', backgroundColor: '#2563eb',
});
await editor.addShape('advanced_arrow', {
  points: [{ x: 420, y: 320 }, { x: 290, y: 190 }], stroke: '#2563eb', strokeWidth: 5,
});
return editor.getState().history.index;`}
				run={async (editor) => {
					await editor.addShape('rectangle', {
						left: 60,
						top: 60,
						width: 220,
						height: 120,
						stroke: '#2563eb',
						strokeWidth: 4,
						rx: 12,
					});
					await editor.addShape('text', {
						left: 80,
						top: 200,
						text: 'Look here',
						fontSize: 32,
						fill: '#ffffff',
						backgroundColor: '#2563eb',
					});
					await editor.addShape('advanced_arrow', {
						points: [
							{ x: 420, y: 320 },
							{ x: 290, y: 190 },
						],
						stroke: '#2563eb',
						strokeWidth: 5,
					});
					return editor.getState().history.index;
				}}
			>
				<p>
					Creates an object through its <DocLink to='custom-shapes'>shape definition</DocLink> and records one
					history entry. An <code>id</code> is generated unless you pass one. Most shapes are selected after
					adding. Unknown types (or types without a <code>create</code>) log a warning and add nothing.
				</p>
			</ApiMethod>

			<H3 id='shape-types'>Shape types and their data</H3>
			<p>Defaults in brackets. Values are in scene units; colors are any CSS color.</p>
			<Table head={['Type', 'Data', 'Notes']} rows={shapeRows} />
			<Callout type='note' title='Not for addShape'>
				<p>
					<code>crop_rectangle</code> and the <code>temp_*</code> types are editing UI of the tools; crop with
					the Crop tool instead.
				</p>
			</Callout>

			<H3 id='addshape-more-examples'>More examples</H3>
			<CodeBlock
				title='Icon, blur, callout'
				code={`import { defaultIconLibrary } from 'fabri-pix';

const { x, y } = editor.getSceneCenter();
const heart = defaultIconLibrary.find((icon) => icon.id === 'heart');
await editor.addShape('icon', { path: heart.path, size: 80, left: x, top: y, fill: '#e11d48' });

await editor.addShape('blur', { left: 40, top: 40, width: 200, height: 60 });

await editor.addShape('comment_box', {
  left: 300, top: 60, fill: '#0f172a', stroke: '#0f172a',
  test: { text: 'Nice view!', fill: '#ffffff', fontSize: 22 },
});`}
			/>
			<CodeBlock
				title='Block arrow, numbered steps, free drawing'
				code={`// Shapes → Arrow, pointing down
await editor.addShape('arrow', { left: 100, top: 100, color: '#2563eb', angle: 90 });

// a numbered badge
await editor.addShape('steps_creator', { left: 200, top: 150, number: 1 });

// step 2 with a frame from (300, 150) to (460, 250), the badge at its top-left corner
await editor.addShape('steps_creator', { left: 300, top: 150, width: 160, height: 100, number: 2 });

// a free drawing from SVG path data
await editor.addShape('draw', { path: 'M 50 300 Q 150 200 250 300 T 450 300', stroke: '#db2777', strokeWidth: 4 });`}
			/>
			<p>
				The saved (nested) form of <code>arrow</code> and <code>steps_creator</code> that you find in the JSON
				works with <code>addShape</code> too.
			</p>

			<ApiMethod
				name='addImage'
				signature='editor.addImage(src: string | Blob): Promise<void>'
				returns='Promise<void>'
				params={[
					{
						name: 'src',
						type: 'string | Blob',
						description: 'URL, data URL, or a Blob / File (e.g. from a file input or the clipboard).',
					},
				]}
				example={`// a logo, a sticker, a second photo...
await editor.addImage(logoUrl);
return editor.canvas.getActiveObject().shapeType;`}
				run={async (editor) => {
					await editor.addImage(LOGO_SVG);
					return (editor.canvas!.getActiveObject() as any)?.shapeType;
				}}
			>
				<p>
					Adds an image on top of the photo, scaled down to fit into half of it, centered and selected (shape
					type <code>custom_shape</code>). One history entry. Blobs are converted to data URLs so the state
					stays serializable. Images from other origins need CORS headers to be exportable.
				</p>
			</ApiMethod>

			<H2 id='changing'>Changing objects</H2>

			<ApiMethod
				name='updateObject'
				signature='editor.updateObject(object: FabricObject, properties: object, options?: { commit?: boolean }): void'
				params={[
					{ name: 'object', type: 'FabricObject', description: 'The object to change.' },
					{
						name: 'properties',
						type: 'object',
						description: 'Fabric properties, e.g. { fill, stroke, strokeWidth, angle, left }.',
					},
					{
						name: 'options.commit',
						type: 'boolean',
						default: 'false',
						description: 'true records a history entry.',
					},
				]}
				example={`const object = editor.canvas.getActiveObject();
editor.updateObject(object, { stroke: '#16a34a', strokeWidth: 8 }, { commit: true });
return editor.getState().history.index;`}
				run={async (editor) => {
					const object = await ensureSelection(editor);
					editor.updateObject(object, { stroke: '#16a34a', strokeWidth: 8 }, { commit: true });
					return editor.getState().history.index;
				}}
			>
				<p>
					Sets properties, updates the object's controls, re-renders and refreshes the option panels. Without{' '}
					<code>commit</code> nothing is recorded: use that for live previews (while a slider or color picker
					is dragged) and commit once at the end.
				</p>
			</ApiMethod>

			<ApiMethod
				name='notifyObjectChanged'
				signature='editor.notifyObjectChanged(options?: { commit?: boolean }): void'
				params={[
					{
						name: 'options.commit',
						type: 'boolean',
						default: 'false',
						description: 'true records a history entry.',
					},
				]}
				example={`const object = editor.canvas.getActiveObject();
object.set({ angle: (object.angle + 20) % 360 });
editor.notifyObjectChanged({ commit: true });
return object.angle;`}
				run={async (editor) => {
					const object = await ensureSelection(editor);
					object.set({ angle: (object.angle + 20) % 360 });
					object.setCoords();
					editor.notifyObjectChanged({ commit: true });
					return object.angle;
				}}
			>
				<p>
					Call it after changing objects with Fabric directly: re-renders the canvas, increases{' '}
					<code>getState().revision</code> (option panels re-render) and optionally records a history entry.
				</p>
			</ApiMethod>

			<H2 id='removing'>Removing objects</H2>

			<ApiMethod
				name='deleteObject'
				signature='editor.deleteObject(object: FabricObject): void'
				params={[{ name: 'object', type: 'FabricObject', description: 'The object to remove.' }]}
				example={`const rect = editor.canvas.getObjects().find((object) => object.shapeType === 'rectangle');
if (rect) editor.deleteObject(rect);
return editor.canvas.getObjects().length;`}
				run={(editor) => {
					const rect = lastObject(editor, 'rectangle');
					if (rect) {
						editor.deleteObject(rect);
					}
					return rect ? objectCount(editor) : 'no rectangle to delete, add one first';
				}}
			>
				<p>
					Removes the object together with its helper objects (the head of an arrow, the text of a callout,
					the blurred copy of a redacted area). Recorded in the history.
				</p>
			</ApiMethod>

			<ApiMethod
				name='deleteSelection'
				signature='editor.deleteSelection(): FabricObject[]'
				returns='FabricObject[] (the removed objects)'
				example={`editor.selectAll();
const removed = editor.deleteSelection();
return removed.length;`}
				run={(editor) => {
					editor.selectAll();
					const removed = editor.deleteSelection();
					return removed.map(describe);
				}}
			>
				<p>
					Removes all selected objects as <strong>one</strong> history entry (what the Delete key and the
					delete button do). Returns an empty array when nothing is selected.
				</p>
			</ApiMethod>

			<ApiMethod
				name='clearAnnotations'
				signature='editor.clearAnnotations(): void'
				example={`editor.clearAnnotations();
return editor.canvas.getObjects().length;`}
				run={(editor) => {
					editor.clearAnnotations();
					return objectCount(editor);
				}}
			>
				<p>
					Removes every annotation in one history entry and keeps the crop, rotation, filters and output size
					(the Delete All action).
				</p>
			</ApiMethod>

			<ApiMethod
				name='reset'
				signature='editor.reset(): void'
				example={`editor.reset();
return { rotation: editor.getImageRotation(), filters: editor.getImageFilters(), size: editor.getOutputSize() };`}
				run={(editor) => {
					editor.reset();
					return {
						rotation: editor.getImageRotation(),
						filters: editor.getImageFilters(),
						size: editor.getOutputSize(),
					};
				}}
			>
				<p>
					Back to the original photo: removes every annotation, the crop, rotation, flip, filters and output
					size, as one history entry (the Reset action). It can be undone.
				</p>
			</ApiMethod>
		</ApiPlayground>
	);
}
