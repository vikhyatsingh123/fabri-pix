import { useMemo, useState } from 'react';
import {
	HistoryControls,
	ZoomControls,
	useEditorState,
	type ButtonProps,
	type ColorPickerProps,
	type EditorComponents,
} from 'fabri-pix';

import './customize.css';
import { canvasJson } from '../../../canvasJson';
import { Callout, CodeBlock, Demo, DemoControls, DemoEditor, DocLink, H2, H3, PageHeader, PropTable } from '../../ui';

// ---------------------------------------------------------------- demo components

function AmberButton({ active, danger, slot, className, ...props }: ButtonProps) {
	return (
		<button
			type='button'
			className={[
				'cz-custom-button',
				active && 'cz-custom-button--active',
				danger && 'cz-custom-button--danger',
				slot && `cz-custom-button--${slot}`,
				className,
			]
				.filter(Boolean)
				.join(' ')}
			{...props}
		/>
	);
}

const SWATCHES = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#111827', '#ffffff'];

function SwatchPicker({ value, onChange, onChangeComplete, 'aria-label': ariaLabel }: ColorPickerProps) {
	return (
		<span className='cz-swatches' role='group' aria-label={ariaLabel}>
			{SWATCHES.map((color) => (
				<button
					key={color}
					type='button'
					className='cz-swatch'
					style={{ background: color }}
					aria-label={color}
					aria-pressed={value?.toLowerCase() === color}
					onClick={() => {
						onChange(color);
						onChangeComplete?.(color);
					}}
				/>
			))}
		</span>
	);
}

function CompactHeader() {
	const { history } = useEditorState();
	return (
		<div className='cz-header'>
			<span>{history.index} change(s)</span>
			<span>
				<HistoryControls />
				<ZoomControls />
			</span>
		</div>
	);
}

const demoCode = (options: { button: boolean; colors: boolean; header: boolean; actions: boolean }) => {
	const parts = [
		options.button && '\t\tButton: AmberButton,',
		options.colors && '\t\tColorPicker: SwatchPicker,',
		options.header && '\t\tHeader: CompactHeader,',
		!options.actions && '\t\tActions: null, // hidden',
	].filter(Boolean);
	return `import { cx, HistoryControls, ZoomControls, useEditorState, type ButtonProps, type ColorPickerProps } from 'fabri-pix';

// active, danger and slot are not HTML attributes: take them out before spreading
function AmberButton({ active, danger, slot, className, ...props }: ButtonProps) {
	return (
		<button
			type='button'
			className={cx('my-button', active && 'my-button--active', danger && 'my-button--danger', className)}
			{...props}
		/>
	);
}

const SWATCHES = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#111827', '#ffffff'];

function SwatchPicker({ value, onChange, onChangeComplete, 'aria-label': ariaLabel }: ColorPickerProps) {
	return (
		<span role='group' aria-label={ariaLabel}>
			{SWATCHES.map((color) => (
				<button
					key={color}
					style={{ background: color }}
					aria-pressed={value?.toLowerCase() === color}
					onClick={() => {
						onChange(color); // updates the object
						onChangeComplete?.(color); // records one undo step
					}}
				/>
			))}
		</span>
	);
}

// layout parts are rendered inside the editor, so they can use the hooks
function CompactHeader() {
	const { history } = useEditorState();
	return (
		<div className='my-header'>
			<span>{history.index} change(s)</span>
			<HistoryControls />
			<ZoomControls />
		</div>
	);
}

// outside the component, so the object is stable
const components = {
${parts.join('\n')}
};

<ImageEditor src={imageUrl} components={components} />`;
};

function ComponentsDemo() {
	const [options, setOptions] = useState({ button: true, colors: true, header: true, actions: true });
	const components = useMemo<Partial<EditorComponents>>(
		() => ({
			...(options.button ? { Button: AmberButton } : {}),
			...(options.colors ? { ColorPicker: SwatchPicker } : {}),
			...(options.header ? { Header: CompactHeader } : {}),
			...(options.actions ? {} : { Actions: null }),
		}),
		[options],
	);
	const toggle = (key: keyof typeof options) => setOptions((current) => ({ ...current, [key]: !current[key] }));
	return (
		<Demo
			title='Own Button, ColorPicker and Header'
			description='Select a shape or a text to see the swatch color picker in the options panel.'
			code={demoCode(options)}
		>
			<DemoControls>
				<label>
					<input type='checkbox' checked={options.button} onChange={() => toggle('button')} /> Button
				</label>
				<label>
					<input type='checkbox' checked={options.colors} onChange={() => toggle('colors')} /> ColorPicker
				</label>
				<label>
					<input type='checkbox' checked={options.header} onChange={() => toggle('header')} /> Header
				</label>
				<label>
					<input type='checkbox' checked={options.actions} onChange={() => toggle('actions')} /> show Actions
				</label>
			</DemoControls>
			<DemoEditor initialState={canvasJson} components={components} />
		</Demo>
	);
}

// ---------------------------------------------------------------- page

function CustomComponentsPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Your own components'
				lead='Plug in the buttons, inputs and color pickers of your design system, and replace or hide whole parts of the layout, through the components prop.'
			/>

			<H2 id='how'>How it works</H2>
			<p>
				The editor renders every button, color picker, number input, slider and select through a small set of{' '}
				<strong>primitives</strong>. Replace a primitive once and the whole editor uses yours: the header, the
				toolbar, every option panel, even the panels of custom tools that use them. The same prop also replaces
				or hides the five <strong>layout parts</strong>.
			</p>
			<ComponentsDemo />
			<Callout type='warning' title='Keep the components stable'>
				<p>
					Define your components outside of other components (and the <code>components</code> object outside
					of render, or with <code>useMemo</code>). A component defined inside a render is a new type every
					time, and React re-mounts it on each render.
				</p>
			</Callout>

			<H2 id='primitives'>Primitives</H2>

			<H3 id='button'>Button</H3>
			<p>
				Used for every button: tools, menus, header, actions, panels. It receives all <code>{'<button>'}</code>{' '}
				attributes (<code>onClick</code>, <code>disabled</code>, <code>title</code>, <code>aria-*</code>,{' '}
				<code>children</code>, <code>className</code>…) plus:
			</p>
			<PropTable
				rows={[
					{
						name: 'active',
						type: 'boolean',
						description: 'Pressed / selected: the active tool or menu, bold text on…',
					},
					{ name: 'danger', type: 'boolean', description: 'A destructive action (delete).' },
					{
						name: 'slot',
						type: 'EditorSlot',
						description: (
							<>
								Which part renders the button: <code>'menuItem'</code>, <code>'toolButton'</code>,{' '}
								<code>'historyItem'</code>, or undefined for other buttons. Lets one component render,
								say, menu tabs differently. The default Button adds the slot&apos;s class (
								<code>fp-tool-button</code>…).
							</>
						),
					},
				]}
			/>
			<Callout>
				<p>
					<code>active</code>, <code>danger</code> and <code>slot</code> are not valid HTML attributes.
					Destructure them before spreading the rest onto a DOM element, as in the demo.
				</p>
			</Callout>

			<H3 id='color-picker'>ColorPicker</H3>
			<PropTable
				rows={[
					{
						name: 'value',
						type: 'string | undefined',
						description:
							"Current color, can be any CSS color ('#f00', 'transparent'…). The built-in picker keeps the alpha of a partly transparent color when a new one is picked.",
					},
					{
						name: 'onChange',
						type: '(color: string) => void',
						required: true,
						description: 'Call while the user is picking: the object updates live without an undo step.',
					},
					{
						name: 'onChangeComplete',
						type: '(color: string) => void',
						description:
							'Call once the color is chosen: records the undo step and remembers the color for new objects.',
					},
					{ name: 'aria-label', type: 'string', description: 'Accessible name.' },
				]}
			/>
			<p>
				The built-in picker is a native <code>{'<input type="color">'}</code>; <code>toHexColor(value)</code> is
				exported to turn values like <code>rgb()</code> or <code>#fff</code> into the <code>#rrggbb</code> form
				such inputs need.
			</p>

			<H3 id='number-input'>NumberInput</H3>
			<PropTable
				rows={[
					{ name: 'value', type: 'number | string | undefined', description: 'Current value.' },
					{
						name: 'onChange',
						type: '(value: number) => void',
						required: true,
						description: 'Every change, live.',
					},
					{
						name: 'onChangeComplete',
						type: '(value: number) => void',
						description:
							'When editing is done (the built-in one: on blur and Enter). Records the undo step.',
					},
					{ name: 'min', type: 'number', description: 'Smallest value.' },
					{ name: 'max', type: 'number', description: 'Largest value.' },
					{ name: 'aria-label', type: 'string', description: 'Accessible name.' },
				]}
			/>

			<H3 id='slider'>Slider</H3>
			<PropTable
				rows={[
					{ name: 'value', type: 'number', required: true, description: 'Current value.' },
					{ name: 'min', type: 'number', required: true, description: 'Smallest value.' },
					{ name: 'max', type: 'number', required: true, description: 'Largest value.' },
					{ name: 'step', type: 'number', default: '1', description: 'Step size.' },
					{
						name: 'onChange',
						type: '(value: number) => void',
						required: true,
						description: 'While dragging.',
					},
					{
						name: 'onChangeComplete',
						type: '(value: number) => void',
						description: 'When the thumb is released. Records the undo step.',
					},
					{ name: 'aria-label', type: 'string', description: 'Accessible name.' },
				]}
			/>

			<H3 id='select'>Select</H3>
			<PropTable
				rows={[
					{ name: 'value', type: 'string | undefined', description: 'Selected value.' },
					{
						name: 'options',
						type: '{ value: string; label: string }[]',
						required: true,
						description: 'Choices.',
					},
					{
						name: 'onChange',
						type: '(value: string) => void',
						required: true,
						description: 'A choice was made.',
					},
					{ name: 'aria-label', type: 'string', description: 'Accessible name.' },
				]}
			/>
			<Callout type='tip' title='onChange vs. onChangeComplete'>
				<p>
					Always call <code>onChangeComplete</code> when the user is done. Without it, slider and color
					changes update the image but don&apos;t create an undo step until the next recorded change.
				</p>
			</Callout>

			<H3 id='design-system'>Example: a design system</H3>
			<CodeBlock
				code={`import MuiButton from '@mui/material/Button';
import MuiSlider from '@mui/material/Slider';
import type { ButtonProps, SliderProps } from 'fabri-pix';

const Button = ({ active, danger, slot, ...props }: ButtonProps) => (
	<MuiButton
		size='small'
		variant={active ? 'contained' : 'text'}
		color={danger ? 'error' : 'primary'}
		{...(props as any)}
	/>
);

const Slider = ({ value, min, max, step, onChange, onChangeComplete, ...rest }: SliderProps) => (
	<MuiSlider
		size='small'
		sx={{ width: 140 }}
		value={value}
		min={min}
		max={max}
		step={step}
		onChange={(_, next) => onChange(next as number)}
		onChangeCommitted={(_, next) => onChangeComplete?.(next as number)}
		{...rest}
	/>
);

const components = { Button, Slider };

<ImageEditor src={imageUrl} components={components} unstyled />`}
			/>
			<p>
				Combine it with <DocLink to='theming#unstyled'>unstyled</DocLink> when your components bring their own
				look.
			</p>

			<H2 id='layout-parts'>Layout parts</H2>
			<p>
				<code>Header</code>, <code>MenuBar</code>, <code>Toolbar</code>, <code>ContextPanel</code> and{' '}
				<code>Actions</code> can be replaced with a component (no props; it renders inside the editor and uses
				the <DocLink to='api/hooks'>hooks</DocLink>) or hidden with <code>null</code>. Their position still
				comes from <DocLink to='layout'>layout</DocLink>.
			</p>
			<PropTable
				nameLabel='Key'
				rows={[
					{
						name: 'Header',
						type: 'ComponentType | null',
						description: 'History and zoom (default: HistoryControls + ZoomControls).',
					},
					{ name: 'MenuBar', type: 'ComponentType | null', description: 'Menu tabs.' },
					{ name: 'Toolbar', type: 'ComponentType | null', description: 'Tools of the active menu.' },
					{
						name: 'ContextPanel',
						type: 'ComponentType | null',
						description: 'Options panel and object controls.',
					},
					{ name: 'Actions', type: 'ComponentType | null', description: 'Action buttons.' },
				]}
			/>
			<CodeBlock
				code={`import { ImageEditor, ToolButton, useEditorState } from 'fabri-pix';

// a toolbar with only three tools, whatever the menu
function MyToolbar() {
	return (
		<div className='my-toolbar'>
			<ToolButton toolId='text' />
			<ToolButton toolId='arrow' />
			<ToolButton toolId='redact' />
		</div>
	);
}

<ImageEditor src={imageUrl} components={{ Toolbar: MyToolbar, MenuBar: null }} />`}
			/>
			<p>
				The default parts and smaller pieces (<code>HistoryControls</code>, <code>ZoomControls</code>,{' '}
				<code>ToolButton</code>, <code>ObjectControls</code>…) are exported; see{' '}
				<DocLink to='api/components'>Components</DocLink>. For a completely different arrangement, use{' '}
				<DocLink to='custom-layout'>a custom layout</DocLink>.
			</p>
		</>
	);
}

export default CustomComponentsPage;
