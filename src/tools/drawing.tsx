/**
 * @author Vikhyat Singh
 * @description Arrow, path and steps tools (drawn with the mouse)
 */

import React from 'react';
import { Line, Polygon, Polyline, Rect, Triangle } from 'fabric';

import AddTextTwoIcon from '../icons/AddTextTwoIcon';
import ArrowRightUpIcon from '../icons/ArrowRightUpIcon';
import LineIcon from '../icons/LineIcon';
import OrderedListIcon from '../icons/OrderedListIcon';
import WholeSiteAcceleratorIcon from '../icons/WholeSiteAcceleratorIcon';
import { generateId, ShapeType } from '../core/constants';
import { positionArrowHead } from '../core/shapeFactory';
import type { ToolDefinition, ToolPanelProps } from '../core/types';
import { Divider, Field } from '../react/ui';
import { createCursorCache, usePanel } from './shared';

export interface StrokeOptions {
	stroke: string;
	width: number;
}

export interface StepsOptions {
	borderColor: string;
	backgroundColor: string;
	fontColor: string;
	fontSize: number;
	strokeWidth: number;
	/** number of the next step */
	stepNumber: number;
}

const findById = (objects: any[], id: string) => objects.find((obj) => obj.id === id);

/** stroke color and width, used by the arrow and path tools */
export const StrokePanel: React.FC<ToolPanelProps<StrokeOptions>> = (props) => {
	const { editor, target } = props;
	const { value, apply, ColorPicker, NumberInput, labels, icons } = usePanel(props);
	const canvas = editor.canvas;
	const arrowHead = target && canvas ? findById(canvas.getObjects(), `${(target as any).id}-arrowhead`) : undefined;

	const setColor = (stroke: string, commit: boolean) => {
		if (target) {
			target.set({ stroke });
			arrowHead?.set({ fill: stroke });
			editor.notifyObjectChanged({ commit });
		}
		if (commit) {
			apply({ stroke });
		}
	};

	const setWidth = (width: number) => {
		if (target) {
			target.set({ strokeWidth: width });
			target.setCoords();
			if (arrowHead) {
				arrowHead.set({ width: width * 2, height: width * 2 });
				positionArrowHead(arrowHead, target as Polygon);
			}
		}
		apply({ width });
		if (target) {
			editor.notifyObjectChanged({ commit: true });
		}
	};

	return (
		<Field icon={icons.stroke} label={labels.stroke}>
			<ColorPicker
				aria-label={labels.stroke}
				value={value('stroke')}
				onChange={(stroke) => setColor(stroke, false)}
				onChangeComplete={(stroke) => setColor(stroke, true)}
			/>
			<NumberInput
				aria-label={labels.size}
				min={1}
				max={50}
				value={value('width', 'strokeWidth')}
				onChange={setWidth}
			/>
		</Field>
	);
};

export const arrowTool: ToolDefinition<StrokeOptions> = {
	id: 'arrow',
	label: 'Arrow',
	icon: <ArrowRightUpIcon />,
	shapeTypes: [ShapeType.ADVANCED_ARROW],
	defaultOptions: { stroke: '#ff0000', width: 4 },
	activate: (context) => {
		const { canvas, editor } = context;
		let start: { x: number; y: number } | null = null;
		let line: Polygon | undefined;
		let head: Triangle | undefined;

		context.setSelectionEnabled(false);
		context.setCursor('crosshair');
		canvas.discardActiveObject();
		canvas.requestRenderAll();

		const removePreview = () => {
			canvas.remove(...[line, head].filter((obj): obj is Polygon | Triangle => !!obj));
			line = undefined;
			head = undefined;
			start = null;
		};

		context.on('mouse:down', (event: any) => {
			if (start || canvas.findTarget(event.e) || canvas.getActiveObject()) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			const id = generateId();
			start = { x: point.x, y: point.y };
			void editor.addShape(ShapeType.TEMP_ADVANCED_ARROW, {
				id,
				stroke: context.options.stroke,
				strokeWidth: context.options.width,
				cornerColor: 'blue',
				points: [{ ...start }, { ...start }],
			});
			line = findById(canvas.getObjects(), id);
			head = findById(canvas.getObjects(), `${id}-arrowhead`);
		});

		context.on('mouse:move', (event: any) => {
			if (!start || !line || !head) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			const points = line.points;
			points[1] = { x: point.x, y: point.y };
			line.set({ points, dirty: true });
			const angle = (Math.atan2(point.y - points[0].y, point.x - points[0].x) * 180) / Math.PI;
			head.set({ left: point.x, top: point.y, angle: angle + 90 });
			canvas.requestRenderAll();
		});

		context.on('mouse:up', (event: any) => {
			if (!start) {
				return;
			}
			const from = start;
			const to = canvas.getScenePoint(event.e);
			removePreview();
			if (from.x !== to.x || from.y !== to.y) {
				void editor.addShape(ShapeType.ADVANCED_ARROW, {
					stroke: context.options.stroke,
					strokeWidth: context.options.width,
					cornerColor: 'blue',
					points: [from, { x: to.x, y: to.y }],
				});
				// arrows are added in two parts, record them once both exist
				editor.commit();
			}
			canvas.requestRenderAll();
		});

		return removePreview;
	},
	OptionsPanel: StrokePanel,
};

export const lineTool: ToolDefinition<StrokeOptions> = {
	id: 'line',
	label: 'Line',
	icon: <LineIcon />,
	shapeTypes: [ShapeType.LINE],
	defaultOptions: { stroke: '#ff0000', width: 3 },
	activate: (context) => {
		const { canvas, editor } = context;
		let line: Line | undefined;

		context.setSelectionEnabled(false);
		context.setCursor('crosshair');
		canvas.discardActiveObject();
		canvas.requestRenderAll();

		context.on('mouse:down', (event: any) => {
			if (line || canvas.findTarget(event.e)) {
				return;
			}
			const { x, y } = canvas.getScenePoint(event.e);
			const id = generateId();
			// created through the shape definition directly: the line is recorded once the drag ends
			void editor
				.getShape(ShapeType.LINE)
				?.create?.(
					{ id, points: [x, y, x, y], stroke: context.options.stroke, strokeWidth: context.options.width },
					{ editor, canvas },
				);
			line = findById(canvas.getObjects(), id);
			canvas.discardActiveObject();
		});

		context.on('mouse:move', (event: any) => {
			if (!line) {
				return;
			}
			const { x, y } = canvas.getScenePoint(event.e);
			line.set({ x2: x, y2: y });
			line.setCoords();
			canvas.requestRenderAll();
		});

		context.on('mouse:up', () => {
			if (!line) {
				return;
			}
			const drawn = line;
			line = undefined;
			if (drawn.x1 === drawn.x2 && drawn.y1 === drawn.y2) {
				canvas.remove(drawn);
			} else {
				drawn.setCoords();
				canvas.setActiveObject(drawn);
				editor.commit();
			}
			canvas.requestRenderAll();
		});

		return () => {
			if (line) {
				canvas.remove(line);
				line = undefined;
			}
		};
	},
	OptionsPanel: StrokePanel,
};

export const pathTool: ToolDefinition<StrokeOptions> = {
	id: 'path',
	label: 'Path',
	icon: <WholeSiteAcceleratorIcon />,
	shapeTypes: [ShapeType.LINE_PATH],
	defaultOptions: { stroke: '#ff0000', width: 3 },
	activate: (context) => {
		const { canvas, editor } = context;
		let points: { x: number; y: number }[] = [];
		let preview: Polyline | undefined;

		context.setSelectionEnabled(false);
		context.setCursor('crosshair');
		canvas.discardActiveObject();
		canvas.requestRenderAll();

		const finish = (create: boolean) => {
			if (preview) {
				canvas.remove(preview);
				preview = undefined;
			}
			// the clicks of a double click add the same point again, drop consecutive duplicates
			const cleanPoints = points.filter(
				(point, index) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y,
			);
			points = [];
			// a path needs at least two points, a single click would create an invisible object
			if (create && cleanPoints.length > 1) {
				void editor.addShape(ShapeType.LINE_PATH, {
					stroke: context.options.stroke,
					strokeWidth: context.options.width,
					points: cleanPoints,
				});
				editor.commit();
			}
			canvas.requestRenderAll();
		};

		context.on('mouse:down', (event: any) => {
			if (canvas.findTarget(event.e)) {
				canvas.discardActiveObject();
			}
			const point = canvas.getScenePoint(event.e);

			if (!preview) {
				const id = generateId();
				points = [{ x: point.x, y: point.y }];
				void editor.addShape(ShapeType.TEMP_LINE_PATH, {
					id,
					stroke: context.options.stroke,
					strokeWidth: context.options.width,
					points: [
						{ x: point.x, y: point.y },
						{ x: point.x + 1, y: point.y + 1 },
					],
				});
				preview = findById(canvas.getObjects(), id);
				return;
			}

			points.push({ x: point.x, y: point.y });
			preview.points.push({ x: point.x, y: point.y });
			preview.set({ points: preview.points });
			preview.setCoords();
			canvas.requestRenderAll();
		});

		context.on('mouse:move', (event: any) => {
			if (!preview) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			const previewPoints = preview.points;
			previewPoints[previewPoints.length - 1] = { x: point.x, y: point.y };
			preview.set({ points: previewPoints });
			canvas.requestRenderAll();
		});

		context.on('mouse:dblclick', () => finish(true));
		context.listen(window, 'keyup', (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				finish(true);
			}
		});

		// switching tools completes the path, it is dropped when the canvas content is replaced
		return (reason) => finish(reason === 'switch' || reason === 'pause');
	},
	OptionsPanel: StrokePanel,
};

const getNextStepNumber = (objects: any[]) => {
	const stepNumbers = objects
		.filter((obj) => obj.shapeType === ShapeType.STEPS_CREATOR)
		.map((obj) => Number(obj._objects?.[1]?._objects?.[1]?.text))
		.filter((stepNumber) => !isNaN(stepNumber));
	return stepNumbers.length > 0 ? Math.max(...stepNumbers) + 1 : 1;
};

export const StepsPanel: React.FC<ToolPanelProps<StepsOptions>> = (props) => {
	const { editor, target, options } = props;
	const { apply, ColorPicker, NumberInput, labels, icons } = usePanel(props);
	const parts = (target as any)?._objects;
	const rect = parts?.[0];
	const circle = parts?.[1]?._objects?.[0];
	const text = parts?.[1]?._objects?.[1];

	// the circle grows with the text
	const resizeCircle = () => {
		if (!circle || !text) {
			return;
		}
		const newRadius = Math.max(text.width / 2 + 10, text.height / 2 + 10);
		circle.set({
			radius: newRadius,
			left: circle.left - (newRadius - circle.radius),
			top: circle.top - (newRadius - circle.radius),
		});
		text.set({ left: 0, top: 0 });
		// re-select so that the selection box matches the new size
		editor.canvas?.discardActiveObject();
		editor.canvas?.setActiveObject(target!);
	};

	const change = (
		part: any,
		objectProps: Record<string, any> | null,
		optionValues: Partial<StepsOptions>,
		commit = true,
	) => {
		if (part && objectProps) {
			part.set(objectProps);
			if ('fontSize' in objectProps || 'text' in objectProps) {
				resizeCircle();
			}
			editor.notifyObjectChanged({ commit });
		}
		if (commit) {
			apply(optionValues);
		}
	};

	return (
		<>
			<Field icon={icons.fill} label={labels.fill}>
				<ColorPicker
					aria-label={labels.fill}
					value={circle ? circle.fill : options.backgroundColor}
					onChange={(fill) => change(circle, { fill }, {}, false)}
					onChangeComplete={(fill) => change(circle, { fill }, { backgroundColor: fill })}
				/>
			</Field>
			<Divider />
			<Field icon={icons.stroke} label={labels.stroke}>
				<ColorPicker
					aria-label={labels.stroke}
					value={rect ? rect.stroke : options.borderColor}
					onChange={(stroke) => change(rect, { stroke }, {}, false)}
					onChangeComplete={(stroke) => change(rect, { stroke }, { borderColor: stroke })}
				/>
				<NumberInput
					aria-label={labels.size}
					min={1}
					max={15}
					value={rect ? rect.strokeWidth : options.strokeWidth}
					onChange={(strokeWidth) => change(rect, { strokeWidth }, { strokeWidth })}
				/>
			</Field>
			<Divider />
			<Field icon={<AddTextTwoIcon />} label={labels.text}>
				<ColorPicker
					aria-label={labels.text}
					value={text ? text.fill : options.fontColor}
					onChange={(fill) => change(text, { fill }, {}, false)}
					onChangeComplete={(fill) => change(text, { fill }, { fontColor: fill })}
				/>
				<NumberInput
					aria-label={labels.size}
					min={1}
					max={100}
					value={text ? text.fontSize : options.fontSize}
					onChange={(fontSize) => change(text, { fontSize }, { fontSize })}
				/>
			</Field>
			<Divider />
			<Field icon={icons.stepNumber} label={labels.stepNumber}>
				<NumberInput
					aria-label={labels.stepNumber}
					min={1}
					value={text ? text.text : options.stepNumber}
					onChange={(stepNumber) =>
						// the next step continues after an edited one instead of repeating its number
						change(text, { text: String(stepNumber) }, { stepNumber: text ? stepNumber + 1 : stepNumber })
					}
				/>
			</Field>
		</>
	);
};

export const stepsTool: ToolDefinition<StepsOptions> = {
	id: 'steps',
	label: 'Steps',
	icon: <OrderedListIcon />,
	shapeTypes: [ShapeType.STEPS_CREATOR],
	defaultOptions: {
		borderColor: '#ff0000',
		backgroundColor: '#ff0000',
		fontColor: '#ffffff',
		fontSize: 20,
		strokeWidth: 2,
		stepNumber: 1,
	},
	activate: (context) => {
		const { canvas, editor } = context;
		let stepRect: Rect | null = null;
		let start = { x: 0, y: 0 };
		const cursor = createCursorCache();

		// continue numbering after the highest step on the canvas
		context.setOptions({ stepNumber: getNextStepNumber(canvas.getObjects()) });
		context.setSelectionEnabled(false);
		context.setCursor('crosshair');
		canvas.discardActiveObject();
		canvas.requestRenderAll();

		const stepCursor = () => {
			const { stepNumber, backgroundColor, fontColor } = context.options;
			return cursor(`${stepNumber}|${backgroundColor}|${fontColor}`, (ctx, element) => {
				element.width = 60;
				element.height = 60;
				ctx.fillStyle = backgroundColor;
				ctx.globalAlpha = 0.5;
				ctx.beginPath();
				ctx.arc(30, 30, 25, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = fontColor;
				ctx.font = 'bold 18px Arial';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(String(stepNumber), 30, 30);
				return `url(${element.toDataURL()}) 30 30, auto`;
			});
		};

		context.on('mouse:move', (event: any) => {
			canvas.setCursor(canvas.findTarget(event.e) ? 'move' : stepCursor());
			if (!stepRect) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			stepRect.set({
				left: Math.min(start.x, point.x),
				top: Math.min(start.y, point.y),
				width: Math.abs(point.x - start.x),
				height: Math.abs(point.y - start.y),
			});
			stepRect.setCoords();
			canvas.requestRenderAll();
		});

		context.on('mouse:down', (event: any) => {
			if (canvas.findTarget(event.e)) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			start = { x: point.x, y: point.y };
			const options = context.options;
			stepRect = new Rect({
				left: point.x,
				top: point.y,
				width: 0,
				height: 0,
				fill: 'transparent',
				stroke: options.borderColor,
				strokeWidth: options.strokeWidth,
				selectable: false,
				excludeFromExport: true,
			});
			stepRect.set({ shapeType: ShapeType.RECT_STEPS_CREATOR });
			canvas.add(stepRect);
		});

		context.on('mouse:up', (event: any) => {
			if (!stepRect) {
				return;
			}
			const rect = stepRect;
			stepRect = null;
			const { x, y } = canvas.getScenePoint(event.e);
			const options = context.options;

			// the circle is placed at the rectangle corner where the drag ended
			const corners = rect.getCoords();
			const cornerOffsets = [
				[0, 0],
				[rect.width, 0],
				[rect.width, rect.height],
				[0, rect.height],
			];
			const cornerIndex = corners.findIndex(
				(corner) => Math.abs(corner.x - x) <= 2 && Math.abs(corner.y - y) <= 2,
			);
			const [circleLeft, circleTop] = cornerOffsets[cornerIndex] ?? [0, 0];

			canvas.remove(rect);
			void editor.addShape(ShapeType.STEPS_CREATOR, {
				angle: 0,
				left: x,
				top: y,
				scaleX: 1,
				scaleY: 1,
				fill: 'transparent',
				objects: [
					{
						left: rect.left,
						top: rect.top,
						width: rect.width,
						height: rect.height,
						fill: 'transparent',
						stroke: options.borderColor,
						strokeWidth: options.strokeWidth,
					},
					{
						objects: [
							{ left: circleLeft, top: circleTop, fill: options.backgroundColor },
							{
								fill: options.fontColor,
								text: String(options.stepNumber),
								fontSize: options.fontSize,
								angle: 0,
							},
						],
					},
				],
			});
			context.setOptions({ stepNumber: options.stepNumber + 1 });
			canvas.requestRenderAll();
		});

		return () => {
			if (stepRect) {
				canvas.remove(stepRect);
				stepRect = null;
			}
		};
	},
	OptionsPanel: StepsPanel,
};
