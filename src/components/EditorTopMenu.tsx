/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Image editor for top menu
 */

import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { Canvas, FabricImage, Point, Rect } from 'fabric';
import { CheckOne, Five, History, Minus, Plus, Redo, Undo } from '@icon-park/react';
import { Tooltip, Button, Popover, Divider, Col, Row } from 'antd';

import imageEditorShapes from '../utils/imageEditorShapes';
import { historyLogs, SubMenu } from '../utils/utils';
import { useActiveAnnotation, useImageEditorActions } from '../store/ImageEditorStore';

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
		if (!_.get(canvas.current, 'isDragging')) {
			return;
		}
		const vpt = canvas.current.viewportTransform;
		vpt[4] += e.e.clientX - _.get(canvas.current, 'lastPosX', 0);
		vpt[5] += e.e.clientY - _.get(canvas.current, 'lastPosY', 0);
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

		if (_.isUndefined(jsonData.clipPath)) {
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

		_.forEach(jsonData.objects, (obj) => {
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
		const jsonData = JSON.parse(_.cloneDeep(config.canvasState[config.currentStateIndex - 1]));

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

		_.forEach(jsonData.objects, (obj) => {
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
		const jsonData = JSON.parse(_.cloneDeep(state));

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

		_.forEach(jsonData.objects, (obj) => {
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
		const oldObjects = JSON.parse(_.cloneDeep(prevState))?.objects || [];
		const newObjects = JSON.parse(_.cloneDeep(newState))?.objects || [];

		const createdObjects = [];
		const modifiedObjects = [];
		const deletedObjects = [];

		newObjects.forEach((newObj) => {
			const existingObj = oldObjects.find((oldObj) => oldObj.id === newObj.id);

			if (!existingObj) {
				createdObjects.push(newObj);
			} else if (JSON.stringify(existingObj) !== JSON.stringify(newObj)) {
				modifiedObjects.push(newObj);
			}
		});

		oldObjects.forEach((oldObj) => {
			const existsInNew = newObjects.find((newObj) => newObj.id === oldObj.id);
			if (!existsInNew) {
				deletedObjects.push(oldObj);
			}
		});

		return { createdObjects, modifiedObjects, deletedObjects };
	};

	const history = (
		<div className='overflow-y-scroll max-h-56 w-60'>
			{_.map(config.canvasState, (state, index) => {
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
							<Button
								type='text'
								className={`w-full ${index === config.currentStateIndex ? 'hover:!bg-[#e6f4ff]' : ''}`}
								onClick={() => void handleHistory(state, index)}
							>
								<Row className='w-full'>
									<Col span={3} className='flex items-center'>
										<div
											className={`text-xs ${index === config.currentStateIndex ? 'text-[rgba(0,0,0,0.88)] font-semibold' : ''}`}
										>
											{index + 1}.
										</div>
									</Col>
									<Col span={17}>
										{!_.isNull(changes) ? (
											<div
												className={`text-xs flex flex-col items-start ${index === config.currentStateIndex ? 'text-[rgba(0,0,0,0.88)] font-semibold' : ''}`}
											>
												{changes.createdObjects.length > 0 && (
													<div>{historyLogs[changes.createdObjects[0].shapeType]} Created</div>
												)}
												{changes.modifiedObjects.length > 0 && (
													<div>{historyLogs[changes.modifiedObjects[0].shapeType]} Modified</div>
												)}
												{changes.deletedObjects.length > 0 && (
													<div>{historyLogs[changes.deletedObjects[0].shapeType]} Deleted</div>
												)}
											</div>
										) : (
											<div
												className={`text-xs flex flex-col items-start ${index === config.currentStateIndex ? 'text-[rgba(0,0,0,0.88)] font-semibold' : ''}`}
											>
												Initial State
											</div>
										)}
									</Col>
									<Col span={4} className='flex items-center justify-center'>
										{index === config.currentStateIndex && <CheckOne fill={'green'} />}
									</Col>
								</Row>
							</Button>
						</div>
						<Divider className='mx-0 my-1' />
					</>
				);
			})}
		</div>
	);

	return (
		<div className='flex items-center justify-between'>
			<div className='flex justify-center items-center'>
				<div className='flex justify-center items-center gap-2'>
					<Tooltip title='History Logs'>
						<Popover content={history} trigger='click'>
							<Button
								icon={<History />}
								shape='circle'
								size='small'
								type='text'
								className='border-solid border-1 border-[#d9d9d9]'
								disabled={_.isEmpty(config.canvasState)}
							/>
						</Popover>
					</Tooltip>
					<div className='flex border-solid border border-[#d9d9d9] rounded-full overflow-hidden'>
						<Tooltip title='Undo'>
							<Button
								icon={<Undo />}
								type='text'
								size='small'
								className='!px-5'
								disabled={config.currentStateIndex === 0 || _.isEmpty(config.canvasState)}
								onClick={() => void handleUndo()}
							/>
						</Tooltip>
						<Divider type='vertical' className='h-auto m-0 bg-[#d9d9d9]' />
						<Tooltip title='Redo'>
							<Button
								icon={<Redo />}
								type='text'
								size='small'
								className='!px-5'
								disabled={config.currentStateIndex === _.size(config.canvasState) - 1 || _.isEmpty(config.canvasState)}
								onClick={() => void handleRedo()}
							/>
						</Tooltip>
					</div>
					<Divider type='vertical' className='h-6 m-0 bg-[#d9d9d9]' />
					<div className='flex border-solid border border-[#d9d9d9] rounded-full overflow-hidden'>
						<Tooltip title='Zoom in'>
							<Button
								onClick={() => setZoomValue(zoomValue + 0.1)}
								disabled={zoomValue >= 4}
								size='small'
								className={'border-none'}
								type='text'
								icon={<Plus />}
							/>
						</Tooltip>
						<Divider type='vertical' className='h-auto m-0 bg-[#d9d9d9]' />
						<Tooltip title='Fit'>
							<Button onClick={handleFit} size='small' className={'border-none text-xs'} type='text'>
								Fit
							</Button>
						</Tooltip>
						<Divider type='vertical' className='h-auto m-0 bg-[#d9d9d9]' />
						<Tooltip title='Zoom out'>
							<Button
								onClick={() => {
									setZoomValue(zoomValue - 0.1);
								}}
								size='small'
								disabled={zoomValue <= 1}
								className={'border-none'}
								shape='circle'
								type='text'
								icon={<Minus />}
							/>
						</Tooltip>
					</div>
					<Tooltip title='Free hand'>
						<Button
							disabled={zoomValue === 1}
							icon={<Five />}
							size='small'
							type={isPanning ? 'primary' : 'text'}
							className='border-solid border-1 border-[#d9d9d9]'
							shape='circle'
							onClick={handlePanMode}
						/>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

export default EditorTopMenu;
