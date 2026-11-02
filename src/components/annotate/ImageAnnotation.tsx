/**
 * @author Vikhyat Singh
 * Image Annotation for menu
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, Circle, FabricImage, Group, Line, Rect, Triangle } from 'fabric';

import AdvancedArrowTool from './AdvancedArrowTool';
import CommentOneIcon from '../../icons/CommentOneIcon';
import DownOneIcon from '../../icons/DownOneIcon';
import EditorEmoji from './EditorEmoji';
import EditorTextbox from './EditorTextbox';
import LinePath from './LinePath';
import PencilDraw from './PencilDraw';
import PlusIcon from '../../icons/PlusIcon';
import RectangleIcon from '../../icons/RectangleIcon';
import RightTwoIcon from '../../icons/RightTwoIcon';
import RoundIcon from '../../icons/RoundIcon';
import StarIcon from '../../icons/StarIcon';
import StepsCreator from './StepsCreator';
import imageEditorShapes from '../../utils/imageEditorShapes';
import { generateId, SubMenu } from '../../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
	// optional pre-detected regions (e.g. from an AI model) that shapes snap to
	aIAnnotation?: any;
	handleTrackChange: (e?: any) => void;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
	freeDrawingBrushContextMenu: { color: string; width: number };
	advancedArrowRef: React.RefObject<{ stroke: string; width: number }>;
	linePathRef: React.RefObject<{ stroke: string; width: number }>;
	stepCreatorRef: React.RefObject<{
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		stepNumber: number;
		strokeWidth: number;
	}>;
	commentBoxRef: React.RefObject<{
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
		strokeWidth: number;
		borderColor: string;
		text: string;
	}>;
	textBoxContextMenu: {
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	};
}

const shapeAnnotations: (SubMenu | '')[] = [SubMenu.RECTANGLE, SubMenu.CIRCLE, SubMenu.ARROW];

const ImageAnnotation: React.FC<IProps> = (props) => {
	const {
		canvas,
		aIAnnotation,
		handleTrackChange,
		activeAnnotation,
		setActiveAnnotation,
		freeDrawingBrushContextMenu,
		advancedArrowRef,
		linePathRef,
		stepCreatorRef,
		commentBoxRef,
		textBoxContextMenu,
	} = props;

	const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState<boolean>(false);

	const hoverRectRef = useRef<Rect | Circle | Group | null>(null);
	const aiScaledCoordinatesRef = useRef<{ bbox: number[]; scaledBbox: number[] }[]>([]);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setActiveAnnotation('');
	}, []);

	useEffect(() => {
		if (!canvas.current || !aIAnnotation) {
			aiScaledCoordinatesRef.current = [];
			return;
		}

		const bgImage = canvas.current.backgroundImage as FabricImage;
		if (!bgImage) {
			return;
		}

		const scaleX = bgImage.scaleX;
		const scaleY = bgImage.scaleY;
		aiScaledCoordinatesRef.current = aIAnnotation.map((coord: any) => ({
			...coord,
			scaledBbox: [
				coord.bbox[0] * scaleX,
				coord.bbox[1] * scaleY,
				coord.bbox[2] * scaleX,
				coord.bbox[3] * scaleY,
			],
		}));
	}, [aIAnnotation]);

	// returns the biggest region under the given scene point
	const findHoveredEntry = (x: number, y: number) => {
		let hoveredEntry = null;
		let maxArea = 0;

		for (const coord of aiScaledCoordinatesRef.current) {
			const [x1, y1, x2, y2] = coord.scaledBbox;
			if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
				const area = (x2 - x1) * (y2 - y1);
				if (area > maxArea) {
					maxArea = area;
					hoveredEntry = coord;
				}
			}
		}
		return hoveredEntry;
	};

	const handleStarShape = () => {
		canvas.current.discardActiveObject();
		setActiveAnnotation(SubMenu.STAR);

		const id = generateId();
		const height = canvas.current.getHeight();
		const width = canvas.current.getWidth();

		imageEditorShapes({
			canvas,
			shapeType: SubMenu.STAR,
			isNewShape: true,
			canvasData: {
				id,
				angle: 0,
				fill: 'transparent',
				stroke: '#ff0000',
				strokeWidth: 5,
				left: width / 2 - 45,
				top: height / 2 - 47.5,
				scaleX: 1,
				scaleY: 1,
				width: 90,
				height: 95,
			},
		});
	};

	const handleRectMouseMove = useCallback((event: any) => {
		if (!canvas.current || !hoverRectRef.current) {
			return;
		}

		const { x, y } = canvas.current.getScenePoint(event.e);
		const hoveredEntry = findHoveredEntry(x, y);

		if (hoveredEntry) {
			const [x1, y1, x2, y2] = hoveredEntry.scaledBbox;
			hoverRectRef.current.set({
				left: x1,
				top: y1,
				width: x2 - x1,
				height: y2 - y1,
				visible: true,
			});
		} else {
			hoverRectRef.current.visible = false;
		}
		canvas.current.requestRenderAll();
	}, []);

	const handleRectMouseDown = useCallback((event: any) => {
		const target = canvas.current.findTarget(event.e);
		if (target) {
			return;
		}

		const { x, y } = canvas.current.getScenePoint(event.e);
		const hoveredEntry = findHoveredEntry(x, y);

		const id = generateId();
		if (hoveredEntry) {
			const [x1, y1, x2, y2] = hoveredEntry.scaledBbox;
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.RECTANGLE,
				isNewShape: true,
				canvasData: {
					id,
					angle: 0,
					fill: 'transparent',
					height: y2 - y1,
					left: x1,
					scaleX: 1,
					scaleY: 1,
					stroke: '#ff0000',
					strokeWidth: 5,
					top: y1,
					width: x2 - x1,
				},
			});
		} else {
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.RECTANGLE,
				isNewShape: true,
				canvasData: {
					id,
					angle: 0,
					fill: 'transparent',
					height: 50,
					left: x - 50,
					scaleX: 1,
					scaleY: 1,
					stroke: '#ff0000',
					strokeWidth: 5,
					top: y - 25,
					width: 100,
				},
			});
		}
	}, []);

	const handleCircleMouseMove = useCallback((event: any) => {
		if (!canvas.current || !hoverRectRef.current) {
			return;
		}

		const { x, y } = canvas.current.getScenePoint(event.e);
		const hoveredEntry = findHoveredEntry(x, y);

		if (hoveredEntry) {
			const [x1, y1, x2, y2] = hoveredEntry.scaledBbox;
			hoverRectRef.current.set({
				left: x1,
				top: y1 - (x2 - x1) / 2 + (y2 - y1) / 2,
				radius: (x2 - x1) / 2,
				visible: true,
			});
		} else {
			hoverRectRef.current.visible = false;
		}
		canvas.current.requestRenderAll();
	}, []);

	const handleCircleMouseDown = useCallback((event: any) => {
		const target = canvas.current.findTarget(event.e);
		if (target) {
			return;
		}

		const { x, y } = canvas.current.getScenePoint(event.e);
		const hoveredEntry = findHoveredEntry(x, y);

		const id = generateId();
		if (hoveredEntry) {
			const [x1, y1, x2, y2] = hoveredEntry.scaledBbox;
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.CIRCLE,
				isNewShape: true,
				canvasData: {
					angle: 0,
					fill: 'transparent',
					id,
					left: x1,
					radius: (x2 - x1) / 2,
					scaleX: 1,
					scaleY: 1,
					stroke: '#ff0000',
					strokeWidth: 5,
					top: y1 - (x2 - x1) / 2 + (y2 - y1) / 2,
				},
			});
		} else {
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.CIRCLE,
				isNewShape: true,
				canvasData: {
					angle: 0,
					fill: 'transparent',
					id,
					left: x - 50,
					radius: 50,
					scaleX: 1,
					scaleY: 1,
					stroke: '#ff0000',
					strokeWidth: 5,
					top: y - 50,
				},
			});
		}
	}, []);

	const handleArrowMouseMove = useCallback((event: any) => {
		if (!canvas.current || !hoverRectRef.current) {
			return;
		}

		const { x, y } = canvas.current.getScenePoint(event.e);
		const hoveredEntry = findHoveredEntry(x, y);

		const obj1 = (hoverRectRef.current as any)?._objects[1];
		const obj2 = (hoverRectRef.current as any)?._objects[0];

		if (hoveredEntry && obj1 && obj2) {
			const [x1, y1, x2, y2] = hoveredEntry.scaledBbox;
			if (x1 <= 72) {
				hoverRectRef.current.set({
					left: x2 + 18,
					top: y1 + (y2 - y1) / 2 - 7,
					visible: true,
				});
				obj1.set({
					left: -52,
					top: 10,
					angle: -90,
				});
			} else if (x1 > 72) {
				hoverRectRef.current.set({
					left: x1 - 72,
					top: y1 + (y2 - y1) / 2 - 7,
					visible: true,
				});
				obj1.set({
					left: 36,
					top: -10.5,
					angle: 90,
				});
			} else if (y1 > 72) {
				hoverRectRef.current.set({
					left: (x2 - x1) / 2 - 10,
					top: y1,
					visible: true,
				});
				obj1.set({
					left: 36,
					top: -10.5,
					angle: 180,
				});
				obj2.set({
					left: 28,
					top: -80.5,
					angle: 90,
				});
			} else {
				hoverRectRef.current.set({
					left: (x2 - x1) / 2 - 14,
					top: y2,
					visible: true,
				});
				obj1.set({
					left: 16,
					top: -6.5,
					angle: 0,
				});
				obj2.set({
					left: 28,
					top: 0.5,
					angle: 90,
				});
			}
		} else {
			hoverRectRef.current.visible = false;
		}
		canvas.current.requestRenderAll();
	}, []);

	const handleArrowMouseDown = useCallback((event: any) => {
		const target = canvas.current.findTarget(event.e);
		if (target) {
			return;
		}

		const { x, y } = canvas.current.getScenePoint(event.e);
		const hoveredEntry = findHoveredEntry(x, y);

		const obj0 = (hoverRectRef.current as any)?._objects[0];
		const obj1 = (hoverRectRef.current as any)?._objects[1];

		const id = generateId();
		if (hoveredEntry && obj0 && obj1) {
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.ARROW,
				isNewShape: true,
				canvasData: {
					id,
					angle: 0,
					fill: 'transparent',
					left: hoverRectRef.current.left,
					top: hoverRectRef.current.top,
					scaleX: 1,
					scaleY: 1,
					objects: [
						{
							angle: obj0.angle,
							fill: 'transparent',
							left: obj0.left,
							stroke: '#ff0000',
							strokeWidth: 4,
							top: obj0.top,
							x1: -25,
							x2: 25,
							y1: 0,
							y2: 0,
						},
						{
							width: 20,
							height: 20,
							fill: '#ff0000',
							left: obj1.left,
							top: obj1.top,
							angle: obj1.angle,
						},
					],
				},
			});
		} else {
			imageEditorShapes({
				canvas,
				shapeType: SubMenu.ARROW,
				isNewShape: true,
				canvasData: {
					id,
					angle: 0,
					fill: 'transparent',
					left: x - 36,
					top: y - 10.5,
					scaleX: 1,
					scaleY: 1,
					objects: [
						{
							angle: 0,
							fill: 'transparent',
							left: -36,
							stroke: '#ff0000',
							strokeWidth: 4,
							top: -2.5,
							x1: -25,
							x2: 25,
							y1: 0,
							y2: 0,
						},
						{
							width: 20,
							height: 20,
							fill: '#ff0000',
							left: 36,
							top: -10.5,
							angle: 90,
						},
					],
				},
			});
		}
	}, []);

	// removes the hover preview and all listeners of the rectangle / circle / arrow tools
	const clearShapeTool = (fabricCanvas: Canvas | null) => {
		if (!fabricCanvas) {
			return;
		}
		if (hoverRectRef.current) {
			fabricCanvas.remove(hoverRectRef.current);
			hoverRectRef.current = null;
		}
		fabricCanvas.off('mouse:move', handleRectMouseMove);
		fabricCanvas.off('mouse:down', handleRectMouseDown);
		fabricCanvas.off('mouse:move', handleCircleMouseMove);
		fabricCanvas.off('mouse:down', handleCircleMouseDown);
		fabricCanvas.off('mouse:move', handleArrowMouseMove);
		fabricCanvas.off('mouse:down', handleArrowMouseDown);
	};

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const canvasOverlay = canvas.current;
		canvas.current.discardActiveObject();
		canvas.current.requestRenderAll();

		return () => {
			clearShapeTool(canvasOverlay);
		};
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		// another tool got selected, the hover preview must not stay on the canvas (it would be exported)
		if (!shapeAnnotations.includes(activeAnnotation)) {
			clearShapeTool(canvas.current);
		}
	}, [activeAnnotation]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsShapeDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const startShapeTool = (shapeType: SubMenu, hoverObject: Rect | Circle | Group) => {
		clearShapeTool(canvas.current);
		setActiveAnnotation(shapeType);

		hoverRectRef.current = hoverObject;
		hoverRectRef.current.visible = false;
		canvas.current.add(hoverRectRef.current);
		canvas.current.discardActiveObject();
		canvas.current.requestRenderAll();
	};

	const handleRectangularShape = () => {
		if (activeAnnotation === SubMenu.RECTANGLE) {
			return;
		}

		startShapeTool(
			SubMenu.RECTANGLE,
			new Rect({
				fill: 'rgba(171, 211, 255, 0.3)',
				stroke: '#ff0000',
				strokeWidth: 2,
				strokeDashArray: [4, 2],
				strokeUniform: true,
				selectable: false,
				evented: false,
				excludeFromExport: true,
				shapeType: SubMenu.AI_RECTANGLE,
			}),
		);

		canvas.current.on('mouse:down', handleRectMouseDown);
		canvas.current.on('mouse:move', handleRectMouseMove);
	};

	const handleAddArrow = () => {
		if (activeAnnotation === SubMenu.ARROW) {
			return;
		}

		const line = new Line([50, 50, 100, 50], {
			angle: 0,
			fill: 'transparent',
			left: -36,
			stroke: '#ff0000',
			strokeWidth: 4,
			top: -2.5,
			x1: -25,
			x2: 25,
			y1: 0,
			y2: 0,
		});
		const arrowhead = new Triangle({
			width: 20,
			height: 20,
			fill: '#ff0000',
			left: 36,
			top: -10.5,
			angle: 90,
		});

		const hoverArrow = new Group([line, arrowhead], {
			angle: 0,
			fill: 'transparent',
			stroke: '#ff0000',
			strokeWidth: 2,
			strokeDashArray: [4, 2],
			strokeUniform: true,
			selectable: false,
			evented: false,
			excludeFromExport: true,
		});
		hoverArrow.set({
			shapeType: SubMenu.AI_ARROW,
		});

		startShapeTool(SubMenu.ARROW, hoverArrow);

		canvas.current.on('mouse:down', handleArrowMouseDown);
		canvas.current.on('mouse:move', handleArrowMouseMove);
	};

	const handleCircularShape = () => {
		if (activeAnnotation === SubMenu.CIRCLE) {
			return;
		}

		startShapeTool(
			SubMenu.CIRCLE,
			new Circle({
				fill: 'rgba(171, 211, 255, 0.3)',
				stroke: '#ff0000',
				strokeWidth: 2,
				strokeDashArray: [4, 2],
				strokeUniform: true,
				selectable: false,
				evented: false,
				excludeFromExport: true,
				shapeType: SubMenu.AI_CIRCLE,
			}),
		);

		canvas.current.on('mouse:down', handleCircleMouseDown);
		canvas.current.on('mouse:move', handleCircleMouseMove);
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		// reset so that selecting the same file again still triggers onChange
		event.target.value = '';
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			const imageUrl = e.target?.result as string;
			if (imageUrl && canvas.current) {
				const id = generateId();

				imageEditorShapes({
					canvas,
					shapeType: SubMenu.CUSTOM_SHAPE,
					isNewShape: true,
					canvasData: {
						id,
						src: imageUrl,
						angle: 0,
						fill: 'transparent',
						scaleX: 1,
						scaleY: 1,
					},
				});
			}
		};
		reader.readAsDataURL(file);
	};

	const handleAddCustom = () => {
		setActiveAnnotation(SubMenu.CUSTOM_SHAPE);

		canvas.current.discardActiveObject();
		canvas.current.requestRenderAll();
		fileInputRef.current?.click();
	};

	const handleCommentBox = () => {
		setActiveAnnotation(SubMenu.COMMENT_BOX);

		canvas.current.discardActiveObject();

		imageEditorShapes({
			canvas,
			shapeType: SubMenu.COMMENT_BOX,
			isNewShape: true,
			canvasData: {
				id: generateId(),
				top: canvas.current.getHeight() / 2 - 50,
				left: canvas.current.getWidth() / 2 - 100,
				borderColor: commentBoxRef.current.borderColor,
				fill: commentBoxRef.current.backgroundColor,
				test: {
					fontStyle: commentBoxRef.current.fontStyle,
					fill: commentBoxRef.current.fontColor,
					text: commentBoxRef.current.text,
					fontSize: commentBoxRef.current.fontSize,
					fontWeight: commentBoxRef.current.fontWeight,
					textAlign: 'left',
				},
				scaleX: 1,
				scaleY: 1,
				width: 200,
				height: 100,
				strokeWidth: commentBoxRef.current.strokeWidth,
				stroke: commentBoxRef.current.borderColor,
			},
		});

		setActiveAnnotation('');
		canvas.current.requestRenderAll();
	};

	const handleShapeClick = () => {
		if (shapeAnnotations.includes(activeAnnotation)) {
			setActiveAnnotation('');
			clearShapeTool(canvas.current);
			return;
		}
		handleRectangularShape();
	};

	const menuProps = [
		{
			label: 'Rectangle',
			key: 'rectangle',
			icon: <RectangleIcon />,
			onClick: handleRectangularShape,
		},
		{
			label: 'Circle',
			key: 'circle',
			icon: <RoundIcon />,
			onClick: handleCircularShape,
		},
		{
			label: 'Arrow',
			key: 'arrow',
			icon: <RightTwoIcon />,
			onClick: handleAddArrow,
		},
		{
			label: 'Star',
			key: 'star',
			icon: <StarIcon />,
			onClick: handleStarShape,
		},
		{
			label: 'Comment',
			key: 'comment',
			icon: <CommentOneIcon />,
			onClick: handleCommentBox,
		},
		{
			label: 'Add Custom',
			key: 'add-custom',
			icon: <PlusIcon disabled={false} />,
			onClick: handleAddCustom,
		},
	];

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 }}>
			<StepsCreator
				canvas={canvas}
				activeAnnotation={activeAnnotation}
				setActiveAnnotation={setActiveAnnotation}
				stepCreatorRef={stepCreatorRef}
			/>
			<button
				type='button'
				className={`custom-button ${shapeAnnotations.includes(activeAnnotation) ? 'active' : ''}`}
				style={{ paddingRight: '8px' }}
				onClick={handleShapeClick}
			>
				Shapes
			</button>
			<div className='dropdown' ref={dropdownRef}>
				<button
					type='button'
					onClick={() => setIsShapeDropdownOpen((open) => !open)}
					className='custom-button'
					style={{ padding: '0px' }}
				>
					<DownOneIcon />
				</button>
				{/* kept outside of the dropdown so that it stays mounted while the file dialog is open */}
				<input
					type='file'
					accept='image/*'
					ref={fileInputRef}
					onChange={handleImageUpload}
					style={{ display: 'none' }}
				/>
				<div className={`dropdown-content ${isShapeDropdownOpen ? 'show-shape-dropdown' : ''}`}>
					<ul style={{ padding: 12, margin: 0 }}>
						{menuProps.map((item) => (
							<li
								key={item.key}
								style={{
									padding: 4,
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
								}}
								onClick={() => {
									item.onClick();
									setIsShapeDropdownOpen(false);
								}}
							>
								<span style={{ marginRight: 8, marginTop: '3px' }}>{item.icon}</span>
								{item.label}
							</li>
						))}
					</ul>
				</div>
			</div>
			<EditorEmoji
				canvas={canvas}
				activeAnnotation={activeAnnotation}
				setActiveAnnotation={setActiveAnnotation}
			/>
			<EditorTextbox
				canvas={canvas}
				activeAnnotation={activeAnnotation}
				setActiveAnnotation={setActiveAnnotation}
				textBoxContextMenu={textBoxContextMenu}
			/>
			<PencilDraw
				canvas={canvas}
				handleTrackChange={handleTrackChange}
				activeAnnotation={activeAnnotation}
				setActiveAnnotation={setActiveAnnotation}
				freeDrawingBrushContextMenu={freeDrawingBrushContextMenu}
			/>
			<AdvancedArrowTool
				canvas={canvas}
				handleTrackChange={handleTrackChange}
				activeAnnotation={activeAnnotation}
				setActiveAnnotation={setActiveAnnotation}
				advancedArrowRef={advancedArrowRef}
			/>
			<LinePath
				canvas={canvas}
				handleTrackChange={handleTrackChange}
				activeAnnotation={activeAnnotation}
				setActiveAnnotation={setActiveAnnotation}
				linePathRef={linePathRef}
			/>
		</div>
	);
};

export default ImageAnnotation;
