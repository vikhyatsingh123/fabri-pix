import { useMemo, useState } from 'react';
import type { EditorSlot, EditorTheme } from 'fabri-pix';

import './customize.css';
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
	Table,
} from '../../ui';

const themeRows: [keyof EditorTheme, string, string, string][] = [
	['primary', '--fp-color-primary', '#1677ff', 'Focus border of inputs, slider thumbs'],
	['background', '--fp-color-background', 'transparent', 'Background of the editor and of inputs / selects'],
	['surface', '--fp-color-surface', '#f5f5f5', 'Dropdowns (tool groups, history, icon grid)'],
	['text', '--fp-color-text', '#1f1f1f', 'Text and icons (icons use currentColor)'],
	['mutedText', '--fp-color-muted-text', 'rgba(16, 16, 16, 0.3)', 'Disabled buttons, the loading text'],
	['border', '--fp-color-border', '#d9d9d9', 'Dividers, input and segmented borders'],
	['hover', '--fp-color-hover', '#e8e8e8', 'Button background on hover'],
	['active', '--fp-color-active', '#f0f0f0', 'Background of pressed buttons (active tool, menu, bold…)'],
	['danger', '--fp-color-danger', '#eb1919', 'Delete buttons'],
	['success', '--fp-color-success', '#74c00d', 'Check mark of the current history entry'],
	['stageBackground', '--fp-color-stage-background', 'transparent', 'The area around the image'],
	['radius', '--fp-radius', '20px', 'Corner radius of buttons'],
	['fontFamily', '--fp-font-family', 'inherit', 'Font of the UI (not of text objects)'],
	['fontSize', '--fp-font-size', '14px', 'Font size of the UI'],
];

const slots: [EditorSlot, string, string][] = [
	['root', 'fp-root', 'The outer element'],
	['header', 'fp-header', 'History and zoom controls'],
	['body', 'fp-body', 'Menu bar and canvas (has fp-body--menu-left / -right / -top / -bottom / -none)'],
	['menu', 'fp-menu', 'Menu bar (has fp-menu--left / -right / -top / -bottom)'],
	['menuItem', 'fp-menu-item', 'A menu tab button'],
	['stage', 'fp-stage', 'Area around the canvas'],
	['toolbar', 'fp-toolbar', 'Tools of the active menu'],
	['toolButton', 'fp-tool-button', 'A tool button'],
	['contextPanel', 'fp-context-panel', 'Options of the active tool / selected object'],
	['actions', 'fp-actions', 'Action buttons (each also has fp-action-<name>)'],
	['button', 'fp-button', 'Every button (fp-button--active, fp-button--danger)'],
	['dropdown', 'fp-dropdown', 'A dropdown and its trigger'],
	['dropdownContent', 'fp-dropdown-content', 'The popup of a dropdown (fp-dropdown-content--top / --bottom)'],
	['historyPanel', 'fp-history-panel', 'List of history entries'],
	['historyItem', 'fp-history-item', 'One history entry'],
	['divider', 'fp-divider', 'Separator line'],
	['field', 'fp-field', 'Label + control in option panels (label: fp-field-label)'],
	['colorPicker', 'fp-color-picker', 'Color inputs'],
	['numberInput', 'fp-number-input', 'Number inputs'],
	['textInput', 'fp-text-input', 'Text input of the comment panel'],
	['segmented', 'fp-segmented', 'Button groups (text alignment)'],
	['slider', 'fp-slider', 'Range inputs'],
	['select', 'fp-select', 'Selects (font, blend mode)'],
	['filterList', 'fp-filter-list', 'The filter panel (each filter: fp-filter)'],
	['iconGrid', 'fp-icon-grid', 'Icon chooser of the icon tool'],
	['objectControls', 'fp-object-controls', 'Opacity, shadow, layers… of selected objects'],
];

interface Preset {
	label: string;
	theme: EditorTheme;
}

const presets: Preset[] = [
	{
		label: 'Violet',
		theme: {
			primary: '#7c3aed',
			background: '#ffffff',
			surface: '#faf5ff',
			text: '#2e1065',
			border: '#ddd6fe',
			hover: '#f3e8ff',
			active: '#ede9fe',
			stageBackground: '#f5f3ff',
			radius: '8px',
		},
	},
	{
		label: 'Dark',
		theme: {
			primary: '#60a5fa',
			background: '#111827',
			surface: '#1f2937',
			text: '#f9fafb',
			mutedText: 'rgba(249, 250, 251, 0.35)',
			border: '#374151',
			hover: '#1f2937',
			active: '#374151',
			stageBackground: '#030712',
			radius: '6px',
		},
	},
	{
		label: 'Warm',
		theme: {
			primary: '#ea580c',
			background: '#fffbf5',
			surface: '#fff7ed',
			text: '#431407',
			border: '#fed7aa',
			hover: '#ffedd5',
			active: '#fed7aa',
			stageBackground: '#fff7ed',
			radius: '999px',
			fontFamily: 'Georgia, serif',
		},
	},
];

const editableKeys: (keyof EditorTheme)[] = [
	'primary',
	'background',
	'surface',
	'text',
	'border',
	'active',
	'stageBackground',
];

function ThemeDemo() {
	const [theme, setTheme] = useState<EditorTheme>(presets[0].theme);
	const [unstyled, setUnstyled] = useState(false);
	const stableTheme = useMemo(() => theme, [theme]);
	const set = (key: keyof EditorTheme, value: string) => setTheme((current) => ({ ...current, [key]: value }));
	const code = `<ImageEditor
	src={imageUrl}${unstyled ? '\n\tunstyled' : ''}
	theme={{
${Object.entries(theme)
	.map(([key, value]) => `\t\t${key}: '${value}',`)
	.join('\n')}
	}}
/>`;
	return (
		<Demo
			title='Theme editor'
			description='Start from a preset and change single colors. Open a dropdown (the Shapes arrow, the history) to see the surface color.'
			code={code}
		>
			<DemoControls>
				{presets.map((preset) => (
					<DemoButton
						key={preset.label}
						active={theme === preset.theme}
						onClick={() => setTheme(preset.theme)}
					>
						{preset.label}
					</DemoButton>
				))}
				<label>
					<input type='checkbox' checked={unstyled} onChange={(event) => setUnstyled(event.target.checked)} />{' '}
					unstyled
				</label>
			</DemoControls>
			<DemoControls>
				{editableKeys.map((key) => (
					<label key={key}>
						{key}
						<input
							type='color'
							value={String(theme[key] ?? '#ffffff')}
							onChange={(event) => set(key, event.target.value)}
						/>
					</label>
				))}
				<label>
					radius
					<select value={theme.radius} onChange={(event) => set('radius', event.target.value)}>
						{['0px', '6px', '8px', '20px', '999px'].map((radius) => (
							<option key={radius}>{radius}</option>
						))}
					</select>
				</label>
			</DemoControls>
			<DemoEditor theme={stableTheme} unstyled={unstyled} />
		</Demo>
	);
}

function ClassNamesDemo() {
	return (
		<Demo
			title='classNames and styles'
			description='Your classes are added next to the fp-* classes. Here the toolbar and menu get a pill look, every button a bold font and the stage a checkerboard.'
			code={`/* styles.css */
.my-toolbar {
	padding: 6px;
	border-radius: 999px;
	background: #0f172a;
	color: #f8fafc;
}
.my-toolbar .fp-button--active {
	background: #2563eb;
	color: #fff;
}
.my-button {
	font-weight: 600;
}

<ImageEditor
	src={imageUrl}
	classNames={{ toolbar: 'my-toolbar', menu: 'my-menu', button: 'my-button' }}
	styles={{
		stage: { background: 'repeating-conic-gradient(#e2e8f0 0 25%, #f8fafc 0 50%) 0 0 / 24px 24px' },
	}}
/>`}
		>
			<DemoEditor
				classNames={{ toolbar: 'cz-toolbar', menu: 'cz-menu', button: 'cz-button' }}
				styles={{
					stage: { background: 'repeating-conic-gradient(#e2e8f0 0 25%, #f8fafc 0 50%) 0 0 / 24px 24px' },
				}}
			/>
		</Demo>
	);
}

function ThemingPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Theme & styling'
				lead='Match the editor to your app: set colors with the theme prop or CSS variables, add your own class names and inline styles to any part, or drop the default look completely.'
			/>

			<H2 id='overview'>Four ways to style the editor</H2>
			<Table
				head={['Approach', 'Use it to', 'Example']}
				rows={[
					[
						<code key='a'>theme</code>,
						'Change colors, radius and font',
						<code key='e'>{`theme={{ primary: '#7c3aed' }}`}</code>,
					],
					[
						'CSS variables',
						'Theme from your stylesheet (e.g. dark mode with a media query)',
						<code key='e'>--fp-color-text</code>,
					],
					[
						<code key='a'>classNames</code>,
						'Add your classes (Tailwind, CSS modules…) to single parts',
						<code key='e'>{`classNames={{ toolbar: 'my-toolbar' }}`}</code>,
					],
					[
						<code key='a'>styles</code>,
						'Inline styles for single parts',
						<code key='e'>{`styles={{ stage: { padding: 0 } }}`}</code>,
					],
					[
						<code key='a'>unstyled</code>,
						'Remove every color, border and spacing and style it yourself',
						<code key='e'>unstyled</code>,
					],
				]}
			/>

			<H2 id='theme-prop'>The theme prop</H2>
			<p>
				<code>theme</code> sets the CSS variables of the editor root. Every key is optional; missing keys keep
				the default.
			</p>
			<ThemeDemo />

			<H3 id='theme-keys'>Theme keys and CSS variables</H3>
			<Table
				head={['theme key', 'CSS variable', 'Default', 'Used for']}
				rows={themeRows.map(([key, variable, value, usage]) => [
					<code key='k'>{key}</code>,
					<code key='v'>{variable}</code>,
					<code key='d'>{value}</code>,
					usage,
				])}
			/>
			<p>Two more variables have no theme key, set them in CSS:</p>
			<Table
				head={['CSS variable', 'Default', 'Used for']}
				rows={[
					[
						<code key='v'>--fp-gap</code>,
						<code key='d'>12px</code>,
						'Space between header, body, toolbar, panel and actions',
					],
					[
						<code key='v'>--fp-stage-min-height</code>,
						<code key='d'>400px</code>,
						'Minimum height of the canvas area',
					],
				]}
			/>

			<H2 id='css-variables'>Theming with CSS</H2>
			<p>
				The variables are declared on <code>.fp-root</code> with zero specificity, so any rule of yours wins.
				This is handy for a dark mode that follows your app:
			</p>
			<CodeBlock
				lang='css'
				code={`.fp-root {
	--fp-color-primary: #6d28d9;
	--fp-radius: 8px;
	--fp-gap: 8px;
	--fp-stage-min-height: 300px;
}

[data-theme='dark'] .fp-root {
	--fp-color-background: #111827;
	--fp-color-surface: #1f2937;
	--fp-color-text: #f9fafb;
	--fp-color-muted-text: rgba(249, 250, 251, 0.35);
	--fp-color-border: #374151;
	--fp-color-hover: #1f2937;
	--fp-color-active: #374151;
	--fp-color-stage-background: #030712;
}`}
			/>
			<Callout>
				<p>
					Values from the <code>theme</code> prop are inline styles on the root element, so they win over your
					stylesheet. Use one or the other for the same variable.
				</p>
			</Callout>

			<H2 id='class-names'>Class names and inline styles</H2>
			<p>
				Every part of the editor is a <strong>slot</strong> with a fixed <code>fp-*</code> class. Through{' '}
				<code>classNames</code> you add your own class to a slot, through <code>styles</code> an inline style.
				All default rules are wrapped in <code>:where()</code>, which has zero specificity: a single class of
				yours overrides them, no <code>!important</code> needed.
			</p>
			<ClassNamesDemo />
			<CodeBlock
				title='Tailwind'
				code={`<ImageEditor
	src={imageUrl}
	classNames={{
		root: 'rounded-xl border border-slate-200 p-3',
		toolbar: 'gap-2',
		button: 'rounded-md px-3 py-1.5 hover:bg-slate-100',
		contextPanel: 'bg-slate-50 rounded-lg',
	}}
/>`}
			/>

			<H3 id='slots'>All slots</H3>
			<p>
				The keys of <code>classNames</code> and <code>styles</code> (type <code>EditorSlot</code>) and the class
				each part always has:
			</p>
			<Table
				head={['Slot', 'Class', 'Part']}
				rows={slots.map(([slot, className, part]) => [
					<code key='s'>{slot}</code>,
					<code key='c'>.{className}</code>,
					part,
				])}
			/>
			<Callout type='tip'>
				<p>
					A button is both a <code>button</code> and its own slot: a tool button has <code>fp-button</code>{' '}
					and <code>fp-tool-button</code>, so <code>classNames.button</code> styles every button and{' '}
					<code>classNames.toolButton</code> only the tools. State classes are <code>fp-button--active</code>{' '}
					and <code>fp-button--danger</code>; buttons also set <code>aria-pressed</code>.
				</p>
			</Callout>

			<H2 id='unstyled'>Unstyled mode</H2>
			<p>
				<code>unstyled</code> removes all colors, borders, backgrounds and spacing and keeps only the layout
				(flex rows, the canvas sizing, dropdown positions). The root gets the class <code>fp-unstyled</code>.
				Use it when you style every part yourself, e.g. with Tailwind classes through <code>classNames</code>,
				or when you replace the primitives with <DocLink to='custom-components'>your own components</DocLink>.
				Try the checkbox in the theme editor above.
			</p>

			<H2 id='editor-size'>Size of the editor</H2>
			<p>
				The editor fills its parent (<code>width</code> and <code>height</code> default to <code>100%</code>),
				so give the parent a height, or pass <code>width</code> / <code>height</code> as a number (px) or CSS
				string. <code>className</code> and <code>style</code> of <code>{'<ImageEditor>'}</code> go to the root
				element. More in <DocLink to='layout#size'>Layout</DocLink>.
			</p>
		</>
	);
}

export default ThemingPage;
