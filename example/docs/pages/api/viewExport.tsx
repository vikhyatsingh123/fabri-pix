import { ApiMethod, ApiPlayground, Callout, DocLink, H2, PageHeader, PropTable } from '../../ui';

export function ViewAndExportPage() {
	return (
		<ApiPlayground>
			<PageHeader
				eyebrow='API reference'
				title='Zoom & export'
				lead='Zoom and pan the view, and export the edited image. The view never changes the exported result.'
			/>

			<H2 id='zoom'>Zoom</H2>
			<p>
				Zoom 1 means the photo fits the view; the editor allows 1 – 4 (exported as <code>MIN_ZOOM</code> /{' '}
				<code>MAX_ZOOM</code>). The current zoom is <code>getState().zoom</code>, changes emit{' '}
				<code>zoomChange</code>. Zooming is not recorded in the history.
			</p>

			<ApiMethod
				name='setZoom'
				signature='editor.setZoom(zoom: number, point?: { x: number; y: number }): void'
				params={[
					{ name: 'zoom', type: 'number', description: 'Clamped to 1 – 4 and rounded to 3 decimals.' },
					{
						name: 'point',
						type: '{ x: number; y: number }',
						description:
							'Optional: zoom around this spot instead of the center, in pixels from the top-left corner of the canvas element. That spot stays under the pointer, like a pinch.',
					},
				]}
				example={`editor.setZoom(2);                     // into the center
editor.setZoom(3, { x: 40, y: 30 });   // around a spot near the top-left corner
return editor.getState().zoom;`}
				run={(editor) => {
					editor.setZoom(2);
					editor.setZoom(3, { x: 40, y: 30 });
					return editor.getState().zoom;
				}}
			>
				<p>
					Zooms into the center of the view, or around <code>point</code>. A zoomed-in view is kept covering
					the canvas (it never moves the photo out of view). Going back to 1 shows the whole photo again and
					turns pan mode off. Pinching and ⌘/Ctrl + wheel use this, see{' '}
					<DocLink to='touch-and-mobile'>Phones, tablets &amp; gestures</DocLink>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='zoomIn'
				signature='editor.zoomIn(): void'
				example={`editor.zoomIn();
return editor.getState().zoom;`}
				run={(editor) => {
					editor.zoomIn();
					return editor.getState().zoom;
				}}
			>
				<p>Zooms in by 0.1 (the + button).</p>
			</ApiMethod>

			<ApiMethod
				name='zoomOut'
				signature='editor.zoomOut(): void'
				example={`editor.zoomOut();
return editor.getState().zoom;`}
				run={(editor) => {
					editor.zoomOut();
					return editor.getState().zoom;
				}}
			>
				<p>Zooms out by 0.1 (the − button), down to 1.</p>
			</ApiMethod>

			<ApiMethod
				name='fitToView'
				signature='editor.fitToView(): void'
				example={`editor.fitToView();
return editor.getState().zoom;`}
				run={(editor) => {
					editor.fitToView();
					return editor.getState().zoom;
				}}
			>
				<p>Back to zoom 1, the whole photo visible (the Fit button).</p>
			</ApiMethod>

			<H2 id='pan'>Pan</H2>

			<ApiMethod
				name='panBy'
				signature='editor.panBy(dx: number, dy: number): void'
				params={[
					{
						name: 'dx',
						type: 'number',
						description: 'Pixels to move the view to the right (negative: left).',
					},
					{ name: 'dy', type: 'number', description: 'Pixels to move the view down (negative: up).' },
				]}
				example={`editor.setZoom(2);       // panning needs zoom > 1
editor.panBy(-120, -60); // shows more of the bottom right
return editor.canvas.viewportTransform.slice(4);`}
				run={(editor) => {
					editor.setZoom(2);
					editor.panBy(-120, -60);
					return editor.canvas!.viewportTransform.slice(4).map(Math.round);
				}}
			>
				<p>
					Moves the zoomed-in view, e.g. from your own arrow buttons. Does nothing at zoom 1, and stops at the
					edges of the photo. Two fingers and the wheel pan the same way.
				</p>
			</ApiMethod>

			<ApiMethod
				name='setPanning'
				signature='editor.setPanning(enabled: boolean, resumeTool?: boolean): void'
				params={[
					{ name: 'enabled', type: 'boolean', description: 'Turn pan mode on or off.' },
					{
						name: 'resumeTool',
						type: 'boolean',
						default: 'true',
						description: 'When turning off: re-activate the tool that was paused.',
					},
				]}
				example={`editor.setZoom(2);       // panning needs zoom > 1
editor.setPanning(true); // now drag the photo
return editor.getState().panning;`}
				run={(editor) => {
					editor.setZoom(2);
					editor.setPanning(true);
					return editor.getState().panning;
				}}
			>
				<p>
					In pan mode, dragging an empty area moves the view. The active tool is paused meanwhile and resumed
					when pan mode ends. Turning it on does nothing at zoom 1. Changing the menu or the tool ends pan
					mode.
				</p>
			</ApiMethod>

			<ApiMethod
				name='togglePanning'
				signature='editor.togglePanning(): void'
				example={`editor.togglePanning();
return editor.getState().panning;`}
				run={(editor) => {
					editor.togglePanning();
					return editor.getState().panning;
				}}
			>
				<p>Turns pan mode on or off (the hand button).</p>
			</ApiMethod>

			<ApiMethod
				name='setViewportSize'
				signature='editor.setViewportSize(width: number, height: number): void'
				params={[
					{ name: 'width', type: 'number', description: 'Available width in CSS pixels.' },
					{ name: 'height', type: 'number', description: 'Available height in CSS pixels.' },
				]}
				example={`// only needed when you call editor.attach() yourself
new ResizeObserver(() => {
  editor.setViewportSize(container.clientWidth, container.clientHeight);
}).observe(container);`}
			>
				<p>
					The size of the area the photo is fitted into. <code>{'<EditorCanvas>'}</code> calls it whenever its
					element is resized, so you only need it when you mount the canvas yourself.
				</p>
			</ApiMethod>

			<H2 id='export'>Export</H2>

			<ApiMethod
				name='exportImage'
				signature='editor.exportImage(options?: ExportOptions): Promise<Blob>'
				returns='Promise<Blob>'
				example={`const blob = await editor.exportImage({ format: 'jpeg', quality: 0.85 });
// upload it, or show it: URL.createObjectURL(blob)
return blob;`}
				run={async (editor) => editor.exportImage({ format: 'jpeg', quality: 0.85 })}
			>
				<p>
					Renders the edited image: the photo with crop, rotation, filters and annotations, without the
					editing UI and independent of the zoom. Options are merged over the <code>exportOptions</code> prop.
					A tool with pending work finishes it first (e.g. an unapplied crop rectangle is applied).
				</p>
				<PropTable
					nameLabel='ExportOptions'
					rows={[
						{
							name: 'format',
							type: "'png' | 'jpeg' | 'webp'",
							default: "'png'",
							description: <span>Image type of the blob.</span>,
						},
						{
							name: 'quality',
							type: 'number',
							default: '1',
							description: <span>0 – 1, used by jpeg and webp.</span>,
						},
						{
							name: 'multiplier',
							type: 'number',
							default: 'original resolution',
							description: (
								<span>
									Scale relative to the scene units (1 = 1000 × 508 box). By default the photo's
									original resolution times the{' '}
									<DocLink to='api/image#output-size'>output size</DocLink>. Passing it ignores the
									output size.
								</span>
							),
						},
						{
							name: 'maxPixels',
							type: 'number',
							default: '16 000 000',
							description: (
								<span>
									Upper limit of exported pixels; larger exports are scaled down. Browsers fail to
									create bigger canvases (especially Safari / iOS).
								</span>
							),
						},
					]}
				/>
				<Callout type='warning' title='Images from other origins'>
					<p>
						Exporting fails (the promise rejects) when the photo or an added image came from another origin
						without CORS headers: the browser marks the canvas as tainted. Serve images with{' '}
						<code>Access-Control-Allow-Origin</code> or load them as a Blob. See{' '}
						<DocLink to='troubleshooting'>Troubleshooting</DocLink>.
					</p>
				</Callout>
			</ApiMethod>

			<ApiMethod
				name='save'
				signature='editor.save(): Promise<SaveResult | null>'
				returns='Promise<{ blob, json } | null>'
				example={`const result = await editor.save();
// onSave was called with the same result (or the image was downloaded)
return result && { blob: result.blob, objects: result.json.objects.length };`}
				run={async (editor) => {
					const result = await editor.save();
					return result && { blob: result.blob, objects: result.json.objects.length };
				}}
				runLabel='Run (downloads the image)'
			>
				<p>
					What the Save button does: exports the image with the default export options and takes the JSON,
					then calls <code>onSave</code>, or downloads the image when there is no <code>onSave</code>. Emits
					the <code>save</code> event. Errors (e.g. a tainted canvas) are reported through{' '}
					<code>onError</code> / the <code>error</code> event and the promise resolves to <code>null</code>;
					it never rejects.
				</p>
			</ApiMethod>
		</ApiPlayground>
	);
}
