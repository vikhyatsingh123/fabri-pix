/**
 * @author Vikhyat Singh
 * @description Built-in tools and the default menus
 */

import React from 'react';

import AdjustIcon from '../icons/AdjustIcon';
import FilterIcon from '../icons/FilterIcon';
import ResizeIcon from '../icons/ResizeIcon';
import SubtractSelectionIcon from '../icons/SubtractSelectionIcon';
import TailoringIcon from '../icons/TailoringIcon';
import TransformIcon from '../icons/TransformIcon';
import WriteIcon from '../icons/WriteIcon';
import type { MenuDefinition, ToolDefinition } from '../core/types';
import { arrowTool, lineTool, pathTool, stepsTool } from './drawing';
import { adjustTool, cropTool, filterTool, redactTool, resizeTool, transformTool } from './image';
import {
	arrowShapeTool,
	circleTool,
	commentTool,
	iconTool,
	imageTool,
	rectangleTool,
	starTool,
	triangleTool,
} from './shapes';
import { drawTool, emojiTool, textTool } from './text';

export { arrowTool, lineTool, pathTool, stepsTool, StepsPanel, StrokePanel } from './drawing';
export type { StepsOptions, StrokeOptions } from './drawing';
export {
	AdjustPanel,
	adjustTool,
	applyCropMask,
	CropPanel,
	cropTool,
	FilterPanel,
	filterTool,
	redactTool,
	ResizePanel,
	resizeTool,
	TransformPanel,
	transformTool,
} from './image';
export type { CropOptions, CropRatio, ResizeOptions } from './image';
export {
	ArrowShapePanel,
	arrowShapeTool,
	circleTool,
	CommentPanel,
	commentTool,
	defaultIconLibrary,
	IconPanel,
	iconTool,
	IconToolButton,
	imageTool,
	rectangleTool,
	ShapesPanel,
	starTool,
	triangleTool,
} from './shapes';
export type {
	ArrowShapeOptions,
	CircleOptions,
	CommentOptions,
	IconOptions,
	IconShape,
	ImageToolOptions,
	TriangleOptions,
	RectangleOptions,
	ShapeOptions,
} from './shapes';
export { DrawPanel, drawTool, EmojiToolButton, emojiTool, TextPanel, textTool } from './text';
export type { DrawOptions, EmojiOptions, TextOptions } from './text';
export { createCursorCache, followCursor, placeOnClick, usePanel } from './shared';

export const builtInTools: ToolDefinition<any>[] = [
	stepsTool,
	rectangleTool,
	circleTool,
	triangleTool,
	arrowShapeTool,
	starTool,
	commentTool,
	imageTool,
	iconTool,
	emojiTool,
	textTool,
	drawTool,
	lineTool,
	arrowTool,
	pathTool,
	cropTool,
	transformTool,
	resizeTool,
	adjustTool,
	filterTool,
	redactTool,
];

export const defaultMenus: MenuDefinition[] = [
	{
		id: 'annotate',
		label: 'Annotate',
		icon: <WriteIcon />,
		tools: [
			'steps',
			{
				id: 'shapes',
				label: 'Shapes',
				tools: ['rectangle', 'circle', 'triangle', 'arrowShape', 'star', 'comment', 'image'],
			},
			'icon',
			'emoji',
			'text',
			'draw',
			'line',
			'arrow',
			'path',
		],
	},
	{ id: 'crop', label: 'Crop', icon: <TailoringIcon />, tools: ['crop'], defaultTool: 'crop' },
	{ id: 'transform', label: 'Rotate', icon: <TransformIcon />, tools: ['transform'], defaultTool: 'transform' },
	{ id: 'resize', label: 'Resize', icon: <ResizeIcon />, tools: ['resize'], defaultTool: 'resize' },
	{ id: 'adjust', label: 'Adjust', icon: <AdjustIcon />, tools: ['adjust'], defaultTool: 'adjust' },
	{ id: 'filter', label: 'Filter', icon: <FilterIcon />, tools: ['filter'], defaultTool: 'filter' },
	{ id: 'redact', label: 'Redact', icon: <SubtractSelectionIcon />, tools: ['redact'], defaultTool: 'redact' },
];
