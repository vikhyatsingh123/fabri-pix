/**
 * @author Vikhyat Singh
 * @description Rectangle, circle, arrow, star, comment and image tools
 */

import React, { useEffect, useRef, useState } from 'react';
import type { FabricObject } from 'fabric';

import CommentOneIcon from '../icons/CommentOneIcon';
import PlusIcon from '../icons/PlusIcon';
import RectangleIcon from '../icons/RectangleIcon';
import RightTwoIcon from '../icons/RightTwoIcon';
import RoundIcon from '../icons/RoundIcon';
import StarIcon from '../icons/StarIcon';
import IconsIcon from '../icons/IconsIcon';
import TriangleIcon from '../icons/TriangleIcon';
import { ShapeType } from '../core/constants';
import type { ToolButtonProps, ToolDefinition, ToolPanelProps } from '../core/types';
import { useEditorUI, useImageEditor, useToolOptions } from '../react/context';
import { Divider, Dropdown, Field } from '../react/ui';
import { placeOnClick, usePanel } from './shared';

export interface ShapeOptions {
	fill: string;
	stroke: string;
	strokeWidth: number;
}

export interface RectangleOptions extends ShapeOptions {
	width: number;
	height: number;
}

export interface TriangleOptions extends ShapeOptions {
	width: number;
	height: number;
}

export interface IconShape {
	id: string;
	label: string;
	/** SVG path data, any viewBox */
	path: string;
	fillRule?: 'nonzero' | 'evenodd';
}

export interface IconOptions {
	/** id of the icon in `library` */
	icon: string;
	color: string;
	/** size of the longer side in image pixels */
	size: number;
	library: IconShape[];
}

/** icons of the Icon tool (24 × 24 paths), extend it through `defaults={{ icon: { library: [...] } }}` */
export const defaultIconLibrary: IconShape[] = [
	{ id: 'arrowRight', label: 'Arrow right', path: 'M2 9H14V4L22 12L14 20V15H2Z' },
	{ id: 'arrowLeft', label: 'Arrow left', path: 'M22 9H10V4L2 12L10 20V15H22Z' },
	{ id: 'arrowUp', label: 'Arrow up', path: 'M9 22V10H4L12 2L20 10H15V22Z' },
	{ id: 'arrowDown', label: 'Arrow down', path: 'M9 2V14H4L12 22L20 14H15V2Z' },
	{ id: 'check', label: 'Check', path: 'M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6Z' },
	{
		id: 'cancel',
		label: 'Cancel',
		path: 'M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12Z',
	},
	{
		id: 'heart',
		label: 'Heart',
		path: 'M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04Z',
	},
	{
		id: 'location',
		label: 'Location',
		path: 'M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z',
		fillRule: 'evenodd',
	},
	{ id: 'polygon', label: 'Polygon', path: 'M12 2L21 7V17L12 22L3 17V7Z' },
	{
		id: 'star',
		label: 'Star',
		path: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z',
	},
	{
		id: 'bubble',
		label: 'Bubble',
		path: 'M4 3H20C21.1 3 22 3.9 22 5V15C22 16.1 21.1 17 20 17H9L4 21V17C2.9 17 2 16.1 2 15V5C2 3.9 2.9 3 4 3Z',
	},
	{ id: 'warning', label: 'Warning', path: 'M1 21H23L12 2ZM13 18H11V16H13ZM13 14H11V10H13Z', fillRule: 'evenodd' },
];

const IconPreview: React.FC<{ icon?: IconShape }> = ({ icon }) =>
	icon ? (
		<svg width='20' height='20' viewBox='0 0 24 24' aria-hidden='true'>
			<path d={icon.path} fill='currentColor' fillRule={icon.fillRule} />
		</svg>
	) : null;

export interface CircleOptions extends ShapeOptions {
	radius: number;
}

export interface ArrowShapeOptions {
	color: string;
}

export interface CommentOptions {
	fill: string;
	stroke: string;
	strokeWidth: number;
	textColor: string;
	fontSize: number;
	fontStyle: string;
	fontWeight: string;
	text: string;
}

export interface ImageToolOptions {
	accept: string;
}

/** fill, stroke color and stroke width, used by rectangle, circle and star */
export function ShapesPanel<O extends ShapeOptions>(props: ToolPanelProps<O>) {
	const { value, preview, apply, ColorPicker, NumberInput, labels, icons } = usePanel(props);

	return (
		<>
			<Field icon={icons.fill} label={labels.fill}>
				<ColorPicker
					aria-label={labels.fill}
					value={value('fill')}
					onChange={(fill) => preview({ fill })}
					onChangeComplete={(fill) => apply({ fill } as Partial<O>, { fill })}
				/>
			</Field>
			<Divider />
			<Field icon={icons.stroke} label={labels.stroke}>
				<ColorPicker
					aria-label={labels.stroke}
					value={value('stroke')}
					onChange={(stroke) => preview({ stroke })}
					onChangeComplete={(stroke) => apply({ stroke } as Partial<O>, { stroke })}
				/>
				<NumberInput
					aria-label={labels.size}
					min={1}
					max={50}
					value={value('strokeWidth')}
					onChange={(strokeWidth) => apply({ strokeWidth } as Partial<O>, { strokeWidth })}
				/>
			</Field>
		</>
	);
}

export const ArrowShapePanel: React.FC<ToolPanelProps<ArrowShapeOptions>> = (props) => {
	const { editor, target } = props;
	const { value, apply, ColorPicker, labels, icons } = usePanel(props);
	const parts = (target as any)?._objects as FabricObject[] | undefined;
	const color = target ? (parts?.[1] as any)?.fill : value('color');

	const setColor = (newColor: string, commit: boolean) => {
		if (parts) {
			parts[1].set({ fill: newColor });
			parts[0].set({ stroke: newColor });
			editor.notifyObjectChanged({ commit });
		}
		if (commit) {
			apply({ color: newColor });
		}
	};

	return (
		<Field icon={icons.fill} label={labels.fill}>
			<ColorPicker
				aria-label={labels.fill}
				value={color}
				onChange={(newColor) => setColor(newColor, false)}
				onChangeComplete={(newColor) => setColor(newColor, true)}
			/>
		</Field>
	);
};

export const CommentPanel: React.FC<ToolPanelProps<CommentOptions>> = (props) => {
	const { editor, target } = props;
	const { value, preview, apply, Button, ColorPicker, NumberInput, labels, icons, ui } = usePanel(props);
	const textbox = (target as any)?.test as FabricObject | undefined;
	const textValue = <K extends keyof CommentOptions & string>(key: K, objectKey: string) =>
		textbox ? (textbox as any)[objectKey] : props.options[key];

	// clicking the canvas deselects the callout before the text input blurs, so remember what is edited
	const editedObjectRef = useRef<FabricObject | null>(null);
	const commitTextEdit = () => {
		const edited = editedObjectRef.current;
		editedObjectRef.current = null;
		if (edited?.canvas) {
			editor.commit();
		}
	};
	const commitTextEditRef = useRef(commitTextEdit);
	commitTextEditRef.current = commitTextEdit;
	// the panel can unmount (callout deselected) before the input receives its blur event
	useEffect(() => () => commitTextEditRef.current(), []);

	const toggle = (key: 'fontWeight' | 'fontStyle', on: string) => {
		const next = textValue(key, key) === on ? 'normal' : on;
		apply({ [key]: next } as Partial<CommentOptions>, { [key]: next }, textbox ?? null);
	};

	return (
		<>
			<Field icon={icons.fill} label={labels.fill}>
				<ColorPicker
					aria-label={labels.fill}
					value={value('fill')}
					onChange={(fill) => preview({ fill })}
					onChangeComplete={(fill) => apply({ fill }, { fill })}
				/>
			</Field>
			<Divider />
			<Field icon={icons.stroke} label={labels.stroke}>
				<ColorPicker
					aria-label={labels.stroke}
					value={value('stroke')}
					onChange={(stroke) => preview({ stroke })}
					onChangeComplete={(stroke) => apply({ stroke }, { stroke })}
				/>
				<NumberInput
					aria-label={labels.size}
					min={1}
					max={15}
					value={value('strokeWidth')}
					onChange={(strokeWidth) => apply({ strokeWidth }, { strokeWidth })}
				/>
			</Field>
			<Divider />
			<Field>
				<Button
					title={labels.bold}
					aria-label={labels.bold}
					active={textValue('fontWeight', 'fontWeight') === 'bold'}
					onClick={() => toggle('fontWeight', 'bold')}
				>
					{icons.bold}
				</Button>
				<Button
					title={labels.italic}
					aria-label={labels.italic}
					active={textValue('fontStyle', 'fontStyle') === 'italic'}
					onClick={() => toggle('fontStyle', 'italic')}
				>
					{icons.italic}
				</Button>
			</Field>
			<Divider />
			<Field icon={icons.text} label={labels.text}>
				<ColorPicker
					aria-label={labels.text}
					value={textValue('textColor', 'fill')}
					onChange={(fill) => preview({ fill }, textbox ?? null)}
					onChangeComplete={(textColor) => apply({ textColor }, { fill: textColor }, textbox ?? null)}
				/>
				<NumberInput
					aria-label={labels.size}
					min={1}
					max={100}
					value={textValue('fontSize', 'fontSize')}
					onChange={(fontSize) => apply({ fontSize }, { fontSize }, textbox ?? null)}
				/>
				<input
					type='text'
					aria-label={labels.text}
					value={textValue('text', 'text') ?? ''}
					onFocus={() => {
						editedObjectRef.current = target;
					}}
					onBlur={commitTextEdit}
					onChange={(event) => {
						const text = event.target.value;
						if (textbox) {
							textbox.set({ text });
							editor.notifyObjectChanged();
						}
						props.setOptions({ text });
					}}
					{...ui.slot('textInput')}
				/>
			</Field>
		</>
	);
};

export const rectangleTool: ToolDefinition<RectangleOptions> = {
	id: 'rectangle',
	label: 'Rectangle',
	icon: <RectangleIcon />,
	shapeTypes: [ShapeType.RECTANGLE],
	defaultOptions: { fill: 'transparent', stroke: '#ff0000', strokeWidth: 5, width: 100, height: 50 },
	activate: (context) => {
		placeOnClick(context, ({ x, y }) => {
			const { fill, stroke, strokeWidth, width, height } = context.options;
			void context.editor.addShape(ShapeType.RECTANGLE, {
				angle: 0,
				fill,
				stroke,
				strokeWidth,
				width,
				height,
				left: x - width / 2,
				top: y - height / 2,
				scaleX: 1,
				scaleY: 1,
			});
		});
	},
	OptionsPanel: ShapesPanel,
};

export const circleTool: ToolDefinition<CircleOptions> = {
	id: 'circle',
	label: 'Circle',
	icon: <RoundIcon />,
	shapeTypes: [ShapeType.CIRCLE],
	defaultOptions: { fill: 'transparent', stroke: '#ff0000', strokeWidth: 5, radius: 50 },
	activate: (context) => {
		placeOnClick(context, ({ x, y }) => {
			const { fill, stroke, strokeWidth, radius } = context.options;
			void context.editor.addShape(ShapeType.CIRCLE, {
				angle: 0,
				fill,
				stroke,
				strokeWidth,
				radius,
				left: x - radius,
				top: y - radius,
				scaleX: 1,
				scaleY: 1,
			});
		});
	},
	OptionsPanel: ShapesPanel,
};

export const arrowShapeTool: ToolDefinition<ArrowShapeOptions> = {
	id: 'arrowShape',
	label: 'Arrow',
	icon: <RightTwoIcon />,
	shapeTypes: [ShapeType.ARROW],
	defaultOptions: { color: '#ff0000' },
	activate: (context) => {
		placeOnClick(context, ({ x, y }) => {
			const { color } = context.options;
			void context.editor.addShape(ShapeType.ARROW, {
				angle: 0,
				fill: 'transparent',
				left: x - 36,
				top: y - 10.5,
				scaleX: 1,
				scaleY: 1,
				objects: [
					{
						angle: 0,
						fill: 'transparent',
						left: -36,
						stroke: color,
						strokeWidth: 4,
						top: -2.5,
						x1: -25,
						x2: 25,
						y1: 0,
						y2: 0,
					},
					{ width: 20, height: 20, fill: color, left: 36, top: -10.5, angle: 90 },
				],
			});
		});
	},
	OptionsPanel: ArrowShapePanel,
};

export const starTool: ToolDefinition<ShapeOptions> = {
	id: 'star',
	label: 'Star',
	icon: <StarIcon />,
	type: 'action',
	shapeTypes: [ShapeType.STAR],
	defaultOptions: { fill: 'transparent', stroke: '#ff0000', strokeWidth: 5 },
	run: (context) => {
		const { x, y } = context.editor.getSceneCenter();
		const { fill, stroke, strokeWidth } = context.options;
		context.canvas.discardActiveObject();
		return context.editor.addShape(ShapeType.STAR, {
			angle: 0,
			fill,
			stroke,
			strokeWidth,
			left: x - 45,
			top: y - 47.5,
			scaleX: 1,
			scaleY: 1,
			width: 90,
			height: 95,
		});
	},
	OptionsPanel: ShapesPanel,
};

export const commentTool: ToolDefinition<CommentOptions> = {
	id: 'comment',
	label: 'Comment',
	icon: <CommentOneIcon />,
	type: 'action',
	shapeTypes: [ShapeType.COMMENT_BOX],
	defaultOptions: {
		fill: '#ff0000',
		stroke: '#0386b5',
		strokeWidth: 2,
		textColor: '#ffffff',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: 'normal',
		text: 'Textbox',
	},
	run: (context) => {
		const { x, y } = context.editor.getSceneCenter();
		const options = context.options;
		context.canvas.discardActiveObject();
		return context.editor.addShape(ShapeType.COMMENT_BOX, {
			top: y - 50,
			left: x - 100,
			fill: options.fill,
			test: {
				fontStyle: options.fontStyle,
				fill: options.textColor,
				text: options.text,
				fontSize: options.fontSize,
				fontWeight: options.fontWeight,
				textAlign: 'left',
			},
			scaleX: 1,
			scaleY: 1,
			width: 200,
			height: 100,
			strokeWidth: options.strokeWidth,
			stroke: options.stroke,
		});
	},
	OptionsPanel: CommentPanel,
};

export const imageTool: ToolDefinition<ImageToolOptions> = {
	id: 'image',
	label: 'Add Image',
	icon: <PlusIcon />,
	type: 'action',
	shapeTypes: [ShapeType.CUSTOM_SHAPE],
	defaultOptions: { accept: 'image/*' },
	run: (context) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = context.options.accept;
		input.onchange = () => {
			const file = input.files?.[0];
			if (file) {
				context.editor.addImage(file).catch((error) => console.error(error));
			}
		};
		input.click();
	},
};

export const triangleTool: ToolDefinition<TriangleOptions> = {
	id: 'triangle',
	label: 'Triangle',
	icon: <TriangleIcon />,
	shapeTypes: [ShapeType.TRIANGLE],
	defaultOptions: { fill: 'transparent', stroke: '#ff0000', strokeWidth: 5, width: 90, height: 80 },
	activate: (context) => {
		placeOnClick(context, ({ x, y }) => {
			const { fill, stroke, strokeWidth, width, height } = context.options;
			void context.editor.addShape(ShapeType.TRIANGLE, {
				fill,
				stroke,
				strokeWidth,
				width,
				height,
				left: x - width / 2,
				top: y - height / 2,
			});
		});
	},
	OptionsPanel: ShapesPanel,
};

/** the icon button with a dropdown of the icon library */
export const IconToolButton: React.FC<ToolButtonProps> = (props) => {
	const { tool, active, onClick } = props;
	const editor = useImageEditor();
	const ui = useEditorUI();
	const [options, setOptions] = useToolOptions<IconOptions>(tool.id);
	const [open, setOpen] = useState(false);
	const { Button } = ui.components;
	const current = options.library?.find((icon) => icon.id === options.icon);

	return (
		<Dropdown
			open={open}
			onOpenChange={setOpen}
			trigger={
				<>
					<Button slot='toolButton' active={active} onClick={onClick}>
						{current ? <IconPreview icon={current} /> : ui.toolIcon(tool)}
						<span>{ui.toolLabel(tool)}</span>
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
			<div role='menu' {...ui.slot('iconGrid')}>
				{options.library?.map((icon) => (
					<Button
						key={icon.id}
						role='menuitem'
						title={icon.label}
						aria-label={icon.label}
						active={icon.id === options.icon}
						onClick={() => {
							setOpen(false);
							setOptions({ icon: icon.id });
							if (!active) {
								editor.setActiveTool(tool.id);
							}
						}}
					>
						<IconPreview icon={icon} />
					</Button>
				))}
			</div>
		</Dropdown>
	);
};

export const IconPanel: React.FC<ToolPanelProps<IconOptions>> = (props) => {
	const { value, preview, apply, ColorPicker, labels, icons } = usePanel(props);
	return (
		<Field icon={icons.fill} label={labels.color}>
			<ColorPicker
				aria-label={labels.color}
				value={value('color', 'fill')}
				onChange={(fill) => preview({ fill })}
				onChangeComplete={(color) => apply({ color }, { fill: color })}
			/>
		</Field>
	);
};

export const iconTool: ToolDefinition<IconOptions> = {
	id: 'icon',
	label: 'Icon',
	icon: <IconsIcon />,
	shapeTypes: [ShapeType.ICON],
	defaultOptions: { icon: 'arrowRight', color: '#ff0000', size: 60, library: defaultIconLibrary },
	activate: (context) => {
		context.setCursor('crosshair');
		placeOnClick(context, ({ x, y }) => {
			const { icon: iconId, color, size, library } = context.options;
			const icon = library.find((item) => item.id === iconId) ?? library[0];
			if (!icon) {
				return;
			}
			void context.editor.addShape(ShapeType.ICON, {
				path: icon.path,
				fillRule: icon.fillRule,
				fill: color,
				size,
				left: x,
				top: y,
			});
		});
	},
	OptionsPanel: IconPanel,
	ToolbarButton: IconToolButton,
};
