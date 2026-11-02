/**
 * @author Vikhyat Singh
 * Image redact for menu
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { Canvas, Rect } from 'fabric';

import { generateId, SubMenu } from '../../utils/utils';
import imageEditorShapes, { applyBlurEffect } from '../../utils/imageEditorShapes';

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

	const handleMouseDown = useCallback((event: any) => {
		if (blurRect.current) {
			return;
		}

		const pointer = canvas.current.getScenePoint(event.e);
		const target = canvas.current.findTarget(event.e);

		if (target) {
			return;
		}

		const { x, y } = pointer;
		startPointer.current = { x, y };

		const id = generateId();
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

		const pointer = canvas.current.getScenePoint(event.e);
		const rect = blurRect.current;

		rect.set({
			left: Math.min(startPointer.current?.x, pointer.x),
			top: Math.min(startPointer.current?.y, pointer.y),
			width: Math.abs(pointer.x - startPointer.current?.x),
			height: Math.abs(pointer.y - startPointer.current?.y),
		});

		canvas.current.requestRenderAll();
	}, []);

	const handleMouseUp = useCallback(() => {
		if (isDrawing.current && blurRect.current) {
			if (blurRect.current.width === 0 || blurRect.current.height === 0) {
				canvas.current.remove(blurRect.current);
				canvas.current.requestRenderAll();
			} else {
				blurRect.current.setCoords();
				applyBlurEffect(canvas, blurRect.current);
				handleTrackChange();
			}
			isDrawing.current = false;
			blurRect.current = null;
		}
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotation === SubMenu.FREE_HAND_ENABLED) {
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.off('mouse:up', handleMouseUp);
		} else if (activeAnnotation === SubMenu.BLUR || activeAnnotation === SubMenu.FREE_HAND_DISABLED) {
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.off('mouse:up', handleMouseUp);

			canvas.current.defaultCursor = 'crosshair';
			// otherwise fabric draws its selection box on top of the blur rectangle being drawn
			canvas.current.selection = false;
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
			canvasOverlay.selection = true;
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
			canvasOverlay.off('mouse:up', handleMouseUp);
		};
	}, []);

	return null;
};

export default ImageRedact;
