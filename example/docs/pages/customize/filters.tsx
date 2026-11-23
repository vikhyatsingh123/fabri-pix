import { useRef, useState } from 'react';
import { filters } from 'fabric';
import { builtInFilters, type FilterDefinition, type ImageEditorController } from 'fabri-pix';

import {
	Callout,
	CodeBlock,
	Demo,
	DemoButton,
	DemoControls,
	DemoEditor,
	DemoLog,
	DocLink,
	H2,
	H3,
	PageHeader,
	PropTable,
	Table,
	useLog,
} from '../../ui';

const describeOptions = (filter: FilterDefinition) =>
	filter.defaultOptions
		? Object.entries(filter.defaultOptions)
				.map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
				.join(', ')
		: '—';

const describeControls = (filter: FilterDefinition) =>
	filter.controls?.length
		? filter.controls
				.map((control) =>
					control.type === 'color'
						? `${control.key}: color`
						: control.type === 'select'
							? `${control.key}: ${control.options?.join(' | ')}`
							: `${control.key}: ${control.min} … ${control.max}`,
				)
				.join('; ')
		: 'on / off';

// a custom filter and a replaced built-in one
const customFilters: FilterDefinition[] = [
	{
		id: 'warm',
		label: 'Warm',
		defaultOptions: { amount: 0.25 },
		controls: [{ key: 'amount', min: 0, max: 0.6, step: 0.01 }],
		create: ({ amount }) => new filters.BlendColor({ color: '#ff9a3c', mode: 'multiply', alpha: amount }),
	},
	{
		id: 'duotone',
		label: 'Duotone',
		defaultOptions: { color: '#2563eb', mode: 'screen' },
		controls: [
			{ key: 'color', type: 'color' },
			{ key: 'mode', type: 'select', options: ['screen', 'multiply', 'overlay', 'lighten', 'darken'] },
		],
		create: ({ color, mode }) =>
			new filters.Composed({
				subFilters: [new filters.Grayscale(), new filters.BlendColor({ color, mode, alpha: 1 })],
			}),
	},
	// same id as the built-in sepia: replaces it, here with an adjustable strength
	{
		id: 'sepia',
		label: 'Sepia',
		defaultOptions: { strength: 0.6 },
		controls: [{ key: 'strength', min: 0, max: 1, step: 0.05 }],
		create: ({ strength }) => new filters.BlendColor({ color: '#704214', mode: 'tint', alpha: strength }),
	},
];

function ApiDemo() {
	const editorRef = useRef<ImageEditorController>(null);
	const { entries, log, clear } = useLog();
	const [brightness, setBrightness] = useState(0);
	const run = (label: string, action: (editor: ImageEditorController) => void) => {
		const editor = editorRef.current;
		if (!editor?.getState().ready) {
			return;
		}
		action(editor);
		log(label, '→ getImageFilters():', editor.getImageFilters());
	};
	return (
		<Demo
			title='Filters from code'
			description='The buttons call the editor API. Open the Filter or Adjust menu to see the panels follow along; everything is undoable.'
			code={`const editor = useRef<ImageEditorController>(null);

<ImageEditor ref={editor} src={imageUrl} />

editor.current.setImageFilter('grayscale', {});                 // turn on with default options
editor.current.setImageFilter('pixelate', { value: 8 });        // with options
editor.current.setImageFilter('tint', { color: '#00aaff' });    // options are merged with the defaults
editor.current.setImageFilter('grayscale', null);               // turn off
editor.current.clearImageFilters({ group: 'filter' });         // remove the filters, keep adjustments
editor.current.clearImageFilters();                              // remove all, adjustments included
editor.current.getImageFilters();                                // { pixelate: { value: 8 }, … }

// a slider: no undo step while dragging, one at the end
editor.current.setImageFilter('brightness', { value }, { commit: false });
editor.current.commit();`}
		>
			<DemoControls>
				<DemoButton
					onClick={() =>
						run("setImageFilter('grayscale', {})", (editor) => editor.setImageFilter('grayscale', {}))
					}
				>
					Grayscale
				</DemoButton>
				<DemoButton
					onClick={() =>
						run("setImageFilter('vintage', {})", (editor) => editor.setImageFilter('vintage', {}))
					}
				>
					Vintage
				</DemoButton>
				<DemoButton
					onClick={() =>
						run("setImageFilter('pixelate', { value: 8 })", (editor) =>
							editor.setImageFilter('pixelate', { value: 8 }),
						)
					}
				>
					Pixelate 8
				</DemoButton>
				<DemoButton
					onClick={() =>
						run("setImageFilter('tint', { color: '#00aaff' })", (editor) =>
							editor.setImageFilter('tint', { color: '#00aaff' }),
						)
					}
				>
					Blue tint
				</DemoButton>
				<DemoButton
					onClick={() =>
						run("setImageFilter('grayscale', null)", (editor) => editor.setImageFilter('grayscale', null))
					}
				>
					Grayscale off
				</DemoButton>
				<DemoButton
					onClick={() =>
						run('clearImageFilters()', (editor) => {
							editor.clearImageFilters();
							setBrightness(0);
						})
					}
				>
					Clear all
				</DemoButton>
				<label>
					brightness
					<input
						type='range'
						min={-1}
						max={1}
						step={0.01}
						value={brightness}
						onChange={(event) => {
							const value = Number(event.target.value);
							setBrightness(value);
							editorRef.current?.setImageFilter('brightness', { value }, { commit: false });
						}}
						onPointerUp={() => run('commit()', (editor) => editor.commit())}
					/>
				</label>
			</DemoControls>
			<DemoEditor ref={editorRef} height={400} />
			<DemoLog entries={entries} onClear={clear} />
		</Demo>
	);
}

function FiltersPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Filters & adjustments'
				lead='Color adjustments (brightness, contrast…) and effects (grayscale, vintage, pixelate…) are applied to the photo. Use the built-in ones, rename them, replace them, or add your own Fabric.js filters.'
			/>

			<H2 id='two-groups'>Adjustments and filters</H2>
			<p>Every filter definition belongs to one of two groups:</p>
			<Table
				head={['Group', 'Shown in', 'Behaves like']}
				rows={[
					[
						<code key='g'>'adjust'</code>,
						'Adjust menu, as always-visible sliders',
						<>
							A correction. Each adjustment has a <code>neutral</code> value (e.g. brightness 0) at which
							it is removed again.
						</>,
					],
					[
						<code key='g'>'filter'</code>,
						'Filter menu, as on / off buttons (default group)',
						'An effect you switch on. Filters with controls show them while they are on.',
					],
				]}
			/>
			<p>
				Both are stored on the photo only: annotations are not filtered, redaction areas are refreshed so they
				keep hiding the filtered image, and the result is in the exported image. Filters are applied in the
				order of the definitions: the built-in adjustments, the built-in effects, then your own filters.
			</p>

			<H2 id='built-in'>Built-in filters</H2>
			<p>
				The list is exported as <code>builtInFilters</code>. Options are the values you pass to{' '}
				<code>setImageFilter</code>.
			</p>
			<Table
				head={['Id', 'Label', 'Group', 'Default options', 'Controls']}
				rows={builtInFilters.map((filter) => [
					<code key='i'>{filter.id}</code>,
					filter.label,
					filter.group ?? 'filter',
					<code key='o'>{describeOptions(filter)}</code>,
					describeControls(filter),
				])}
			/>

			<H2 id='from-code'>Applying filters from code</H2>
			<p>
				<DocLink to='api/image#setimagefilter'>setImageFilter(id, options | null)</DocLink> switches a filter on
				(or changes its options) and <code>null</code> switches it off. Options are merged with the
				filter&apos;s defaults and its current options, so you can change one option at a time.
			</p>
			<ApiDemo />
			<Callout>
				<p>
					Each call records an undo step unless you pass <code>{'{ commit: false }'}</code>. The Clear button
					of the Filter panel removes only the filters (
					<code>{"clearImageFilters({ group: 'filter' })"}</code>
					), &ldquo;Reset adjustments&rdquo; only the adjustments (<code>{"{ group: 'adjust' }"}</code>).{' '}
					<code>clearImageFilters()</code> without a group removes both, and so does Reset (the action
					button).
				</p>
			</Callout>

			<H2 id='custom-filters'>Your own filters</H2>
			<p>
				Pass definitions through the <code>filters</code> prop. A new id adds a filter (shown after the built-in
				ones); the id of a built-in filter replaces it at the same position. <code>create</code> returns a{' '}
				<a href='https://fabricjs.com/docs/' target='_blank' rel='noreferrer'>
					Fabric.js filter
				</a>{' '}
				from the options.
			</p>
			<Demo
				title='Warm, Duotone and a stronger Sepia'
				description='Open the Filter menu: Warm and Duotone are new, Sepia is replaced by a version with a strength slider.'
				code={`import { filters } from 'fabric';
import type { FilterDefinition } from 'fabri-pix';

const customFilters: FilterDefinition[] = [
	{
		id: 'warm',
		label: 'Warm',
		defaultOptions: { amount: 0.25 },
		controls: [{ key: 'amount', min: 0, max: 0.6, step: 0.01 }],
		create: ({ amount }) => new filters.BlendColor({ color: '#ff9a3c', mode: 'multiply', alpha: amount }),
	},
	{
		id: 'duotone',
		label: 'Duotone',
		defaultOptions: { color: '#2563eb', mode: 'screen' },
		controls: [
			{ key: 'color', type: 'color' },
			{ key: 'mode', type: 'select', options: ['screen', 'multiply', 'overlay', 'lighten', 'darken'] },
		],
		// several fabric filters combined into one
		create: ({ color, mode }) =>
			new filters.Composed({ subFilters: [new filters.Grayscale(), new filters.BlendColor({ color, mode, alpha: 1 })] }),
	},
	// same id as the built-in sepia: replaces it
	{
		id: 'sepia',
		label: 'Sepia',
		defaultOptions: { strength: 0.6 },
		controls: [{ key: 'strength', min: 0, max: 1, step: 0.05 }],
		create: ({ strength }) => new filters.BlendColor({ color: '#704214', mode: 'tint', alpha: strength }),
	},
];

<ImageEditor src={imageUrl} filters={customFilters} />`}
			>
				<DemoEditor filters={customFilters} />
			</Demo>
			<Callout type='tip' title='Combining filters'>
				<p>
					<code>create</code> returns one Fabric.js filter. To combine several, wrap them in{' '}
					<code>{'new filters.Composed({ subFilters: [...] })'}</code> like the Duotone example.
				</p>
			</Callout>

			<H3 id='filter-definition'>FilterDefinition</H3>
			<PropTable
				nameLabel='Property'
				rows={[
					{
						name: 'id',
						type: 'string',
						required: true,
						description: 'Unique id, stored in the saved JSON. Never change it once states are saved.',
					},
					{
						name: 'label',
						type: 'string',
						required: true,
						description: 'Name in the panels (translatable through labels.filters).',
					},
					{
						name: 'group',
						type: "'filter' | 'adjust'",
						default: "'filter'",
						description: 'Filter menu button or Adjust menu slider.',
					},
					{
						name: 'defaultOptions',
						type: 'object',
						description:
							'Options when the filter is switched on; missing options passed to setImageFilter come from here.',
					},
					{
						name: 'neutral',
						type: 'object',
						description:
							"For 'adjust': options at which the adjustment has no effect and is removed, e.g. { value: 0 }.",
					},
					{
						name: 'controls',
						type: 'FilterControl[]',
						description: 'Inputs shown in the panel, one per option.',
					},
					{
						name: 'create',
						type: '(options) => fabric filter',
						required: true,
						description: 'Creates the Fabric.js filter.',
					},
				]}
			/>
			<H3 id='filter-control'>FilterControl</H3>
			<PropTable
				nameLabel='Property'
				rows={[
					{ name: 'key', type: 'string', required: true, description: 'The option this control changes.' },
					{
						name: 'type',
						type: "'range' | 'color' | 'select'",
						default: "'range'",
						description: 'Slider, color picker or select.',
					},
					{ name: 'min', type: 'number', default: '0', description: 'range: smallest value.' },
					{ name: 'max', type: 'number', default: '1', description: 'range: largest value.' },
					{ name: 'step', type: 'number', default: '0.01', description: 'range: step size.' },
					{ name: 'options', type: 'string[]', description: 'select: the choices.' },
				]}
			/>
			<p>
				An <code>adjust</code> filter shows one slider per control in the Adjust menu. Example, a sharpness
				slider next to brightness &amp; co:
			</p>
			<CodeBlock
				code={`import { filters } from 'fabric';

const sharpness: FilterDefinition = {
	id: 'sharpness',
	label: 'Sharpness',
	group: 'adjust',
	defaultOptions: { value: 0 },
	neutral: { value: 0 },
	controls: [{ key: 'value', min: 0, max: 1, step: 0.05 }],
	create: ({ value }) => new filters.Convolute({ matrix: [0, -value, 0, -value, 1 + 4 * value, -value, 0, -value, 0] }),
};

<ImageEditor src={imageUrl} filters={[sharpness]} />`}
			/>

			<H2 id='rename-remove'>Rename or hide filters</H2>
			<p>
				Rename with <code>labels.filters</code> (by id), see <DocLink to='labels'>Labels</DocLink>. To hide the
				Filter or Adjust menu, leave the <code>filter</code> or <code>adjust</code> tool out of{' '}
				<DocLink to='tools-and-menus'>tools</DocLink>. Single built-in filters can&apos;t be removed from the
				list; to offer only your own effects, build your own panel with{' '}
				<DocLink to='api/image#getfilterdefinitions'>getFilterDefinitions</DocLink> and{' '}
				<code>setImageFilter</code> (see <DocLink to='custom-tools'>Custom tools</DocLink>).
			</p>
			<CodeBlock
				code={`<ImageEditor src={imageUrl} labels={{ filters: { blackWhite: 'Noir', blur: 'Soften' } }} />`}
			/>
			<Callout type='tip' title='Saved states'>
				<p>
					The saved JSON stores only <code>{'{ [filterId]: options }'}</code>, not the fabric filters, so you
					can improve a filter definition later and old states pick up the new version.
				</p>
			</Callout>
		</>
	);
}

export default FiltersPage;
