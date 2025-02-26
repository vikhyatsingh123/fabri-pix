/**
 * @author Vikhyat Singh
 * @description Image editor warpper component
 */

import React from 'react';
import ImageEditor from './ImageEditor';

interface IProps {
	imageUrl?: string | null;
}
export const ImageEditorWrapper: React.FC<IProps> = (props) => {
	return <ImageEditor {...props} />;
};
