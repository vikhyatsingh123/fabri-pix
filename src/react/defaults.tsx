/**
 * @author Vikhyat Singh
 * @description Default texts and icons of the editor UI
 */

import React from 'react';

import AddTextIcon from '../icons/AddTextIcon';
import AlignTextCenterIcon from '../icons/AlignTextCenterIcon';
import AlignTextLeftIcon from '../icons/AlignTextLeftIcon';
import AlignTextRightIcon from '../icons/AlignTextRightIcon';
import BackgroundColorIcon from '../icons/BackgroundColorIcon';
import CancelIcon from '../icons/CancelIcon';
import CheckOneIcon from '../icons/CheckOneIcon';
import ClearIcon from '../icons/ClearIcon';
import BringForwardIcon from '../icons/BringForwardIcon';
import BringToFrontIcon from '../icons/BringToFrontIcon';
import DashedIcon from '../icons/DashedIcon';
import DeleteIcon from '../icons/DeleteIcon';
import DuplicateIcon from '../icons/DuplicateIcon';
import LockIcon from '../icons/LockIcon';
import SendBackwardIcon from '../icons/SendBackwardIcon';
import SendToBackIcon from '../icons/SendToBackIcon';
import ShadowIcon from '../icons/ShadowIcon';
import FlipHorizontalIcon from '../icons/FlipHorizontalIcon';
import FlipVerticalIcon from '../icons/FlipVerticalIcon';
import LoadIcon from '../icons/LoadIcon';
import RotateLeftIcon from '../icons/RotateLeftIcon';
import RotateRightIcon from '../icons/RotateRightIcon';
import StrikethroughIcon from '../icons/StrikethroughIcon';
import UnderlineIcon from '../icons/UnderlineIcon';
import DownOneIcon from '../icons/DownOneIcon';
import ExportJsonIcon from '../icons/ExportJsonIcon';
import FiveIcon from '../icons/FiveIcon';
import HandleRoundIcon from '../icons/HandleRoundIcon';
import HistoryIcon from '../icons/HistoryIcon';
import ListNumbersIcon from '../icons/ListNumbersIcon';
import MinusIcon from '../icons/MinusIcon';
import PlusIcon from '../icons/PlusIcon';
import RedoIcon from '../icons/RedoIcon';
import SaveIcon from '../icons/SaveIcon';
import TextBoldIcon from '../icons/TextBoldIcon';
import TextItalicIcon from '../icons/TextItalicIcon';
import UndoIcon from '../icons/UndoIcon';
import type { EditorIcons, EditorLabels } from './types';

export const defaultLabels: EditorLabels = {
	undo: 'Undo',
	redo: 'Redo',
	history: 'History',
	zoomIn: 'Zoom in',
	zoomOut: 'Zoom out',
	fit: 'Fit',
	pan: 'Pan',
	reset: 'Reset',
	cancel: 'Cancel',
	save: 'Save',
	exportJson: 'Export JSON',
	delete: 'Delete',
	more: 'options',
	fill: 'Fill',
	stroke: 'Stroke',
	text: 'Text',
	size: 'Size',
	bold: 'Bold',
	italic: 'Italic',
	alignLeft: 'Align left',
	alignCenter: 'Align center',
	alignRight: 'Align right',
	stepNumber: 'Step Number',
	emoji: 'Emoji',
	initialState: 'Initial State',
	created: 'Created',
	modified: 'Modified',
	deleted: 'Deleted',
	cropApplied: 'Crop Applied',
	cropRemoved: 'Crop Removed',
	imageEdited: 'Image Edited',
	loading: 'Loading...',
	underline: 'Underline',
	strikethrough: 'Strikethrough',
	font: 'Font',
	color: 'Color',
	rotateLeft: 'Rotate left',
	rotateRight: 'Rotate right',
	rotation: 'Angle',
	flipHorizontal: 'Flip horizontal',
	flipVertical: 'Flip vertical',
	resetImage: 'Reset rotation',
	ratio: 'Ratio',
	ratioCustom: 'Custom',
	ratioSquare: 'Square',
	apply: 'Apply',
	load: 'Load',
	deleteAll: 'Delete All',
	clearFilters: 'Clear',
	duplicate: 'Duplicate',
	bringForward: 'Bring forward',
	sendBackward: 'Send backward',
	bringToFront: 'Bring to front',
	sendToBack: 'Send to back',
	opacity: 'Opacity',
	shadow: 'Shadow',
	dashed: 'Dashed',
	cornerRadius: 'Corners',
	width: 'Width',
	height: 'Height',
	keepAspect: 'Keep aspect ratio',
	originalSize: 'Original',
	resetAdjustments: 'Reset adjustments',
};

export const defaultIcons: EditorIcons = {
	undo: <UndoIcon />,
	redo: <RedoIcon />,
	history: <HistoryIcon />,
	zoomIn: <PlusIcon />,
	zoomOut: <MinusIcon />,
	pan: <FiveIcon />,
	reset: <CancelIcon />,
	cancel: <CancelIcon />,
	save: <SaveIcon />,
	exportJson: <ExportJsonIcon />,
	delete: <DeleteIcon />,
	dropdown: <DownOneIcon />,
	check: <CheckOneIcon />,
	fill: <BackgroundColorIcon />,
	stroke: <HandleRoundIcon />,
	text: <AddTextIcon />,
	bold: <TextBoldIcon />,
	italic: <TextItalicIcon />,
	alignLeft: <AlignTextLeftIcon />,
	alignCenter: <AlignTextCenterIcon />,
	alignRight: <AlignTextRightIcon />,
	stepNumber: <ListNumbersIcon />,
	underline: <UnderlineIcon />,
	strikethrough: <StrikethroughIcon />,
	rotateLeft: <RotateLeftIcon />,
	rotateRight: <RotateRightIcon />,
	flipHorizontal: <FlipHorizontalIcon />,
	flipVertical: <FlipVerticalIcon />,
	load: <LoadIcon />,
	deleteAll: <ClearIcon />,
	duplicate: <DuplicateIcon />,
	bringForward: <BringForwardIcon />,
	sendBackward: <SendBackwardIcon />,
	bringToFront: <BringToFrontIcon />,
	sendToBack: <SendToBackIcon />,
	shadow: <ShadowIcon />,
	dashed: <DashedIcon />,
	keepAspect: <LockIcon />,
};
