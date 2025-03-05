/**
 * @author Vikhyat Singh
 * @description Image editor main component
 */

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, IText, FabricImage, FabricObject } from 'fabric';

import EditorMenu from './EditorMenu';
import EditorSubMenu from './EditorSubMenu';
import { Menu, overlaysConstants, SubMenu, AICoordinates } from '../utils/utils';
import EditorTopMenu from './EditorTopMenu';
import EditorContextMenu from './context-menu/EditorContextMenu';
import { useImageEditorActions } from '../store/ImageEditorStore';
import ImageEditorFooter from './ImageEditorFooter';

interface IProps {
	imageUrl?: string | null;
}

const ImageEditor: React.FC<IProps> = (props) => {
	const { imageUrl } = props;

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvas = useRef<Canvas>(null);
	const undoRedoActive = useRef<boolean>(false);

	const { setActiveAnnotation } = useImageEditorActions();

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
					const text = activeObject as IText;
					const textValue = text.text;
					if (textValue.length > 0) {
						text.text = textValue.slice(0, -1);
						canvas.current?.renderAll();
					}
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
		FabricObject.customProperties = ['id', 'shapeType', 'lastLeft', 'lastTop', 'test'];
		canvas.current = new Canvas(canvasRef.current as HTMLCanvasElement);

		if (imageUrl) {
			try {
				const image = await FabricImage.fromURL(imageUrl);
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
			<h5 className='m-0'>Edit Image</h5>
			<div className='flex justify-between items-center'>
				<EditorMenu setMenu={setMenu} menu={menu} />
				<EditorTopMenu canvas={canvas} config={config} setConfig={setConfig} undoRedoActive={undoRedoActive} />
			</div>
			<div className='flex w-full justify-center'>
				<div
					className={'flex flex-col justify-center items-center border-r'}
					style={{ width: '1000px', height: '508px' }}
					id='img-editor-div'
				>
					<canvas ref={canvasRef} id='mainCanvas' />
				</div>
			</div>
			<div className='mt-4'>{/* <EditorContextMenu canvas={canvas} selectedObject={selectedObject} /> */}</div>
			<div className='absolute left-0 right-0 bottom-8'>
				<EditorSubMenu
					canvas={canvas}
					menu={menu}
					aIAnnotation={AICoordinates}
					handleTrackChange={trackChange}
				/>
			</div>
			<ImageEditorFooter canvas={canvas} />
		</div>
	);
};

export default ImageEditor;
