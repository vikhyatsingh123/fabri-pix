/**
 * @author Vikhyat Singh
 * Advanced Arrow Tool for image editor
 */

import { Canvas, Polygon, Triangle } from 'fabric';
import React, { useCallback, useEffect, useRef } from 'react';

import { multiSelectAnnotation, SubMenu } from '../../utils/utils';
import imageEditorShapes from '../../utils/imageEditorShapes';
import ArrowRightUpIcon from '../../icons/ArrowRightUpIcon';

interface IProps {
	canvas: React.RefObject<Canvas>;
	handleTrackChange: (e?: any) => void;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
	advancedArrowRef: React.RefObject<{ stroke: string; width: number }>;
}

const AdvancedArrowTool: React.FC<IProps> = (props) => {
	const { canvas, handleTrackChange, activeAnnotation, setActiveAnnotation, advancedArrowRef } = props;

	const isDrawing = useRef<boolean>(false);
	const currentPolyline = useRef<Polygon | null>(null);
	const polylinePoints = useRef<{ x: number; y: number }[]>([]);
	const arrowHead = useRef<Triangle | null>(null);

	const handleMouseDown = useCallback((e: any) => {
		const target = canvas.current.findTarget(e.e);
		if (target) {
			return;
		}

		const activeObj = canvas.current.getActiveObject();
		if (activeObj) {
			return;
		}
		const pointer = canvas.current.getPointer(e.e);

		if (!isDrawing.current) {
			isDrawing.current = true;

			const id = crypto.randomUUID();
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.TEMP_ADVANCED_ARROW,
				isNewShape: true,
				canvasData: {
					stroke: advancedArrowRef.current.stroke,
					strokeWidth: advancedArrowRef.current.width,
					cornerColor: 'blue',
					points: [
						{ x: pointer.x, y: pointer.y },
						{ x: pointer.x, y: pointer.y },
					],
					id,
				},
			});

			polylinePoints.current = [{ x: pointer.x, y: pointer.y }];

			currentPolyline.current = canvas.current.getObjects().find((obj: any) => obj.id === id) as Polygon;
			arrowHead.current = canvas.current
				.getObjects()
				.find((obj: any) => obj.id === `${id}-arrowhead`) as Triangle;

			canvas.current.selection = false;
		}
	}, []);

	const handleMouseMove = useCallback((e: any) => {
		canvas.current.defaultCursor = 'crosshair';

		if (!isDrawing.current || !currentPolyline.current || !arrowHead.current) {
			return;
		}

		const pointer = canvas.current.getPointer(e.e);
		const points = currentPolyline.current?.points;
		points[1] = { x: pointer.x, y: pointer.y };
		currentPolyline.current?.set({ points });
		currentPolyline.current.dirty = true;
		const dx = pointer.x - points[0].x;
		const dy = pointer.y - points[0].y;
		const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

		arrowHead.current?.set({
			left: pointer.x,
			top: pointer.y,
			angle: angle + 90,
		});
		canvas.current.renderAll();
	}, []);

	const handleMouseUp = useCallback((event: any) => {
		if (isDrawing.current) {
			isDrawing.current = false;

			if (
				currentPolyline.current?.points[0].x === currentPolyline.current?.points[1].x &&
				currentPolyline.current?.points[0].y === currentPolyline.current?.points[1].y
			) {
				canvas.current.remove(currentPolyline.current);
				canvas.current.remove(arrowHead.current);
			} else {
				const target = canvas.current.findTarget(event.e) as any;
				const pointer = canvas.current.getPointer(event.e);

				if (target) {
					const size = target._objects ? target._objects.length : 0;
					if (size > 0) {
						canvas.current.setActiveObject(target._objects ? target._objects[size - 1] : null);
					}
				}

				canvas.current.remove(currentPolyline.current);
				canvas.current.remove(arrowHead.current);
				canvas.current.requestRenderAll();
				polylinePoints.current.push({ x: pointer.x, y: pointer.y });

				imageEditorShapes({
					canvas,
					shapeType: SubMenu.ADVANCED_ARROW,
					isNewShape: true,
					canvasData: {
						stroke: advancedArrowRef.current.stroke,
						strokeWidth: advancedArrowRef.current.width,
						cornerColor: 'blue',
						points: polylinePoints.current,
						id: crypto.randomUUID(),
					},
				});

				polylinePoints.current = [];
				handleTrackChange();
			}

			canvas.current.selection = true;
			canvas.current.requestRenderAll();
		}
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotation !== SubMenu.ADVANCED_ARROW) {
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.off('mouse:up', handleMouseUp);
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
			canvasOverlay.defaultCursor = 'default';
			canvasOverlay.selection = true;
			canvasOverlay.defaultCursor = 'default';
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
			canvasOverlay.off('mouse:up', handleMouseUp);
		};
	}, []);

	const handleArrowTool = () => {
		if (activeAnnotation === SubMenu.ADVANCED_ARROW) {
			canvas.current.selection = true;
			canvas.current.defaultCursor = 'default';
			setActiveAnnotation('');

			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.off('mouse:up', handleMouseUp);
			return;
		}

		setActiveAnnotation(SubMenu.ADVANCED_ARROW);
		canvas.current.selection = false;
		canvas.current.defaultCursor = 'crosshair';
		canvas.current.discardActiveObject();
		canvas.current.requestRenderAll();

		canvas.current.on('mouse:down', handleMouseDown);
		canvas.current.on('mouse:move', handleMouseMove);
		canvas.current.on('mouse:up', handleMouseUp);
	};

	return (
		<button
			className={`custom-button ${activeAnnotation === SubMenu.ADVANCED_ARROW ? 'active' : ''}`}
			onClick={handleArrowTool}
		>
			<ArrowRightUpIcon />
			Arrow Tool
		</button>
	);
};

export default AdvancedArrowTool;
