import { useEffect, useState } from 'react';
import { defaultShortcuts, type EditorShortcut, type ImageEditorProps } from 'fabri-pix';

import { canvasJson } from '../../../canvasJson';
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
	Kbd,
	PageHeader,
	Table,
	useLog,
} from '../../ui';

const descriptions: Record<EditorShortcut, string> = {
	undo: 'Undo the last change',
	redo: 'Redo',
	delete: 'Delete the selected objects',
	copy: 'Copy the selected objects',
	cut: 'Cut the selected objects',
	paste: 'Paste copied objects, or an image from the system clipboard',
	duplicate: 'Duplicate the selection (slightly moved)',
	selectAll: 'Select all annotations',
	deselect: 'Clear the selection',
	nudgeLeft: 'Move the selection 1px left (10px with Shift)',
	nudgeRight: 'Move the selection 1px right (10px with Shift)',
	nudgeUp: 'Move the selection 1px up (10px with Shift)',
	nudgeDown: 'Move the selection 1px down (10px with Shift)',
	bringForward: 'One layer up',
	sendBackward: 'One layer down',
	bringToFront: 'To the top',
	sendToBack: 'To the bottom',
};

const needsSelection: EditorShortcut[] = [
	'delete',
	'copy',
	'cut',
	'duplicate',
	'deselect',
	'nudgeLeft',
	'nudgeRight',
	'nudgeUp',
	'nudgeDown',
	'bringForward',
	'sendBackward',
	'bringToFront',
	'sendToBack',
];

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

const pretty = (combination: string) =>
	combination
		.split('+')
		.map((part) => {
			const names: Record<string, string> = {
				mod: isMac ? '⌘' : 'Ctrl',
				shift: isMac ? '⇧' : 'Shift',
				alt: isMac ? '⌥' : 'Alt',
				ctrl: 'Ctrl',
				meta: isMac ? '⌘' : 'Win',
				arrowleft: '←',
				arrowright: '→',
				arrowup: '↑',
				arrowdown: '↓',
				escape: 'Esc',
				delete: 'Delete',
				backspace: 'Backspace',
			};
			return names[part] ?? part.toUpperCase();
		})
		.join(isMac ? '' : '+');

type Mode = 'default' | 'custom' | 'off';

const configs: Record<Mode, ImageEditorProps['keyboardShortcuts']> = {
	default: true,
	custom: {
		duplicate: ['mod+j'],
		selectAll: null,
		delete: ['delete', 'backspace', 'x'],
		bringToFront: ['f'],
		sendToBack: ['b'],
	},
	off: false,
};

const codes: Record<Mode, string> = {
	default: `// on by default
<ImageEditor src={imageUrl} />`,
	custom: `<ImageEditor
	src={imageUrl}
	keyboardShortcuts={{
		duplicate: ['mod+j'], // instead of mod+d
		selectAll: null, // disabled
		delete: ['delete', 'backspace', 'x'],
		bringToFront: ['f'],
		sendToBack: ['b'],
	}}
/>`,
	off: `<ImageEditor src={imageUrl} keyboardShortcuts={false} />`,
};

function ShortcutsDemo() {
	const [mode, setMode] = useState<Mode>('custom');
	const { entries, log, clear } = useLog();

	// shows which keys were pressed, the editor's reaction appears as change events
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (['Meta', 'Control', 'Shift', 'Alt'].includes(event.key)) {
				return;
			}
			const parts = [
				event.metaKey && 'meta',
				event.ctrlKey && 'ctrl',
				event.altKey && 'alt',
				event.shiftKey && 'shift',
			]
				.filter(Boolean)
				.concat(event.key.toLowerCase());
			log(`key: ${parts.join('+')}`);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [log]);

	return (
		<Demo
			title='Try the shortcuts'
			description='Click a shape on the image first (shortcuts apply to the editor you used last), then press keys. With the custom bindings, ⌘/Ctrl+J duplicates, X deletes, F and B change the layer.'
			code={codes[mode]}
		>
			<DemoControls>
				<DemoButton active={mode === 'default'} onClick={() => setMode('default')}>
					Defaults
				</DemoButton>
				<DemoButton active={mode === 'custom'} onClick={() => setMode('custom')}>
					Custom bindings
				</DemoButton>
				<DemoButton active={mode === 'off'} onClick={() => setMode('off')}>
					Disabled
				</DemoButton>
			</DemoControls>
			<DemoEditor
				initialState={canvasJson}
				keyboardShortcuts={configs[mode]}
				onChange={(json) => log(`→ change: ${json.objects?.length ?? 0} objects`)}
				onSelectionChange={(objects) => log(`→ selection: ${objects.length} object(s)`)}
				height={400}
			/>
			<DemoLog entries={entries} onClear={clear} placeholder='Press keys after clicking the image' />
		</Demo>
	);
}

function ShortcutsPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Keyboard shortcuts'
				lead='Undo, copy and paste, duplicate, delete, nudge and arrange objects from the keyboard. Every shortcut can be rebound or switched off.'
			/>

			<H2 id='defaults'>Default shortcuts</H2>
			<p>
				Shortcuts are on by default. The table shows them for your system: <Kbd>⌘</Kbd> on macOS is{' '}
				<Kbd>Ctrl</Kbd> on Windows and Linux.
			</p>
			<Table
				head={['Action', 'Keys', 'Needs a selection', 'Does']}
				rows={(Object.keys(defaultShortcuts) as EditorShortcut[]).map((action) => [
					<code key='a'>{action}</code>,
					<span key='k'>
						{defaultShortcuts[action].map((combination, index) => (
							<span key={combination}>
								{index > 0 && ' or '}
								<Kbd>{pretty(combination)}</Kbd>
							</span>
						))}
					</span>,
					needsSelection.includes(action) ? 'yes' : '—',
					descriptions[action],
				])}
			/>
			<p>
				The raw definitions are exported as <code>defaultShortcuts</code> (an object of action → array of
				combinations).
			</p>

			<H2 id='configure'>Change, add or disable shortcuts</H2>
			<p>
				<code>keyboardShortcuts</code> accepts <code>true</code> (default), <code>false</code> (no shortcuts at
				all) or an object. In the object, each key is an action and its value either replaces the key
				combinations of that action or, with <code>null</code>, disables it. Actions you don&apos;t mention keep
				their defaults.
			</p>
			<ShortcutsDemo />

			<H3 id='syntax'>Writing key combinations</H3>
			<p>
				A combination is a list of modifiers and one key joined with <code>+</code>, case-insensitive, e.g.{' '}
				<code>'mod+shift+z'</code>.
			</p>
			<Table
				head={['Part', 'Meaning']}
				rows={[
					[
						<code key='p'>mod</code>,
						'⌘ on macOS, Ctrl everywhere else. Use it for cross-platform shortcuts.',
					],
					[<code key='p'>ctrl</code>, 'The Control key on every system'],
					[<code key='p'>meta</code>, '⌘ on macOS, the Windows key elsewhere'],
					[<code key='p'>alt</code>, 'Alt / ⌥ Option'],
					[<code key='p'>shift</code>, 'Shift'],
					[
						'letters, digits',
						<>
							<code>a</code> – <code>z</code>, <code>0</code> – <code>9</code>. Matched by the physical
							key, so they work with Shift or Alt held and on other keyboard layouts (QWERTZ, AZERTY…).
						</>,
					],
					[
						<span key='p'>
							<code>[</code> <code>]</code>
						</span>,
						'Brackets, also matched by the physical key',
					],
					[
						'other keys',
						<>
							The <code>KeyboardEvent.key</code> value in lower case: <code>delete</code>,{' '}
							<code>backspace</code>, <code>escape</code>, <code>enter</code>, <code>arrowleft</code>,{' '}
							<code>f2</code>, <code>/</code>…
						</>,
					],
				]}
			/>
			<Callout type='warning' title='Modifiers must match exactly'>
				<p>
					<code>'mod+d'</code> does not fire for <Kbd>⌘</Kbd>+<Kbd>⇧</Kbd>+<Kbd>D</Kbd>. The nudge actions are
					the exception: they ignore Shift because Shift switches to 10px steps.
				</p>
			</Callout>
			<p>
				When a shortcut fires, the browser&apos;s default for that key is prevented (e.g. <Kbd>⌘</Kbd>+
				<Kbd>D</Kbd> doesn&apos;t bookmark the page and arrow keys don&apos;t scroll). Keys that don&apos;t
				match any shortcut are left alone.
			</p>

			<H2 id='when'>When shortcuts are active</H2>
			<ul>
				<li>
					<strong>Only for the editor the user worked with last.</strong> The first editor that is mounted
					starts as the target; with several editors on a page, a click on an editor&apos;s canvas makes it
					the one that receives shortcuts.
				</li>
				<li>
					<strong>Never while typing</strong>: not in inputs, textareas, selects or contenteditable elements,
					and not while a text on the canvas is being edited (there, Delete and arrows edit the text).
				</li>
				<li>Only once the image is loaded.</li>
				<li>Most actions need a selection, see the table above.</li>
			</ul>

			<H2 id='clipboard'>Copy, cut and paste</H2>
			<p>
				Copy, cut and paste use the browser&apos;s clipboard <em>events</em>, not keydown. That means they work
				with the keys the system uses and with the browser&apos;s Edit menu, so their entries in{' '}
				<code>keyboardShortcuts</code> only act as switches: set <code>copy</code>, <code>cut</code> or{' '}
				<code>paste</code> to <code>null</code> to disable them.
			</p>
			<ul>
				<li>Copied objects are shared between all editors on the page: copy in one, paste in another.</li>
				<li>Every paste is moved a bit further, a cut selection is pasted back at its place first.</li>
				<li>
					Pasting an <strong>image from another application</strong> (a screenshot, an image copied in the
					browser) adds it on top of the photo, like the Add Image tool.
				</li>
			</ul>
			<p>
				All of it is available in code as well:{' '}
				<DocLink to='api/selection#copyselection'>copySelection</DocLink>,{' '}
				<DocLink to='api/selection#paste'>paste</DocLink>,{' '}
				<DocLink to='api/selection#duplicateselection'>duplicateSelection</DocLink>,{' '}
				<DocLink to='api/selection#nudgeselection'>nudgeSelection</DocLink>,{' '}
				<DocLink to='api/selection#arrangeselection'>arrangeSelection</DocLink> and{' '}
				<DocLink to='api/controller#getshortcut'>getShortcut</DocLink> (the combinations in effect, e.g. to show
				them in a tooltip).
			</p>

			<H2 id='own-shortcuts'>Shortcuts for other things</H2>
			<p>
				For keys that should switch tools or save, listen yourself and call the editor. Use{' '}
				<code>getShortcut</code> to avoid clashes:
			</p>
			<CodeBlock
				code={`useEffect(() => {
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.target instanceof HTMLInputElement) return;
		if (event.key === 't') editor.current?.setActiveTool('text');
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			void editor.current?.save();
		}
	};
	window.addEventListener('keydown', handleKeyDown);
	return () => window.removeEventListener('keydown', handleKeyDown);
}, []);`}
			/>
		</>
	);
}

export default ShortcutsPage;
