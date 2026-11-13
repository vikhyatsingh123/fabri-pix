/**
 * @author Vikhyat Singh
 * @description Tools which change the photo itself: crop, rotate / flip, filters and redact
 */

import React from 'react';
import { Canvas, Rect } from 'fabric';

import FilterIcon from '../icons/FilterIcon';
import SubtractSelectionIcon from '../icons/SubtractSelectionIcon';
import TailoringIcon from '../icons/TailoringIcon';
import TransformIcon from '../icons/TransformIcon';
import type { ImageEditorController } from '../core/controller';
import { applyBlurEffect } from '../core/shapeFactory';
import { cropOverlayShapeTypes, generateId, ShapeType } from '../core/constants';
import type { ToolDefinition, ToolPanelProps } from '../core/types';
import { useEditorUI } from '../react/context';
import { Divider, Field } from '../react/ui';

export interface CropRatio {
	label: string;
	/** width / height, `null` = free */
	value: number | null;
}

export interface CropOptions {
	/** active aspect ratio (width / height), `null` = free */
	ratio: number | null;
	/** ratios offered in the crop panel */
	ratios: CropRatio[];
}

const findCropRect = (canvas: Canvas) =>
	canvas.getObjects().find((obj: any) => obj.shapeType === ShapeType.CROP_RECTANGLE) as Rect | undefined;

const findOverlays = (canvas: Canvas) =>
	canvas.getObjects().filter((obj: any) => cropOverlayShapeTypes.includes(obj.shapeType)) as Rect[];

/** converts the crop rectangle into the canvas clip path, returns false when there is nothing to apply */
export const applyCropMask = (canvas: Canvas): boolean => {
	const cropRect = findCropRect(canvas);
	if (!canvas.backgroundImage || !cropRect) {
		return false;
	}
	// no random id here, re-applying the same crop must serialize identically
	canvas.clipPath = new Rect({
		left: cropRect.left,
		top: cropRect.top,
		width: cropRect.width * cropRect.scaleX,
		height: cropRect.height * cropRect.scaleY,
		absolutePositioned: true,
	});
	canvas.remove(...findOverlays(canvas), cropRect);
	canvas.requestRenderAll();
	return true;
};

// lets the crop panel cancel the running crop session
const cropSessions = new WeakMap<Canvas, { cancel: () => void }>();

/** leaves the current menu (applies the crop), or deactivates the tool when there is no other menu */
const leaveMenu = (editor: ImageEditorController) => {
	const current = editor.getState().activeMenu;
	const next = editor.getMenus().find((menu) => menu.id !== current);
	if (next) {
		editor.setMenu(next.id);
	} else {
		editor.setActiveTool(null);
	}
};

export const CropPanel: React.FC<ToolPanelProps<CropOptions>> = (props) => {
	const { editor, options, setOptions } = props;
	const ui = useEditorUI();
	const { Button } = ui.components;
	const { labels, icons } = ui;

	const ratioLabel = (ratio: CropRatio) =>
		ratio.value === null ? labels.ratioCustom : ratio.value === 1 ? labels.ratioSquare : ratio.label;

	return (
		<>
			<Field label={labels.ratio}>
				{(options.ratios ?? []).map((ratio) => (
					<Button
						key={ratio.label}
						active={options.ratio === ratio.value}
						onClick={() => setOptions({ ratio: ratio.value })}
					>
						{ratioLabel(ratio)}
					</Button>
				))}
			</Field>
			<Divider />
			<Button
				onClick={() => {
					if (editor.canvas) {
						cropSessions.get(editor.canvas)?.cancel();
					}
					leaveMenu(editor);
				}}
			>
				{icons.cancel}
				<span>{labels.cancel}</span>
			</Button>
			<Button onClick={() => leaveMenu(editor)}>
				{icons.check}
				<span>{labels.apply}</span>
			</Button>
		</>
	);
};

export const cropTool: ToolDefinition<CropOptions> = {
	id: 'crop',
	label: 'Crop',
	icon: <TailoringIcon />,
	shapeTypes: [ShapeType.CROP_RECTANGLE],
	defaultOptions: {
		ratio: null,
		ratios: [
			{ label: 'Custom', value: null },
			{ label: 'Square', value: 1 },
			{ label: '3:2', value: 3 / 2 },
			{ label: '4:3', value: 4 / 3 },
			{ label: '5:4', value: 5 / 4 },
			{ label: '7:5', value: 7 / 5 },
			{ label: '16:9', value: 16 / 9 },
		],
	},
	activate: (context) => {
		const { canvas, editor } = context;
		let drawing = false;
		let cancelled = false;
		let start = { x: 0, y: 0 };
		let ratio = context.options.ratio;

		const clipPath = canvas.clipPath;
		const originalClip = clipPath
			? {
					left: clipPath.left,
					top: clipPath.top,
					width: clipPath.width * clipPath.scaleX,
					height: clipPath.height * clipPath.scaleY,
				}
			: null;

		const scene = () => editor.getSceneSize();
		const addCropRect = (left: number, top: number, width: number, height: number) => {
			void editor.addShape(ShapeType.CROP_RECTANGLE, {
				left,
				top,
				width,
				height,
				sceneWidth: scene().width,
				sceneHeight: scene().height,
			});
			const rect = findCropRect(canvas);
			// with a fixed ratio only the corners (which scale uniformly) are shown
			rect?.setControlsVisibility({ mt: !ratio, mb: !ratio, ml: !ratio, mr: !ratio });
			return rect;
		};

		const updateOverlays = (rect: Rect) => {
			const { width: sceneWidth, height: sceneHeight } = scene();
			const left = rect.left;
			const top = rect.top;
			const width = rect.getScaledWidth();
			const height = rect.getScaledHeight();
			const areas: Record<string, Partial<Rect>> = {
				[ShapeType.CROP_GREYED_TOP]: { left: 0, top: 0, width: sceneWidth, height: top },
				[ShapeType.CROP_GREYED_LEFT]: { left: 0, top, width: left, height },
				[ShapeType.CROP_GREYED_RIGHT]: { left: left + width, top, width: sceneWidth - (left + width), height },
				[ShapeType.CROP_GREYED_BOTTOM]: {
					left: 0,
					top: top + height,
					width: sceneWidth,
					height: sceneHeight - (top + height),
				},
			};
			findOverlays(canvas).forEach((overlay: any) => {
				overlay.set(areas[overlay.shapeType]);
				overlay.setCoords();
			});
			canvas.requestRenderAll();
		};

		// the largest crop with the ratio, centered
		const createCenteredCrop = () => {
			if (!ratio) {
				return;
			}
			const previous = findCropRect(canvas);
			if (previous) {
				editor.deleteObject(previous);
			}
			const { width: sceneWidth, height: sceneHeight } = scene();
			const width = Math.min(sceneWidth * 0.9, sceneHeight * 0.9 * ratio);
			const height = width / ratio;
			const rect = addCropRect((sceneWidth - width) / 2, (sceneHeight - height) / 2, width, height);
			if (rect) {
				updateOverlays(rect);
				canvas.setActiveObject(rect);
			}
		};

		// an applied crop becomes editable again
		if (!findCropRect(canvas) && originalClip) {
			const rect = addCropRect(originalClip.left, originalClip.top, originalClip.width, originalClip.height);
			canvas.clipPath = undefined;
			if (rect) {
				updateOverlays(rect);
			}
		} else if (!findCropRect(canvas) && ratio) {
			createCenteredCrop();
		}

		context.setSelectionEnabled(false);
		context.setCursor('crosshair');
		const existing = findCropRect(canvas);
		if (existing) {
			canvas.setActiveObject(existing);
		}
		canvas.requestRenderAll();

		context.onOptionsChange((options) => {
			if (options.ratio === ratio) {
				return;
			}
			ratio = options.ratio;
			if (ratio) {
				createCenteredCrop();
			} else {
				findCropRect(canvas)?.setControlsVisibility({ mt: true, mb: true, ml: true, mr: true });
				canvas.requestRenderAll();
			}
		});

		context.on('mouse:down', (event: any) => {
			if (drawing || canvas.findTarget(event.e)) {
				return;
			}
			const previous = findCropRect(canvas);
			if (previous) {
				editor.deleteObject(previous);
			}
			const point = canvas.getScenePoint(event.e);
			start = { x: point.x, y: point.y };
			addCropRect(point.x, point.y, 0, 0);
			drawing = true;
		});

		context.on('mouse:move', (event: any) => {
			const rect = findCropRect(canvas);
			if (!drawing || !rect) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			const dx = point.x - start.x;
			const dy = point.y - start.y;
			const width = Math.abs(dx);
			const height = ratio ? width / ratio : Math.abs(dy);
			rect.set({
				left: dx < 0 ? start.x - width : start.x,
				top: dy < 0 ? start.y - height : start.y,
				width,
				height,
			});
			rect.setCoords();
			updateOverlays(rect);
		});

		context.on('mouse:up', () => {
			const rect = findCropRect(canvas);
			if (!drawing || !rect) {
				return;
			}
			drawing = false;
			if (rect.width === 0 || rect.height === 0) {
				// a click without dragging, drop the empty crop rectangle together with its overlays
				editor.deleteObject(rect);
			} else {
				updateOverlays(rect);
				canvas.setActiveObject(rect);
			}
			canvas.requestRenderAll();
		});

		const removeCropUI = () => {
			const rect = findCropRect(canvas);
			canvas.remove(...findOverlays(canvas), ...(rect ? [rect] : []));
		};

		cropSessions.set(canvas, {
			cancel: () => {
				cancelled = true;
				removeCropUI();
				canvas.clipPath = originalClip ? new Rect({ ...originalClip, absolutePositioned: true }) : undefined;
				canvas.requestRenderAll();
			},
		});

		return (reason) => {
			if (reason === 'pause') {
				return;
			}
			cropSessions.delete(canvas);
			if (reason === 'switch' && !cancelled) {
				applyCropMask(canvas);
				// the crop rectangle itself is not tracked, record the applied (or removed) crop
				editor.commit();
				return;
			}
			removeCropUI();
		};
	},
	OptionsPanel: CropPanel,
};

export const TransformPanel: React.FC<ToolPanelProps> = (props) => {
	const { editor } = props;
	const ui = useEditorUI();
	const { Button, Slider, NumberInput } = ui.components;
	const { labels, icons } = ui;
	const rotation = editor.getImageRotation();
	// shown as -180 ... 180
	const angle = Math.round(rotation > 180 ? rotation - 360 : rotation);

	const resetTransform = () => {
		const flip = editor.getImageFlip();
		if (flip.horizontal) {
			editor.flipImage('horizontal', { commit: false });
		}
		if (flip.vertical) {
			editor.flipImage('vertical', { commit: false });
		}
		editor.setImageRotation(0);
	};

	return (
		<>
			<Button title={labels.rotateLeft} aria-label={labels.rotateLeft} onClick={() => editor.rotateImage(-90)}>
				{icons.rotateLeft}
			</Button>
			<Button title={labels.rotateRight} aria-label={labels.rotateRight} onClick={() => editor.rotateImage(90)}>
				{icons.rotateRight}
			</Button>
			<Divider />
			<Field label={labels.rotation}>
				<Slider
					aria-label={labels.rotation}
					min={-180}
					max={180}
					value={angle}
					// rotates live while dragging, one history entry once released
					onChange={(value) => editor.setImageRotation(value, { commit: false })}
					onChangeComplete={() => editor.commit()}
				/>
				<NumberInput
					aria-label={labels.rotation}
					min={-360}
					max={360}
					value={angle}
					onChange={(value) => editor.setImageRotation(value)}
				/>
			</Field>
			<Divider />
			<Button
				title={labels.flipHorizontal}
				aria-label={labels.flipHorizontal}
				onClick={() => editor.flipImage('horizontal')}
			>
				{icons.flipHorizontal}
			</Button>
			<Button
				title={labels.flipVertical}
				aria-label={labels.flipVertical}
				onClick={() => editor.flipImage('vertical')}
			>
				{icons.flipVertical}
			</Button>
			<Divider />
			<Button onClick={resetTransform}>{labels.resetImage}</Button>
		</>
	);
};

export const transformTool: ToolDefinition = {
	id: 'transform',
	label: 'Rotate & Flip',
	icon: <TransformIcon />,
	// the panel works on the photo, objects can't be selected meanwhile
	activate: (context) => context.setInteractive(false),
	OptionsPanel: TransformPanel,
};

export const FilterPanel: React.FC<ToolPanelProps> = (props) => {
	const { editor } = props;
	const ui = useEditorUI();
	const { Button, Slider, ColorPicker, Select } = ui.components;
	const active = editor.getImageFilters();

	return (
		<div {...ui.slot('filterList')}>
			{editor.getFilterDefinitions().map((filter) => {
				const options = active[filter.id];
				const label = ui.filterLabel(filter);
				const change = (key: string, value: unknown, commit: boolean) =>
					editor.setImageFilter(filter.id, { [key]: value }, { commit });

				return (
					<div key={filter.id} className='fp-filter'>
						<Button
							active={!!options}
							onClick={() => editor.setImageFilter(filter.id, options ? null : {})}
						>
							{label}
						</Button>
						{options &&
							filter.controls?.map((control) => {
								const value = options[control.key];
								const ariaLabel = `${label} ${control.key}`;
								if (control.type === 'color') {
									return (
										<ColorPicker
											key={control.key}
											aria-label={ariaLabel}
											value={value}
											onChange={(color) => change(control.key, color, false)}
											onChangeComplete={() => editor.commit()}
										/>
									);
								}
								if (control.type === 'select') {
									return (
										<Select
											key={control.key}
											aria-label={ariaLabel}
											value={value}
											options={(control.options ?? []).map((option) => ({ value: option, label: option }))}
											onChange={(option) => change(control.key, option, true)}
										/>
									);
								}
								return (
									<Slider
										key={control.key}
										aria-label={ariaLabel}
										min={control.min ?? 0}
										max={control.max ?? 1}
										step={control.step ?? 0.01}
										value={value}
										onChange={(number) => change(control.key, number, false)}
										onChangeComplete={() => editor.commit()}
									/>
								);
							})}
					</div>
				);
			})}
			{Object.keys(active).length > 0 && (
				<Button danger onClick={() => editor.clearImageFilters()}>
					{ui.labels.clearFilters}
				</Button>
			)}
		</div>
	);
};

export const filterTool: ToolDefinition = {
	id: 'filter',
	label: 'Filter',
	icon: <FilterIcon />,
	activate: (context) => context.setInteractive(false),
	OptionsPanel: FilterPanel,
};

export const redactTool: ToolDefinition = {
	id: 'redact',
	label: 'Redact',
	icon: <SubtractSelectionIcon />,
	shapeTypes: [ShapeType.BLUR],
	activate: (context) => {
		const { canvas, editor } = context;
		let rect: Rect | undefined;
		let start = { x: 0, y: 0 };

		// otherwise fabric draws its selection box on top of the blur rectangle being drawn
		context.setSelectionEnabled(false);
		context.setCursor('crosshair');
		canvas.discardActiveObject();
		canvas.requestRenderAll();

		context.on('mouse:down', (event: any) => {
			if (rect || canvas.findTarget(event.e)) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			const id = generateId();
			start = { x: point.x, y: point.y };
			// created through the shape definition directly: the area is recorded once it is drawn
			void editor
				.getShape(ShapeType.BLUR)
				?.create?.({ id, left: point.x, top: point.y, width: 0, height: 0 }, { editor, canvas });
			rect = canvas.getObjects().find((obj: any) => obj.id === id) as Rect | undefined;
		});

		context.on('mouse:move', (event: any) => {
			if (!rect) {
				return;
			}
			const point = canvas.getScenePoint(event.e);
			rect.set({
				left: Math.min(start.x, point.x),
				top: Math.min(start.y, point.y),
				width: Math.abs(point.x - start.x),
				height: Math.abs(point.y - start.y),
			});
			canvas.requestRenderAll();
		});

		context.on('mouse:up', () => {
			if (!rect) {
				return;
			}
			const drawn = rect;
			rect = undefined;
			if (drawn.width === 0 || drawn.height === 0) {
				canvas.remove(drawn);
			} else {
				drawn.setCoords();
				applyBlurEffect({ current: canvas }, drawn);
				editor.commit();
			}
			canvas.requestRenderAll();
		});

		return () => {
			if (rect) {
				canvas.remove(rect);
				rect = undefined;
			}
		};
	},
};
