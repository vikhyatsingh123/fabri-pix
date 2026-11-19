import { ApiMethod, ApiPlayground, Callout, DEMO_IMAGES, DocLink, H2, PageHeader } from '../../ui';

const sampleImage = DEMO_IMAGES[2].src;

export function HistoryPage() {
	return (
		<ApiPlayground>
			<PageHeader
				eyebrow='API reference'
				title='History & state'
				lead='Undo and redo, recording your own changes, and saving or loading the complete editing state as JSON.'
			/>

			<H2 id='how-history-works'>How the history works</H2>
			<ul>
				<li>
					Every history entry is a complete snapshot of the canvas (<code>toJSON()</code>, serialized). Entry
					0 is the state right after the image loaded; <code>getState().history.index</code> is the current
					one, so it equals the number of possible undo steps.
				</li>
				<li>
					Entries are recorded automatically when objects are added, modified or removed, and by every
					controller method that changes something (unless you pass <code>{'{ commit: false }'}</code>).
				</li>
				<li>Recording a state identical to the current entry is ignored, so extra commits are harmless.</li>
				<li>
					At most <code>historyLimit</code> undo steps (default 50) are kept; older entries are dropped.
				</li>
				<li>
					The photo itself (often a large data URL) is not stored in each entry, only its rotation, flip,
					filters and output size. Recording after an undo drops the redo entries, like in any editor.
				</li>
			</ul>

			<H2 id='undo-redo'>Undo &amp; redo</H2>

			<ApiMethod
				name='undo'
				signature='editor.undo(): Promise<void>'
				returns='Promise<void>'
				example={`await editor.addShape('rectangle', { left: 100, top: 100 });
await editor.undo(); // the rectangle is gone
return editor.getState().history.index;`}
				run={async (editor) => {
					await editor.addShape('rectangle', { left: 100, top: 100 });
					await editor.undo();
					return editor.getState().history.index;
				}}
			>
				<p>
					Restores the previous entry. Does nothing when there is nothing to undo or while another undo / redo
					is running. The active tool is paused during the restore and resumed afterwards. Emits{' '}
					<code>historyChange</code> and <code>change</code>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='redo'
				signature='editor.redo(): Promise<void>'
				returns='Promise<void>'
				example={`await editor.redo();
return editor.getState().history;`}
				run={async (editor) => {
					await editor.redo();
					const { entries, index } = editor.getState().history;
					return { entries: entries.length, index };
				}}
			>
				<p>Restores the next entry, after an undo. Does nothing when there is nothing to redo.</p>
			</ApiMethod>

			<ApiMethod
				name='canUndo'
				signature='editor.canUndo(): boolean'
				returns='boolean'
				example={`return { canUndo: editor.canUndo(), canRedo: editor.canRedo() };`}
				run={(editor) => ({ canUndo: editor.canUndo(), canRedo: editor.canRedo() })}
			>
				<p>
					Whether <code>undo()</code> would do something: there is a previous entry and no restore is running.
					To re-render a button when this changes, read it inside{' '}
					<DocLink to='api/hooks#useeditorstate'>useEditorState()</DocLink>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='canRedo'
				signature='editor.canRedo(): boolean'
				returns='boolean'
				example={`await editor.undo();
return editor.canRedo();`}
				run={async (editor) => {
					await editor.undo();
					return editor.canRedo();
				}}
			>
				<p>
					Whether <code>redo()</code> would do something.
				</p>
			</ApiMethod>

			<ApiMethod
				name='goToHistory'
				signature='editor.goToHistory(index: number): Promise<void>'
				returns='Promise<void>'
				params={[
					{
						name: 'index',
						type: 'number',
						description: 'Index in getState().history.entries, 0 = the loaded state.',
					},
				]}
				example={`await editor.goToHistory(0); // back to the start, redo still possible
return editor.getState().history;`}
				run={async (editor) => {
					await editor.goToHistory(0);
					const { entries, index } = editor.getState().history;
					return { entries: entries.length, index };
				}}
			>
				<p>
					Jumps to any entry, like clicking an item of the history panel. Out-of-range indexes and the current
					index are ignored.
				</p>
			</ApiMethod>

			<H2 id='recording'>Recording your own changes</H2>

			<ApiMethod
				name='commit'
				signature='editor.commit(): void'
				example={`const rect = editor.canvas.getObjects().find((object) => object.shapeType === 'rectangle');
rect?.set({ angle: 15 });
editor.canvas.requestRenderAll();
editor.commit(); // one undo step for the change
return editor.getState().history.index;`}
				run={async (editor) => {
					let rect = editor.canvas!.getObjects().find((object) => (object as any).shapeType === 'rectangle');
					if (!rect) {
						await editor.addShape('rectangle', { left: 160, top: 120 });
						rect = editor.canvas!.getActiveObject()!;
					}
					rect.set({ angle: (rect.angle + 15) % 360 });
					editor.canvas!.requestRenderAll();
					editor.commit();
					return editor.getState().history.index;
				}}
			>
				<p>
					Records the current canvas as a new entry. Call it after changing objects directly with Fabric (
					<code>object.set()</code> does not fire <code>object:modified</code>). It is ignored before the
					editor is ready, inside <code>withoutHistory</code>, and when nothing changed. Emits{' '}
					<code>historyChange</code> and <code>change</code>.
				</p>
				<p>
					Bound to the editor, so <code>onSomething={'{editor.commit}'}</code> works.
				</p>
			</ApiMethod>

			<ApiMethod
				name='withoutHistory'
				signature='editor.withoutHistory<T>(callback: () => T): T'
				returns='T (the callback result)'
				params={[
					{
						name: 'callback',
						type: '() => T',
						description: 'Runs synchronously, nothing it does creates history entries.',
					},
				]}
				example={`// several changes, one undo step
editor.withoutHistory(() => {
  editor.canvas.getObjects().forEach((object) => object.set({ opacity: 0.6 }));
});
editor.canvas.requestRenderAll();
editor.commit();
return editor.getState().history.index;`}
				run={(editor) => {
					editor.withoutHistory(() => {
						editor.canvas!.getObjects().forEach((object) => object.set({ opacity: 0.6 }));
					});
					editor.canvas!.requestRenderAll();
					editor.commit();
					return editor.getState().history.index;
				}}
			>
				<p>
					Suspends recording while the callback runs, e.g. to group many changes into a single entry: do them
					inside, then <code>commit()</code> once. Only synchronous work is covered; an <code>async</code>{' '}
					callback's later steps are recorded normally.
				</p>
			</ApiMethod>

			<H2 id='json'>Saving &amp; loading the state</H2>

			<ApiMethod
				name='toJSON'
				signature='editor.toJSON(): Record<string, any>'
				returns='object'
				example={`const json = editor.toJSON();
localStorage.setItem('draft', JSON.stringify(json));
return { objects: json.objects.length, hasCrop: !!json.clipPath, filters: json.backgroundImage?.fpFilters };`}
				run={(editor) => {
					const json = editor.toJSON();
					return {
						objects: json.objects.length,
						hasCrop: !!json.clipPath,
						filters: json.backgroundImage?.fpFilters,
					};
				}}
			>
				<p>
					The complete editing state: Fabric's canvas JSON with the annotations, the crop (
					<code>clipPath</code>) and the photo (<code>backgroundImage</code>, including its <code>src</code>,
					rotation, flip, filters in <code>fpFilters</code> and output size in <code>fpResize</code>). Editing
					UI such as the crop rectangle is left out.
				</p>
				<p>
					Pass it to <code>initialState</code> or <code>loadState</code> to continue later. It is what{' '}
					<code>onSave</code>, <code>onChange</code> and <code>onExportJson</code> receive. While a crop is
					being drawn it is not applied yet; <code>save()</code> applies it first.
				</p>
			</ApiMethod>

			<ApiMethod
				name='loadState'
				signature='editor.loadState(json: object | string): Promise<void>'
				returns='Promise<void>'
				params={[
					{
						name: 'json',
						type: 'object | string',
						description: 'JSON from toJSON() / onSave, or its string.',
					},
				]}
				example={`const saved = editor.toJSON();
editor.clearAnnotations();
await editor.loadState(saved); // everything is back
return editor.getState().history;`}
				run={async (editor) => {
					const saved = editor.toJSON();
					editor.clearAnnotations();
					await editor.loadState(saved);
					const { entries, index } = editor.getState().history;
					return { entries: entries.length, index };
				}}
			>
				<p>
					Replaces the canvas content with the state and <strong>starts a new history</strong> (the state
					becomes entry 0). The open photo is kept; its rotation, flip, filters and output size come from the
					JSON. Your object is copied, never changed. Emits <code>historyChange</code> and <code>change</code>
					.
				</p>
			</ApiMethod>

			<ApiMethod
				name='setSource'
				signature='editor.setSource(src: string | Blob | null, initialState?: object | string | null): Promise<void>'
				returns='Promise<void>'
				params={[
					{
						name: 'src',
						type: 'string | Blob | null',
						description: 'The new image: URL, data URL, Blob / File.',
					},
					{
						name: 'initialState',
						type: 'object | string | null',
						description: 'State to apply to the new image. Without it the image starts empty.',
					},
				]}
				example={`await editor.setSource('${sampleImage}');
return editor.getSceneSize();`}
				run={async (editor) => {
					await editor.setSource(sampleImage);
					return editor.getSceneSize();
				}}
			>
				<p>
					Loads another image (what the Load button does): the active tool is deactivated, the canvas cleared,
					the image fitted and the history restarted. Emits <code>historyChange</code> and <code>ready</code>{' '}
					again (<code>onReady</code> is called again). If several loads overlap, only the last one wins.
				</p>
				<Callout type='note'>
					<p>
						With <code>{'<ImageEditor>'}</code>, changing the <code>src</code> prop calls this for you. A{' '}
						<code>setSource</code> call is not reflected in the prop, so the next prop change loads the
						prop's image again.
					</p>
				</Callout>
			</ApiMethod>
		</ApiPlayground>
	);
}
