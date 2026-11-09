/**
 * @author Vikhyat Singh
 * @description Rectangle, circle, arrow, star, comment and image tools
 */

import React, { useEffect, useRef } from 'react';
import type { FabricObject } from 'fabric';

import CommentOneIcon from '../icons/CommentOneIcon';
import PlusIcon from '../icons/PlusIcon';
import RectangleIcon from '../icons/RectangleIcon';
import RightTwoIcon from '../icons/RightTwoIcon';
import RoundIcon from '../icons/RoundIcon';
import StarIcon from '../icons/StarIcon';
import { ShapeType } from '../core/constants';
import type { ToolDefinition, ToolPanelProps } from '../core/types';
import { Field, Divider } from '../react/ui';
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
