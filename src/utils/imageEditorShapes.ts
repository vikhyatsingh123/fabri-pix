/**
 * @author Vikhyat Singh
 * hooks for creating shapes in image editor
 */

import {
	Canvas,
	Rect,
	Image,
	controlsUtils,
	Triangle,
	Polygon,
	Polyline,
	Path,
	IText,
	Textbox,
	Circle,
	Group,
	Line,
	FabricImage,
	Control,
} from 'fabric';
import loglevel from 'loglevel';

import { SubMenu } from './utils';
import _ from 'lodash';
import CustomFabricPolygon from './CustomFabricPolygon';

const applyBlurEffect = (canvas: React.MutableRefObject<Canvas>, rect: any) => {
	const img = canvas.current.backgroundImage as any;

	if (!img || !rect) {
		return;
	}

	const { left, top, width, height, scaleX, scaleY } = rect;
	const { scaleX: imgScaleX = 1, scaleY: imgScaleY = 1 } = img;

	const croppedCanvas = document.createElement('canvas');
	croppedCanvas.width = width * scaleX;
	croppedCanvas.height = height * scaleY;

	if (croppedCanvas.width === 0 || croppedCanvas.height === 0) {
		return;
	}

	const ctx = croppedCanvas.getContext('2d');
	if (ctx) {
		ctx.filter = 'blur(5px)';
		ctx.drawImage(
			img.getElement(),
			(left - img.left) / imgScaleX,
			(top - img.top) / imgScaleY,
			(width * scaleX) / imgScaleX,
			(height * scaleY) / imgScaleY,
			0,
			0,
			croppedCanvas.width,
			croppedCanvas.height,
		);

		const blurredImage = new Image(croppedCanvas);

		blurredImage.set({
			left,
			top,
			width: width * scaleX,
			height: height * scaleY,
			selectable: false,
			evented: false,
			excludeFromExport: true,
			shapeType: SubMenu.BLUR_INNER_PART,
			id: rect.id + '-blur',
		});

		canvas.current.getObjects().forEach((obj: any) => {
			if (obj.type === 'image' && obj !== img && obj.id === rect.id + '-blur') {
				canvas.current.remove(obj);
			}
		});

		canvas.current.add(blurredImage);
		canvas.current.renderAll();
	}
};

const addBlurEffect = ({
	canvas,
	isNewShape,
	canvasData,
}: {
	canvas: React.MutableRefObject<Canvas>;
	isNewShape?: boolean;
	canvasData?: any;
}) => {
	const rect = new Rect({
		id: canvasData.id,
		left: canvasData.left,
		top: canvasData.top,
		width: canvasData.width,
		height: canvasData.height,
		scaleX: canvasData?.scaleX ?? 1,
		scaleY: canvasData?.scaleY ?? 1,
		fill: 'rgba(255, 255, 255, 0.3)',
		stroke: 'transparent',
		strokeWidth: 1,
		cornerColor: 'blue',
		cornerStyle: 'circle',
		cornerSize: 8,
		transparentCorners: false,
		selectable: true,
		hasBorders: true,
		hasControls: true,
		lockRotation: true,
		shapeType: SubMenu.BLUR,
	});

	if (!isNewShape) {
		canvas.current.on(
			'after:render',
			_.once(() => {
				applyBlurEffect(canvas, rect);
			}),
		);
	}
	rect.on('modified', () => {
		applyBlurEffect(canvas, rect);
	});

	canvas.current.add(rect);

	if (!isNewShape) {
		canvas.current.setActiveObject(rect);
	}
	canvas.current.requestRenderAll();
};

const modifyArrowHeadFirstTime = (arrowHead: Triangle, points: any) => {
	const dx = points![1].x - points![0].x;
	const dy = points![1].y - points![0].y;
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
	arrowHead?.set({
		left: points![1].x,
		top: points![1].y,
		angle: angle + 90,
	});
};

const modifyArrowHeadOnMoving = (arrowHead: Triangle, coords: any) => {
	const dx = coords.p1.x - coords.p0.x;
	const dy = coords.p1.y - coords.p0.y;
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
	arrowHead?.set({
		left: coords.p1.x,
		top: coords.p1.y,
		angle: angle + 90,
	});
};

const addAdvancedArrow = ({
	canvas,
	isNewShape,
	canvasData,
	shapeType,
}: {
	canvas: React.MutableRefObject<Canvas>;
	isNewShape?: boolean;
	canvasData?: any;
	shapeType: SubMenu;
}) => {
	const currentPolyline = new Polygon(canvasData.points, {
		fill: 'transparent',
		stroke: canvasData.stroke,
		strokeWidth: canvasData.strokeWidth,
		objectCaching: false,
		transparentCorners: false,
		cornerColor: canvasData.cornerColor,
		perPixelTargetFind: true,
		...(isNewShape
			? {}
			: {
					left: canvasData.left,
					top: canvasData.top,
					scaleX: canvasData.scaleX,
					scaleY: canvasData.scaleY,
			  }),
	});

	const arrowHead = new Triangle({
		width: canvasData.strokeWidth * 2,
		height: canvasData.strokeWidth * 2,
		fill: canvasData.stroke,
		excludeFromExport: true,
		selectable: false,
		originX: 'center',
		originY: 'center',
	});

	currentPolyline.set({
		shapeType,
		id: canvasData.id,
	});

	arrowHead.set({
		shapeType:
			shapeType === SubMenu.TEMP_ADVANCED_ARROW ? SubMenu.TEMP_ADVANCED_ARROW_HEAD : SubMenu.ADVANCED_ARROW_HEAD,
		id: `${canvasData.id}-arrowhead`,
	});

	currentPolyline.on('modifyPoly', () => {
		modifyArrowHeadOnMoving(arrowHead, currentPolyline?.oCoords);
	});

	currentPolyline.on('moving', () => {
		modifyArrowHeadOnMoving(arrowHead, currentPolyline?.oCoords);
	});

	currentPolyline.on(
		'added',
		_.once(() => {
			if (isNewShape) {
				modifyArrowHeadFirstTime(arrowHead, currentPolyline?.points);
			} else {
				modifyArrowHeadOnMoving(arrowHead, currentPolyline?.oCoords);
			}
		}),
	);

	currentPolyline.cornerStyle = 'circle';
	currentPolyline.cornerColor = 'rgba(0,0,255,0.5)';
	currentPolyline.hasBorders = false;
	currentPolyline.controls = controlsUtils.createPolyControls(currentPolyline);
	currentPolyline.setCoords();

	canvas.current.add(currentPolyline, arrowHead);
	canvas.current.setActiveObject(currentPolyline);
	canvas.current.requestRenderAll();
};

const addLinePath = ({
	canvas,
	isNewShape,
	canvasData,
	shapeType,
}: {
	canvas: React.MutableRefObject<Canvas>;
	isNewShape?: boolean;
	canvasData?: any;
	shapeType: SubMenu;
}) => {
	const currentPolyline = new Polyline(canvasData.points, {
		fill: 'transparent',
		stroke: canvasData.stroke,
		strokeWidth: canvasData.strokeWidth,
		objectCaching: false,
		transparentCorners: false,
		perPixelTargetFind: true,
		cornerColor: 'blue',
		...(isNewShape
			? {}
			: {
					left: canvasData.left,
					top: canvasData.top,
					scaleX: canvasData.scaleX,
					scaleY: canvasData.scaleY,
			  }),
	});

	currentPolyline.set({
		shapeType,
		id: canvasData.id,
	});

	currentPolyline.cornerStyle = 'circle';
	currentPolyline.cornerColor = 'rgba(0,0,255,0.5)';
	currentPolyline.hasBorders = false;
	currentPolyline.controls = controlsUtils.createPolyControls(currentPolyline);
	currentPolyline.setCoords();

	canvas.current.add(currentPolyline);
	canvas.current.setActiveObject(currentPolyline);
	canvas.current.requestRenderAll();
};

const addPencil = ({
	canvas,
	isNewShape,
	canvasData,
}: {
	canvas: React.MutableRefObject<Canvas>;
	isNewShape?: boolean;
	canvasData?: any;
}) => {
	if (!isNewShape) {
		const path = new Path(canvasData.path);
		path.set({
			left: canvasData.left,
			top: canvasData.top,
			scaleX: canvasData.scaleX,
			scaleY: canvasData.scaleY,
			width: canvasData.width,
			height: canvasData.height,
			stroke: canvasData.stroke,
			strokeWidth: canvasData.strokeWidth,
			fill: canvasData.fill,
			strokeLineCap: canvasData.strokeLineCap,
			strokeLineJoin: canvasData.strokeLineJoin,
			strokeMiterLimit: canvasData.strokeMiterLimit,
			shapeType: SubMenu.DRAW,
		});
		canvas.current.add(path);
		canvas.current.requestRenderAll();
	}
};

const addText = ({ canvas, canvasData }: { canvas: React.MutableRefObject<Canvas>; canvasData?: any }) => {
	const text = new IText(canvasData.text, {
		backgroundColor: canvasData.backgroundColor,
		cornerColor: '#000',
		cornerSize: 8,
		cornerStrokeColor: '#1d7bb9',
		cornerStyle: 'circle',
		fill: canvasData.fill,
		fontFamily: 'Arial',
		fontSize: canvasData.fontSize,
		fontStyle: canvasData.fontStyle,
		fontWeight: canvasData.fontWeight,
		left: canvasData.left,
		scaleX: canvasData.scaleX,
		scaleY: canvasData.scaleY,
		textAlign: canvasData.textAlign,
		top: canvasData.top,
		transparentCorners: false,
	});

	text.set({
		shapeType: SubMenu.TEXT,
		id: canvasData.id,
	});

	canvas.current.add(text);
	canvas.current.setActiveObject(text);
};

const addEmoji = ({ canvas, canvasData }: { canvas: React.MutableRefObject<Canvas>; canvasData?: any }) => {
	const emoj = new Textbox(canvasData.text, {
		cornerColor: '#000',
		cornerSize: 8,
		cornerStrokeColor: '#1d7bb9',
		cornerStyle: 'circle',
		editable: false,
		fill: '#000',
		left: canvasData.left,
		scaleX: canvasData.scaleX,
		scaleY: canvasData.scaleY,
		top: canvasData.top,
		transparentCorners: false,
	});

	emoj.set({
		shapeType: SubMenu.EMOJI,
		id: canvasData.id,
	});

	canvas.current.add(emoj);
	canvas.current.setActiveObject(emoj);
};

const addRectangle = ({ canvas, canvasData }: { canvas: React.MutableRefObject<Canvas>; canvasData?: any }) => {
	const rect = new Rect({
		angle: canvasData.angle,
		cornerColor: '#000',
		cornerSize: 8,
		cornerStrokeColor: '#1d7bb9',
		cornerStyle: 'circle',
		fill: canvasData.fill,
		height: canvasData.height,
		left: canvasData.left,
		rx: 0,
		ry: 0,
		scaleX: canvasData.scaleX,
		scaleY: canvasData.scaleY,
		stroke: canvasData.stroke,
		strokeUniform: true,
		strokeWidth: canvasData.strokeWidth,
		top: canvasData.top,
		transparentCorners: false,
		width: canvasData.width,
	});

	rect.set({
		shapeType: SubMenu.RECTANGLE,
		id: canvasData.id,
	});

	canvas.current.add(rect);
	canvas.current.setActiveObject(rect);
};

const addCircle = ({ canvas, canvasData }: { canvas: React.MutableRefObject<Canvas>; canvasData?: any }) => {
	const circle = new Circle({
		angle: canvasData.angle,
		cornerColor: '#000',
		cornerSize: 8,
		cornerStrokeColor: '#1d7bb9',
		cornerStyle: 'circle',
		fill: canvasData.fill,
		left: canvasData.left,
		radius: canvasData.radius,
		scaleX: canvasData.scaleX,
		scaleY: canvasData.scaleY,
		stroke: canvasData.stroke,
		strokeWidth: canvasData.strokeWidth,
		top: canvasData.top,
		strokeUniform: true,
		transparentCorners: false,
	});

	circle.set({
		shapeType: SubMenu.CIRCLE,
		id: canvasData.id,
	});

	canvas.current?.add(circle);
	canvas.current.setActiveObject(circle);
};

const createStarPoints = (
	centerX: number,
	centerY: number,
	outerRadius: number,
	innerRadius: number,
	points: number,
) => {
	const angle = Math.PI / points;
	const starPoints = [];
	for (let i = 0; i < 2 * points; i++) {
		const radius = i % 2 === 0 ? outerRadius : innerRadius;
		const x = centerX + radius * Math.cos(i * angle);
		const y = centerY + radius * Math.sin(i * angle);
		starPoints.push({ x, y });
	}
	return starPoints;
};

const addStar = ({ canvas, canvasData }: { canvas: React.MutableRefObject<Canvas>; canvasData?: any }) => {
	const centerX = 200;
	const centerY = 150;
	const outerRadius = 50;
	const innerRadius = 25;
	const points = 5;

	const starPoints = createStarPoints(centerX, centerY, outerRadius, innerRadius, points);

	const star = new Polygon(starPoints, {
		left: canvasData.left,
		top: canvasData.top,
		scaleX: canvasData.scaleX,
		scaleY: canvasData.scaleY,
		width: canvasData.width,
		height: canvasData.height,
		angle: canvasData.angle,
		fill: canvasData.fill,
		stroke: canvasData.stroke,
		strokeWidth: canvasData.strokeWidth,
		strokeUniform: true,
		transparentCorners: false,
		cornerColor: '#000',
		cornerStyle: 'circle',
		cornerSize: 8,
		cornerStrokeColor: '#1d7bb9',
	});

	star.set({
		shapeType: SubMenu.STAR,
		id: canvasData.id,
	});

	canvas.current.add(star);
	canvas.current.setActiveObject(star);
};

const addArrow = ({ canvas, canvasData }: { canvas: React.MutableRefObject<Canvas>; canvasData?: any }) => {
	const line = new Line([50, 50, 100, 50], {
		angle: canvasData.objects[0].angle,
		fill: canvasData.objects[0].fill,
		left: canvasData.objects[0].left,
		stroke: canvasData.objects[0].stroke,
		strokeWidth: canvasData.objects[0].strokeWidth,
		top: canvasData.objects[0].top,
		x1: canvasData.objects[0].x1,
		x2: canvasData.objects[0].x2,
		y1: canvasData.objects[0].y1,
		y2: canvasData.objects[0].y2,
	});
	const arrowhead = new Triangle({
		width: canvasData.objects[1].width,
		height: canvasData.objects[1].height,
		fill: canvasData.objects[1].fill,
		left: canvasData.objects[1].left,
		top: canvasData.objects[1].top,
		angle: canvasData.objects[1].angle,
	});
	const arrow = new Group([line, arrowhead], {
		angle: canvasData.angle,
		left: canvasData.left,
		top: canvasData.top,
		scaleX: canvasData.scaleX,
		scaleY: canvasData.scaleY,
		selectable: true,
		hasControls: true,
		hasBorders: true,
		strokeUniform: true,
		transparentCorners: false,
		cornerColor: '#000',
		cornerStyle: 'circle',
		cornerSize: 8,
		cornerStrokeColor: '#1d7bb9',
	});

	arrow.set({
		shapeType: SubMenu.ARROW,
		id: canvasData.id,
	});

	canvas.current.add(arrow);
	canvas.current.setActiveObject(arrow);
};

const addCustomShape = async ({ canvas, canvasData }: { canvas: React.MutableRefObject<Canvas>; canvasData?: any }) => {
	const img = await FabricImage.fromURL(canvasData.src);
	img.set({
		left: canvasData.left,
		top: canvasData.top,
		scaleX: canvasData.scaleX,
		scaleY: canvasData.scaleY,
		angle: canvasData.angle,
		fill: canvasData.fill,
		shapeType: SubMenu.CUSTOM_SHAPE,
		id: canvasData.id,
	});

	canvas.current.add(img);
	canvas.current.setActiveObject(img);
	canvas.current.renderAll();
};

const handleTextChangedStepsCreator = (group: Group, canvas: React.MutableRefObject<Canvas>) => {
	const textObject = _.get(group, ['_objects', '1', '_objects', '1']) as IText;
	const circleObject = _.get(group, ['_objects', '1', '_objects', '0']) as Circle;
	const textWidth = textObject.width;
	const textHeight = textObject.height;
	const radius = circleObject.radius;
	const newRadius = Math.max(textWidth / 2 + 10, textHeight / 2 + 10);

	circleObject.set({
		radius: newRadius,
		left: circleObject.left - (newRadius - radius),
		top: circleObject.top - (newRadius - radius),
	});

	textObject.set({
		left: 0,
		top: 0,
	});

	canvas.current.requestRenderAll();
};

const handleDoubleClickStepsCreator = (e: any, canvas: React.MutableRefObject<Canvas>) => {
	const target = e.target;
	if (!target) {
		return;
	}

	if (target?.shapeType === SubMenu.STEPS_CREATOR) {
		const group = target as Group;
		const textObject = _.get(group, ['_objects', '1', '_objects', '1']) as IText;

		textObject.enterEditing();
		textObject.selectAll();

		canvas.current.requestRenderAll();
	}
};

const handleDeselectStepsCreator = (group: Group, canvas: React.MutableRefObject<Canvas>) => {
	(_.get(group, ['_objects', '1', '_objects', '1']) as IText).exitEditing();
	canvas.current.requestRenderAll();
};

const addStepsCreator = ({
	canvas,
	isNewShape,
	canvasData,
}: {
	canvas: React.MutableRefObject<Canvas>;
	isNewShape: boolean;
	canvasData: any;
}) => {
	const text = new IText(canvasData.objects[1].objects[1].text, {
		left: 0,
		top: 0,
		fontSize: canvasData.objects[1].objects[1].fontSize,
		fill: canvasData.objects[1].objects[1].fill,
		angle: canvasData.objects[1].objects[1].angle,
		fontWeight: 'bold',
		editable: true,
		objectCaching: false,
		shapeType: SubMenu.TEXT_STEPS_CREATOR,
		originX: 'center',
		originY: 'center',
	});

	const textWidth = text.width;
	const textHeight = text.height;
	const newRadius = Math.max(textWidth / 2 + 10, textHeight / 2 + 10);

	const circle = new Circle({
		radius: newRadius,
		left: -newRadius / 2,
		top: -newRadius / 2,
		fill: canvasData.objects[1].objects[0].fill,
		selectable: false,
		objectCaching: false,
	});

	const rect = new Rect({
		width: canvasData.objects[0].width,
		height: canvasData.objects[0].height,
		fill: canvasData.objects[0].fill,
		stroke: canvasData.objects[0].stroke,
		strokeWidth: canvasData.objects[0].strokeWidth,
		strokeUniform: true,
		objectCaching: false,
		selectable: false,
		shapeType: SubMenu.RECT_STEPS_CREATOR,
		id: canvasData.id,
		...(isNewShape
			? {}
			: {
					left: canvasData.objects[0].left,
					top: canvasData.objects[0].top,
			  }),
	});

	const internalGroup = new Group([circle, text], {
		left: isNewShape ? canvasData.objects[1].objects[0].left : canvasData.objects[1].left,
		top: isNewShape ? canvasData.objects[1].objects[0].top : canvasData.objects[1].top,
		selectable: false,
		hasControls: false,
		objectCaching: false,
		originX: 'center',
		originY: 'center',
	});

	text.set({
		left: 0,
		top: 0,
	});

	let groupLeft: number = 0;
	let groupTop: number = 0;
	if (isNewShape) {
		if (canvasData.left === canvasData.objects[0].left) {
			groupLeft = canvasData.objects[0].left - newRadius;
		} else if (canvasData.left === canvasData.objects[0].left + canvasData.objects[0].width) {
			groupLeft = canvasData.objects[0].left;
		}
		if (canvasData.top === canvasData.objects[0].top) {
			groupTop = canvasData.objects[0].top - newRadius;
		} else if (canvasData.top === canvasData.objects[0].top + canvasData.objects[0].height) {
			groupTop = canvasData.objects[0].top;
		}
	}

	const group = new Group([rect, internalGroup], {
		selectable: true,
		hasControls: true,
		objectCaching: false,
		angle: canvasData.angle,
		fill: canvasData.fill,
		cornerStyle: 'circle',
		cornerColor: '#1d7bb9',
		cornerSize: 8,
		transparentCorners: false,
		left: isNewShape ? groupLeft : canvasData.left,
		top: isNewShape ? groupTop : canvasData.top,
		scaleX: canvasData.scaleX,
		scaleY: canvasData.scaleY,
	});

	group.set({
		shapeType: SubMenu.STEPS_CREATOR,
		id: canvasData.id,
	});

	group.on('deselected', () => handleDeselectStepsCreator(group, canvas));
	group.on('mousedblclick', (e) => handleDoubleClickStepsCreator(e, canvas));
	(_.get(group, ['_objects', '1', '_objects', '1']) as IText).on('changed', () =>
		handleTextChangedStepsCreator(group, canvas),
	);

	group.setCoords();
	canvas.current.add(group);

	if (isNewShape) {
		canvas.current.setActiveObject(group);
		canvas.current.discardActiveObject();
		canvas.current.setActiveObject(group);
	} else {
		canvas.current.discardActiveObject();
		canvas.current.setActiveObject(group);
		canvas.current.discardActiveObject();
	}
	canvas.current.renderAll();
};

const addCommentBox = ({
	canvas,
	isNewShape,
	canvasData,
}: {
	canvas: React.MutableRefObject<Canvas>;
	isNewShape: boolean;
	canvasData: any;
}): void => {
	const bottomArrowPoints = [
		{ x: 0, y: 0 },
		{ x: 100, y: 0 },
		{ x: 100, y: 50 },
		{ x: 50, y: 50 },
		{ x: 60, y: 70 },
		{ x: 70, y: 50 },
		{ x: 0, y: 50 },
	];
	const points = {
		points: bottomArrowPoints,
		pointIndex: 4,
		widthPointer: { x1: 0, x2: 1 },
		heightPointer: { y1: 1, y2: 2 },
		type: 'bottom',
	};
	const defaultPoints = {
		points: bottomArrowPoints,
		pointIndex: 4,
		widthPointer: { x1: 0, x2: 1 },
		heightPointer: { y1: 1, y2: 2 },
		type: 'bottom',
	};
	if (points.points.length === 0) {
		return;
	}
	const clonedPoints = _.cloneDeep(points);
	const clonedDefaultPoints = _.cloneDeep(defaultPoints);
	const polygon = new CustomFabricPolygon(
		clonedDefaultPoints.points,
		{
			id: canvasData.id,
			fill: _.get(canvasData, 'fill'),
			scaleX: canvasData.scaleX,
			scaleY: canvasData.scaleY,
			lockRotation: true,
			objectCaching: false,
			transparentCorners: false,
			hasControls: true,
			evented: true,
			stroke: _.get(canvasData, 'stroke'),
			strokeWidth: _.get(canvasData, 'strokeWidth'),
			cornerColor: '#fff',
			cornerStyle: 'circle',
			cornerSize: 12,
			fontStyle: _.get(canvasData, ['test', 'fontStyle']) || 'normal',
		},
		new Textbox(_.get(canvasData, ['test', 'text']), {
			id: canvasData.id + '-text',
			fill: _.get(canvasData, ['test', 'fill']),
			fontSize: _.get(canvasData, ['test', 'fontSize']),
			fontFamily: 'Inter Roboto',
			fontWeight: _.get(canvasData, ['test', 'fontWeight']),
			textAlign: _.get(canvasData, ['test', 'textAlign']),
			objectCaching: false,
			hasBorders: false,
			hasControls: true,
			evented: true,
			excludeFromExport: true,
			fontStyle: _.get(canvasData, ['test', 'fontStyle']) || 'normal',
			shapeType: SubMenu.COMMENT_BOX_TEXTBOX,
		}),
		canvas.current,
		clonedDefaultPoints.pointIndex,
		clonedDefaultPoints.widthPointer,
		clonedDefaultPoints.heightPointer,
		clonedDefaultPoints.type,
		'bottom',
	);
	polygon.set({
		left: canvasData.left,
		top: canvasData.top,
	});
	canvas.current.add(polygon);
	polygon.set({
		points: _.get(canvasData, 'points') ?? _.cloneDeep(clonedPoints.points),
		pointIndex: clonedPoints.pointIndex,
		widthPointer: clonedPoints.widthPointer,
		heightPointer: clonedPoints.heightPointer,
		type: clonedPoints.type,
		dirty: true,
		hasControls: true,
		evented: true,
		shapeType: SubMenu.COMMENT_BOX,
	});

	if (isNewShape) {
		canvas.current.setActiveObject(polygon);
	}
	canvas.current.requestRenderAll();
};

const drawLCorner = (ctx: any, left: number, top: number, position: string) => {
	ctx.save();
	ctx.strokeStyle = '#1677FF';
	ctx.lineWidth = 3;

	ctx.beginPath();

	switch (position) {
		case 'tl':
			ctx.moveTo(left, top + 15);
			ctx.lineTo(left, top);
			ctx.lineTo(left + 15, top);
			break;

		case 'tr':
			ctx.moveTo(left - 15, top);
			ctx.lineTo(left, top);
			ctx.lineTo(left, top + 15);
			break;

		case 'bl':
			ctx.moveTo(left, top - 15);
			ctx.lineTo(left, top);
			ctx.lineTo(left + 15, top);
			break;

		case 'br':
			ctx.moveTo(left - 15, top);
			ctx.lineTo(left, top);
			ctx.lineTo(left, top - 15);
			break;

		case 'mt':
		case 'mb':
			ctx.moveTo(left - 10, top);
			ctx.lineTo(left + 10, top);
			break;

		case 'ml':
		case 'mr':
			ctx.moveTo(left, top - 10);
			ctx.lineTo(left, top + 10);
			break;
	}

	ctx.stroke();
	ctx.restore();
};

const lCornerControl = (x: number, y: number, cursor: string, position: string) => {
	return new Control({
		x,
		y,
		render: (ctx, left, top) => drawLCorner(ctx, left, top, position),
		actionHandler:
			cursor === 'ns-resize'
				? controlsUtils.scalingY
				: cursor === 'ew-resize'
				? controlsUtils.scalingX
				: controlsUtils.scalingEqually,
		cursorStyle: cursor,
		sizeX: 20,
		sizeY: 20,
	});
};

const addCropRectangle = ({
	canvas,
	isNewShape,
	canvasData,
}: {
	canvas: React.MutableRefObject<Canvas>;
	isNewShape: boolean;
	canvasData?: any;
}) => {
	const canvasWidth = canvas.current.getWidth();
	const canvasHeight = canvas.current.getHeight();

	const cropRect = new Rect({
		left: canvasData.left,
		top: canvasData.top,
		width: canvasData.width,
		height: canvasData.height,
		fill: 'transparent',
		stroke: '#fff',
		strokeWidth: 1,
		strokeDashArray: [5, 5],
		selectable: true,
		strokeUniform: true,
		lockRotation: true,
		cornerSize: 8,
		transparentCorners: false,
		excludeFromExport: true,
	});
	cropRect.set({
		id: canvasData.id,
		shapeType: SubMenu.CROP_RECTANGLE,
	});

	cropRect.controls = {
		tl: lCornerControl(-0.5, -0.5, 'nwse-resize', 'tl'),
		tr: lCornerControl(0.5, -0.5, 'nesw-resize', 'tr'),
		bl: lCornerControl(-0.5, 0.5, 'nesw-resize', 'bl'),
		br: lCornerControl(0.5, 0.5, 'nwse-resize', 'br'),
		mt: lCornerControl(0, -0.5, 'ns-resize', 'mt'),
		mb: lCornerControl(0, 0.5, 'ns-resize', 'mb'),
		ml: lCornerControl(-0.5, 0, 'ew-resize', 'ml'),
		mr: lCornerControl(0.5, 0, 'ew-resize', 'mr'),
	};

	const overlayTop = new Rect({
		left: 0,
		top: 0,
		width: canvasWidth,
		height: cropRect.top,
		fill: 'rgba(0,0,0,0.5)',
		selectable: false,
		evented: false,
		hoverCursor: 'default',
		excludeFromExport: true,
	});
	overlayTop.set({ shapeType: SubMenu.CROP_GREYED_TOP });

	const overlayLeft = new Rect({
		left: 0,
		top: cropRect.top,
		width: cropRect.left,
		height: cropRect.getScaledHeight(),
		fill: 'rgba(0,0,0,0.5)',
		selectable: false,
		evented: false,
		hoverCursor: 'default',
		excludeFromExport: true,
	});
	overlayLeft.set({ shapeType: SubMenu.CROP_GREYED_LEFT });

	const overlayRight = new Rect({
		left: cropRect.left + cropRect.getScaledWidth(),
		top: cropRect.top,
		width: canvasWidth - (cropRect.left + cropRect.getScaledWidth()),
		height: cropRect.getScaledHeight(),
		fill: 'rgba(0,0,0,0.5)',
		selectable: false,
		evented: false,
		hoverCursor: 'default',
		excludeFromExport: true,
	});
	overlayRight.set({ shapeType: SubMenu.CROP_GREYED_RIGHT });

	const overlayBottom = new Rect({
		left: 0,
		top: cropRect.top + cropRect.getScaledHeight(),
		width: canvasWidth,
		height: canvasHeight - (cropRect.top + cropRect.getScaledHeight()),
		fill: 'rgba(0,0,0,0.5)',
		selectable: false,
		evented: false,
		hoverCursor: 'default',
		excludeFromExport: true,
	});
	overlayBottom.set({ shapeType: SubMenu.CROP_GREYED_BOTTOM });

	canvas.current.add(overlayTop, overlayLeft, overlayRight, overlayBottom);
	canvas.current.add(cropRect);

	if (!isNewShape) {
		canvas.current.setActiveObject(cropRect);
	}

	const updateOverlays = () => {
		const newLeft = cropRect.left;
		const newTop = cropRect.top;
		const newWidth = cropRect.getScaledWidth();
		const newHeight = cropRect.getScaledHeight();
		overlayTop.set({
			top: 0,
			left: 0,
			width: canvasWidth,
			height: newTop,
		});
		overlayLeft.set({
			left: 0,
			top: newTop,
			width: newLeft,
			height: newHeight,
		});
		overlayRight.set({
			left: newLeft + newWidth,
			top: newTop,
			width: canvasWidth - (newLeft + newWidth),
			height: newHeight,
		});
		overlayBottom.set({
			left: 0,
			top: newTop + newHeight,
			width: canvasWidth,
			height: canvasHeight - (newTop + newHeight),
		});
		[overlayTop, overlayLeft, overlayRight, overlayBottom].forEach((overlay) => overlay.setCoords());
		canvas.current.requestRenderAll();
	};

	if (!isNewShape) {
		canvas.current.on(
			'after:render',
			_.once(() => {
				updateOverlays();
			}),
		);
	}

	cropRect.on('modified', updateOverlays);
	cropRect.on('moving', updateOverlays);
	cropRect.on('scaling', updateOverlays);
};

const imageEditorShapes = ({
	canvas,
	shapeType,
	isNewShape,
	canvasData,
}: {
	canvas: React.MutableRefObject<Canvas>;
	shapeType: SubMenu;
	isNewShape: boolean;
	canvasData?: any;
}): void => {
	switch (shapeType) {
		case SubMenu.BLUR:
			addBlurEffect({ canvas, isNewShape, canvasData });
			break;
		case SubMenu.ADVANCED_ARROW:
		case SubMenu.TEMP_ADVANCED_ARROW:
			addAdvancedArrow({ canvas, isNewShape, canvasData, shapeType });
			break;
		case SubMenu.LINE_PATH:
		case SubMenu.TEMP_LINE_PATH:
			addLinePath({ canvas, isNewShape, canvasData, shapeType });
			break;
		case SubMenu.DRAW:
			addPencil({ canvas, isNewShape, canvasData });
			break;
		case SubMenu.TEXT:
			addText({ canvas, canvasData });
			break;
		case SubMenu.EMOJI:
			addEmoji({ canvas, canvasData });
			break;
		case SubMenu.RECTANGLE:
			addRectangle({ canvas, canvasData });
			break;
		case SubMenu.CIRCLE:
			addCircle({ canvas, canvasData });
			break;
		case SubMenu.STAR:
			addStar({ canvas, canvasData });
			break;
		case SubMenu.ARROW:
			addArrow({ canvas, canvasData });
			break;
		case SubMenu.CUSTOM_SHAPE:
			addCustomShape({ canvas, canvasData }).catch((err) => loglevel.error(err));
			break;
		case SubMenu.STEPS_CREATOR:
			addStepsCreator({ canvas, isNewShape, canvasData });
			break;
		case SubMenu.COMMENT_BOX:
			addCommentBox({ canvas, isNewShape, canvasData });
			break;
		case SubMenu.CROP_RECTANGLE:
			addCropRectangle({ canvas, isNewShape, canvasData });
			break;
		default:
			break;
	}
};

export default imageEditorShapes;
