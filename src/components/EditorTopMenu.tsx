/**
 * @author Vikhyat Singh
 * Image editor for top menu
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Canvas, FabricImage, Point, Rect } from 'fabric';

import imageEditorShapes from '../utils/imageEditorShapes';
import { historyLogs, SubMenu } from '../utils/utils';
import { useActiveAnnotation, useImageEditorActions } from '../store/ImageEditorStore';
import Popover from './widgets/Popover';
import PlusIcon from 'src/icons/PlusIcon';
import HistoryIcon from 'src/icons/HistoryIcon';
import UndoIcon from 'src/icons/UndoIcon';
import RedoIcon from 'src/icons/RedoIcon';
import MinusIcon from 'src/icons/MinusIcon';
import FiveIcon from 'src/icons/FiveIcon';
import CheckOneIcon from 'src/icons/CheckOneIcon';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	config: {
		canvasState: string[];
		currentStateIndex: number;
	};
	setConfig: React.Dispatch<
		React.SetStateAction<{
			canvasState: string[];
			currentStateIndex: number;
		}>
	>;
	undoRedoActive: React.MutableRefObject<boolean>;
}

const EditorTopMenu: React.FC<IProps> = (props) => {
	const { canvas, config, setConfig, undoRedoActive } = props;
	const activeAnnotation = useActiveAnnotation();
	const { setActiveAnnotation } = useImageEditorActions();

	const [isPanning, setIsPanning] = useState<boolean>(false);
	const [zoomValue, setZoomValue] = useState<number>(1);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const center = canvas.current.getCenter();
		canvas.current.zoomToPoint(new Point(center.left, center.top), zoomValue);
		canvas.current.requestRenderAll();
	}, [zoomValue]);

	const handleMouseDown = useCallback((e: any) => {
		const target = canvas.current.findTarget(e.e);

		if (target) {
			return;
		}

		canvas.current.set({
			isDragging: true,
			lastPosX: e.e.clientX,
			lastPosY: e.e.clientY,
		});
	}, []);

	const handleMouseMove = useCallback((e: any) => {
		if (!(canvas.current as any)?.isDragging) {
			return;
		}
		const vpt = canvas.current.viewportTransform;
		vpt[4] += e.e.clientX - (canvas.current as any)?.lastPosX;
		vpt[5] += e.e.clientY - (canvas.current as any)?.lastPosY;
		canvas.current.set({
			lastPosX: e.e.clientX,
			lastPosY: e.e.clientY,
		});
		canvas.current.requestRenderAll();
	}, []);

	const handleMouseUp = useCallback(() => {
		canvas.current.set({
			isDragging: false,
		});
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (zoomValue === 1) {
			canvas.current.viewportTransform = [1, 0, 0, 1, 0, 0];
			canvas.current.setViewportTransform(canvas.current.viewportTransform);
			canvas.current.renderAll();
			setIsPanning(false);
			canvas.current.defaultCursor = 'default';
			canvas.current.selection = true;
		}
	}, [zoomValue]);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const canvasOverlay = canvas.current;

		if (isPanning) {
			canvasOverlay.on('mouse:down', handleMouseDown);
			canvasOverlay.on('mouse:move', handleMouseMove);
			canvasOverlay.on('mouse:up', handleMouseUp);
		}

		return () => {
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
			canvasOverlay.off('mouse:up', handleMouseUp);
		};
	}, [isPanning]);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotation !== SubMenu.FREE_HAND_ENABLED) {
			setIsPanning(false);
			canvas.current.defaultCursor = 'default';
			canvas.current.selection = true;
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
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
			canvasOverlay.off('mouse:up', handleMouseUp);
		};
	}, []);

	const handlePanMode = () => {
		if (isPanning) {
			canvas.current.defaultCursor = 'default';
			canvas.current.selection = true;
			setIsPanning(false);
			setActiveAnnotation(SubMenu.FREE_HAND_DISABLED);
		} else {
			canvas.current.defaultCursor = 'grab';
			canvas.current.selection = false;
			setIsPanning(true);
			setActiveAnnotation(SubMenu.FREE_HAND_ENABLED);
		}
	};

	const handleRedo = async () => {
		undoRedoActive.current = true;

		const existingBackgroundImage = canvas.current.backgroundImage;
		const jsonData = JSON.parse(config.canvasState[config.currentStateIndex + 1]);

		canvas.current.clear();

		if (existingBackgroundImage) {
			canvas.current.backgroundImage = existingBackgroundImage;
		} else {
			const newBackgroundImage = await FabricImage.fromURL(jsonData.backgroundImage.src);
			newBackgroundImage.flipX = jsonData.backgroundImage.flipX;
			newBackgroundImage.flipY = jsonData.backgroundImage.flipY;
			newBackgroundImage.width = jsonData.backgroundImage.width;
			newBackgroundImage.height = jsonData.backgroundImage.height;
			newBackgroundImage.scaleX = jsonData.backgroundImage.scaleX;
			newBackgroundImage.scaleY = jsonData.backgroundImage.scaleY;
			canvas.current.backgroundImage = newBackgroundImage;
		}

		if (!jsonData.clipPath) {
			canvas.current.clipPath = undefined;
		} else {
			const clipPath = new Rect({
				left: jsonData.clipPath.left,
				top: jsonData.clipPath.top,
				width: jsonData.clipPath.width * jsonData.clipPath.scaleX,
				height: jsonData.clipPath.height * jsonData.clipPath.scaleY,
				absolutePositioned: true,
			});

			canvas.current.clipPath = clipPath;
			canvas.current.renderAll();
		}

		jsonData.objects.forEach((obj: any) => {
			imageEditorShapes({
				canvas,
				shapeType: obj.shapeType,
				isNewShape: false,
				canvasData: obj,
			});
		});

		canvas.current.setDimensions({
			width: jsonData.backgroundImage.width * jsonData.backgroundImage.scaleX,
			height: jsonData.backgroundImage.height * jsonData.backgroundImage.scaleY,
		});
		canvas.current.requestRenderAll();
		undoRedoActive.current = false;

		setConfig((prevConfig) => ({
			...prevConfig,
			currentStateIndex: prevConfig.currentStateIndex + 1,
		}));
	};

	const handleUndo = async () => {
		undoRedoActive.current = true;

		const existingBackgroundImage = canvas.current.backgroundImage;
		const jsonData = JSON.parse(JSON.stringify(config.canvasState[config.currentStateIndex - 1]));

		canvas.current.clear();

		if (existingBackgroundImage) {
			canvas.current.backgroundImage = existingBackgroundImage;
		} else {
			const newBackgroundImage = await FabricImage.fromURL(jsonData.backgroundImage.src);
			newBackgroundImage.flipX = jsonData.backgroundImage.flipX;
			newBackgroundImage.flipY = jsonData.backgroundImage.flipY;
			newBackgroundImage.width = jsonData.backgroundImage.width;
			newBackgroundImage.height = jsonData.backgroundImage.height;
			newBackgroundImage.scaleX = jsonData.backgroundImage.scaleX;
			newBackgroundImage.scaleY = jsonData.backgroundImage.scaleY;
			canvas.current.backgroundImage = newBackgroundImage;
		}

		if (!jsonData.clipPath) {
			canvas.current.clipPath = undefined;
		} else {
			const clipPath = new Rect({
				left: jsonData.clipPath.left,
				top: jsonData.clipPath.top,
				width: jsonData.clipPath.width * jsonData.clipPath.scaleX,
				height: jsonData.clipPath.height * jsonData.clipPath.scaleY,
				absolutePositioned: true,
			});

			canvas.current.clipPath = clipPath;
			canvas.current.renderAll();
		}

		jsonData.objects.forEach((obj: any) => {
			imageEditorShapes({
				canvas,
				shapeType: obj.shapeType,
				isNewShape: false,
				canvasData: obj,
			});
		});

		canvas.current.setDimensions({
			width: jsonData.backgroundImage.width * jsonData.backgroundImage.scaleX,
			height: jsonData.backgroundImage.height * jsonData.backgroundImage.scaleY,
		});
		canvas.current.requestRenderAll();
		undoRedoActive.current = false;

		setConfig((prevConfig) => ({
			...prevConfig,
			currentStateIndex: prevConfig.currentStateIndex - 1,
		}));
	};

	const handleHistory = async (state: string, index: number) => {
		undoRedoActive.current = true;

		const existingBackgroundImage = canvas.current.backgroundImage;
		const jsonData = JSON.parse(JSON.stringify(state));

		canvas.current.clear();

		if (existingBackgroundImage) {
			canvas.current.backgroundImage = existingBackgroundImage;
		} else {
			const newBackgroundImage = await FabricImage.fromURL(jsonData.backgroundImage.src);
			newBackgroundImage.flipX = jsonData.backgroundImage.flipX;
			newBackgroundImage.flipY = jsonData.backgroundImage.flipY;
			newBackgroundImage.width = jsonData.backgroundImage.width;
			newBackgroundImage.height = jsonData.backgroundImage.height;
			newBackgroundImage.scaleX = jsonData.backgroundImage.scaleX;
			newBackgroundImage.scaleY = jsonData.backgroundImage.scaleY;
			canvas.current.backgroundImage = newBackgroundImage;
		}

		if (!jsonData.clipPath) {
			canvas.current.clipPath = undefined;
		} else {
			const clipPath = new Rect({
				left: jsonData.clipPath.left,
				top: jsonData.clipPath.top,
				width: jsonData.clipPath.width * jsonData.clipPath.scaleX,
				height: jsonData.clipPath.height * jsonData.clipPath.scaleY,
				absolutePositioned: true,
			});

			canvas.current.clipPath = clipPath;
			canvas.current.renderAll();
		}

		jsonData.objects.forEach((obj: any) => {
			imageEditorShapes({
				canvas,
				shapeType: obj.shapeType,
				isNewShape: false,
				canvasData: obj,
			});
		});

		canvas.current.setDimensions({
			width: jsonData.backgroundImage.width * jsonData.backgroundImage.scaleX,
			height: jsonData.backgroundImage.height * jsonData.backgroundImage.scaleY,
		});
		canvas.current.renderAll();
		undoRedoActive.current = false;

		setConfig((prevConfig) => ({
			...prevConfig,
			currentStateIndex: index,
		}));
	};

	const handleFit = () => {
		setZoomValue(1);
		if (activeAnnotation === SubMenu.FREE_HAND_ENABLED) {
			setActiveAnnotation(SubMenu.FREE_HAND_DISABLED);
		}
	};

	const detectCanvasChanges = (prevState: any, newState: any) => {
		const oldObjects = JSON.parse(JSON.stringify(prevState))?.objects || [];
		const newObjects = JSON.parse(JSON.stringify(newState))?.objects || [];

		const createdObjects: any[] = [];
		const modifiedObjects: any[] = [];
		const deletedObjects: any[] = [];

		newObjects.forEach((newObj: any) => {
			const existingObj = oldObjects.find((oldObj: any) => oldObj.id === newObj.id);

			if (!existingObj) {
				createdObjects.push(newObj);
			} else if (JSON.stringify(existingObj) !== JSON.stringify(newObj)) {
				modifiedObjects.push(newObj);
			}
		});

		oldObjects.forEach((oldObj: any) => {
			const existsInNew = newObjects.find((newObj: any) => newObj.id === oldObj.id);
			if (!existsInNew) {
				deletedObjects.push(oldObj);
			}
		});

		return { createdObjects, modifiedObjects, deletedObjects };
	};

	const history = (
		<div className='overflow-y-scroll max-h-56 w-60'>
			{config.canvasState.map((state, index) => {
				const prevState = index > 0 ? config.canvasState[index - 1] : null;
				const changes = prevState ? detectCanvasChanges(prevState, state) : null;

				return (
					<>
						<div
							key={index}
							className={`flex flex-col justify-between items-start p-1 mr-1 ${
								index === config.currentStateIndex ? 'bg-[#e6f4ff] rounded-md' : ''
							}`}
						>
							<button
								className={`custom-button ${index === config.currentStateIndex ? 'active' : ''}`}
								onClick={() => void handleHistory(state, index)}
							>
								<div className='flex w-full'>
									<div className='flex items-center'>
										<div
											className={`text-xs ${
												index === config.currentStateIndex
													? 'text-[rgba(0,0,0,0.88)] font-semibold'
													: ''
											}`}
										>
											{index + 1}.
										</div>
									</div>
									<div className='flex items-center'>
										{!changes ? (
											<div
												className={`text-xs flex flex-col items-start ${
													index === config.currentStateIndex
														? 'text-[rgba(0,0,0,0.88)] font-semibold'
														: ''
												}`}
											>
												{changes.createdObjects.length > 0 && (
													<div>
														{historyLogs[changes.createdObjects[0].shapeType]} Created
													</div>
												)}
												{changes.modifiedObjects.length > 0 && (
													<div>
														{historyLogs[changes.modifiedObjects[0].shapeType]} Modified
													</div>
												)}
												{changes.deletedObjects.length > 0 && (
													<div>
														{historyLogs[changes.deletedObjects[0].shapeType]} Deleted
													</div>
												)}
											</div>
										) : (
											<div
												className={`text-xs flex flex-col items-start ${
													index === config.currentStateIndex
														? 'text-[rgba(0,0,0,0.88)] font-semibold'
														: ''
												}`}
											>
												Initial State
											</div>
										)}
									</div>
									<div className='flex items-center justify-center'>
										{index === config.currentStateIndex && <CheckOneIcon />}
									</div>
								</div>
							</button>
						</div>
						<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
					</>
				);
			})}
		</div>
	);

	return (
		<div className='flex items-center justify-between'>
			<div className='flex justify-center items-center'>
				<div className='flex justify-center items-center gap-2'>
					<Popover content={history} disabled={config.canvasState.length === 0}>
						<button className='custom-button'>
							<HistoryIcon />
						</button>
					</Popover>
					<div className='flex border-solid border border-[#d9d9d9] rounded-full overflow-hidden'>
						<button
							className='custom-button'
							disabled={config.currentStateIndex === 0 || config.canvasState.length === 0}
							onClick={() => void handleUndo()}
						>
							<UndoIcon />
						</button>
						<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
						<button
							className='custom-button'
							disabled={
								config.currentStateIndex === config.canvasState.length - 1 ||
								config.canvasState.length === 0
							}
							onClick={() => void handleRedo()}
						>
							<RedoIcon />
						</button>
					</div>
					<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
					<div className='flex border-solid border border-[#d9d9d9] rounded-full overflow-hidden'>
						<button
							className='custom-button'
							onClick={() => setZoomValue(zoomValue + 0.1)}
							disabled={zoomValue >= 4}
						>
							<PlusIcon />
						</button>
						<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
						<button className='custom-button' onClick={handleFit} disabled={zoomValue <= 1}>
							Fit
						</button>
						<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
						<button
							className='custom-button'
							onClick={() => {
								setZoomValue(zoomValue - 0.1);
							}}
							disabled={zoomValue <= 1}
						>
							<MinusIcon />
						</button>
					</div>
					<button className='custom-button' disabled={zoomValue === 1} onClick={handlePanMode}>
						<FiveIcon />
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditorTopMenu;
