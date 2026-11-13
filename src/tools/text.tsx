/**
 * @author Vikhyat Singh
 * @description Text, emoji and free drawing tools
 */

import React, { lazy, Suspense, useState } from 'react';
import { PencilBrush } from 'fabric';

import AddTextIcon from '../icons/AddTextIcon';
import WritingFluentlyIcon from '../icons/WritingFluently';
import { generateId, ShapeType } from '../core/constants';
import type { ToolButtonProps, ToolDefinition, ToolPanelProps } from '../core/types';
import { useEditorUI, useImageEditor, useToolOptions } from '../react/context';
import { Divider, Dropdown, Field, Segmented } from '../react/ui';
import { createCursorCache, followCursor, placeOnClick, usePanel } from './shared';

// the picker (~60KB gzipped with its emoji data) is split into its own chunk by the consumer's bundler
// and only downloaded when the emoji dropdown is opened for the first time
const EmojiPicker = lazy(() => import('emoji-picker-react'));

export interface TextOptions {
	fill: string;
	backgroundColor: string;
	fontSize: number;
	fontStyle: string;
	fontWeight: string;
	fontFamily: string;
	textAlign: string;
	underline: boolean;
	linethrough: boolean;
	text: string;
	/** fonts offered in the font select */
	fonts: string[];
}

export interface EmojiOptions {
	emoji: string;
}

export interface DrawOptions {
	color: string;
	width: number;
}

export const TextPanel: React.FC<ToolPanelProps<TextOptions>> = (props) => {
	const { value, preview, apply, Button, ColorPicker, NumberInput, Select, labels, icons } = usePanel(props);
	const fonts = props.options.fonts ?? [];
	const fontFamily = value('fontFamily');

	const toggle = (key: 'fontWeight' | 'fontStyle', on: string) => {
		const next = value(key) === on ? 'normal' : on;
		apply({ [key]: next } as Partial<TextOptions>, { [key]: next });
	};

	const toggleDecoration = (key: 'underline' | 'linethrough') => {
		const next = !value(key);
		apply({ [key]: next } as Partial<TextOptions>, { [key]: next });
	};

	return (
		<>
			<Field icon={icons.fill} label={labels.fill}>
				<ColorPicker
					aria-label={labels.fill}
					value={value('backgroundColor')}
					onChange={(backgroundColor) => preview({ backgroundColor })}
					onChangeComplete={(backgroundColor) => apply({ backgroundColor }, { backgroundColor })}
				/>
			</Field>
			<Divider />
			<Field icon={icons.text} label={labels.text}>
				<ColorPicker
					aria-label={labels.text}
					value={value('fill')}
					onChange={(fill) => preview({ fill })}
					onChangeComplete={(fill) => apply({ fill }, { fill })}
				/>
				<NumberInput
					aria-label={labels.size}
					min={1}
					max={100}
					value={value('fontSize')}
					onChange={(fontSize) => apply({ fontSize }, { fontSize })}
				/>
			</Field>
			<Divider />
			<Field>
				<Button
					title={labels.bold}
					aria-label={labels.bold}
					active={value('fontWeight') === 'bold'}
					onClick={() => toggle('fontWeight', 'bold')}
				>
					{icons.bold}
				</Button>
				<Button
					title={labels.italic}
					aria-label={labels.italic}
					active={value('fontStyle') === 'italic'}
					onClick={() => toggle('fontStyle', 'italic')}
				>
					{icons.italic}
				</Button>
				<Button
					title={labels.underline}
					aria-label={labels.underline}
					active={!!value('underline')}
					onClick={() => toggleDecoration('underline')}
				>
					{icons.underline}
				</Button>
				<Button
					title={labels.strikethrough}
					aria-label={labels.strikethrough}
					active={!!value('linethrough')}
					onClick={() => toggleDecoration('linethrough')}
				>
					{icons.strikethrough}
				</Button>
			</Field>
			{fonts.length > 0 && (
				<>
					<Divider />
					<Select
						aria-label={labels.font}
						value={fontFamily}
						// the current font stays selectable even when it is not part of the list
						options={[...new Set([fontFamily, ...fonts].filter(Boolean))].map((font) => ({
							value: font,
							label: font,
						}))}
						onChange={(font) => apply({ fontFamily: font }, { fontFamily: font })}
					/>
				</>
			)}
			<Divider />
			<Segmented
				value={value('textAlign')}
				onChange={(textAlign) => apply({ textAlign }, { textAlign })}
				options={[
					{ value: 'left', label: icons.alignLeft, title: labels.alignLeft },
					{ value: 'center', label: icons.alignCenter, title: labels.alignCenter },
					{ value: 'right', label: icons.alignRight, title: labels.alignRight },
				]}
			/>
		</>
	);
};

export const textTool: ToolDefinition<TextOptions> = {
	id: 'text',
	label: 'Text',
	icon: <AddTextIcon />,
	shapeTypes: [ShapeType.TEXT],
	defaultOptions: {
		fill: '#ff0000',
		backgroundColor: '#ffffff',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: 'normal',
		fontFamily: 'Arial',
		textAlign: 'left',
		underline: false,
		linethrough: false,
		text: 'Add your text here',
		fonts: ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS', 'Impact'],
	},
	activate: (context) => {
		const cursor = createCursorCache();
		followCursor(context, () => {
			const { backgroundColor, fill } = context.options;
			return cursor(`${backgroundColor}|${fill}`, (ctx, element) => {
				element.width = 120;
				element.height = 40;
				ctx.fillStyle = backgroundColor;
				ctx.globalAlpha = 0.8;
				ctx.fillRect(0, 0, element.width, element.height);
				ctx.strokeStyle = '#ff0000';
				ctx.setLineDash([4, 2]);
				ctx.lineWidth = 1;
				ctx.strokeRect(5, 5, 110, 30);
				ctx.fillStyle = fill;
				ctx.font = '12px Arial';
				ctx.textAlign = 'center';
				ctx.fillText('Add your text here', element.width / 2, element.height / 2 + 4);
				return `url(${element.toDataURL()}) 35 20, auto`;
			});
		});

		placeOnClick(context, ({ x, y }) => {
			void context.editor.addShape(ShapeType.TEXT, {
				...context.options,
				left: x - 80,
				top: y - 11,
				scaleX: 1,
				scaleY: 1,
			});
		});
	},
	OptionsPanel: TextPanel,
};

/** emoji button with a picker dropdown */
export const EmojiToolButton: React.FC<ToolButtonProps> = (props) => {
	const { tool, active, onClick } = props;
	const editor = useImageEditor();
	const ui = useEditorUI();
	const [options, setOptions] = useToolOptions<EmojiOptions>(tool.id);
	const [open, setOpen] = useState(false);
	const { Button } = ui.components;

	return (
		<Dropdown
			open={open}
			onOpenChange={setOpen}
			trigger={
				<>
					<Button slot='toolButton' active={active} onClick={onClick}>
						<span>{options.emoji}</span>
						{ui.toolLabel(tool)}
					</Button>
					<Button
						slot='toolButton'
						aria-label={`${ui.toolLabel(tool)} ${ui.labels.more}`}
						aria-expanded={open}
						onClick={() => setOpen((isOpen) => !isOpen)}
					>
						{ui.icons.dropdown}
					</Button>
				</>
			}
		>
			<Suspense fallback={<div className='fp-loading'>{ui.labels.loading}</div>}>
				<EmojiPicker
					skinTonesDisabled
					onEmojiClick={(emojiData) => {
						setOpen(false);
						setOptions({ emoji: emojiData.emoji });
						if (!active) {
							editor.setActiveTool(tool.id);
						}
					}}
				/>
			</Suspense>
		</Dropdown>
	);
};

export const emojiTool: ToolDefinition<EmojiOptions> = {
	id: 'emoji',
	label: 'Emoji',
	shapeTypes: [ShapeType.EMOJI],
	defaultOptions: { emoji: '😀' },
	activate: (context) => {
		const cursor = createCursorCache();
		followCursor(context, () => {
			const { emoji } = context.options;
			return cursor(emoji, (ctx, element) => {
				element.width = 40;
				element.height = 40;
				ctx.font = '32px "Apple Color Emoji", sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.globalAlpha = 0.7;
				ctx.fillText(emoji, 20, 20);
				return `url(${element.toDataURL()}) 20 20, auto`;
			});
		});

		placeOnClick(context, ({ x, y }) => {
			void context.editor.addShape(ShapeType.EMOJI, {
				text: context.options.emoji,
				left: x - 20,
				top: y - 20,
				scaleX: 1,
				scaleY: 1,
			});
		});
	},
	ToolbarButton: EmojiToolButton,
};

const PENCIL_SVG = `<svg width="23" height="23" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.32497 43.4996L13.81 43.4998L44.9227 12.3871L36.4374 3.90186L5.32471 35.0146L5.32497 43.4996Z" fill="none" stroke="#000000" stroke-width="4" stroke-linejoin="bevel"/><path d="M27.9521 12.3872L36.4374 20.8725" stroke="#000000" stroke-width="4" stroke-linecap="square" stroke-linejoin="bevel"/></svg>`;

// the hotspot points to the pencil tip (bottom left)
const PENCIL_CURSOR = `url("data:image/svg+xml;utf8,${encodeURIComponent(PENCIL_SVG)}") 2 21, crosshair`;

export const DrawPanel: React.FC<ToolPanelProps<DrawOptions>> = (props) => {
	const { value, preview, apply, ColorPicker, NumberInput, labels, icons } = usePanel(props);

	return (
		<Field icon={icons.stroke} label={labels.stroke}>
			<ColorPicker
				aria-label={labels.stroke}
				value={value('color', 'stroke')}
				onChange={(stroke) => preview({ stroke })}
				onChangeComplete={(color) => apply({ color }, { stroke: color })}
			/>
			<NumberInput
				aria-label={labels.size}
				min={1}
				max={50}
				value={value('width', 'strokeWidth')}
				onChange={(width) => apply({ width }, { strokeWidth: width })}
			/>
		</Field>
	);
};

export const drawTool: ToolDefinition<DrawOptions> = {
	id: 'draw',
	label: 'Draw',
	icon: <WritingFluentlyIcon />,
	shapeTypes: [ShapeType.DRAW],
	defaultOptions: { color: '#ff0000', width: 2 },
	activate: (context) => {
		const { canvas } = context;
		const applyBrush = () => {
			const brush = new PencilBrush(canvas);
			brush.color = context.options.color;
			brush.width = context.options.width;
			brush.limitedToCanvasSize = true;
			canvas.freeDrawingBrush = brush;
		};

		canvas.discardActiveObject();
		canvas.isDrawingMode = true;
		canvas.freeDrawingCursor = PENCIL_CURSOR;
		applyBrush();
		canvas.requestRenderAll();

		context.onOptionsChange(applyBrush);
		context.on('before:path:created', (event: any) => {
			event.path.set({ shapeType: ShapeType.DRAW, perPixelTargetFind: true, id: generateId() });
		});
		// drawings are added before they are complete, record them once the stroke is finished
		context.on('path:created', () => context.editor.commit());
	},
	OptionsPanel: DrawPanel,
};
