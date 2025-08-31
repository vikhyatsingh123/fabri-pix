/**
 * @author Vikhyat Singh
 * @description Image editor main component
 */

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, IText, FabricImage, FabricObject } from 'fabric';

import EditorContextMenu from './context-menu/EditorContextMenu';
import EditorMenu from './EditorMenu';
import EditorSubMenu from './EditorSubMenu';
import EditorTopMenu from './EditorTopMenu';
import ImageEditorFooter from './ImageEditorFooter';
import { Menu, overlaysConstants, SubMenu, AICoordinates } from '../utils/utils';

interface IProps {
	imageUrl?: string | null;
}

const ImageEditor: React.FC<IProps> = (props) => {
	const { imageUrl } = props;

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvas = useRef<Canvas>(null);
	const undoRedoActive = useRef<boolean>(false);
	const advancedArrowRef = useRef<{ stroke: string; width: number }>({ stroke: '#ff0000', width: 4 });
	const linePathRef = useRef<{ stroke: string; width: number }>({ stroke: '#ff0000', width: 3 });
	const stepCreatorRef = useRef<{
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		stepNumber: number;
		strokeWidth: number;
	}>({
		borderColor: '#ff0000',
		backgroundColor: '#ff0000',
		fontColor: '#fff',
		fontSize: 20,
		stepNumber: 1,
		strokeWidth: 2,
	});
	const commentBoxRef = useRef<{
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
		strokeWidth: number;
		borderColor: string;
		text: string;
	}>({
		backgroundColor: '#ff0000',
		fontColor: '#fff',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: 'normal',
		strokeWidth: 2,
		borderColor: '#0386B5',
		text: 'Textbox',
	});

	const [textBoxContextMenu, setTextBoxContextMenu] = useState<{
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	}>({
		backgroundColor: '#fff',
		fontColor: '#ff0000',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: 'normal',
	});
	const [freeDrawingBrushContextMenu, setFreeDrawingBrushContextMenu] = useState<{ color: string; width: number }>({
		color: '#ff0000',
		width: 1,
	});
	const [activeAnnotation, setActiveAnnotation] = useState<SubMenu | ''>('');
	const [menu, setMenu] = useState<Menu | ''>('');
	const [selectedObject, setSelectedObject] = useState<any>({});

	const [config, setConfig] = useState<{
		canvasState: string[];
		currentStateIndex: number;
	}>({
		canvasState: [],
		currentStateIndex: -1,
	});

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Backspace' || event.key === 'Delete') {
			const target = event.target as HTMLElement;
			if (target.tagName === 'INPUT') {
				return;
			}

			const activeObject = canvas.current?.getActiveObject() as any;
			if (activeObject) {
				if (activeObject.shapeType === SubMenu.STEPS_CREATOR) {
					if (event.key === 'Backspace') {
						const text = activeObject as IText;
						const textValue = activeObject._objects?.[1]?._objects?.[1]?.text ?? '';
						if (!activeObject._objects?.[1]?._objects?.[1]?.isEditing) {
							canvas.current?.remove(activeObject);
							canvas.current?.renderAll();
							return;
						}
						if (textValue.length > 0) {
							text.text = textValue.slice(0, -1);
							canvas.current?.renderAll();
						}
					} else {
						canvas.current?.remove(activeObject);
						canvas.current?.renderAll();
					}
				} else if (activeObject.shapeType === SubMenu.TEXT) {
					const text = activeObject as IText;
					if (!activeObject.isEditing) {
						canvas.current?.remove(activeObject);
						canvas.current?.renderAll();
						return;
					}

					const textValue = text.text;
					if (textValue.length > 0) {
						text.text = textValue.slice(0, -1);
						canvas.current?.renderAll();
					}
				} else if (activeObject.type === 'rect' && activeObject.shapeType === SubMenu.BLUR) {
					const objects = canvas.current?.getObjects();
					if (objects) {
						objects.forEach((object: any) => {
							if (
								object.shapeType === SubMenu.BLUR_INNER_PART &&
								object.id === activeObject.id + '-blur'
							) {
								canvas.current?.remove(object);
							}
						});
					}
					canvas.current?.remove(activeObject);
					canvas.current?.renderAll();
				} else if (activeObject.shapeType === SubMenu.CROP_RECTANGLE) {
					const overlayObjects = canvas.current?.getObjects();
					if (overlayObjects) {
						overlayObjects.forEach((object: any) => {
							if (
								overlaysConstants.includes(object.shapeType) ||
								object.shapeType === SubMenu.CROP_RECTANGLE
							) {
								canvas.current?.remove(object);
							}
						});
					}
					setActiveAnnotation(SubMenu.CROP_CLIP_PATH_DELETED);
					canvas.current?.renderAll();
				} else if (activeObject.shapeType === SubMenu.ADVANCED_ARROW) {
					const arrowHead = canvas.current
						?.getObjects()
						.find((obj: any) => obj.id === activeObject.id + '-arrowhead');
					if (arrowHead) {
						canvas.current?.remove(arrowHead);
					}
					canvas.current?.remove(activeObject);
					canvas.current?.renderAll();
				} else if (activeObject.shapeType === SubMenu.COMMENT_BOX_TEXTBOX) {
					return;
				} else if (activeObject.shapeType === SubMenu.COMMENT_BOX) {
					const canvasObject = canvas.current.getObjects();
					const textboxObj = canvasObject.find((obj: any) => obj.id === activeObject.id + '-text');
					canvas.current?.remove(activeObject);
					canvas.current?.remove(textboxObj);
					canvas.current?.renderAll();
				} else {
					canvas.current?.remove(activeObject);
					canvas.current?.renderAll();
				}
			}
		}
	};

	const initializeCanvas = async () => {
		if (canvas.current) {
			canvas.current.dispose();
			canvas.current = null;
		}
		FabricObject.customProperties = ['id', 'shapeType', 'lastLeft', 'lastTop', 'test'];
		canvas.current = new Canvas(canvasRef.current as HTMLCanvasElement);

		if (imageUrl) {
			try {
				const image = await FabricImage.fromURL(imageUrl, {
					crossOrigin: 'anonymous',
				});
				const maxWidth = 1000;
				const maxHeight = 508;
				const imageWidth = image.width;
				const imageHeight = image.height;
				const widthScale = maxWidth / imageWidth;
				const heightScale = maxHeight / imageHeight;
				const scale = Math.min(widthScale, heightScale);
				const canvasWidth = imageWidth * scale;
				const canvasHeight = imageHeight * scale;
				canvas.current.setDimensions({ width: canvasWidth, height: canvasHeight });
				image.scaleX = scale;
				image.scaleY = scale;
				canvas.current.backgroundImage = image;
				canvas.current.renderAll();
			} catch (error) {
				void console.error('Error loading image');
			}
		}

		const canvasAsJson = JSON.stringify(JSON.parse(JSON.stringify(canvas.current.toJSON())));
		setMenu(Menu.ANNOTATE);
		setConfig({
			canvasState: [canvasAsJson],
			currentStateIndex: 0,
		});
	};

	const trackChange = (e?: any) => {
		if (undoRedoActive.current === true) {
			return;
		}

		if (
			e?.target?.shapeType === SubMenu.BLUR_INNER_PART ||
			e?.target?.shapeType === SubMenu.ADVANCED_ARROW_HEAD ||
			e?.target?.shapeType === SubMenu.RECT_STEPS_CREATOR ||
			e?.target?.shapeType === SubMenu.TEXT_STEPS_CREATOR ||
			e?.target?.shapeType === SubMenu.AI_RECTANGLE ||
			e?.target?.shapeType === SubMenu.AI_CIRCLE ||
			e?.target?.shapeType === SubMenu.AI_ARROW ||
			e?.target?.shapeType === SubMenu.CROP_RECTANGLE ||
			e?.target?.shapeType === SubMenu.CROP_GREYED_TOP ||
			e?.target?.shapeType === SubMenu.CROP_GREYED_LEFT ||
			e?.target?.shapeType === SubMenu.CROP_GREYED_RIGHT ||
			e?.target?.shapeType === SubMenu.CROP_GREYED_BOTTOM ||
			e?.target?.shapeType === SubMenu.COMMENT_BOX_TEXTBOX ||
			e?.target?.shapeType === SubMenu.TEMP_LINE_PATH ||
			e?.target?.shapeType === SubMenu.TEMP_ADVANCED_ARROW_HEAD ||
			e?.target?.shapeType === SubMenu.TEMP_ADVANCED_ARROW
		) {
			return;
		}

		if (e?.target?.shapeType !== SubMenu.ADVANCED_ARROW && (e?.target?.width === 0 || e?.target?.height === 0)) {
			return;
		}

		if (
			e?.target?.shapeType === SubMenu.ADVANCED_ARROW &&
			e?.target?.points[0].x === e?.target?.points[1].x &&
			e?.target?.points[0].y === e?.target?.points[1].y
		) {
			return;
		}

		const jsonData = canvas.current.toJSON();
		const canvasAsJson = JSON.stringify(JSON.parse(JSON.stringify(jsonData)));
		setConfig((prevConfig) => {
			let newCanvasState = [...JSON.parse(JSON.stringify(prevConfig.canvasState))];
			if (prevConfig.currentStateIndex < newCanvasState.length - 1) {
				const indexToBeInserted = prevConfig.currentStateIndex + 1;
				newCanvasState[indexToBeInserted] = canvasAsJson;
				newCanvasState = newCanvasState.slice(0, indexToBeInserted + 1);
			} else {
				newCanvasState.push(canvasAsJson);
			}

			return {
				...prevConfig,
				canvasState: newCanvasState,
				currentStateIndex: newCanvasState.length - 1,
			};
		});
	};

	useEffect(() => {
		const handleObjectAdded = (e: any) => {
			if (undoRedoActive.current) {
				return;
			}

			if (
				e.target?.shapeType === SubMenu.BLUR_INNER_PART ||
				e.target?.shapeType === SubMenu.ADVANCED_ARROW_HEAD ||
				e.target?.shapeType === SubMenu.RECT_STEPS_CREATOR ||
				e.target?.shapeType === SubMenu.TEXT_STEPS_CREATOR ||
				e.target?.shapeType === SubMenu.AI_RECTANGLE ||
				e.target?.shapeType === SubMenu.AI_CIRCLE ||
				e.target?.shapeType === SubMenu.AI_ARROW ||
				e.target?.shapeType === SubMenu.CROP_RECTANGLE ||
				e.target?.shapeType === SubMenu.CROP_GREYED_TOP ||
				e.target?.shapeType === SubMenu.CROP_GREYED_LEFT ||
				e.target?.shapeType === SubMenu.CROP_GREYED_RIGHT ||
				e.target?.shapeType === SubMenu.CROP_GREYED_BOTTOM ||
				e.target?.shapeType === SubMenu.COMMENT_BOX_TEXTBOX ||
				e.target?.shapeType === SubMenu.TEMP_LINE_PATH ||
				e.target?.shapeType === SubMenu.TEMP_ADVANCED_ARROW_HEAD ||
				e.target?.shapeType === SubMenu.TEMP_ADVANCED_ARROW
			) {
				return;
			}

			// this is for manually adding into history
			if (
				e.target?.shapeType === SubMenu.BLUR ||
				e.target?.shapeType === SubMenu.DRAW ||
				e.target?.shapeType === SubMenu.ADVANCED_ARROW ||
				e.target?.shapeType === SubMenu.LINE_PATH
			) {
				return;
			}
			trackChange();
		};

		const handleObjectModified = (e: any) => {
			if (undoRedoActive.current === true) {
				return;
			}

			if (
				e.target?.shapeType === SubMenu.BLUR_INNER_PART ||
				e.target?.shapeType === SubMenu.ADVANCED_ARROW_HEAD ||
				e.target?.shapeType === SubMenu.RECT_STEPS_CREATOR ||
				e.target?.shapeType === SubMenu.TEXT_STEPS_CREATOR ||
				e.target?.shapeType === SubMenu.AI_RECTANGLE ||
				e.target?.shapeType === SubMenu.AI_CIRCLE ||
				e.target?.shapeType === SubMenu.AI_ARROW ||
				e.target?.shapeType === SubMenu.CROP_RECTANGLE ||
				e.target?.shapeType === SubMenu.CROP_GREYED_TOP ||
				e.target?.shapeType === SubMenu.CROP_GREYED_LEFT ||
				e.target?.shapeType === SubMenu.CROP_GREYED_RIGHT ||
				e.target?.shapeType === SubMenu.CROP_GREYED_BOTTOM ||
				e.target?.shapeType === SubMenu.COMMENT_BOX_TEXTBOX ||
				e.target?.shapeType === SubMenu.TEMP_LINE_PATH ||
				e.target?.shapeType === SubMenu.TEMP_ADVANCED_ARROW_HEAD ||
				e.target?.shapeType === SubMenu.TEMP_ADVANCED_ARROW
			) {
				return;
			}
			trackChange();
		};

		void initializeCanvas();

		canvas.current.on('object:modified', handleObjectModified);
		canvas.current.on('object:added', handleObjectAdded);
		canvas.current.on('object:removed', trackChange);
		canvas.current.on('selection:created', (event) => {
			setSelectedObject(event.selected[0]);
		});
		canvas.current.on('selection:updated', (event) => {
			setSelectedObject(event.selected[0]);
		});
		canvas.current.on('selection:cleared', () => {
			setSelectedObject({});
		});

		window.addEventListener('keyup', handleKeyPress);
		return () => {
			if (canvas.current) {
				canvas.current.off('object:modified', handleObjectModified);
				canvas.current.off('object:added', handleObjectAdded);
				canvas.current.off('object:removed', trackChange);
				void canvas.current.dispose();
			}
			window.removeEventListener('keyup', handleKeyPress);
		};
	}, []);

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
				<EditorTopMenu
					canvas={canvas}
					config={config}
					setConfig={setConfig}
					undoRedoActive={undoRedoActive}
					stepCreatorRef={stepCreatorRef}
					activeAnnotation={activeAnnotation}
					setActiveAnnotation={setActiveAnnotation}
				/>
			</div>
			<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
				<EditorMenu setMenu={setMenu} menu={menu} />
				<div
					style={{
						width: '1000px',
						height: '508px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						borderRightWidth: '1px',
					}}
					id='img-editor-div'
				>
					<canvas ref={canvasRef} id='mainCanvas' />
				</div>
			</div>
			<div style={{ marginTop: '16px' }}>
				<EditorContextMenu
					canvas={canvas}
					selectedObject={selectedObject}
					activeAnnotation={activeAnnotation}
					freeDrawingBrushContextMenu={freeDrawingBrushContextMenu}
					setFreeDrawingBrushContextMenu={setFreeDrawingBrushContextMenu}
					advancedArrowRef={advancedArrowRef}
					linePathRef={linePathRef}
					stepCreatorRef={stepCreatorRef}
					commentBoxRef={commentBoxRef}
					textBoxContextMenu={textBoxContextMenu}
					setTextBoxContextMenu={setTextBoxContextMenu}
				/>
			</div>
			<div style={{ position: 'absolute', left: 0, right: 0, bottom: 26 }}>
				<EditorSubMenu
					canvas={canvas}
					menu={menu}
					aIAnnotation={AICoordinates}
					handleTrackChange={trackChange}
					activeAnnotation={activeAnnotation}
					setActiveAnnotation={setActiveAnnotation}
					freeDrawingBrushContextMenu={freeDrawingBrushContextMenu}
					advancedArrowRef={advancedArrowRef}
					linePathRef={linePathRef}
					stepCreatorRef={stepCreatorRef}
					commentBoxRef={commentBoxRef}
					textBoxContextMenu={textBoxContextMenu}
				/>
			</div>
			<ImageEditorFooter canvas={canvas} />
		</div>
	);
};

export default ImageEditor;
