/**
 * @author Vikhyat Singh
 * Image crop for menu
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Canvas, Rect } from 'fabric';

import imageEditorShapes from '../../utils/imageEditorShapes';
import { overlaysConstants, SubMenu } from '../../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
}

const ImageCrop: React.FC<IProps> = (props) => {
	const { canvas, activeAnnotation, setActiveAnnotation } = props;

	const cropRect = useRef<Rect | null>(null);
	const isDrawing = useRef<boolean>(false);
	const startPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

	const applyCropMask = () => {
		const cropRectangle = canvas.current
			.getObjects()
			.find((obj: any) => obj?.shapeType === SubMenu.CROP_RECTANGLE) as Rect;
		if (!canvas.current.backgroundImage || !cropRectangle) {
			return;
		}

		const clipPath = new Rect({
			left: cropRectangle.left,
			top: cropRectangle.top,
			width: cropRectangle.width * cropRectangle.scaleX,
			height: cropRectangle.height * cropRectangle.scaleY,
			absolutePositioned: true,
			id: crypto.randomUUID(),
		});

		canvas.current.clipPath = clipPath;
		canvas.current.remove(cropRectangle);
		canvas.current.renderAll();
	};

	const updateOverlays = () => {
		const newLeft = cropRect.current.left;
		const newTop = cropRect.current.top;
		const newWidth = cropRect.current.getScaledWidth();
		const newHeight = cropRect.current.getScaledHeight();
		const canvasWidth = canvas.current.getWidth();
		const canvasHeight = canvas.current.getHeight();
		const overlayObjects = canvas.current.getObjects();

		let overlayTop: Rect | null = null;
		let overlayLeft: Rect | null = null;
		let overlayRight: Rect | null = null;
		let overlayBottom: Rect | null = null;
		overlayObjects.forEach((obj: any) => {
			if (obj?.shapeType === SubMenu.CROP_GREYED_TOP) {
				overlayTop = obj as Rect;
			}
			if (obj?.shapeType === SubMenu.CROP_GREYED_LEFT) {
				overlayLeft = obj as Rect;
			}
			if (obj?.shapeType === SubMenu.CROP_GREYED_RIGHT) {
				overlayRight = obj as Rect;
			}
			if (obj?.shapeType === SubMenu.CROP_GREYED_BOTTOM) {
				overlayBottom = obj as Rect;
			}
		});

		overlayTop?.set({
			top: 0,
			left: 0,
			width: canvasWidth,
			height: newTop,
		});
		overlayLeft?.set({
			left: 0,
			top: newTop,
			width: newLeft,
			height: newHeight,
		});
		overlayRight?.set({
			left: newLeft + newWidth,
			top: newTop,
			width: canvasWidth - (newLeft + newWidth),
			height: newHeight,
		});
		overlayBottom?.set({
			left: 0,
			top: newTop + newHeight,
			width: canvasWidth,
			height: canvasHeight - (newTop + newHeight),
		});

		[overlayTop, overlayLeft, overlayRight, overlayBottom].forEach((overlay) => overlay?.setCoords());
		canvas.current.requestRenderAll();
	};

	const handleMouseDown = useCallback((event: any) => {
		if (cropRect.current) {
			return;
		}

		const pointer = canvas.current.getViewportPoint(event.e);
		const target = canvas.current.findTarget(event.e);

		if (target) {
			return;
		}

		const overlayObjects = canvas.current?.getObjects();
		if (overlayObjects) {
			overlayObjects.forEach((object: any) => {
				if (overlaysConstants.includes(object?.shapeType) || object?.shapeType === SubMenu.CROP_RECTANGLE) {
					canvas.current?.remove(object);
				}
			});
		}
		canvas.current.requestRenderAll();

		const { x, y } = pointer;
		startPointer.current = { x, y };

		const id = crypto.randomUUID();
		imageEditorShapes({
			canvas,
			shapeType: SubMenu.CROP_RECTANGLE,
			isNewShape: true,
			canvasData: {
				id,
				left: x,
				top: y,
				width: 0,
				height: 0,
			},
		});

		const rect = canvas.current.getObjects().find((obj: any) => obj?.id === id);
		if (rect) {
			cropRect.current = rect as Rect;
		}
		isDrawing.current = true;
	}, []);

	const handleMouseMove = useCallback((event: any) => {
		if (!isDrawing.current || !cropRect.current) {
			return;
		}

		const pointer = canvas.current.getViewportPoint(event.e);
		const rect = cropRect.current;

		rect.set({
			left: Math.min(startPointer.current?.x, pointer.x),
			top: Math.min(startPointer.current?.y, pointer.y),
			width: Math.abs(pointer.x - startPointer.current?.x),
			height: Math.abs(pointer.y - startPointer.current?.y),
		});

		canvas.current.renderAll();
	}, []);

	const handleMouseUp = useCallback((event: any) => {
		if (isDrawing.current && cropRect.current) {
			if (cropRect.current.width === 0 || cropRect.current.height === 0) {
				canvas.current.remove(cropRect.current);
				canvas.current.requestRenderAll();
			} else {
				const target = canvas.current.findTarget(event.e) as any;
				if (target) {
					const size = (target?._objects ?? []).length;
					if (size > 0) {
						canvas.current.setActiveObject((target?._objects ?? [])[size - 1]);
						canvas.current.requestRenderAll();
					}
				}
			}

			updateOverlays();
			canvas.current.setActiveObject(cropRect.current);
			isDrawing.current = false;
			cropRect.current = null;
		}
	}, []);

	useEffect(() => {
		if (!canvas.current?.clipPath) {
			const cropRectangle = canvas.current
				.getObjects()
				.find((obj: any) => obj?.shapeType === SubMenu.CROP_RECTANGLE) as Rect;
			if (activeAnnotation === SubMenu.FREE_HAND_ENABLED) {
				canvas.current.selection = true;
				canvas.current.off('mouse:down', handleMouseDown);
				canvas.current.off('mouse:move', handleMouseMove);
				canvas.current.off('mouse:up', handleMouseUp);
			} else if (
				(activeAnnotation === SubMenu.CROP_RECTANGLE ||
					activeAnnotation === SubMenu.FREE_HAND_DISABLED ||
					activeAnnotation === SubMenu.CROP_CLIP_PATH_DELETED) &&
				!cropRectangle
			) {
				cropRect.current = null;
				canvas.current.defaultCursor = 'crosshair';
				canvas.current.off('mouse:down', handleMouseDown);
				canvas.current.off('mouse:move', handleMouseMove);
				canvas.current.off('mouse:up', handleMouseUp);

				canvas.current.selection = false;
				canvas.current.on('mouse:down', handleMouseDown);
				canvas.current.on('mouse:move', handleMouseMove);
				canvas.current.on('mouse:up', handleMouseUp);
			}
			if (cropRect.current) {
				canvas.current.setActiveObject(cropRect.current);
			}
		} else {
			const id = crypto.randomUUID();
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.CROP_RECTANGLE,
				isNewShape: true,
				canvasData: {
					id,
					left: canvas.current.clipPath.left,
					top: canvas.current.clipPath.top,
					width: canvas.current.clipPath.width * canvas.current.clipPath.scaleX,
					height: canvas.current.clipPath.height * canvas.current.clipPath.scaleY,
				},
			});

			cropRect.current = canvas.current
				.getObjects()
				.find((obj: any) => obj?.shapeType === SubMenu.CROP_RECTANGLE) as Rect;
			canvas.current.clipPath = undefined;
		}
	}, [activeAnnotation]);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const canvasOverlay = canvas.current;

		setActiveAnnotation(SubMenu.CROP_RECTANGLE);

		return () => {
			const overlayObjects = canvasOverlay.getObjects();
			overlayObjects.forEach((obj: any) => {
				if (overlaysConstants.includes(obj?.shapeType)) {
					canvasOverlay.remove(obj);
				}
			});
			applyCropMask();
			canvasOverlay.defaultCursor = 'default';
			canvasOverlay.selection = true;
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
			canvasOverlay.off('mouse:up', handleMouseUp);
		};
	}, []);

	return null;
};

export default ImageCrop;
