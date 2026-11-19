import type { ImageEditorController } from 'fabri-pix';

import { ApiMethod, ApiPlayground, Callout, DocLink, H2, PageHeader, PropTable } from '../../ui';
import { describe, ensureSelection } from './shared';

/** two overlapping rectangles, the first (blue, lower layer) is selected */
const addOverlappingPair = async (editor: ImageEditorController) => {
	await editor.addShape('rectangle', {
		left: 140,
		top: 120,
		width: 200,
		height: 130,
		fill: 'rgba(37, 99, 235, 0.85)',
		stroke: '#1d4ed8',
	});
	const blue = editor.canvas!.getActiveObject()!;
	await editor.addShape('rectangle', {
		left: 220,
		top: 170,
		width: 200,
		height: 130,
		fill: 'rgba(234, 88, 12, 0.85)',
		stroke: '#c2410c',
	});
	editor.canvas!.setActiveObject(blue);
	editor.canvas!.requestRenderAll();
	return blue;
};

const layerIndex = (editor: ImageEditorController) =>
	editor.canvas!.getObjects().indexOf(editor.canvas!.getActiveObject()!);

export function SelectionPage() {
	return (
		<ApiPlayground>
			<PageHeader
				eyebrow='API reference'
				title='Selection, layers & styles'
				lead='Select and move objects, copy and paste them, change their stacking order and their look. These are the methods behind the keyboard shortcuts and the object controls.'
			/>

			<p>
				The selected objects are in <code>editor.getState().selection</code> (and{' '}
				<code>editor.canvas.getActiveObjects()</code>). The crop rectangle and other editing UI are never part
				of a selection these methods act on.
			</p>

			<H2 id='selection'>Selection</H2>

			<ApiMethod
				name='selectAll'
				signature='editor.selectAll(): void'
				example={`editor.selectAll();
return editor.getState().selection.length;`}
				run={(editor) => {
					editor.selectAll();
					return editor.getState().selection.length;
				}}
			>
				<p>
					Selects every annotation that can be selected (helper objects such as arrow heads and editing UI are
					skipped). Emits <code>selectionChange</code>. Shortcut: <kbd>⌘A</kbd>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='deselect'
				signature='editor.deselect(): void'
				example={`editor.deselect();
return editor.getState().selection.length;`}
				run={(editor) => {
					editor.deselect();
					return editor.getState().selection.length;
				}}
			>
				<p>
					Clears the selection. Shortcut: <kbd>Escape</kbd>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='nudgeSelection'
				signature='editor.nudgeSelection(dx: number, dy: number): void'
				params={[
					{ name: 'dx', type: 'number', description: 'Horizontal distance in scene units (negative: left).' },
					{ name: 'dy', type: 'number', description: 'Vertical distance in scene units (negative: up).' },
				]}
				example={`editor.nudgeSelection(20, 0);
return editor.canvas.getActiveObject().left;`}
				run={async (editor) => {
					const object = await ensureSelection(editor);
					editor.nudgeSelection(20, 0);
					return Math.round(object.left);
				}}
			>
				<p>
					Moves the selected objects (helpers follow). Repeated nudges are recorded as <strong>one</strong>{' '}
					history entry, 400 ms after the last one. Does nothing without a selection. Shortcuts: arrow keys,
					with <kbd>⇧</kbd> by 10.
				</p>
			</ApiMethod>

			<H2 id='clipboard'>Copy, cut, paste &amp; duplicate</H2>
			<p>
				The editor has its own clipboard, shared by all editors on the page (copy in one, paste in another). The
				keyboard shortcuts additionally mark the system clipboard, so that pasting an image copied in another
				app (e.g. a screenshot) adds that image instead; the methods below only use the editor clipboard.
			</p>

			<ApiMethod
				name='copySelection'
				signature='editor.copySelection(): boolean'
				returns='boolean (false: nothing selected)'
				example={`const copied = editor.copySelection();
return { copied, hasClipboard: editor.hasClipboard() };`}
				run={async (editor) => {
					await ensureSelection(editor);
					const copied = editor.copySelection();
					return { copied, hasClipboard: editor.hasClipboard() };
				}}
			>
				<p>
					Copies the selected objects (as JSON, so later changes to the originals don't affect the copy).
					Shortcut: <kbd>⌘C</kbd>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='cutSelection'
				signature='editor.cutSelection(): boolean'
				returns='boolean (false: nothing selected)'
				example={`editor.cutSelection(); // removed, one history entry
await editor.paste();  // back at the same place
return editor.getState().selection.length;`}
				run={async (editor) => {
					await ensureSelection(editor);
					editor.cutSelection();
					await editor.paste();
					return editor.getState().selection.length;
				}}
			>
				<p>
					Copies and then deletes the selection. The first paste after a cut puts the objects back at their
					original position. Shortcut: <kbd>⌘X</kbd>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='hasClipboard'
				signature='editor.hasClipboard(): boolean'
				returns='boolean'
				example={`return editor.hasClipboard();`}
				run={(editor) => editor.hasClipboard()}
			>
				<p>Whether something was copied (in any editor on the page), e.g. to enable a Paste button.</p>
			</ApiMethod>

			<ApiMethod
				name='paste'
				signature='editor.paste(): Promise<void>'
				returns='Promise<void>'
				example={`editor.copySelection();
await editor.paste(); // 20 units right and down
await editor.paste(); // 40 units...
return editor.getState().selection.map((object) => object.left);`}
				run={async (editor) => {
					await ensureSelection(editor);
					editor.copySelection();
					await editor.paste();
					await editor.paste();
					return editor.getState().selection.map((object) => Math.round(object.left));
				}}
			>
				<p>
					Adds copies of the clipboard objects (with new ids), each paste moved 20 units further, selects them
					and records one history entry. Does nothing with an empty clipboard. Shortcut: <kbd>⌘V</kbd>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='duplicateSelection'
				signature='editor.duplicateSelection(): Promise<void>'
				returns='Promise<void>'
				example={`await editor.duplicateSelection();
return editor.getState().selection.length;`}
				run={async (editor) => {
					await ensureSelection(editor);
					await editor.duplicateSelection();
					return editor.getState().selection.map(describe);
				}}
			>
				<p>
					Copies the selection in place (20 units right and down) and selects the copies, without touching the
					clipboard. One history entry. Shortcut: <kbd>⌘D</kbd>.
				</p>
			</ApiMethod>

			<H2 id='layers'>Layer order</H2>
			<p>
				Objects are drawn in their order on the canvas, the last one on top. Objects move together with their
				helpers (arrow heads, callout texts, blurred copies), so these never end up separated.
			</p>

			<ApiMethod
				name='arrangeSelection'
				signature="editor.arrangeSelection(direction: 'forward' | 'backward' | 'front' | 'back'): void"
				params={[
					{
						name: 'direction',
						type: "'forward' | 'backward' | 'front' | 'back'",
						description: 'One step up / down, or all the way to the top / bottom.',
					},
				]}
				example={`// the blue rectangle is selected and lies below the orange one
editor.arrangeSelection('front');
return editor.canvas.getObjects().indexOf(editor.canvas.getActiveObject());`}
				run={async (editor) => {
					await addOverlappingPair(editor);
					const before = layerIndex(editor);
					editor.arrangeSelection('front');
					return { before, after: layerIndex(editor) };
				}}
			>
				<p>
					Changes the stacking order of the selected objects and records a history entry. With several
					selected objects their relative order is kept. Shortcuts: <kbd>⌘]</kbd> / <kbd>⌘[</kbd>, with{' '}
					<kbd>⇧</kbd> to the front / back.
				</p>
			</ApiMethod>

			<ApiMethod
				name='canArrangeSelection'
				signature="editor.canArrangeSelection(direction: 'forward' | 'backward' | 'front' | 'back'): boolean"
				returns='boolean'
				example={`return {
  forward: editor.canArrangeSelection('forward'),
  backward: editor.canArrangeSelection('backward'),
};`}
				run={async (editor) => {
					await ensureSelection(editor);
					return {
						forward: editor.canArrangeSelection('forward'),
						backward: editor.canArrangeSelection('backward'),
					};
				}}
			>
				<p>
					Whether <code>arrangeSelection</code> would move anything: false without a selection or when the
					selection is already at the top (forward / front) or bottom (backward / back). The layer buttons use
					it to disable themselves.
				</p>
			</ApiMethod>

			<H2 id='styles'>Object styles</H2>
			<p>
				Any annotation can get an opacity, a shadow, dashed outlines and (rectangles) rounded corners. These are
				the controls shown in the options panel when objects are selected (see{' '}
				<DocLink to='layout'>objectControls</DocLink>).
			</p>
			<PropTable
				nameLabel='ObjectStyle'
				rows={[
					{ name: 'opacity', type: 'number', description: '0 (invisible) – 1.' },
					{
						name: 'shadow',
						type: '{ color, blur, offsetX, offsetY } | null',
						description: '`null` removes the shadow.',
					},
					{
						name: 'dashed',
						type: 'boolean',
						description: 'Dashed stroke (dash and gap follow the stroke width).',
					},
					{ name: 'cornerRadius', type: 'number', description: 'Rectangles only, in scene units.' },
				].map((row) => ({ ...row, description: <span>{row.description}</span> }))}
			/>

			<ApiMethod
				name='setObjectStyle'
				signature='editor.setObjectStyle(objects: FabricObject | FabricObject[], style: ObjectStyle, options?: { commit?: boolean }): void'
				params={[
					{ name: 'objects', type: 'FabricObject | FabricObject[]', description: 'One or more objects.' },
					{ name: 'style', type: 'ObjectStyle', description: 'Only the given keys change.' },
					{
						name: 'options.commit',
						type: 'boolean',
						default: 'true',
						description: 'false: no history entry (e.g. while a slider is dragged).',
					},
				]}
				example={`editor.setObjectStyle(editor.canvas.getActiveObjects(), {
  opacity: 0.8,
  dashed: true,
  cornerRadius: 16,
  shadow: { color: 'rgba(0, 0, 0, 0.4)', blur: 12, offsetX: 4, offsetY: 6 },
});
return editor.getObjectStyle(editor.canvas.getActiveObject());`}
				run={async (editor) => {
					await ensureSelection(editor);
					editor.setObjectStyle(editor.canvas!.getActiveObjects(), {
						opacity: 0.8,
						dashed: true,
						cornerRadius: 16,
						shadow: { color: 'rgba(0, 0, 0, 0.4)', blur: 12, offsetX: 4, offsetY: 6 },
					});
					return editor.getObjectStyle(editor.canvas!.getActiveObject()!);
				}}
			>
				<p>
					Applies the style to every object that supports it and silently skips the rest (see{' '}
					<code>supportsObjectStyle</code>). Helper objects follow: an arrow head gets the opacity and shadow
					of its arrow.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getObjectStyle'
				signature='editor.getObjectStyle(object: FabricObject): Required<ObjectStyle>'
				returns='{ opacity, shadow, dashed, cornerRadius }'
				example={`return editor.getObjectStyle(editor.canvas.getActiveObject());`}
				run={async (editor) => editor.getObjectStyle(await ensureSelection(editor))}
			>
				<p>
					The current style of an object, all four keys filled (<code>shadow: null</code> without a shadow,{' '}
					<code>cornerRadius: 0</code> for non-rectangles).
				</p>
			</ApiMethod>

			<ApiMethod
				name='supportsObjectStyle'
				signature="editor.supportsObjectStyle(object: FabricObject, style: 'opacity' | 'shadow' | 'dashed' | 'cornerRadius'): boolean"
				returns='boolean'
				example={`const object = editor.canvas.getActiveObject();
return {
  opacity: editor.supportsObjectStyle(object, 'opacity'),
  dashed: editor.supportsObjectStyle(object, 'dashed'),
  cornerRadius: editor.supportsObjectStyle(object, 'cornerRadius'),
};`}
				run={async (editor) => {
					const object = await ensureSelection(editor);
					return {
						shapeType: (object as any).shapeType,
						opacity: editor.supportsObjectStyle(object, 'opacity'),
						dashed: editor.supportsObjectStyle(object, 'dashed'),
						cornerRadius: editor.supportsObjectStyle(object, 'cornerRadius'),
					};
				}}
			>
				<p>Whether a style can be applied:</p>
				<ul>
					<li>
						Blur areas support none: a see-through or shadowed redaction would no longer hide what it
						covers.
					</li>
					<li>
						<code>dashed</code> needs a visible stroke and no group (text, emoji, steps and block arrows
						can't be dashed).
					</li>
					<li>
						<code>cornerRadius</code> only applies to rectangles.
					</li>
				</ul>
			</ApiMethod>

			<Callout type='tip'>
				<p>
					Building your own object toolbar? Read <code>useEditorState().selection</code> and{' '}
					<code>revision</code> in a component inside the editor so it re-renders when the selection or the
					objects change. See <DocLink to='api/hooks'>Hooks</DocLink>.
				</p>
			</Callout>
		</ApiPlayground>
	);
}
