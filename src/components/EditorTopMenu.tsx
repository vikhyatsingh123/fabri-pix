/**
 * @author Vikhyat Singh
 * Image editor for top menu
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, Point } from 'fabric';

import CheckOneIcon from '../icons/CheckOneIcon';
import FiveIcon from '../icons/FiveIcon';
import HistoryIcon from '../icons/HistoryIcon';
import MinusIcon from '../icons/MinusIcon';
import PlusIcon from '../icons/PlusIcon';
import RedoIcon from '../icons/RedoIcon';
import UndoIcon from '../icons/UndoIcon';
import { historyLogs, SubMenu } from '../utils/utils';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

// avoid floating point drift (1 + 0.1 - 0.1 !== 1) which broke the "zoom === 1" checks
const roundZoom = (value: number) => Math.round(value * 10) / 10;

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
	restoreCanvasState: (jsonData: any) => Promise<void>;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
}

const detectCanvasChanges = (prevState: any, newState: any) => {
	const oldObjects = prevState?.objects || [];
	const newObjects = newState?.objects || [];

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

	const cropChanged = JSON.stringify(prevState?.clipPath ?? null) !== JSON.stringify(newState?.clipPath ?? null);

	return { createdObjects, modifiedObjects, deletedObjects, cropChanged, hasCrop: !!newState?.clipPath };
};

const getHistoryLabel = (shapeType: string) => historyLogs[shapeType as keyof typeof historyLogs] ?? 'Annotation';

const EditorTopMenu: React.FC<IProps> = (props) => {
	const { canvas, config, setConfig, restoreCanvasState, activeAnnotation, setActiveAnnotation } = props;

	const [isPanning, setIsPanning] = useState<boolean>(false);
	const [zoomValue, setZoomValue] = useState<number>(MIN_ZOOM);
	const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
	const [isRestoring, setIsRestoring] = useState<boolean>(false);

	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const isRestoringRef = useRef<boolean>(false);
	const panState = useRef<{ isDragging: boolean; lastPosX: number; lastPosY: number }>({
		isDragging: false,
		lastPosX: 0,
		lastPosY: 0,
	});

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsHistoryOpen(false);
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

		if (zoomValue <= MIN_ZOOM) {
			canvas.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
			setIsPanning(false);
			canvas.current.defaultCursor = 'default';
			canvas.current.selection = true;
		} else {
			const center = canvas.current.getCenterPoint();
			canvas.current.zoomToPoint(new Point(center.x, center.y), zoomValue);
		}
		canvas.current.requestRenderAll();
	}, [zoomValue]);

	const handleMouseDown = useCallback((e: any) => {
		const target = canvas.current.findTarget(e.e);

		if (target) {
			return;
		}

		panState.current = {
			isDragging: true,
			lastPosX: e.e.clientX,
			lastPosY: e.e.clientY,
		};
	}, []);

	const handleMouseMove = useCallback((e: any) => {
		if (!panState.current.isDragging) {
			return;
		}

		// relativePan goes through setViewportTransform which also updates the object coordinates,
		// mutating viewportTransform directly left the selection hit areas at the old position
		canvas.current.relativePan(
			new Point(e.e.clientX - panState.current.lastPosX, e.e.clientY - panState.current.lastPosY),
		);
		panState.current.lastPosX = e.e.clientX;
		panState.current.lastPosY = e.e.clientY;
		canvas.current.requestRenderAll();
	}, []);

	const handleMouseUp = useCallback(() => {
		panState.current.isDragging = false;
	}, []);

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
			panState.current.isDragging = false;
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

	const restoreHistoryState = async (index: number) => {
		// ignore clicks while a previous restore (which can load images) is still running
		if (isRestoringRef.current || index < 0 || index >= config.canvasState.length) {
			return;
		}

		isRestoringRef.current = true;
		setIsRestoring(true);
		try {
			await restoreCanvasState(JSON.parse(config.canvasState[index]));
			setConfig((prevConfig) => ({
				...prevConfig,
				currentStateIndex: index,
			}));
		} finally {
			isRestoringRef.current = false;
			setIsRestoring(false);
		}
	};

	const handleRedo = () => restoreHistoryState(config.currentStateIndex + 1);

	const handleUndo = () => restoreHistoryState(config.currentStateIndex - 1);

	const handleFit = () => {
		setZoomValue(MIN_ZOOM);
		if (activeAnnotation === SubMenu.FREE_HAND_ENABLED) {
			setActiveAnnotation(SubMenu.FREE_HAND_DISABLED);
		}
	};

	// parsing every state is expensive, only do it while the history dropdown is visible
	const historyChanges = useMemo(() => {
		if (!isHistoryOpen) {
			return [];
		}
		const parsedStates = config.canvasState.map((state) => JSON.parse(state));
		return parsedStates.map((state, index) =>
			index > 0 ? detectCanvasChanges(parsedStates[index - 1], state) : null,
		);
	}, [config.canvasState, isHistoryOpen]);

	const history = (
		<div style={{ overflowY: 'scroll', maxHeight: 224, width: 230 }}>
			{historyChanges.map((changes, index) => {
				return (
					<React.Fragment key={index}>
						<div
							className='history-log'
							style={{
								backgroundColor: index === config.currentStateIndex ? '#CEEFFD' : 'transparent',
							}}
						>
							<button
								type='button'
								style={{
									border: 'none',
									cursor: 'pointer',
									background: 'transparent',
									paddingInline: 14,
								}}
								disabled={isRestoring}
								onClick={() => void restoreHistoryState(index)}
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
												{changes.createdObjects.length > 0 && (
													<div>
														{getHistoryLabel(changes.createdObjects[0].shapeType)} Created
													</div>
												)}
												{changes.modifiedObjects.length > 0 && (
													<div>
														{getHistoryLabel(changes.modifiedObjects[0].shapeType)} Modified
													</div>
												)}
												{changes.deletedObjects.length > 0 && (
													<div style={{ gap: '10px' }}>
														{getHistoryLabel(changes.deletedObjects[0].shapeType)} Deleted
													</div>
												)}
												{changes.cropChanged && (
													<div>{changes.hasCrop ? 'Crop Applied' : 'Crop Removed'}</div>
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
					</React.Fragment>
				);
			})}
		</div>
	);

	const isUndoDisabled = isRestoring || config.currentStateIndex <= 0 || config.canvasState.length === 0;
	const isRedoDisabled =
		isRestoring || config.currentStateIndex >= config.canvasState.length - 1 || config.canvasState.length === 0;

	return (
		<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
					<div className='dropdown' ref={dropdownRef}>
						<button
							type='button'
							onClick={() => setIsHistoryOpen((open) => !open)}
							className='custom-button'
							disabled={config.canvasState.length === 0}
						>
							<HistoryIcon disabled={config.canvasState.length === 0} />
						</button>
						<div
							className={`dropdown-content ${isHistoryOpen ? 'show-history-dropdown' : ''}`}
							style={{ top: '40px', left: '10px', bottom: 'initial', padding: '12px' }}
						>
							{isHistoryOpen && history}
						</div>
					</div>
					<button
						type='button'
						className='custom-button'
						disabled={isUndoDisabled}
						onClick={() => void handleUndo()}
					>
						<UndoIcon disabled={isUndoDisabled} />
					</button>
					<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

					<button
						type='button'
						className='custom-button'
						disabled={isRedoDisabled}
						onClick={() => void handleRedo()}
					>
						<RedoIcon disabled={isRedoDisabled} />
					</button>
					<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />
					<button
						type='button'
						className='custom-button'
						onClick={() => setZoomValue((zoom) => Math.min(MAX_ZOOM, roundZoom(zoom + ZOOM_STEP)))}
						disabled={zoomValue >= MAX_ZOOM}
					>
						<PlusIcon disabled={zoomValue >= MAX_ZOOM} />
					</button>
					<button
						type='button'
						className='custom-button'
						onClick={handleFit}
						disabled={zoomValue <= MIN_ZOOM}
					>
						Fit
					</button>
					<button
						type='button'
						className='custom-button'
						onClick={() => setZoomValue((zoom) => Math.max(MIN_ZOOM, roundZoom(zoom - ZOOM_STEP)))}
						disabled={zoomValue <= MIN_ZOOM}
					>
						<MinusIcon disabled={zoomValue <= MIN_ZOOM} />
					</button>
					<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />
					<button
						type='button'
						className={`custom-button ${activeAnnotation === SubMenu.FREE_HAND_ENABLED ? 'active' : ''}`}
						disabled={zoomValue <= MIN_ZOOM}
						onClick={handlePanMode}
					>
						<FiveIcon disabled={zoomValue <= MIN_ZOOM} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditorTopMenu;
