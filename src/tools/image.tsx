/**
 * @author Vikhyat Singh
 * @description Crop and redact tools
 */

import React from 'react';
import { Canvas, Rect } from 'fabric';

import SubtractSelectionIcon from '../icons/SubtractSelectionIcon';
import TailoringIcon from '../icons/TailoringIcon';
import { applyBlurEffect } from '../core/shapeFactory';
import { cropOverlayShapeTypes, generateId, ShapeType } from '../core/constants';
import type { ToolDefinition } from '../core/types';

const findCropRect = (canvas: Canvas) =>
	canvas.getObjects().find((obj: any) => obj.shapeType === ShapeType.CROP_RECTANGLE) as Rect | undefined;

const findOverlays = (canvas: Canvas) =>
	canvas.getObjects().filter((obj: any) => cropOverlayShapeTypes.includes(obj.shapeType)) as Rect[];

/** converts the crop rectangle into the canvas clip path, returns false when there is nothing to apply */
export const applyCropMask = (canvas: Canvas): boolean => {
	const cropRect = findCropRect(canvas);
	if (!canvas.backgroundImage || !cropRect) {
		return false;
	}
	// no random id here, re-applying the same crop must serialize identically
	canvas.clipPath = new Rect({
		left: cropRect.left,
		top: cropRect.top,
		width: cropRect.width * cropRect.scaleX,
		height: cropRect.height * cropRect.scaleY,
		absolutePositioned: true,
	});
	canvas.remove(...findOverlays(canvas), cropRect);
	canvas.requestRenderAll();
	return true;
};

export const cropTool: ToolDefinition = {
	id: 'crop',
	label: 'Crop',
	icon: <TailoringIcon />,
	activate: (context) => {
		const { canvas, editor } = context;
		let drawing = false;
		let start = { x: 0, y: 0 };

		const scene = () => editor.getSceneSize();
		const addCropRect = (left: number, top: number, width: number, height: number) => {
			void editor.addShape(ShapeType.CROP_RECTANGLE, {
				left,
				top,
				width,
				height,
				sceneWidth: scene().width,
				sceneHeight: scene().height,
			});
		};

		const updateOverlays = (rect: Rect) => {
			const { width: sceneWidth, height: sceneHeight } = scene();
			const left = rect.left;
			const top = rect.top;
			const width = rect.getScaledWidth();
			const height = rect.getScaledHeight();
			const areas: Record<string, Partial<Rect>> = {
				[ShapeType.CROP_GREYED_TOP]: { left: 0, top: 0, width: sceneWidth, height: top },
				[ShapeType.CROP_GREYED_LEFT]: { left: 0, top, width: left, height },
				[ShapeType.CROP_GREYED_RIGHT]: { left: left + width, top, width: sceneWidth - (left + width), height },
				[ShapeType.CROP_GREYED_BOTTOM]: {
					left: 0,
					top: top + height,
					width: sceneWidth,
					height: sceneHeight - (top + height),
				},
			};
			findOverlays(canvas).forEach((overlay: any) => {
				overlay.set(areas[overlay.shapeType]);
				overlay.setCoords();
			});
			canvas.requestRenderAll();
		};

		// an applied crop becomes editable again
		if (!findCropRect(canvas) && canvas.clipPath) {
			const clipPath = canvas.clipPath;
			addCropRect(clipPath.left, clipPath.top, clipPath.width * clipPath.scaleX, clipPath.height * clipPath.scaleY);
			canvas.clipPath = undefined;
		}

		context.setSelectionEnabled(false);
		context.setCursor('crosshair');
		const existing = findCropRect(canvas);
		if (existing) {
			canvas.setActiveObject(existing);
		}
		canvas.requestRenderAll();

		context.on('mouse:down', (event: any) => {
			if (drawing || canvas.findTarget(event.e)) {
				return;
			}
			const previous = findCropRect(canvas);
			if (previous) {
				editor.deleteObject(previous);
			}
			const point = canvas.getScenePoint(event.e);
			start = { x: point.x, y: point.y };
			addCropRect(point.x, point.y, 0, 0);
			drawing = true;
		});

		context.on('mouse:move', (event: any) => {
			const rect = findCropRect(canvas);
			if (!drawing || !rect) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			rect.set({
				left: Math.min(start.x, point.x),
				top: Math.min(start.y, point.y),
				width: Math.abs(point.x - start.x),
				height: Math.abs(point.y - start.y),
			});
			rect.setCoords();
			updateOverlays(rect);
		});

		context.on('mouse:up', () => {
			const rect = findCropRect(canvas);
			if (!drawing || !rect) {
				return;
			}
			drawing = false;
			if (rect.width === 0 || rect.height === 0) {
				// a click without dragging, drop the empty crop rectangle together with its overlays
				editor.deleteObject(rect);
			} else {
				updateOverlays(rect);
				canvas.setActiveObject(rect);
			}
			canvas.requestRenderAll();
		});

		return (reason) => {
			if (reason === 'pause') {
				return;
			}
			if (reason === 'switch') {
				applyCropMask(canvas);
				// the crop rectangle itself is not tracked, record the applied (or removed) crop
				editor.commit();
				return;
			}
			const rect = findCropRect(canvas);
			canvas.remove(...findOverlays(canvas), ...(rect ? [rect] : []));
		};
	},
};

export const redactTool: ToolDefinition = {
	id: 'redact',
	label: 'Redact',
	icon: <SubtractSelectionIcon />,
	shapeTypes: [ShapeType.BLUR],
	activate: (context) => {
		const { canvas, editor } = context;
		let rect: Rect | undefined;
		let start = { x: 0, y: 0 };

		// otherwise fabric draws its selection box on top of the blur rectangle being drawn
		context.setSelectionEnabled(false);
		context.setCursor('crosshair');
		canvas.discardActiveObject();
		canvas.requestRenderAll();

		context.on('mouse:down', (event: any) => {
			if (rect || canvas.findTarget(event.e)) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			const id = generateId();
			start = { x: point.x, y: point.y };
			void editor.addShape(ShapeType.BLUR, { id, left: point.x, top: point.y, width: 0, height: 0 });
			rect = canvas.getObjects().find((obj: any) => obj.id === id) as Rect | undefined;
		});

		context.on('mouse:move', (event: any) => {
			if (!rect) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			rect.set({
				left: Math.min(start.x, point.x),
				top: Math.min(start.y, point.y),
				width: Math.abs(point.x - start.x),
				height: Math.abs(point.y - start.y),
			});
			canvas.requestRenderAll();
		});

		context.on('mouse:up', () => {
			if (!rect) {
				return;
			}
			const drawn = rect;
			rect = undefined;
			if (drawn.width === 0 || drawn.height === 0) {
				canvas.remove(drawn);
			} else {
				drawn.setCoords();
				applyBlurEffect({ current: canvas }, drawn);
				editor.commit();
			}
			canvas.requestRenderAll();
		});

		return () => {
			if (rect) {
				canvas.remove(rect);
				rect = undefined;
			}
		};
	},
};
