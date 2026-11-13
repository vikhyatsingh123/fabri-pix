/**
 * @author Vikhyat Singh
 * @description Definitions of the objects created by the built-in tools
 */

import { Canvas, FabricObject, Line, Path, Point, Triangle, util } from 'fabric';

import createShape, { applyBlurEffect } from './shapeFactory';
import { cropOverlayShapeTypes, ShapeType } from './constants';
import { ShapeContext, ShapeDefinition } from './types';

const withoutUndefined = (data: Record<string, any>) =>
	Object.fromEntries(Object.entries(data ?? {}).filter(([, value]) => value !== undefined));

// fabric options from shape data: no undefined values and no `id` (set separately as custom property)
const fabricProps = (data: Record<string, any>) =>
	Object.fromEntries(Object.entries(data ?? {}).filter(([key, value]) => value !== undefined && key !== 'id'));

const transform = { angle: 0, scaleX: 1, scaleY: 1, left: 0, top: 0 };
const shapeStyle = { ...transform, fill: 'transparent', stroke: '#ff0000', strokeWidth: 5 };

/** defaults for `editor.addShape(type, data)`, so that only the interesting properties have to be passed */
const createDefaults: Record<string, Record<string, any>> = {
	[ShapeType.RECTANGLE]: { ...shapeStyle, width: 100, height: 50 },
	[ShapeType.CIRCLE]: { ...shapeStyle, radius: 50 },
	[ShapeType.STAR]: { ...shapeStyle, width: 90, height: 95 },
	[ShapeType.TEXT]: {
		...transform,
		text: 'Text',
		fill: '#000000',
		backgroundColor: '',
		fontFamily: 'Arial',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: 'normal',
		textAlign: 'left',
	},
	[ShapeType.EMOJI]: { ...transform, text: '😀' },
	[ShapeType.CUSTOM_SHAPE]: { ...transform, fill: 'transparent' },
	[ShapeType.BLUR]: { ...transform, width: 100, height: 50 },
	[ShapeType.ADVANCED_ARROW]: { stroke: '#ff0000', strokeWidth: 4, cornerColor: 'blue' },
	[ShapeType.LINE_PATH]: { stroke: '#ff0000', strokeWidth: 3 },
	[ShapeType.COMMENT_BOX]: {
		...transform,
		fill: '#ff0000',
		stroke: '#0386b5',
		strokeWidth: 2,
		width: 200,
		height: 100,
		test: { text: 'Textbox', fill: '#ffffff', fontSize: 20, fontStyle: 'normal', fontWeight: 'normal', textAlign: 'left' },
	},
};

const fromFactory = (type: string): Pick<ShapeDefinition, 'create' | 'restore'> => ({
	create: (data: any, { editor, canvas }: ShapeContext) => {
		const defaults = createDefaults[type] ?? {};
		const values = withoutUndefined(data);
		return createShape({
			canvas: { current: canvas },
			shapeType: type,
			isNewShape: true,
			canvasData: {
				sceneWidth: editor.getSceneSize().width,
				sceneHeight: editor.getSceneSize().height,
				...defaults,
				...values,
				// the callout text options are nested
				...(defaults.test ? { test: { ...defaults.test, ...withoutUndefined(values.test) } } : {}),
			},
		});
	},
	restore: async (data: any, { canvas }: ShapeContext) => {
		await createShape({ canvas: { current: canvas }, shapeType: type, isNewShape: false, canvasData: data });
		// the factory functions don't restore every transform property (rotated text, flipped shapes)
		const object = canvas.getObjects().find((obj: any) => obj.id === data.id && obj.shapeType === type);
		if (object) {
			object.set({ angle: data.angle ?? 0, flipX: !!data.flipX, flipY: !!data.flipY });
			object.setCoords();
			// re-positions the arrow head of arrows
			(object as any).fire('modifyPoly');
		}
	},
});

// look of the selection controls of the built-in shapes
const controlStyle = {
	cornerColor: '#000',
	cornerSize: 8,
	cornerStrokeColor: '#1d7bb9',
	cornerStyle: 'circle' as const,
	transparentCorners: false,
};

/** restores objects which fabric can serialize on its own and re-applies the control style */
const restoreWithControlStyle = async (data: any, { canvas }: ShapeContext) => {
	const [object] = await util.enlivenObjects<FabricObject>([data]);
	if (object) {
		object.set(controlStyle);
		canvas.add(object);
	}
};

const addAndSelect = (object: FabricObject, data: any, type: string, canvas: Canvas) => {
	object.set({ ...controlStyle, shapeType: type, id: data.id });
	canvas.add(object);
	canvas.setActiveObject(object);
	canvas.requestRenderAll();
};

const relatedById =
	(suffix: string) =>
	(object: FabricObject, canvas: Canvas): FabricObject[] =>
		canvas.getObjects().filter((obj: any) => obj.id === `${(object as any).id}${suffix}`);

export const builtInShapes: ShapeDefinition[] = [
	{ type: ShapeType.RECTANGLE, label: 'Rectangle', ...fromFactory(ShapeType.RECTANGLE) },
	{ type: ShapeType.CIRCLE, label: 'Circle', ...fromFactory(ShapeType.CIRCLE) },
	{ type: ShapeType.STAR, label: 'Star', ...fromFactory(ShapeType.STAR) },
	{ type: ShapeType.ARROW, label: 'Arrow', ...fromFactory(ShapeType.ARROW) },
	{ type: ShapeType.TEXT, label: 'Text', ...fromFactory(ShapeType.TEXT) },
	{ type: ShapeType.EMOJI, label: 'Emoji', ...fromFactory(ShapeType.EMOJI) },
	{ type: ShapeType.CUSTOM_SHAPE, label: 'Image', ...fromFactory(ShapeType.CUSTOM_SHAPE) },
	{
		type: ShapeType.TRIANGLE,
		label: 'Triangle',
		create: (data, { canvas }) => {
			const props = { ...shapeStyle, width: 90, height: 80, ...fabricProps(data) };
			addAndSelect(new Triangle({ strokeUniform: true, ...props }), data, ShapeType.TRIANGLE, canvas);
		},
		restore: restoreWithControlStyle,
	},
	{
		type: ShapeType.LINE,
		label: 'Line',
		// `points`: [x1, y1, x2, y2]
		create: (data, { canvas }) => {
			const { points = [0, 0, 100, 0], stroke = '#ff0000', strokeWidth = 3, ...props } = fabricProps(data);
			addAndSelect(
				new Line(points, { stroke, strokeWidth, strokeLineCap: 'round', perPixelTargetFind: true, ...props }),
				data,
				ShapeType.LINE,
				canvas,
			);
		},
		restore: restoreWithControlStyle,
		// drawn by dragging, the line tool records it once the drag ends
		recordOnAdd: false,
	},
	{
		type: ShapeType.ICON,
		label: 'Icon',
		// `path`: SVG path data, `size`: size of the longer side, `left` / `top`: center of the icon
		create: (data, { canvas }) => {
			const { path, size = 60, left = 0, top = 0, fill = '#ff0000', fillRule = 'nonzero', ...props } =
				fabricProps(data);
			const icon = new Path(path, { fill, fillRule, strokeWidth: 0, ...props });
			const scale = size / Math.max(icon.width, icon.height, 1);
			icon.set({ scaleX: scale, scaleY: scale });
			icon.setPositionByOrigin(new Point(left, top), 'center', 'center');
			addAndSelect(icon, data, ShapeType.ICON, canvas);
		},
		restore: restoreWithControlStyle,
	},
	{ type: ShapeType.STEPS_CREATOR, label: 'Step', ...fromFactory(ShapeType.STEPS_CREATOR) },
	{
		type: ShapeType.COMMENT_BOX,
		label: 'Comment',
		...fromFactory(ShapeType.COMMENT_BOX),
		getRelatedObjects: relatedById('-text'),
	},
	// drawn objects record the history entry themselves once they are complete
	{
		type: ShapeType.BLUR,
		label: 'Blur',
		...fromFactory(ShapeType.BLUR),
		create: async (data, context) => {
			await fromFactory(ShapeType.BLUR).create!(data, context);
			// the redact tool applies the blur once the area is drawn, programmatic blur areas are blurred right away
			const rect: any = context.canvas.getObjects().find((obj: any) => obj.id === data.id);
			if (rect && rect.width > 0 && rect.height > 0) {
				applyBlurEffect({ current: context.canvas }, rect);
			}
		},
		recordOnAdd: false,
		getRelatedObjects: relatedById('-blur'),
	},
	{ type: ShapeType.DRAW, label: 'Drawing', ...fromFactory(ShapeType.DRAW), recordOnAdd: false },
	{
		type: ShapeType.ADVANCED_ARROW,
		label: 'Arrow',
		...fromFactory(ShapeType.ADVANCED_ARROW),
		recordOnAdd: false,
		getRelatedObjects: relatedById('-arrowhead'),
	},
	{ type: ShapeType.LINE_PATH, label: 'Path', ...fromFactory(ShapeType.LINE_PATH), recordOnAdd: false },
	// parts of other objects
	{ type: ShapeType.BLUR_INNER_PART, helper: true },
	{ type: ShapeType.ADVANCED_ARROW_HEAD, helper: true },
	{ type: ShapeType.COMMENT_BOX_TEXTBOX, helper: true, recordModifications: true },
	{ type: ShapeType.TEXT_STEPS_CREATOR, helper: true, recordModifications: true },
	// editing UI
	{
		type: ShapeType.CROP_RECTANGLE,
		label: 'Crop',
		...fromFactory(ShapeType.CROP_RECTANGLE),
		transient: true,
		getRelatedObjects: (_object, canvas) =>
			canvas.getObjects().filter((obj: any) => cropOverlayShapeTypes.includes(obj.shapeType)),
	},
	...cropOverlayShapeTypes.map((type) => ({ type, transient: true })),
	{ type: ShapeType.RECT_STEPS_CREATOR, transient: true },
	{ type: ShapeType.TEMP_LINE_PATH, transient: true, ...fromFactory(ShapeType.TEMP_LINE_PATH) },
	{ type: ShapeType.TEMP_ADVANCED_ARROW, transient: true, ...fromFactory(ShapeType.TEMP_ADVANCED_ARROW) },
	{ type: ShapeType.TEMP_ADVANCED_ARROW_HEAD, transient: true },
];
