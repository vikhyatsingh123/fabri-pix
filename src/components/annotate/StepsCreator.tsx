/**
 * @author Vikhyat Singh
 * Steps creator for image editor
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { Canvas, Rect } from 'fabric';

import OrderedListIcon from '../../icons/OrderedListIcon';
import imageEditorShapes from '../../utils/imageEditorShapes';
import { multiSelectAnnotation, SubMenu } from '../../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
	stepCreatorRef: React.RefObject<{
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		stepNumber: number;
		strokeWidth: number;
	}>;
}
const StepsCreator: React.FC<IProps> = (props) => {
	const { canvas, activeAnnotation, setActiveAnnotation, stepCreatorRef } = props;

	const isDrawing = useRef<boolean>(false);
	const stepRectRef = useRef<Rect | null>(null);
	const startPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

	const updateCustomCursor = (nextStep: number) => {
		const canvasElement = document.createElement('canvas');
		canvasElement.width = 60;
		canvasElement.height = 60;
		const ctx = canvasElement.getContext('2d');

		if (!ctx) {
			return;
		}

		ctx.fillStyle = stepCreatorRef.current.backgroundColor;
		ctx.globalAlpha = 0.5;
		ctx.beginPath();
		ctx.arc(30, 30, 25, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = stepCreatorRef.current.fontColor;
		ctx.font = 'bold 18px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(nextStep.toString(), 30, 30);

		const cursorUrl = canvasElement.toDataURL();

		canvas.current.setCursor(`url(${cursorUrl}) 30 30, auto`);
		canvas.current.requestRenderAll();
	};

	const createStepCircle = (x: number, y: number, number: number) => {
		const id = crypto.randomUUID();
		const coordinates = stepRectRef.current?.getCoords();

		let circleLeft = 0,
			circleTop = 0;

		if (Math.abs(coordinates[0].x - x) <= 2 && Math.abs(coordinates[0].y - y) <= 2) {
			circleLeft = 0;
			circleTop = 0;
		} else if (Math.abs(coordinates[1].x - x) <= 2 && Math.abs(coordinates[1].y - y) <= 2) {
			circleLeft = stepRectRef.current.width;
			circleTop = 0;
		} else if (Math.abs(coordinates[2].x - x) <= 2 && Math.abs(coordinates[2].y - y) <= 2) {
			circleLeft = stepRectRef.current.width;
			circleTop = stepRectRef.current.height;
		} else if (Math.abs(coordinates[3].x - x) <= 2 && Math.abs(coordinates[3].y - y) <= 2) {
			circleLeft = 0;
			circleTop = stepRectRef.current.height;
		}

		imageEditorShapes({
			canvas,
			shapeType: SubMenu.STEPS_CREATOR,
			isNewShape: true,
			canvasData: {
				angle: 0,
				left: x,
				scaleX: 1,
				scaleY: 1,
				fill: 'transparent',
				top: y,
				id,
				objects: [
					{
						left: stepRectRef.current?.left,
						top: stepRectRef.current?.top,
						width: stepRectRef.current?.width,
						height: stepRectRef.current?.height,
						fill: 'transparent',
						stroke: stepCreatorRef.current.borderColor,
						strokeWidth: stepCreatorRef.current.strokeWidth,
					},
					{
						objects: [
							{
								left: circleLeft,
								top: circleTop,
								fill: stepCreatorRef.current.backgroundColor,
							},
							{
								fill: stepCreatorRef.current.fontColor,
								text: number.toString(),
								fontSize: stepCreatorRef.current.fontSize,
								angle: 0,
							},
						],
					},
				],
			},
		});

		if (stepRectRef.current) {
			canvas.current.remove(stepRectRef.current);
		}
		canvas.current.requestRenderAll();
	};

	const handleMouseUp = useCallback((e: any) => {
		if (isDrawing.current && stepRectRef.current) {
			const target = canvas.current.findTarget(e.e) as any;
			if (target) {
				const size = target._objects ? target._objects.length : 0;
				if (size > 0) {
					canvas.current.setActiveObject(target._objects ? target._objects[size - 1] : null);
					canvas.current.requestRenderAll();
				}
			}
			const pointer = canvas.current.getViewportPoint(e.e);
			createStepCircle(pointer.x, pointer.y, stepCreatorRef.current.stepNumber);

			stepCreatorRef.current.stepNumber += 1;

			canvas.current.selection = true;
			stepRectRef.current = null;
			isDrawing.current = false;
		}
	}, []);

	const handleMouseMove = useCallback((e: any) => {
		const target = canvas.current.findTarget(e.e);
		if (target) {
			canvas.current.setCursor('resize');
		} else {
			updateCustomCursor(stepCreatorRef.current.stepNumber);
		}

		if (!isDrawing.current || !stepRectRef.current) {
			return;
		}

		const pointer = canvas.current.getViewportPoint(e.e);
		const rect = stepRectRef.current;

		rect.set({
			left: Math.min(startPointer.current?.x, pointer.x),
			top: Math.min(startPointer.current?.y, pointer.y),
			width: Math.abs(pointer.x - startPointer.current?.x),
			height: Math.abs(pointer.y - startPointer.current?.y),
		});

		stepRectRef.current.setCoords();
		canvas.current.renderAll();
	}, []);

	const handleMouseDown = useCallback((e: any) => {
		const target = canvas.current.findTarget(e.e);
		if (target) {
			return;
		}

		const pointer = canvas.current.getViewportPoint(e.e);
		startPointer.current = { x: pointer.x, y: pointer.y };
		isDrawing.current = true;

		stepRectRef.current = new Rect({
			left: pointer.x,
			top: pointer.y,
			width: 0,
			height: 0,
			fill: 'transparent',
			stroke: stepCreatorRef.current.borderColor,
			strokeWidth: stepCreatorRef.current.strokeWidth,
			selectable: false,
			cornerStyle: 'circle',
			cornerColor: '#1d7bb9',
			cornerSize: 8,
			transparentCorners: false,
			excludeFromExport: true,
		});

		stepRectRef.current.set({
			shapeType: SubMenu.RECT_STEPS_CREATOR,
		});

		canvas.current.add(stepRectRef.current);
		canvas.current.selection = false;
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotation !== SubMenu.STEPS_CREATOR) {
			canvas.current.off('mouse:up', handleMouseUp);
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
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
			canvasOverlay.off('mouse:up', handleMouseUp);
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
		};
	}, []);

	const handleStepsCreator = () => {
		if (activeAnnotation !== SubMenu.STEPS_CREATOR) {
			setActiveAnnotation(SubMenu.STEPS_CREATOR);
			canvas.current.discardActiveObject();
			canvas.current.defaultCursor = 'crosshair';
			stepCreatorRef.current.stepNumber = 1;
			canvas.current.selection = false;
			canvas.current.on('mouse:up', handleMouseUp);
			canvas.current.on('mouse:down', handleMouseDown);
			canvas.current.on('mouse:move', handleMouseMove);
			canvas.current.requestRenderAll();
		} else {
			setActiveAnnotation('');
			canvas.current.defaultCursor = 'default';
			canvas.current.selection = true;
			canvas.current.off('mouse:up', handleMouseUp);
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
		}
	};

	return (
		<button
			className={`custom-button ${activeAnnotation === SubMenu.STEPS_CREATOR ? 'active' : ''}`}
			onClick={handleStepsCreator}
		>
			<OrderedListIcon />
			Steps Creator
		</button>
	);
};

export default StepsCreator;
