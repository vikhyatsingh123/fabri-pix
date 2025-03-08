/**
 * @author Vikhyat Singh
 * Image editor for sub menu
 */

import { Canvas } from 'fabric';
import React from 'react';
import { Menu, SubMenu } from '../utils/utils';
import ImageAnnotation from './annotate/ImageAnnotation';
import ImageRedact from './redact/ImageRedact';
import ImageCrop from './crop/ImageCrop';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	menu: Menu | '';
	aIAnnotation: any;
	handleTrackChange: (e?: any) => void;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
	freeDrawingBrushRef: React.RefObject<{ color: string; width: number }>;
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
	textBoxRef: React.RefObject<{
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	}>;
}

const EditorSubMenu: React.FC<IProps> = (props) => {
	const {
		canvas,
		menu,
		aIAnnotation,
		handleTrackChange,
		activeAnnotation,
		setActiveAnnotation,
		freeDrawingBrushRef,
		advancedArrowRef,
		linePathRef,
		stepCreatorRef,
		commentBoxRef,
		textBoxRef,
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
					freeDrawingBrushRef={freeDrawingBrushRef}
					advancedArrowRef={advancedArrowRef}
					linePathRef={linePathRef}
					stepCreatorRef={stepCreatorRef}
					commentBoxRef={commentBoxRef}
					textBoxRef={textBoxRef}
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
