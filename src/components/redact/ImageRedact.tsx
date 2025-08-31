/**
 * @author Vikhyat Singh
 * Image redact for menu
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { Canvas, FabricImage, Rect } from 'fabric';

import { SubMenu } from '../../utils/utils';
import imageEditorShapes from '../../utils/imageEditorShapes';

interface IProps {
	canvas: React.RefObject<Canvas>;
	handleTrackChange: (e?: any) => void;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
}
const ImageRedact: React.FC<IProps> = (props) => {
	const { canvas, handleTrackChange, activeAnnotation, setActiveAnnotation } = props;

	const blurRect = useRef<Rect | null>(null);
	const isDrawing = useRef<boolean>(false);
	const startPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

	const applyBlurEffect = (rect: any) => {
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

			const blurredImage = new FabricImage(croppedCanvas);

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

	const handleMouseDown = useCallback((event: any) => {
		if (blurRect.current) {
			return;
		}

		const pointer = canvas.current.getViewportPoint(event.e);
		const target = canvas.current.findTarget(event.e);

		if (target) {
			return;
		}

		const { x, y } = pointer;
		startPointer.current = { x, y };

		const id = crypto.randomUUID();
		imageEditorShapes({
			canvas,
			shapeType: SubMenu.BLUR,
			isNewShape: true,
			canvasData: {
				left: x,
				top: y,
				id,
				width: 0,
				height: 0,
			},
		});

		const rect = canvas.current.getObjects().find((obj: any) => obj.id === id);
		if (rect) {
			blurRect.current = rect as Rect;
		}
		isDrawing.current = true;
	}, []);

	const handleMouseMove = useCallback((event: any) => {
		if (!isDrawing.current || !blurRect.current) {
			return;
		}

		const pointer = canvas.current.getViewportPoint(event.e);
		const rect = blurRect.current;

		rect.set({
			left: Math.min(startPointer.current?.x, pointer.x),
			top: Math.min(startPointer.current?.y, pointer.y),
			width: Math.abs(pointer.x - startPointer.current?.x),
			height: Math.abs(pointer.y - startPointer.current?.y),
		});

		canvas.current.renderAll();
	}, []);

	const handleMouseUp = useCallback((event: any) => {
		if (isDrawing.current && blurRect.current) {
			if (blurRect.current.width === 0 || blurRect.current.height === 0) {
				canvas.current.remove(blurRect.current);
				canvas.current.requestRenderAll();
			} else {
				const target = canvas.current.findTarget(event.e);
				if (target) {
					const size = (target as any)?._objects?.length;
					if (size > 0) {
						canvas.current.setActiveObject((target as any)._objects[size - 1]);
						canvas.current.requestRenderAll();
					}
				}
				applyBlurEffect(blurRect.current);
				handleTrackChange();
			}
			isDrawing.current = false;
			blurRect.current = null;
		}
	}, []);

	useEffect(() => {
		if (activeAnnotation === SubMenu.FREE_HAND_ENABLED) {
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.off('mouse:up', handleMouseUp);
		} else if (activeAnnotation === SubMenu.BLUR || activeAnnotation === SubMenu.FREE_HAND_DISABLED) {
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.off('mouse:up', handleMouseUp);

			canvas.current.defaultCursor = 'crosshair';
			isDrawing.current = false;
			blurRect.current = null;
			canvas.current.on('mouse:down', handleMouseDown);
			canvas.current.on('mouse:move', handleMouseMove);
			canvas.current.on('mouse:up', handleMouseUp);
		}
	}, [activeAnnotation]);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const canvasOverlay = canvas.current;
		canvas.current.discardActiveObject();
		canvas.current.requestRenderAll();

		setActiveAnnotation(SubMenu.BLUR);

		return () => {
			canvasOverlay.defaultCursor = 'default';
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
			canvasOverlay.off('mouse:up', handleMouseUp);
		};
	}, []);

	return null;
};

export default ImageRedact;
