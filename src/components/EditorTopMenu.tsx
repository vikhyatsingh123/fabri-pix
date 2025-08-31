/**
 * @author Vikhyat Singh
 * Image editor for top menu
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, Point, Rect } from 'fabric';

import CheckOneIcon from '../icons/CheckOneIcon';
import FiveIcon from '../icons/FiveIcon';
import HistoryIcon from '../icons/HistoryIcon';
import MinusIcon from '../icons/MinusIcon';
import PlusIcon from '../icons/PlusIcon';
import RedoIcon from '../icons/RedoIcon';
import UndoIcon from '../icons/UndoIcon';
import imageEditorShapes from '../utils/imageEditorShapes';
import { historyLogs, SubMenu } from '../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
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
	undoRedoActive: React.RefObject<boolean>;
	stepCreatorRef: React.RefObject<{
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		stepNumber: number;
		strokeWidth: number;
	}>;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
}

const EditorTopMenu: React.FC<IProps> = (props) => {
	const { canvas, config, setConfig, undoRedoActive, stepCreatorRef, activeAnnotation, setActiveAnnotation } = props;

	const [isPanning, setIsPanning] = useState<boolean>(false);
	const [zoomValue, setZoomValue] = useState<number>(1);

	const dropdownRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const dropdown = document.getElementById('history-dropdown');
			const isDropdownOpen = dropdown?.classList.contains('show-history-dropdown');

			if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				handleHideDropdown();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const center = canvas.current.getCenterPoint();
		canvas.current.zoomToPoint(new Point(center.x, center.y), zoomValue);
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
		const jsonData = JSON.parse(JSON.parse(JSON.stringify(config.canvasState[config.currentStateIndex + 1])));

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
			if (obj.shapeType === SubMenu.STEPS_CREATOR) {
				stepCreatorRef.current.stepNumber = Number(obj.objects[1].objects[1].text) + 1;
			}
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
		const jsonData = JSON.parse(JSON.parse(JSON.stringify(config.canvasState[config.currentStateIndex - 1])));

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

		jsonData.objects?.forEach((obj: any) => {
			if (obj.shapeType === SubMenu.STEPS_CREATOR) {
				stepCreatorRef.current.stepNumber = Number(obj.objects[1].objects[1].text) + 1;
			}
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
		const jsonData = JSON.parse(JSON.parse(JSON.stringify(state)));

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
			if (obj.shapeType === SubMenu.STEPS_CREATOR) {
				stepCreatorRef.current.stepNumber = Number(obj.objects[1].objects[1].text) + 1;
			}
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
		const oldObjects = JSON.parse(JSON.parse(JSON.stringify(prevState)))?.objects || [];
		const newObjects = JSON.parse(JSON.parse(JSON.stringify(newState)))?.objects || [];

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
		<div style={{ overflowY: 'scroll', maxHeight: 224, width: 230 }}>
			{config.canvasState.map((state, index) => {
				const prevState = index > 0 ? config.canvasState[index - 1] : null;
				const changes = prevState ? detectCanvasChanges(prevState, state) : null;

				return (
					<>
						<div
							key={index}
							className='history-log'
							style={{
								backgroundColor: index === config.currentStateIndex ? '#CEEFFD' : 'transparent',
							}}
						>
							<button
								style={{
									border: 'none',
									cursor: 'pointer',
									background: 'transparent',
									paddingInline: 14,
								}}
								onClick={() => void handleHistory(state, index)}
							>
								<div
									style={{
										width: '100%',
										gap: '10px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<div
										style={{
											fontSize: 12,
											fontWeight: index === config.currentStateIndex ? 'bold' : 'normal',
										}}
									>
										{index + 1}.
									</div>
									<div>
										{changes ? (
											<div
												style={{
													fontSize: 12,
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'start',
													fontWeight: index === config.currentStateIndex ? 'bold' : 'normal',
												}}
											>
												{changes?.createdObjects.length > 0 && (
													<div>
														{
															historyLogs[
																changes.createdObjects[0]
																	.shapeType as keyof typeof historyLogs
															]
														}{' '}
														Created
													</div>
												)}
												{changes?.modifiedObjects.length > 0 && (
													<div>
														{
															historyLogs[
																changes.modifiedObjects[0]
																	.shapeType as keyof typeof historyLogs
															]
														}{' '}
														Modified
													</div>
												)}
												{changes?.deletedObjects.length > 0 && (
													<div style={{ gap: '10px' }}>
														{
															historyLogs[
																changes.deletedObjects[0]
																	.shapeType as keyof typeof historyLogs
															]
														}{' '}
														Deleted
													</div>
												)}
											</div>
										) : (
											<div
												style={{
													fontSize: 12,
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'start',
													fontWeight: index === config.currentStateIndex ? 'bold' : 'normal',
												}}
											>
												Initial State
											</div>
										)}
									</div>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											marginLeft: '6px',
										}}
									>
										{index === config.currentStateIndex && <CheckOneIcon />}
									</div>
								</div>
							</button>
						</div>
						{index !== config.canvasState.length - 1 && <hr style={{ borderTop: '1px solid #d9d9d9' }} />}
					</>
				);
			})}
		</div>
	);

	const handleShowDropdown = () => {
		document.getElementById('history-dropdown').classList.add('show-history-dropdown');
	};

	const handleHideDropdown = () => {
		document.getElementById('history-dropdown').classList.remove('show-history-dropdown');
	};

	const handleDropdownClick = () => {
		if (document.getElementById('history-dropdown').classList.contains('show-history-dropdown')) {
			handleHideDropdown();
		} else {
			handleShowDropdown();
		}
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
					<div className='dropdown' ref={dropdownRef}>
						<button
							onClick={handleDropdownClick}
							className='custom-button'
							disabled={config.canvasState.length === 0}
						>
							<HistoryIcon disabled={config.canvasState.length === 0} />
						</button>
						<div
							id='history-dropdown'
							className='dropdown-content'
							style={{ top: '40px', left: '10px', bottom: 'initial', padding: '12px' }}
						>
							{history}
						</div>
					</div>
					<button
						className='custom-button'
						disabled={config.currentStateIndex === 0 || config.canvasState.length === 0}
						onClick={() => void handleUndo()}
					>
						<UndoIcon disabled={config.currentStateIndex === 0 || config.canvasState.length === 0} />
					</button>
					<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

					<button
						className='custom-button'
						disabled={
							config.currentStateIndex === config.canvasState.length - 1 ||
							config.canvasState.length === 0
						}
						onClick={() => void handleRedo()}
					>
						<RedoIcon
							disabled={
								config.currentStateIndex === config.canvasState.length - 1 ||
								config.canvasState.length === 0
							}
						/>
					</button>
					<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />
					<button
						className='custom-button'
						onClick={() => setZoomValue(zoomValue + 0.1)}
						disabled={zoomValue >= 4}
					>
						<PlusIcon disabled={zoomValue >= 4} />
					</button>
					<button className='custom-button' onClick={handleFit} disabled={zoomValue <= 1}>
						Fit
					</button>
					<button
						className='custom-button'
						onClick={() => {
							setZoomValue(zoomValue - 0.1);
						}}
						disabled={zoomValue <= 1}
					>
						<MinusIcon disabled={zoomValue <= 1} />
					</button>
					<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />
					<button
						className={`custom-button ${activeAnnotation === SubMenu.FREE_HAND_ENABLED ? 'active' : ''}`}
						disabled={zoomValue === 1}
						onClick={handlePanMode}
					>
						<FiveIcon disabled={zoomValue === 1} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditorTopMenu;
