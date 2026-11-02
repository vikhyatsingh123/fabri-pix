/**
 * @author Vikhyat Singh
 * @description Canvas helpers shared across the image editor
 */

import { ActiveSelection, Canvas, FabricObject, Rect, TMat2D } from 'fabric';

import { overlaysConstants, SubMenu, transientShapeTypes } from './utils';

// browsers refuse to create canvases above ~16.7M pixels (Safari), keep exports below that
const MAX_EXPORT_PIXELS = 16_000_000;

// helper objects which only exist together with their parent annotation
const isRelatedObject = (parent: any, obj: any): boolean => {
	switch (parent.shapeType) {
		case SubMenu.BLUR:
			return obj.shapeType === SubMenu.BLUR_INNER_PART && obj.id === `${parent.id}-blur`;
		case SubMenu.ADVANCED_ARROW:
			return obj.id === `${parent.id}-arrowhead`;
		case SubMenu.COMMENT_BOX:
			return obj.id === `${parent.id}-text`;
		case SubMenu.CROP_RECTANGLE:
			return overlaysConstants.includes(obj.shapeType);
		default:
			return false;
	}
};

// removes an annotation together with its helper objects (blur image, arrow head, callout text, crop overlays)
export const removeCanvasObject = (canvas: Canvas, object: FabricObject) => {
	if (!canvas || !object) {
		return;
	}

	const related = canvas.getObjects().filter((obj) => obj !== object && isRelatedObject(object, obj));
	canvas.remove(...related, object);
	canvas.requestRenderAll();
};

// removes the current selection (single object or multi selection), returns the removed objects
export const removeActiveObjects = (canvas: Canvas): FabricObject[] => {
	const activeObject = canvas?.getActiveObject();
	if (!activeObject) {
		return [];
	}

	const targets = activeObject instanceof ActiveSelection ? activeObject.getObjects() : [activeObject];
	canvas.discardActiveObject();
	targets.forEach((obj) => removeCanvasObject(canvas, obj));
	return targets;
};

// property changes done through the context menus don't fire any fabric event, fire one so history records it
export const commitActiveObjectChange = (canvas: Canvas) => {
	const target = canvas?.getActiveObject();
	if (target) {
		canvas.fire('object:modified', { target });
	}
};

// converts the crop rectangle into the canvas clip path
export const applyCropMask = (canvas: Canvas): boolean => {
	const cropRectangle = canvas
		.getObjects()
		.find((obj: any) => obj?.shapeType === SubMenu.CROP_RECTANGLE) as Rect;
	if (!canvas.backgroundImage || !cropRectangle) {
		return false;
	}

	// no random id here, re-applying the same crop must serialize identically
	const clipPath = new Rect({
		left: cropRectangle.left,
		top: cropRectangle.top,
		width: cropRectangle.width * cropRectangle.scaleX,
		height: cropRectangle.height * cropRectangle.scaleY,
		absolutePositioned: true,
	});

	const overlays = canvas.getObjects().filter((obj: any) => overlaysConstants.includes(obj?.shapeType));
	canvas.clipPath = clipPath;
	canvas.remove(...overlays, cropRectangle);
	canvas.requestRenderAll();
	return true;
};

// exports the edited image at the original image resolution, independent of the current zoom / pan
export const exportCanvasToBlob = (canvas: Canvas): Promise<Blob | null> => {
	const clipPath = canvas.clipPath;
	const area = clipPath
		? {
				left: clipPath.left,
				top: clipPath.top,
				width: clipPath.width * clipPath.scaleX,
				height: clipPath.height * clipPath.scaleY,
			}
		: { left: 0, top: 0, width: canvas.getWidth(), height: canvas.getHeight() };

	const backgroundScale = canvas.backgroundImage?.scaleX;
	let multiplier = backgroundScale ? 1 / backgroundScale : Math.max(1, window.devicePixelRatio || 1);
	const exportPixels = area.width * area.height * multiplier * multiplier;
	if (exportPixels > MAX_EXPORT_PIXELS) {
		multiplier *= Math.sqrt(MAX_EXPORT_PIXELS / exportPixels);
	}

	const viewportTransform = [...canvas.viewportTransform] as TMat2D;
	canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
	try {
		// toBlob paints synchronously, only the encoding is async, so the viewport can be restored right away
		return canvas.toBlob({
			format: 'png',
			quality: 1,
			multiplier,
			...area,
			filter: (obj: any) => !transientShapeTypes.includes(obj.shapeType),
		});
	} finally {
		canvas.setViewportTransform(viewportTransform);
	}
};

export const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	// revoking synchronously can cancel the download in some browsers
	setTimeout(() => URL.revokeObjectURL(url), 1000);
};
