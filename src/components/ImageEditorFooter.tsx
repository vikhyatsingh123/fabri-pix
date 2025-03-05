/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Image editor footer
 */

import React from 'react';
import { Canvas } from 'fabric';

import SaveIcon from '../icons/SaveIcon';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
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
		const dataURL = await canvasEdited.toBlob({ multiplier: 1, format: 'png', quality: 1.0 });
		const blobUrl = URL.createObjectURL(dataURL);
		console.log(blobUrl);
		handleCancel();
	};

	return (
		<div className='flex gap-2 absolute bottom-0 right-0'>
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
