/**
 * @author Vikhyat Singh
 * Line path for image editor
 */

import { Canvas, Polyline } from 'fabric';
import React, { useCallback, useEffect, useRef } from 'react';

import { multiSelectAnnotation, SubMenu } from '../../utils/utils';
import imageEditorShapes from '../../utils/imageEditorShapes';
import WholeSiteAcceleratorIcon from '../../icons/WholeSiteAcceleratorIcon';

interface IProps {
	canvas: React.RefObject<Canvas>;
	handleTrackChange: (e?: any) => void;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
	linePathRef: React.RefObject<{ stroke: string; width: number }>;
}

const LinePath: React.FC<IProps> = (props) => {
	const { canvas, handleTrackChange, activeAnnotation, setActiveAnnotation, linePathRef } = props;

	const isDrawing = useRef<boolean>(false);
	const currentPolyline = useRef<Polyline | null>(null);
	const polylinePoints = useRef<{ x: number; y: number }[]>([]);

	const handleMouseDown = useCallback((e: any) => {
		const pointer = canvas.current.getPointer(e.e);
		const target = canvas.current.findTarget(e.e);

		if (target) {
			canvas.current.discardActiveObject();
		}

		if (!isDrawing.current) {
			const id = crypto.randomUUID();
			isDrawing.current = true;

			imageEditorShapes({
				canvas,
				shapeType: SubMenu.TEMP_LINE_PATH,
				isNewShape: true,
				canvasData: {
					stroke: linePathRef.current.stroke,
					strokeWidth: linePathRef.current.width,
					points: [
						{ x: pointer.x, y: pointer.y },
						{ x: pointer.x + 1, y: pointer.y + 1 },
					],
					id,
				},
			});

			polylinePoints.current = [{ x: pointer.x, y: pointer.y }];

			currentPolyline.current = canvas.current.getObjects().find((obj: any) => obj.id === id) as Polyline;
		} else if (currentPolyline.current) {
			const points = currentPolyline.current.points || [];
			points.push({ x: pointer.x, y: pointer.y });
			polylinePoints.current.push({ x: pointer.x, y: pointer.y });

			currentPolyline.current.set({ points });
			currentPolyline.current.setCoords();
			canvas.current.requestRenderAll();
		}
	}, []);

	const handleMouseMove = useCallback((e: any) => {
		canvas.current.defaultCursor = 'crosshair';

		if (!isDrawing.current || !currentPolyline.current) {
			return;
		}

		const pointer = canvas.current.getPointer(e.e);
		const points = currentPolyline.current?.points || [];

		points[points.length - 1] = { x: pointer.x, y: pointer.y };
		currentPolyline.current?.set({ points });
		canvas.current.requestRenderAll();
	}, []);

	const handleDoubleClick = useCallback(() => {
		isDrawing.current = false;
		if (currentPolyline.current) {
			canvas.current.remove(currentPolyline.current);
			canvas.current.requestRenderAll();
			currentPolyline.current = null;
		}

		if (polylinePoints.current.length > 0) {
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.LINE_PATH,
				isNewShape: true,
				canvasData: {
					stroke: linePathRef.current.stroke,
					strokeWidth: linePathRef.current.width,
					points: polylinePoints.current,
					id: crypto.randomUUID(),
				},
			});
			polylinePoints.current = [];
			handleTrackChange();
		}
	}, []);

	const handleKeyPress = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			handleDoubleClick();
		}
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotation !== SubMenu.LINE_PATH) {
			handleDoubleClick();
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.off('mouse:dblclick', handleDoubleClick);
			window.removeEventListener('keyup', handleKeyPress);
			canvas.current.defaultCursor = 'default';
			if (!multiSelectAnnotation.includes(activeAnnotation)) {
				canvas.current.selection = true;
			}
		}
	}, [activeAnnotation]);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const canvasOverlay = canvas.current;

		return () => {
			handleDoubleClick();
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
			canvasOverlay.off('mouse:dblclick', handleDoubleClick);
			window.removeEventListener('keyup', handleKeyPress);
			canvasOverlay.selection = true;
			canvasOverlay.defaultCursor = 'default';
		};
	}, []);

	const handleLinePath = () => {
		if (activeAnnotation === SubMenu.LINE_PATH) {
			handleDoubleClick();
			setActiveAnnotation('');

			isDrawing.current = false;
			if (currentPolyline.current) {
				currentPolyline.current = null;
			}

			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.off('mouse:dblclick', handleDoubleClick);
			window.removeEventListener('keyup', handleKeyPress);
			canvas.current.selection = true;
			canvas.current.defaultCursor = 'default';
			return;
		}

		setActiveAnnotation(SubMenu.LINE_PATH);
		canvas.current.selection = false;
		canvas.current.defaultCursor = 'crosshair';
		canvas.current.discardActiveObject();
		canvas.current.requestRenderAll();

		canvas.current.on('mouse:down', handleMouseDown);
		canvas.current.on('mouse:move', handleMouseMove);
		canvas.current.on('mouse:dblclick', handleDoubleClick);
		window.addEventListener('keyup', handleKeyPress);
	};

	return (
		<button
			className={`custom-button ${activeAnnotation === SubMenu.LINE_PATH ? 'active' : ''}`}
			onClick={handleLinePath}
		>
			<WholeSiteAcceleratorIcon />
			Path
		</button>
	);
};

export default LinePath;
