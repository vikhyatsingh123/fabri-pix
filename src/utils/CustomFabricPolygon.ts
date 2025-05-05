/**
 * @author Vikhyat Singh
 * @description Custom polygon to achieve callout shapes
 */

import {
	Canvas,
	classRegistry,
	Control,
	Point,
	Polygon,
	Textbox,
	TMat2D,
	Transform,
	TransformActionHandler,
	util,
} from 'fabric';

export default class CustomFabricPolygon extends Polygon {
	static type = 'CustomFabricPolygon';
	test: Textbox;
	text: any = null;
	textOffsetLeft = 0;
	textOffsetTop = 0;
	_prevObjectStacking = true;
	_prevAngle = 0;
	canvas = new Canvas('c');
	selected = false;
	pointIndex = 0;
	widthPointer = { x1: 0, x2: 1 };
	heightPointer = { y1: 1, y2: 2 };
	arrowType = 'bottom';
	contextMenuPosition = 'bottom';

	constructor(...args: any) {
		super(...args);
		this.test = args[2];
		this.canvas = args[3];
		this.pointIndex = args[4];
		this.widthPointer = args[5];
		this.heightPointer = args[6];
		this.arrowType = args[7];
		this.contextMenuPosition = args[8];
		this.cornerColor = 'white';
		this.cornerStrokeColor = 'black';
		this.cornerSize = 8;
		this.hasBorders = false;
		this.strokeUniform = true;
		this.controls = this.createPathControls();
		this.test.hasBorders = false;
		this.test.evented = false;
		this.test.hasControls = false;

		this.on('added', () => {
			this.canvas?.add(this.test);
		});

		this.on('removed', () => {
			if (this.canvas) {
				this.canvas.remove(this.test);
			}
		});

		this.on('mousedown:before', () => {
			if (!this.canvas) {
				return;
			}
			this._prevObjectStacking = this.canvas.preserveObjectStacking;
			this.canvas.preserveObjectStacking = true;
		});

		this.on('mousedblclick', () => {
			this.canvas?.setActiveObject(this.test);
			this.test.enterEditing();
		});

		// Resize Textbox when Polygon is scaled
		this.on('scaling', () => {
			this.updateTextboxDimensions();
		});
	}

	createPathControls(): any {
		const controls = { ...this.controls };
		controls['p0'] = new Control({
			x: 0.5,
			y: 0.2,
			offsetX: 0,
			offsetY: 0,
			actionHandler: this.modifyPolygon.bind(this) as unknown as TransformActionHandler,
			actionName: 'modifyPolygon',
			positionHandler: this.polygonPositionHandler.bind(this, 4),
			render: (ctx: CanvasRenderingContext2D, left: number, top: number) => {
				ctx.save();
				const size = 8;
				const stroke = 'orange';
				const fill = 'orange';
				ctx.fillStyle = fill;
				ctx.strokeStyle = stroke;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(left, top, size / 2, 0, 2 * Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.restore();
			},
		});
		return controls;
	}

	polygonPositionHandler(_: number, __: Point, ___: TMat2D, fabricObject: any): Point {
		const point = new Point(
			fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
			fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y,
		);
		const transformMatrix = util.multiplyTransformMatrices(
			fabricObject.canvas.viewportTransform,
			fabricObject.calcTransformMatrix(),
		);
		return point.transform(transformMatrix);
	}

	modifyPolygon(__: MouseEvent, transform: Transform, x: number, y: number): boolean {
		const polygon = transform.target as Polygon;
		const point = polygon.points[this.pointIndex];

		// Get the scaling factors
		const scaleX = polygon.scaleX || 1;
		const scaleY = polygon.scaleY || 1;

		// Calculate the adjusted coordinates
		const offsetX = (x - polygon.left) / scaleX;
		const offsetY = (y - polygon.top) / scaleY;

		// Update the point coordinates
		point.x = offsetX;
		point.y = offsetY;
		this.updateTextboxDimensions();
		return true;
	}

	updateTextboxDimensions(): void {
		const polygonWidth = (this.points[this.widthPointer.x2].x - this.points[this.widthPointer.x1].x) * this.scaleX;
		const polygonHeight =
			(this.points[this.heightPointer.y2].y - this.points[this.heightPointer.y1].y) * this.scaleY;
		this.test.set({
			width: polygonWidth - 10,
			height: polygonHeight - 10,
		});

		this.adjustPolygonToText();
	}

	adjustPolygonToText(): void {
		const minWidth = 50;
		const minHeight = 50;
		const padding = 10;

		const textWidth = this.test.width + padding;
		const textHeight = this.test.height + padding;

		const newWidth = Math.max(minWidth, textWidth);
		const newHeight = Math.max(minHeight, textHeight);

		const scaleX = newWidth / (this.points[this.widthPointer.x2].x - this.points[this.widthPointer.x1].x || 1);
		const scaleY = newHeight / (this.points[this.heightPointer.y2].y - this.points[this.heightPointer.y1].y || 1);

		if (textWidth > (this.points[this.widthPointer.x2].x - this.points[this.widthPointer.x1].x) * this.scaleX) {
			this.set({
				scaleX,
			});
		}

		if (textHeight > (this.points[this.heightPointer.y2].y - this.points[this.heightPointer.y1].y) * this.scaleY) {
			this.set({
				scaleY,
			});
		}

		this.updateTextboxPosition();
	}

	updateTextboxPosition(): void {
		const extraTop = this.arrowType === 'top' ? this.points[this.pointIndex].y : 0;
		const extraLeft = this.arrowType === 'left' ? this.points[this.pointIndex].x : 0;
		this.test.set({
			left:
				this.left +
				((this.points[this.widthPointer.x2].x - this.points[this.widthPointer.x1].x) * this.scaleX) / 2 -
				extraLeft * this.scaleX,
			top:
				this.top +
				((this.points[this.heightPointer.y2].y - this.points[this.heightPointer.y1].y) * this.scaleY) / 2 -
				extraTop * this.scaleY,
		});
	}

	render(ctx: CanvasRenderingContext2D): void {
		super.render(ctx);
		this.test.set({
			originX: 'center',
			originY: 'center',
		});
		this.updateTextboxDimensions();
		this.test.render(ctx);
	}
}

classRegistry.setClass(CustomFabricPolygon);
