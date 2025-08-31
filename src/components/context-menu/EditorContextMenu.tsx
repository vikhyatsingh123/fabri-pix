/**
 * @author Vikhyat Singh
 * Context menu for image editor
 */

import { Canvas, FabricObject } from 'fabric';
import React from 'react';
import ShapesContextMenu from './ShapesContextMenu';
import TextContextMenu from './TextContextMenu';
import PencilContextMenu from './PencilContextMenu';
import { SubMenu } from '../../utils/utils';
import StepsCreatorContextMenu from './StepsCreatorContextMenu';
import ArrowContextMenu from './ArrowContextMenu';
import AdvancedArrowContextMenu from './AdvancedArrowContextMenu';
import LineContextMenu from './LineContextMenu';
import CommentBoxContextMenu from './CommentBoxContextMenu';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: FabricObject | null;
	activeAnnotation: SubMenu | '';
	freeDrawingBrushContextMenu: { color: string; width: number };
	setFreeDrawingBrushContextMenu: React.Dispatch<React.SetStateAction<{ color: string; width: number }>>;
	advancedArrowRef: React.RefObject<{ stroke: string; width: number }>;
	linePathRef: React.RefObject<{ stroke: string; width: number }>;
	stepCreatorRef: React.RefObject<{
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		stepNumber: number;
		strokeWidth: number;
	}>;
	commentBoxRef: React.RefObject<{
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
		strokeWidth: number;
		borderColor: string;
		text: string;
	}>;
	textBoxContextMenu: {
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	};
	setTextBoxContextMenu: React.Dispatch<
		React.SetStateAction<{
			backgroundColor: string;
			fontColor: string;
			fontSize: number;
			fontStyle: string;
			fontWeight: string;
		}>
	>;
}

const EditorContextMenu: React.FC<IProps> = (props) => {
	const {
		canvas,
		selectedObject,
		activeAnnotation,
		freeDrawingBrushContextMenu,
		setFreeDrawingBrushContextMenu,
		advancedArrowRef,
		linePathRef,
		stepCreatorRef,
		commentBoxRef,
		textBoxContextMenu,
		setTextBoxContextMenu,
	} = props;

	const type = (selectedObject as any)?.shapeType ?? activeAnnotation;

	if (type === '') {
		return null;
	}

	switch (type) {
		case SubMenu.CIRCLE:
		case SubMenu.RECTANGLE:
		case SubMenu.STAR:
			return <ShapesContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.ARROW:
			return <ArrowContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.COMMENT_BOX:
			return (
				<CommentBoxContextMenu canvas={canvas} selectedObject={selectedObject} commentBoxRef={commentBoxRef} />
			);
		case SubMenu.LINE_PATH:
			return <LineContextMenu canvas={canvas} selectedObject={selectedObject} linePathRef={linePathRef} />;
		case SubMenu.ADVANCED_ARROW:
			return (
				<AdvancedArrowContextMenu
					canvas={canvas}
					selectedObject={selectedObject}
					advancedArrowRef={advancedArrowRef}
				/>
			);
		case SubMenu.TEXT:
			return (
				<TextContextMenu
					canvas={canvas}
					selectedObject={selectedObject}
					textBoxContextMenu={textBoxContextMenu}
					setTextBoxContextMenu={setTextBoxContextMenu}
				/>
			);
		case SubMenu.DRAW:
			return (
				<PencilContextMenu
					canvas={canvas}
					selectedObject={selectedObject}
					freeDrawingBrushContextMenu={freeDrawingBrushContextMenu}
					setFreeDrawingBrushContextMenu={setFreeDrawingBrushContextMenu}
				/>
			);
		case SubMenu.STEPS_CREATOR:
			return (
				<StepsCreatorContextMenu
					canvas={canvas}
					selectedObject={selectedObject}
					stepCreatorRef={stepCreatorRef}
				/>
			);
		default:
			return null;
	}
};

export default EditorContextMenu;
