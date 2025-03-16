/**
 * @author Vikhyat Singh
 * Image editor footer
 */

import React from 'react';
import { Canvas } from 'fabric';

import SaveIcon from '../icons/SaveIcon';

interface IProps {
	canvas: React.RefObject<Canvas>;
}

const ImageEditorFooter: React.FC<IProps> = (props) => {
	const { canvas } = props;

	const handleCancel = (): void => {
		console.log('cancel');
	};

	const handleSave = async () => {
		if (!canvas.current) {
			return;
		}

		const canvasEdited = canvas.current;
		canvasEdited.discardActiveObject();
		const canvasAsJson = canvasEdited.toJSON();
		const dataURL = await canvasEdited.toBlob({ multiplier: 1, format: 'png', quality: 1.0 });
		const blobUrl = URL.createObjectURL(dataURL);
		console.log('blobUrl', blobUrl);
		console.log('json', canvasAsJson);
	};

	return (
		<div style={{ display: 'flex', gap: 8, position: 'absolute', bottom: 0, right: 0 }}>
			<button className={`custom-button`} onClick={handleCancel}>
				Cancel
			</button>
			<button className={`custom-button`} onClick={() => void handleSave()}>
				Save <SaveIcon />
			</button>
		</div>
	);
};

export default ImageEditorFooter;
