import { useMemo, useState, type ReactNode } from 'react';
import type { ImageEditorProps } from 'fabri-pix';

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

// a small line icon in the style of popular icon sets (24 × 24, currentColor)
const Svg = (props: { children: ReactNode }) => (
	<svg
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
	>
		{props.children}
	</svg>
);

const lineIcons = {
	undo: (
		<Svg>
			<path d='M9 14 4 9l5-5' />
			<path d='M4 9h10.5a5.5 5.5 0 0 1 0 11H11' />
		</Svg>
	),
	redo: (
		<Svg>
			<path d='m15 14 5-5-5-5' />
			<path d='M20 9H9.5a5.5 5.5 0 0 0 0 11H13' />
		</Svg>
	),
	save: (
		<Svg>
			<path d='M20 6 9 17l-5-5' />
		</Svg>
	),
	reset: (
		<Svg>
			<path d='M3 12a9 9 0 1 0 3-6.7L3 8' />
			<path d='M3 3v5h5' />
		</Svg>
	),
	delete: (
		<Svg>
			<path d='M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6' />
		</Svg>
	),
	text: (
		<Svg>
			<path d='M4 7V4h16v3M9 20h6M12 4v16' />
		</Svg>
	),
	draw: (
		<Svg>
			<path d='M12 20h9' />
			<path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' />
		</Svg>
	),
	crop: (
		<Svg>
			<path d='M6 2v14a2 2 0 0 0 2 2h14' />
			<path d='M18 22V8a2 2 0 0 0-2-2H2' />
		</Svg>
	),
};

const iconSets: Record<string, ImageEditorProps['icons'] | undefined> = {
	default: undefined,
	line: {
		undo: lineIcons.undo,
		redo: lineIcons.redo,
		save: lineIcons.save,
		reset: lineIcons.reset,
		delete: lineIcons.delete,
		tools: { text: lineIcons.text, draw: lineIcons.draw },
		menus: { crop: lineIcons.crop },
	},
	emoji: {
		undo: '↩️',
		redo: '↪️',
		save: '💾',
		reset: '🧹',
		delete: '🗑️',
		tools: { text: '🔤', draw: '🖍️', arrow: '➡️', redact: '🙈' },
		menus: { annotate: '✏️', crop: '✂️', transform: '🔄', redact: '🙈' },
	},
};

const lineCode = `const UndoIcon = () => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
		<path d='M9 14 4 9l5-5' />
		<path d='M4 9h10.5a5.5 5.5 0 0 1 0 11H11' />
	</svg>
);
// RedoIcon, CheckIcon, ResetIcon, TrashIcon, TypeIcon, PenIcon, CropIcon written the same way

<ImageEditor
	src={imageUrl}
	icons={{
		undo: <UndoIcon />,
		redo: <RedoIcon />,
		save: <CheckIcon />,
		reset: <ResetIcon />,
		delete: <TrashIcon />,
		tools: { text: <TypeIcon />, draw: <PenIcon /> },
		menus: { crop: <CropIcon /> },
	}}
/>`;

const emojiCode = `<ImageEditor
	src={imageUrl}
	icons={{
		undo: '↩️',
		redo: '↪️',
		save: '💾',
		reset: '🧹',
		delete: '🗑️',
		tools: { text: '🔤', draw: '🖍️', arrow: '➡️', redact: '🙈' },
		menus: { annotate: '✏️', crop: '✂️', transform: '🔄', redact: '🙈' },
	}}
/>`;

function IconsDemo() {
	const [set, setSet] = useState<'default' | 'line' | 'emoji'>('line');
	const icons = useMemo(() => iconSets[set], [set]);
	return (
		<Demo
			title='Swap the icons'
			description='Select a text and open the Annotate menu to see the replaced tool icons. The action buttons use the save / reset icons.'
			code={set === 'emoji' ? emojiCode : set === 'line' ? lineCode : `<ImageEditor src={imageUrl} />`}
		>
			<DemoControls>
				<DemoButton active={set === 'default'} onClick={() => setSet('default')}>
					Built-in icons
				</DemoButton>
				<DemoButton active={set === 'line'} onClick={() => setSet('line')}>
					Own SVG icons
				</DemoButton>
				<DemoButton active={set === 'emoji'} onClick={() => setSet('emoji')}>
					Emoji
				</DemoButton>
			</DemoControls>
			<DemoEditor icons={icons} />
		</Demo>
	);
}

const iconKeys: [string, string][] = [
	['undo', 'Undo button of the header'],
	['redo', 'Redo button of the header'],
	['history', 'History button of the header'],
	['zoomIn', 'Zoom in button'],
	['zoomOut', 'Zoom out button'],
	['pan', 'Pan (hand) button'],
	['reset', "'reset' action button"],
	['cancel', "'cancel' action button and the crop panel's cancel button"],
	['save', "'save' action button"],
	['exportJson', "'exportJson' action button"],
	['load', "'load' action button"],
	['deleteAll', "'deleteAll' action button"],
	['delete', 'Delete button of selected objects'],
	['dropdown', 'Arrow of dropdown buttons (tool groups, icon tool, emoji tool)'],
	['check', 'Marks the current entry of the history panel, crop apply button'],
	['fill', 'Fill color fields'],
	['stroke', 'Stroke color fields'],
	['text', 'Text fields'],
	['bold', 'Bold button'],
	['italic', 'Italic button'],
	['underline', 'Underline button'],
	['strikethrough', 'Strikethrough button'],
	['alignLeft', 'Align left'],
	['alignCenter', 'Align center'],
	['alignRight', 'Align right'],
	['stepNumber', 'Step number field'],
	['rotateLeft', 'Rotate panel'],
	['rotateRight', 'Rotate panel'],
	['flipHorizontal', 'Rotate panel'],
	['flipVertical', 'Rotate panel'],
	['keepAspect', 'Lock button of the resize panel'],
	['duplicate', 'Duplicate button of selected objects'],
	['bringForward', 'Layer buttons of selected objects'],
	['sendBackward', 'Layer buttons of selected objects'],
	['bringToFront', 'Layer buttons of selected objects'],
	['sendToBack', 'Layer buttons of selected objects'],
	['shadow', 'Shadow button of selected objects'],
	['dashed', 'Dashed button of selected objects'],
];

function IconsPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Icons'
				lead='Replace any icon of the editor with your own: SVG components from your icon library, images, or even emoji.'
			/>

			<H2 id='icons-prop'>The icons prop</H2>
			<p>
				<code>icons</code> takes any <code>ReactNode</code> per key. Only pass the icons you want to change, the
				rest stays as it is. The built-in icons are exported as <code>defaultIcons</code>.
			</p>
			<CodeBlock
				code={`import { Check, Undo2, Redo2, Type } from 'lucide-react';

<ImageEditor
	src={imageUrl}
	icons={{
		undo: <Undo2 size={18} />,
		redo: <Redo2 size={18} />,
		save: <Check size={18} />,
		tools: { text: <Type size={18} /> },
		menus: { crop: <img src='/crop.svg' alt='' width={18} /> },
	}}
/>`}
			/>
			<Table
				head={['Key', 'Changes']}
				rows={[
					[<code key='k'>icons.&lt;key&gt;</code>, 'The UI icons listed below'],
					[
						<code key='k'>icons.tools</code>,
						'Tool buttons, keyed by tool id (also tool groups by their id as a fallback)',
					],
					[
						<code key='k'>icons.menus</code>,
						'Menu tabs and tool groups (Shapes), keyed by id. Falls back to icons.tools for the same id.',
					],
				]}
			/>
			<IconsDemo />

			<H2 id='colors'>Colors and sizes</H2>
			<p>
				The built-in icons are drawn with <code>currentColor</code>, so they take the text color of their
				button: the theme&apos;s <code>text</code> color, the <code>mutedText</code> color when disabled and the{' '}
				<code>danger</code> color for delete. Do the same in your own SVGs (
				<code>stroke=&quot;currentColor&quot;</code> or <code>fill=&quot;currentColor&quot;</code>) and they
				follow the <DocLink to='theming'>theme</DocLink> too. The editor doesn&apos;t resize icons, so give them
				a size (about 16–20px works well).
			</p>
			<Callout type='tip' title='Hide an icon'>
				<p>
					Pass <code>null</code> to show no icon, e.g. <code>{`icons={{ save: null }}`}</code> for a Save
					button with text only. For <code>icons.tools</code> / <code>icons.menus</code> a key that is present
					(even with <code>null</code>) wins over the tool&apos;s own icon.
				</p>
			</Callout>

			<H3 id='tool-icons'>Icons of your own tools</H3>
			<p>
				Custom tools and menus bring their icon in their definition (<code>icon</code>). See{' '}
				<DocLink to='custom-tools'>Custom tools</DocLink> and{' '}
				<DocLink to='tools-and-menus#menu-definition'>MenuDefinition</DocLink>. The icon tool&apos;s icons
				(arrows, heart, star…) are not UI icons: they are SVG paths that end up in the image, configured through{' '}
				<DocLink to='tool-options#icon-library'>the icon library</DocLink>.
			</p>

			<H2 id='all-icons'>All icon keys</H2>
			<p>
				The type is <code>EditorIcons</code>; the prop accepts <code>Partial&lt;EditorIcons&gt;</code> plus{' '}
				<code>tools</code> and <code>menus</code>.
			</p>
			<Table
				head={['Key', 'Where it appears']}
				rows={iconKeys.map(([key, usage]) => [<code key='k'>{key}</code>, usage])}
			/>
		</>
	);
}

export default IconsPage;
