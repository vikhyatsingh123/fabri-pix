import { useMemo, useState } from 'react';
import type { EditorAction, EditorLayout, ObjectControl } from 'fabri-pix';

import {
	Callout,
	CodeBlock,
	Demo,
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
	formatValue,
} from '../../ui';
import { canvasJson } from '../../../canvasJson';

const allActions: EditorAction[] = ['load', 'deleteAll', 'reset', 'cancel', 'exportJson', 'save'];
const allControls: ObjectControl[] = ['opacity', 'shadow', 'dashed', 'cornerRadius', 'layers', 'duplicate', 'delete'];

type Position = 'top' | 'bottom' | 'none';

function LayoutDemo() {
	const [layout, setLayout] = useState<Required<EditorLayout>>({
		menu: 'top',
		header: 'top',
		toolbar: 'bottom',
		contextPanel: 'bottom',
		actions: 'top',
	});
	const stableLayout = useMemo(() => layout, [layout]);
	const set = (key: keyof EditorLayout, value: string) => setLayout((current) => ({ ...current, [key]: value }));
	const positions: Position[] = ['top', 'bottom', 'none'];
	return (
		<Demo
			title='Move the parts around'
			code={`<ImageEditor
	src={imageUrl}
	layout={{ menu: '${layout.menu}', header: '${layout.header}', toolbar: '${layout.toolbar}', contextPanel: '${layout.contextPanel}', actions: '${layout.actions}' }}
/>`}
		>
			<DemoControls>
				<label>
					menu
					<select value={layout.menu} onChange={(event) => set('menu', event.target.value)}>
						{['left', 'right', 'top', 'bottom', 'none'].map((value) => (
							<option key={value}>{value}</option>
						))}
					</select>
				</label>
				{(['header', 'toolbar', 'contextPanel', 'actions'] as const).map((key) => (
					<label key={key}>
						{key}
						<select value={layout[key]} onChange={(event) => set(key, event.target.value)}>
							{positions.map((value) => (
								<option key={value}>{value}</option>
							))}
						</select>
					</label>
				))}
			</DemoControls>
			<DemoEditor layout={stableLayout} />
		</Demo>
	);
}

function ActionsDemo() {
	const [actions, setActions] = useState<EditorAction[]>(['load', 'deleteAll', 'cancel', 'exportJson', 'save']);
	const { entries, log, clear } = useLog();
	const toggle = (action: EditorAction) =>
		setActions((current) =>
			current.includes(action)
				? current.filter((item) => item !== action)
				: allActions.filter((item) => [...current, action].includes(item)),
		);
	return (
		<Demo
			title='Choose the action buttons'
			description='Cancel calls onCancel, Export JSON calls onExportJson and Save calls onSave. Here they print to the output instead of closing a dialog or uploading.'
			code={`<ImageEditor
	src={imageUrl}
	initialState={savedJson}
	actions={[${actions.map((action) => `'${action}'`).join(', ')}]}
	onCancel={() => closeDialog()}
	onExportJson={(json) => storeJson(json)}
	onSave={({ blob, json }) => upload(blob, json)}
/>`}
		>
			<DemoControls>
				{allActions.map((action) => (
					<label key={action}>
						<input type='checkbox' checked={actions.includes(action)} onChange={() => toggle(action)} />
						{action}
					</label>
				))}
			</DemoControls>
			<DemoEditor
				initialState={canvasJson}
				actions={actions}
				onCancel={() => log('onCancel()')}
				onExportJson={(json) =>
					log('onExportJson(json) →', `${json.objects?.length ?? 0} objects`, formatValue(json).slice(0, 120))
				}
				onSave={({ blob }) => log('onSave({ blob, json }) →', blob)}
			/>
			<DemoLog entries={entries} onClear={clear} placeholder='Click Cancel, Export JSON or Save' />
		</Demo>
	);
}

function ObjectControlsDemo() {
	const [controls, setControls] = useState<ObjectControl[]>(['opacity', 'layers', 'delete']);
	const toggle = (control: ObjectControl) =>
		setControls((current) =>
			current.includes(control)
				? current.filter((item) => item !== control)
				: allControls.filter((item) => [...current, control].includes(item)),
		);
	return (
		<Demo
			title='Controls of selected objects'
			description='Select a shape on the image to see the controls in the options panel. The order of the array is the order of the controls.'
			code={`<ImageEditor src={imageUrl} objectControls={[${controls.map((control) => `'${control}'`).join(', ')}]} />`}
		>
			<DemoControls>
				{allControls.map((control) => (
					<label key={control}>
						<input type='checkbox' checked={controls.includes(control)} onChange={() => toggle(control)} />
						{control}
					</label>
				))}
			</DemoControls>
			<DemoEditor initialState={canvasJson} objectControls={controls} height={420} />
		</Demo>
	);
}

function LayoutPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Layout & actions'
				lead='Decide where the menu, the header, the toolbar, the options panel and the action buttons go, which action buttons exist, and which controls selected objects get.'
			/>

			<H2 id='parts'>The parts of the editor</H2>
			<Table
				head={['Part', 'Contains', 'layout key', 'Default']}
				rows={[
					[
						'Menu bar',
						'Menu tabs (Annotate, Crop, Rotate…)',
						<code key='k'>menu</code>,
						<code key='d'>'left'</code>,
					],
					[
						'Header',
						'History, undo / redo, zoom and pan',
						<code key='k'>header</code>,
						<code key='d'>'top'</code>,
					],
					['Toolbar', 'Tools of the open menu', <code key='k'>toolbar</code>, <code key='d'>'bottom'</code>],
					[
						'Options panel',
						'Options of the active tool or the selected object',
						<code key='k'>contextPanel</code>,
						<code key='d'>'bottom'</code>,
					],
					[
						'Actions',
						'Reset, Save and the other action buttons',
						<code key='k'>actions</code>,
						<code key='d'>'bottom'</code>,
					],
				]}
			/>
			<p>
				The menu bar sits next to the canvas (<code>'left'</code>, <code>'right'</code>) or above / below it (
				<code>'top'</code>, <code>'bottom'</code>). The other parts are stacked above or below the canvas.{' '}
				<code>'none'</code> hides a part.
			</p>

			<H2 id='layout-prop'>The layout prop</H2>
			<LayoutDemo />
			<PropTable
				nameLabel='Key'
				rows={[
					{
						name: 'menu',
						type: "'left' | 'right' | 'top' | 'bottom' | 'none'",
						default: "'left'",
						description: 'Menu tabs.',
					},
					{
						name: 'header',
						type: "'top' | 'bottom' | 'none'",
						default: "'top'",
						description: 'History and zoom controls.',
					},
					{
						name: 'toolbar',
						type: "'top' | 'bottom' | 'none'",
						default: "'bottom'",
						description: 'Tools of the active menu.',
					},
					{
						name: 'contextPanel',
						type: "'top' | 'bottom' | 'none'",
						default: "'bottom'",
						description: 'Options of the selected object / active tool.',
					},
					{
						name: 'actions',
						type: "'top' | 'bottom' | 'none'",
						default: "'bottom'",
						description: 'Action buttons.',
					},
				]}
			/>
			<p>
				Parts at the same position are stacked the same way on both sides, starting at the canvas:{' '}
				<em>options panel, toolbar, actions, header</em>. With the defaults, the options panel is directly below
				the image, then the toolbar, then the actions.
			</p>
			<Callout type='tip'>
				<p>
					Need something the positions can&apos;t express, like the actions in your own dialog footer? Hide
					the part with <code>'none'</code> and render it yourself, or build the whole layout with the
					exported building blocks: <DocLink to='custom-layout'>Custom layout</DocLink>.
				</p>
			</Callout>

			<Callout type='tip' title='Narrow editors'>
				<p>
					Below 640px of editor width, a menu on the left or right moves above the image and the bars become
					single rows that scroll sideways. See{' '}
					<DocLink to='touch-and-mobile#narrow-layout'>the narrow layout</DocLink>.
				</p>
			</Callout>

			<H2 id='actions'>Action buttons</H2>
			<p>
				<code>actions</code> lists the buttons of the actions bar, in this order. The default is{' '}
				<code>['reset', 'save']</code>, or <code>['cancel', 'reset', 'save']</code> when you pass{' '}
				<code>onCancel</code>.
			</p>
			<Table
				head={['Action', 'What it does', 'Related prop']}
				rows={[
					[
						<code key='a'>load</code>,
						'Opens a file picker and edits the chosen image instead (a new history starts).',
						'—',
					],
					[
						<code key='a'>deleteAll</code>,
						'Removes all annotations. Keeps crop, rotation, filters and size. One undo step.',
						'—',
					],
					[
						<code key='a'>reset</code>,
						'Removes all annotations and also the crop, rotation, flip, filters and resize. One undo step.',
						'—',
					],
					[
						<code key='a'>cancel</code>,
						'Calls onCancel (e.g. close your dialog). Always enabled.',
						<code key='p'>onCancel</code>,
					],
					[
						<code key='a'>exportJson</code>,
						'Calls onExportJson with the editor state, or downloads it as a .json file when the prop is missing.',
						<code key='p'>onExportJson</code>,
					],
					[
						<code key='a'>save</code>,
						'Exports the image and the JSON and calls onSave({ blob, json }), or downloads the image when the prop is missing.',
						<code key='p'>onSave</code>,
					],
				]}
			/>
			<ActionsDemo />
			<p>
				Each action button has an extra class <code>fp-action-&lt;name&gt;</code> (e.g.{' '}
				<code>fp-action-save</code>) to style it, e.g. a filled Save button. The same things are available in
				code: <DocLink to='api/history#setsource'>setSource</DocLink>,{' '}
				<DocLink to='api/objects#clearannotations'>clearAnnotations</DocLink>,{' '}
				<DocLink to='api/objects#reset'>reset</DocLink>, <DocLink to='api/history#tojson'>toJSON</DocLink> and{' '}
				<DocLink to='api/view-and-export#save'>save</DocLink>.
			</p>
			<CodeBlock
				lang='css'
				code={`.fp-action-save {
	background: #2563eb;
	color: #fff;
}`}
			/>

			<H2 id='object-controls'>Controls of selected objects</H2>
			<p>
				When annotations are selected, the options panel shows controls for them after the tool&apos;s own
				options. <code>objectControls</code> chooses which ones, in which order. The default is all of them.
			</p>
			<Table
				head={['Control', 'What it does']}
				rows={[
					[<code key='c'>opacity</code>, 'Opacity slider (5 – 100 %)'],
					[<code key='c'>shadow</code>, 'Turns a drop shadow on / off, with a color picker while it is on'],
					[<code key='c'>dashed</code>, 'Dashed outline (only for objects with a stroke)'],
					[<code key='c'>cornerRadius</code>, 'Rounded corners (only rectangles)'],
					[<code key='c'>layers</code>, 'Bring to front, bring forward, send backward, send to back'],
					[<code key='c'>duplicate</code>, 'Copies the selection next to it'],
					[<code key='c'>delete</code>, 'Deletes the selection'],
				]}
			/>
			<ObjectControlsDemo />
			<p>
				Controls that don&apos;t apply to the selection are skipped (no corner radius for a circle, no styles
				for redaction areas). Pass <code>[]</code> to show none. The same styles can be set in code with{' '}
				<DocLink to='api/selection#setobjectstyle'>setObjectStyle</DocLink>.
			</p>

			<H2 id='size'>Size, class and style</H2>
			<PropTable
				rows={[
					{
						name: 'width',
						type: 'number | string',
						default: "'100%'",
						description: 'Width of the editor root. Numbers are pixels.',
					},
					{
						name: 'height',
						type: 'number | string',
						default: "'100%'",
						description: 'Height of the editor root. With the default, the parent needs a height.',
					},
					{ name: 'className', type: 'string', description: 'Added to the root element (next to fp-root).' },
					{ name: 'style', type: 'CSSProperties', description: 'Inline style of the root element.' },
				]}
			/>
			<CodeBlock
				code={`// fill a parent with a height
<div style={{ height: '80vh' }}>
	<ImageEditor src={imageUrl} />
</div>

// or a fixed size
<ImageEditor src={imageUrl} width={900} height={600} />

// full screen dialog
<ImageEditor src={imageUrl} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#fff' }} />`}
			/>
			<H3 id='canvas-size'>How the image is sized</H3>
			<p>
				The canvas takes whatever space is left after the other parts (at least{' '}
				<code>--fp-stage-min-height</code>, 400px by default) and fits the image into it. It re-fits when the
				editor is resized, so the editor works in resizable panels and on window resize without extra code.
			</p>
		</>
	);
}

export default LayoutPage;
