/**
 * @author Vikhyat Singh
 * @description Image editor main component
 */

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, FabricObject, Rect } from 'fabric';

import EditorContextMenu from './context-menu/EditorContextMenu';
import EditorMenu from './EditorMenu';
import EditorSubMenu from './EditorSubMenu';
import EditorTopMenu from './EditorTopMenu';
import ImageEditorFooter from './ImageEditorFooter';
import imageEditorShapes from '../utils/imageEditorShapes';
import { removeActiveObjects } from '../utils/canvasHelpers';
import { Menu, nonHistoryShapeTypes, SubMenu } from '../utils/utils';

interface IProps {
	imageUrl?: string | null;
	onSave?: (blob: Blob, json: any) => void;
	onCancel?: () => void;
	loadFromJson?: any;
	exportJson?: (json: any) => void;
	showExportJson?: boolean;
}

// the background image source (often a large data url) is the same for every state,
// so it is not stored again in each history entry
const serializeCanvasState = (fabricCanvas: Canvas): string => {
	const json: any = fabricCanvas.toJSON();
	if (json.backgroundImage) {
		json.backgroundImage = { ...json.backgroundImage, src: undefined };
	}
	return JSON.stringify(json);
};

const ImageEditor: React.FC<IProps> = (props) => {
	const { imageUrl, onSave, onCancel, loadFromJson, exportJson, showExportJson } = props;

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
		fontColor: '#ffffff',
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
		fontColor: '#ffffff',
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
		backgroundColor: '#ffffff',
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

	const trackChange = (e?: any) => {
		if (undoRedoActive.current === true || !canvas.current) {
			return;
		}

		const target = e?.target;
		if (nonHistoryShapeTypes.includes(target?.shapeType)) {
			return;
		}

		if (target?.shapeType !== SubMenu.ADVANCED_ARROW && (target?.width === 0 || target?.height === 0)) {
			return;
		}

		if (
			target?.shapeType === SubMenu.ADVANCED_ARROW &&
			target?.points[0].x === target?.points[1].x &&
			target?.points[0].y === target?.points[1].y
		) {
			return;
		}

		const canvasAsJson = serializeCanvasState(canvas.current);
		setConfig((prevConfig) => {
			// nothing actually changed
			if (prevConfig.canvasState[prevConfig.currentStateIndex] === canvasAsJson) {
				return prevConfig;
			}
			// drop the redo states and append the new one
			const canvasState = [...prevConfig.canvasState.slice(0, prevConfig.currentStateIndex + 1), canvasAsJson];
			return {
				canvasState,
				currentStateIndex: canvasState.length - 1,
			};
		});
	};

	const restoreCanvasState = async (jsonData: any) => {
		const fabricCanvas = canvas.current;
		if (!fabricCanvas || !jsonData) {
			return;
		}

		undoRedoActive.current = true;
		try {
			const existingBackgroundImage = fabricCanvas.backgroundImage;
			fabricCanvas.clear();

			if (existingBackgroundImage) {
				fabricCanvas.backgroundImage = existingBackgroundImage;
			} else if (jsonData.backgroundImage?.src) {
				const newBackgroundImage = await FabricImage.fromURL(jsonData.backgroundImage.src, {
					crossOrigin: 'anonymous',
				});
				if (canvas.current !== fabricCanvas) {
					return;
				}
				newBackgroundImage.flipX = jsonData.backgroundImage.flipX;
				newBackgroundImage.flipY = jsonData.backgroundImage.flipY;
				newBackgroundImage.width = jsonData.backgroundImage.width;
				newBackgroundImage.height = jsonData.backgroundImage.height;
				newBackgroundImage.scaleX = jsonData.backgroundImage.scaleX;
				newBackgroundImage.scaleY = jsonData.backgroundImage.scaleY;
				fabricCanvas.backgroundImage = newBackgroundImage;
			}

			if (!jsonData.clipPath) {
				fabricCanvas.clipPath = undefined;
			} else {
				fabricCanvas.clipPath = new Rect({
					left: jsonData.clipPath.left,
					top: jsonData.clipPath.top,
					width: jsonData.clipPath.width * jsonData.clipPath.scaleX,
					height: jsonData.clipPath.height * jsonData.clipPath.scaleY,
					absolutePositioned: true,
				});
			}

			let nextStepNumber = 0;
			for (const obj of jsonData.objects ?? []) {
				if (obj.shapeType === SubMenu.STEPS_CREATOR) {
					nextStepNumber = Math.max(nextStepNumber, Number(obj.objects[1].objects[1].text) + 1 || 0);
				}
				// awaited one by one so that asynchronously loaded images keep their stacking order and
				// are not picked up as new history entries
				await imageEditorShapes({
					canvas,
					shapeType: obj.shapeType,
					isNewShape: false,
					canvasData: obj,
				});
				if (canvas.current !== fabricCanvas) {
					return;
				}
			}
			if (nextStepNumber > 0) {
				stepCreatorRef.current.stepNumber = nextStepNumber;
			}

			const backgroundImage = fabricCanvas.backgroundImage;
			if (backgroundImage) {
				fabricCanvas.setDimensions({
					width: backgroundImage.width * backgroundImage.scaleX,
					height: backgroundImage.height * backgroundImage.scaleY,
				});
			}
			fabricCanvas.requestRenderAll();
		} finally {
			undoRedoActive.current = false;
		}
	};

	const handleReset = () => {
		const fabricCanvas = canvas.current;
		if (!fabricCanvas) {
			return;
		}

		// remove everything at once and record it as a single history entry
		undoRedoActive.current = true;
		try {
			fabricCanvas.discardActiveObject();
			fabricCanvas.remove(...fabricCanvas.getObjects());
			fabricCanvas.clipPath = undefined;
			stepCreatorRef.current.stepNumber = 1;
		} finally {
			undoRedoActive.current = false;
		}
		fabricCanvas.requestRenderAll();
		trackChange();

		if (menu === Menu.CROP) {
			setActiveAnnotation(SubMenu.CROP_CLIP_PATH_DELETED);
		}
	};

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key !== 'Backspace' && event.key !== 'Delete') {
			return;
		}

		// don't delete annotations while the user is typing (our inputs, fabric's hidden textarea or the host app)
		const target = event.target as HTMLElement;
		if (
			target?.tagName === 'INPUT' ||
			target?.tagName === 'TEXTAREA' ||
			target?.tagName === 'SELECT' ||
			target?.isContentEditable
		) {
			return;
		}

		const fabricCanvas = canvas.current;
		const activeObject = fabricCanvas?.getActiveObject() as any;
		if (
			!activeObject ||
			activeObject.isEditing ||
			activeObject._objects?.[1]?._objects?.[1]?.isEditing ||
			activeObject.shapeType === SubMenu.COMMENT_BOX_TEXTBOX
		) {
			return;
		}

		let removedObjects: any[] = [];
		undoRedoActive.current = true;
		try {
			removedObjects = removeActiveObjects(fabricCanvas);
		} finally {
			undoRedoActive.current = false;
		}

		if (removedObjects.length === 0) {
			return;
		}

		if (removedObjects.some((obj) => obj.shapeType === SubMenu.CROP_RECTANGLE)) {
			// the crop rectangle is not part of the history, just allow drawing a new one
			setActiveAnnotation(SubMenu.CROP_CLIP_PATH_DELETED);
			return;
		}
		trackChange();
	};

	const handleKeyPressRef = useRef(handleKeyPress);
	handleKeyPressRef.current = handleKeyPress;

	useEffect(() => {
		let disposed = false;

		FabricObject.customProperties = ['id', 'shapeType', 'lastLeft', 'lastTop', 'test'];
		const fabricCanvas = new Canvas(canvasRef.current as HTMLCanvasElement);
		canvas.current = fabricCanvas;

		const handleObjectAdded = (e: any) => {
			if (undoRedoActive.current || nonHistoryShapeTypes.includes(e.target?.shapeType)) {
				return;
			}

			// these are added into history manually once they are completely drawn
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

			// text edits of callouts and steps are reported for the inner text objects, record them as well
			if (
				nonHistoryShapeTypes.includes(e.target?.shapeType) &&
				e.target?.shapeType !== SubMenu.COMMENT_BOX_TEXTBOX &&
				e.target?.shapeType !== SubMenu.TEXT_STEPS_CREATOR
			) {
				return;
			}
			trackChange();
		};

		const handleSelection = (event: any) => {
			setSelectedObject(event.selected?.[0] ?? {});
		};

		const handleSelectionCleared = () => {
			setSelectedObject({});
		};

		const handleKeyUp = (event: KeyboardEvent) => handleKeyPressRef.current(event);

		fabricCanvas.on('object:modified', handleObjectModified);
		fabricCanvas.on('object:added', handleObjectAdded);
		fabricCanvas.on('object:removed', trackChange);
		fabricCanvas.on('selection:created', handleSelection);
		fabricCanvas.on('selection:updated', handleSelection);
		fabricCanvas.on('selection:cleared', handleSelectionCleared);
		window.addEventListener('keyup', handleKeyUp);

		const initializeCanvas = async () => {
			if (imageUrl) {
				try {
					const image = await FabricImage.fromURL(imageUrl, {
						crossOrigin: 'anonymous',
					});
					// the editor was unmounted (or re-mounted by StrictMode) while the image was loading
					if (disposed) {
						return;
					}
					const maxWidth = 1000;
					const maxHeight = 508;
					const imageWidth = image.width;
					const imageHeight = image.height;
					const widthScale = maxWidth / imageWidth;
					const heightScale = maxHeight / imageHeight;
					const scale = Math.min(widthScale, heightScale);
					const canvasWidth = imageWidth * scale;
					const canvasHeight = imageHeight * scale;
					fabricCanvas.setDimensions({ width: canvasWidth, height: canvasHeight });
					image.scaleX = scale;
					image.scaleY = scale;
					fabricCanvas.backgroundImage = image;
					fabricCanvas.requestRenderAll();
				} catch (error) {
					console.error('Error loading image', error);
				}
			}

			if (disposed) {
				return;
			}

			if (loadFromJson && Object.keys(loadFromJson).length > 0) {
				// deep copy so that the consumer's object is never mutated
				await restoreCanvasState(JSON.parse(JSON.stringify(loadFromJson)));
				if (disposed) {
					return;
				}
			}

			setMenu(Menu.ANNOTATE);
			setConfig({
				canvasState: [serializeCanvasState(fabricCanvas)],
				currentStateIndex: 0,
			});
		};

		void initializeCanvas();

		return () => {
			disposed = true;
			window.removeEventListener('keyup', handleKeyUp);
			fabricCanvas.off('object:modified', handleObjectModified);
			fabricCanvas.off('object:added', handleObjectAdded);
			fabricCanvas.off('object:removed', trackChange);
			fabricCanvas.off('selection:created', handleSelection);
			fabricCanvas.off('selection:updated', handleSelection);
			fabricCanvas.off('selection:cleared', handleSelectionCleared);
			void fabricCanvas.dispose();
		};
	}, []);

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
				<EditorTopMenu
					canvas={canvas}
					config={config}
					setConfig={setConfig}
					restoreCanvasState={restoreCanvasState}
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
			{/* min height keeps the toolbar below from jumping when the context menu appears */}
			<div style={{ marginTop: '16px', minHeight: '40px' }}>
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
			<div style={{ marginTop: '16px' }}>
				<EditorSubMenu
					canvas={canvas}
					menu={menu}
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
			<ImageEditorFooter
				canvas={canvas}
				onSave={onSave}
				onCancel={onCancel}
				onReset={handleReset}
				exportJson={exportJson}
				showExportJson={showExportJson}
			/>
		</div>
	);
};

export default ImageEditor;
