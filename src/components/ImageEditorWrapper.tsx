/**
 * @author Vikhyat Singh
 * @description Image editor wrapper component
 */

import React from 'react';

import '../styles/index.css';
import ImageEditor from './ImageEditor';

interface IProps {
	imageUrl?: string | null;
}
export const ImageEditorWrapper: React.FC<IProps> = (props) => {
	return <ImageEditor {...props} />;
};
