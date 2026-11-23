import { ApiMethod, ApiPlayground, Callout, DocLink, H2, PageHeader } from '../../ui';

export function ImagePage() {
	return (
		<ApiPlayground>
			<PageHeader
				eyebrow='API reference'
				title='Rotate, filters & size'
				lead='Change the photo itself: rotate and flip it, apply filters and adjustments, and set the size of the exported image.'
			/>

			<p>
				All of these record one history entry by default. Pass <code>{'{ commit: false }'}</code> for live
				previews (e.g. while a slider is dragged) and call <code>editor.commit()</code> once at the end.
			</p>

			<H2 id='rotate-and-flip'>Rotate &amp; flip</H2>
			<p>
				Annotations follow the photo. Shapes, arrows, lines and drawings turn with it; text, emoji, steps and
				callouts only move, so they stay readable; blur areas and the crop stay axis-aligned (a quarter turn
				swaps their width and height).
			</p>

			<ApiMethod
				name='rotateImage'
				signature='editor.rotateImage(degrees: number, options?: { commit?: boolean }): void'
				params={[
					{
						name: 'degrees',
						type: 'number',
						description:
							'Clockwise, relative to the current rotation. Negative values rotate counter-clockwise.',
					},
					{
						name: 'options.commit',
						type: 'boolean',
						default: 'true',
						description: 'false: no history entry.',
					},
				]}
				example={`editor.rotateImage(90);
return { rotation: editor.getImageRotation(), scene: editor.getSceneSize() };`}
				run={(editor) => {
					editor.rotateImage(90);
					return { rotation: editor.getImageRotation(), scene: editor.getSceneSize() };
				}}
			>
				<p>
					Rotates the photo and the annotations by the given angle (any angle, not just 90° steps). The scene
					becomes the bounding box of the rotated photo, so the export has no cut-off corners. Multiples of
					360 do nothing. The active tool is paused and resumed.
				</p>
			</ApiMethod>

			<ApiMethod
				name='setImageRotation'
				signature='editor.setImageRotation(degrees: number, options?: { commit?: boolean }): void'
				params={[
					{ name: 'degrees', type: 'number', description: 'Absolute angle, e.g. 0, 90, 12.5, -45.' },
					{
						name: 'options.commit',
						type: 'boolean',
						default: 'true',
						description: 'false: no history entry.',
					},
				]}
				example={`editor.setImageRotation(15); // straighten a slightly tilted photo
return editor.getImageRotation();`}
				run={(editor) => {
					editor.setImageRotation(15);
					return editor.getImageRotation();
				}}
			>
				<p>
					Rotates to an absolute angle (the Angle slider of the Rotate menu). With the angle already set and{' '}
					<code>commit</code> on, it only commits, which is how a slider drag with{' '}
					<code>{'{ commit: false }'}</code> ends.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getImageRotation'
				signature='editor.getImageRotation(): number'
				returns='number (0 – 360)'
				example={`return editor.getImageRotation();`}
				run={(editor) => editor.getImageRotation()}
			>
				<p>The rotation of the photo in degrees, normalized to 0 – 360.</p>
			</ApiMethod>

			<ApiMethod
				name='flipImage'
				signature="editor.flipImage(direction: 'horizontal' | 'vertical', options?: { commit?: boolean }): void"
				params={[
					{
						name: 'direction',
						type: "'horizontal' | 'vertical'",
						description: 'horizontal mirrors left ↔ right, vertical top ↔ bottom.',
					},
					{
						name: 'options.commit',
						type: 'boolean',
						default: 'true',
						description: 'false: no history entry.',
					},
				]}
				example={`editor.flipImage('horizontal');
return editor.getImageFlip();`}
				run={(editor) => {
					editor.flipImage('horizontal');
					return editor.getImageFlip();
				}}
			>
				<p>
					Mirrors the photo and the positions of the annotations. Calling it twice flips back. Texts are
					moved, not mirrored.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getImageFlip'
				signature='editor.getImageFlip(): { horizontal: boolean; vertical: boolean }'
				returns='{ horizontal, vertical }'
				example={`return editor.getImageFlip();`}
				run={(editor) => editor.getImageFlip()}
			>
				<p>Whether the photo is mirrored.</p>
			</ApiMethod>

			<H2 id='filters'>Filters &amp; adjustments</H2>
			<p>
				Filters are identified by id (<code>'brightness'</code>, <code>'sepia'</code>, <code>'blur'</code>…; see{' '}
				<DocLink to='filters'>Filters &amp; adjustments</DocLink> for the full list and their options). The
				state is a plain object <code>{'{ [filterId]: options }'}</code>, saved in the JSON. Filters are applied
				in the order of their definitions, adjustments first. Redacted areas are re-rendered so they stay
				blurred on the filtered photo.
			</p>

			<ApiMethod
				name='setImageFilter'
				signature='editor.setImageFilter(id: string, options: object | null, settings?: { commit?: boolean }): void'
				params={[
					{ name: 'id', type: 'string', description: 'Filter id.' },
					{
						name: 'options',
						type: 'object | null',
						description:
							'Options merged over the filter defaults and its current options ({} = defaults). null removes the filter.',
					},
					{
						name: 'settings.commit',
						type: 'boolean',
						default: 'true',
						description: 'false: no history entry.',
					},
				]}
				example={`editor.setImageFilter('brightness', { value: 0.15 });
editor.setImageFilter('vintage', {});
editor.setImageFilter('tint', { color: '#2563eb', alpha: 0.2 });
return editor.getImageFilters();`}
				run={(editor) => {
					editor.setImageFilter('brightness', { value: 0.15 });
					editor.setImageFilter('vintage', {});
					editor.setImageFilter('tint', { color: '#2563eb', alpha: 0.2 });
					return editor.getImageFilters();
				}}
			>
				<p>
					Turns a filter on, changes its options, or removes it with <code>null</code>. Unknown ids are
					ignored. Adjustments (<code>group: 'adjust'</code>) at their neutral value are removed by the Adjust
					panel; this method keeps whatever you set.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getImageFilters'
				signature='editor.getImageFilters(): Record<string, object>'
				returns='{ [filterId]: options }'
				example={`return editor.getImageFilters();`}
				run={(editor) => editor.getImageFilters()}
			>
				<p>The active filters and their options (a copy, changing it has no effect).</p>
			</ApiMethod>

			<ApiMethod
				name='clearImageFilters'
				signature="editor.clearImageFilters(settings?: { commit?: boolean; group?: 'filter' | 'adjust' }): void"
				params={[
					{
						name: 'settings.group',
						type: "'filter' | 'adjust'",
						default: 'all',
						description:
							"'filter' removes only the filters of the Filter menu, 'adjust' only the adjustments (brightness, contrast…). Without it, both are removed.",
					},
					{
						name: 'settings.commit',
						type: 'boolean',
						default: 'true',
						description: 'false: no history entry.',
					},
				]}
				example={`editor.setImageFilter('brightness', { value: 0.2 });
editor.setImageFilter('sepia', {});
editor.clearImageFilters({ group: 'filter' });
return editor.getImageFilters(); // { brightness: { value: 0.2 } }`}
				run={(editor) => {
					editor.setImageFilter('brightness', { value: 0.2 });
					editor.setImageFilter('sepia', {});
					editor.clearImageFilters({ group: 'filter' });
					return editor.getImageFilters();
				}}
			>
				<p>
					Removes filters as one undo step. The Filter panel&rsquo;s Clear button uses{' '}
					<code>{"{ group: 'filter' }"}</code>, the Adjust panel&rsquo;s &ldquo;Reset adjustments&rdquo;{' '}
					<code>{"{ group: 'adjust' }"}</code>.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getFilterDefinitions'
				signature='editor.getFilterDefinitions(): FilterDefinition[]'
				returns='FilterDefinition[]'
				example={`return editor.getFilterDefinitions().map((filter) => \`\${filter.id} (\${filter.group ?? 'filter'})\`);`}
				run={(editor) =>
					editor.getFilterDefinitions().map((filter) => `${filter.id} (${filter.group ?? 'filter'})`)
				}
			>
				<p>
					All filters: the built-in ones (replaced by yours with the same id) followed by your own from the{' '}
					<code>filters</code> prop, in the order they are applied. Use it to build your own filter UI.
				</p>
			</ApiMethod>

			<H2 id='output-size'>Output size</H2>
			<p>
				By default the image is exported at its original resolution (after crop and rotation). The output size
				scales that, it does not change what you see in the editor. It is part of the history and the JSON (
				<code>fpResize</code>).
			</p>
			<Callout type='note'>
				<p>
					An explicit <code>multiplier</code> passed to{' '}
					<DocLink to='api/view-and-export#exportimage'>exportImage</DocLink> (or in{' '}
					<code>exportOptions</code>) replaces the output size.
				</p>
			</Callout>

			<ApiMethod
				name='getNaturalSize'
				signature='editor.getNaturalSize(): { width: number; height: number }'
				returns='{ width, height } in pixels'
				example={`return editor.getNaturalSize();`}
				run={(editor) => editor.getNaturalSize()}
			>
				<p>
					Pixel size of the export at the original resolution: the size of the photo, or of the crop,
					including the rotation.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getOutputSize'
				signature='editor.getOutputSize(): { width: number; height: number }'
				returns='{ width, height } in pixels'
				example={`return editor.getOutputSize();`}
				run={(editor) => editor.getOutputSize()}
			>
				<p>
					Pixel size of the exported image: the natural size times the output scale. (Very large exports are
					still limited by <code>maxPixels</code>.)
				</p>
			</ApiMethod>

			<ApiMethod
				name='setOutputSize'
				signature='editor.setOutputSize(size: { width?: number; height?: number }, options?: { keepAspect?: boolean; commit?: boolean }): void'
				params={[
					{
						name: 'size.width / size.height',
						type: 'number',
						description: 'Target size in pixels. Pass one of them to keep the aspect ratio.',
					},
					{
						name: 'options.keepAspect',
						type: 'boolean',
						default: 'true',
						description:
							'true: the other side follows (width wins when both are given). false: each side is scaled on its own, the image is stretched.',
					},
					{
						name: 'options.commit',
						type: 'boolean',
						default: 'true',
						description: 'false: no history entry.',
					},
				]}
				example={`editor.setOutputSize({ width: 800 });
return editor.getOutputSize();`}
				run={(editor) => {
					editor.setOutputSize({ width: 800 });
					return editor.getOutputSize();
				}}
			>
				<p>
					Resizes the exported image to pixels, like the Resize menu. The size is stored relative to the
					natural size, so cropping afterwards keeps the scale, not the pixels.
				</p>
			</ApiMethod>

			<ApiMethod
				name='getOutputScale'
				signature='editor.getOutputScale(): { x: number; y: number }'
				returns='{ x, y }, 1 = original size'
				example={`return editor.getOutputScale();`}
				run={(editor) => editor.getOutputScale()}
			>
				<p>The output scale relative to the natural size.</p>
			</ApiMethod>

			<ApiMethod
				name='setOutputScale'
				signature='editor.setOutputScale(x: number, y?: number, options?: { commit?: boolean }): void'
				params={[
					{ name: 'x', type: 'number', description: 'Horizontal scale, e.g. 0.5 for half the size.' },
					{
						name: 'y',
						type: 'number',
						default: 'x',
						description: 'Vertical scale. A different value stretches the image.',
					},
					{
						name: 'options.commit',
						type: 'boolean',
						default: 'true',
						description: 'false: no history entry.',
					},
				]}
				example={`editor.setOutputScale(0.5);
return editor.getOutputSize();`}
				run={(editor) => {
					editor.setOutputScale(0.5);
					return editor.getOutputSize();
				}}
			>
				<p>
					Scales the export. <code>setOutputScale(1)</code> goes back to the original size. Values that are
					not positive numbers are ignored.
				</p>
			</ApiMethod>
		</ApiPlayground>
	);
}
