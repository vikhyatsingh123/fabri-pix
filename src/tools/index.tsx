/**
 * @author Vikhyat Singh
 * @description Built-in tools and the default menus
 */

import React from 'react';

import SubtractSelectionIcon from '../icons/SubtractSelectionIcon';
import TailoringIcon from '../icons/TailoringIcon';
import WriteIcon from '../icons/WriteIcon';
import type { MenuDefinition, ToolDefinition } from '../core/types';
import { arrowTool, pathTool, stepsTool } from './drawing';
import { cropTool, redactTool } from './image';
import { arrowShapeTool, circleTool, commentTool, imageTool, rectangleTool, starTool } from './shapes';
import { drawTool, emojiTool, textTool } from './text';

export { arrowTool, pathTool, stepsTool, StepsPanel, StrokePanel } from './drawing';
export type { StepsOptions, StrokeOptions } from './drawing';
export { applyCropMask, cropTool, redactTool } from './image';
export {
	ArrowShapePanel,
	arrowShapeTool,
	circleTool,
	CommentPanel,
	commentTool,
	imageTool,
	rectangleTool,
	ShapesPanel,
	starTool,
} from './shapes';
export type {
	ArrowShapeOptions,
	CircleOptions,
	CommentOptions,
	ImageToolOptions,
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
	arrowShapeTool,
	starTool,
	commentTool,
	imageTool,
	emojiTool,
	textTool,
	drawTool,
	arrowTool,
	pathTool,
	cropTool,
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
				tools: ['rectangle', 'circle', 'arrowShape', 'star', 'comment', 'image'],
			},
			'emoji',
			'text',
			'draw',
			'arrow',
			'path',
		],
	},
	{ id: 'crop', label: 'Crop', icon: <TailoringIcon />, tools: ['crop'], defaultTool: 'crop' },
	{ id: 'redact', label: 'Redact', icon: <SubtractSelectionIcon />, tools: ['redact'], defaultTool: 'redact' },
];
