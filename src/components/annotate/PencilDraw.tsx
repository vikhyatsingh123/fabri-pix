/**
 * @author Vikhyat Singh
 * Pencil draw for image editor
 */

import React, { useEffect } from 'react';
import { Canvas, PencilBrush } from 'fabric';

import WritingFluentlyIcon from '../../icons/WritingFluently';
import { SubMenu } from '../../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
	handleTrackChange: (e?: any) => void;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
	freeDrawingBrushContextMenu: { color: string; width: number };
}

const PencilSVG = `<svg width="23" height="23" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.32497 43.4996L13.81 43.4998L44.9227 12.3871L36.4374 3.90186L5.32471 35.0146L5.32497 43.4996Z" fill="none" stroke="#000000" strokeWidth="4" strokeLinejoin="bevel"/><path d="M27.9521 12.3872L36.4374 20.8725" stroke="#000000" strokeWidth="4" strokeLinecap="square" strokeLinejoin="bevel"/></svg>`;

const PencilDraw: React.FC<IProps> = (props) => {
	const { canvas, handleTrackChange, activeAnnotation, setActiveAnnotation, freeDrawingBrushContextMenu } = props;

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotation === SubMenu.DRAW) {
			canvas.current.freeDrawingBrush = new PencilBrush(canvas.current);
			canvas.current.freeDrawingBrush.color = freeDrawingBrushContextMenu.color;
			canvas.current.freeDrawingBrush.width = freeDrawingBrushContextMenu.width;
		}
	}, [freeDrawingBrushContextMenu]);

	const handlePathCreated = () => {
		handleTrackChange();
	};

	const handleBeforePathCreated = (e: any) => {
		const path = e.path;
		path.set({ shapeType: SubMenu.DRAW, perPixelTargetFind: true });
		canvas.current.requestRenderAll();
	};

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotation !== SubMenu.DRAW) {
			canvas.current.isDrawingMode = false;
			canvas.current.off('path:created', handlePathCreated);
			canvas.current.off('before:path:created', handleBeforePathCreated);
		}
	}, [activeAnnotation]);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const canvasOverlay = canvas.current;

		return () => {
			canvasOverlay.isDrawingMode = false;
			canvasOverlay.off('path:created', handlePathCreated);
			canvasOverlay.off('before:path:created', handleBeforePathCreated);
		};
	}, []);

	const updateCustomCursor = () => {
		const canvasElement = document.createElement('canvas');
		canvasElement.width = 23;
		canvasElement.height = 23;
		const ctx = canvasElement.getContext('2d');

		if (!ctx) {
			return;
		}

		const img = new Image();
		const svgBlob = new Blob([PencilSVG], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(svgBlob);

		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(url);

			const cursorUrl = canvasElement.toDataURL();
			canvas.current.freeDrawingCursor = `url(${cursorUrl}) 2 50, auto`;
			canvas.current.requestRenderAll();
		};

		img.src = url;
	};

	const handleDraw = () => {
		if (canvas.current.isDrawingMode) {
			canvas.current.isDrawingMode = false;
			setActiveAnnotation('');
			canvas.current.off('path:created', handlePathCreated);
			canvas.current.off('before:path:created', handleBeforePathCreated);
			return;
		}

		setActiveAnnotation(SubMenu.DRAW);
		canvas.current.isDrawingMode = true;
		canvas.current.freeDrawingBrush = new PencilBrush(canvas.current);
		canvas.current.freeDrawingBrush.color = freeDrawingBrushContextMenu.color;
		canvas.current.freeDrawingBrush.width = freeDrawingBrushContextMenu.width;
		canvas.current.freeDrawingBrush.limitedToCanvasSize = true;
		canvas.current.discardActiveObject();
		canvas.current.requestRenderAll();
		updateCustomCursor();

		canvas.current.on('path:created', handlePathCreated);
		canvas.current.on('before:path:created', handleBeforePathCreated);
	};

	return (
		<button className={`custom-button ${activeAnnotation === SubMenu.DRAW ? 'active' : ''}`} onClick={handleDraw}>
			<WritingFluentlyIcon />
			Draw
		</button>
	);
};

export default PencilDraw;
