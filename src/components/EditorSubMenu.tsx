/**
 * @author Vikhyat Singh
 * Image editor for sub menu
 */

import React from 'react';
import { Canvas } from 'fabric';

import ImageAnnotation from './annotate/ImageAnnotation';
import ImageCrop from './crop/ImageCrop';
import ImageRedact from './redact/ImageRedact';
import { Menu, SubMenu } from '../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
	menu: Menu | '';
	aIAnnotation: any;
	handleTrackChange: (e?: any) => void;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
	freeDrawingBrushContextMenu: { color: string; width: number };
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
}

const EditorSubMenu: React.FC<IProps> = (props) => {
	const {
		canvas,
		menu,
		aIAnnotation,
		handleTrackChange,
		activeAnnotation,
		setActiveAnnotation,
		freeDrawingBrushContextMenu,
		advancedArrowRef,
		linePathRef,
		stepCreatorRef,
		commentBoxRef,
		textBoxContextMenu,
	} = props;

	switch (menu) {
		case Menu.ANNOTATE:
			return (
				<ImageAnnotation
					canvas={canvas}
					aIAnnotation={aIAnnotation}
					handleTrackChange={handleTrackChange}
					activeAnnotation={activeAnnotation}
					setActiveAnnotation={setActiveAnnotation}
					freeDrawingBrushContextMenu={freeDrawingBrushContextMenu}
					advancedArrowRef={advancedArrowRef}
					linePathRef={linePathRef}
					stepCreatorRef={stepCreatorRef}
					commentBoxRef={commentBoxRef}
					textBoxContextMenu={textBoxContextMenu}
				/>
			);
		case Menu.BLUR:
			return (
				<ImageRedact
					canvas={canvas}
					handleTrackChange={handleTrackChange}
					activeAnnotation={activeAnnotation}
					setActiveAnnotation={setActiveAnnotation}
				/>
			);
		case Menu.CROP:
			return (
				<ImageCrop
					canvas={canvas}
					activeAnnotation={activeAnnotation}
					setActiveAnnotation={setActiveAnnotation}
				/>
			);
		default:
			return null;
	}
};

export default EditorSubMenu;
