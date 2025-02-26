/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Image editor for sub menu
 */

import { Canvas } from 'fabric';
import React from 'react';
import { Menu } from '../utils/utils';
import ImageAnnotation from './ImageAnnotation';
import ImageRedact from './ImageRedact';
import ImageCrop from './ImageCrop';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	menu: Menu | '';
	aIAnnotation: any;
	handleTrackChange: (e?: any) => void;
}

const EditorSubMenu: React.FC<IProps> = (props) => {
	const { canvas, menu, aIAnnotation, handleTrackChange } = props;

	switch (menu) {
		case Menu.ANNOTATE:
			return <ImageAnnotation canvas={canvas} aIAnnotation={aIAnnotation} handleTrackChange={handleTrackChange} />;
		case Menu.BLUR:
			return <ImageRedact canvas={canvas} handleTrackChange={handleTrackChange} />;
		case Menu.CROP:
			return <ImageCrop canvas={canvas} />;
		default:
			return null;
	}
};

export default EditorSubMenu;
