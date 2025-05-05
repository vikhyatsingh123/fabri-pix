/**
 * @author Vikhyat Singh
 * Image editor footer
 */

import React from 'react';
import { Canvas, Rect } from 'fabric';

import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';
import { SubMenu } from '../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
}

const ImageEditorFooter: React.FC<IProps> = (props) => {
	const { canvas } = props;

	const handleCancel = (): void => {
		if (!canvas.current) {
			return;
		}

		const objects = canvas.current.getObjects();
		objects.forEach((object) => {
			canvas.current.remove(object);
		});
		canvas.current.renderAll();
	};

	const applyCropMask = () => {
		const cropRectangle = canvas.current
			.getObjects()
			.find((obj: any) => obj?.shapeType === SubMenu.CROP_RECTANGLE) as Rect;
		if (!canvas.current.backgroundImage || !cropRectangle) {
			return;
		}

		const clipPath = new Rect({
			left: cropRectangle.left,
			top: cropRectangle.top,
			width: cropRectangle.width * cropRectangle.scaleX,
			height: cropRectangle.height * cropRectangle.scaleY,
			absolutePositioned: true,
			id: crypto.randomUUID(),
		});

		canvas.current.clipPath = clipPath;
		canvas.current.remove(cropRectangle);
		canvas.current.renderAll();
	};

	const handleSave = async () => {
		if (!canvas.current) {
			return;
		}

		applyCropMask();

		const canvasEdited = canvas.current;
		canvasEdited.discardActiveObject();
		const canvasAsJson = canvasEdited.toJSON();
		const dataURL = await canvasEdited.toBlob({ multiplier: 1, format: 'png', quality: 1.0 });
		const blobUrl = URL.createObjectURL(dataURL);
		console.log('blobUrl', blobUrl);
		console.log('json', canvasAsJson);
	};

	return (
		<div style={{ display: 'flex', gap: 8, position: 'absolute', bottom: 10, right: 10 }}>
			<button className={`custom-button`} onClick={handleCancel} type='reset'>
				<CancelIcon /> Reset
			</button>
			<button className={`custom-button`} onClick={() => void handleSave()} type='submit'>
				<SaveIcon /> Save
			</button>
		</div>
	);
};

export default ImageEditorFooter;
