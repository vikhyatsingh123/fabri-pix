/**
 * @author Vikhyat Singh
 * Image editor footer
 */

import React from 'react';
import { Canvas, Rect } from 'fabric';

import CancelIcon from '../icons/CancelIcon';
import ExportJsonIcon from '../icons/ExportJsonIcon';
import SaveIcon from '../icons/SaveIcon';
import { SubMenu } from '../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
	onSave?: (blob: Blob, json: any) => void;
	onCancel?: () => void;
	exportJson?: (json: any) => void;
	showExportJson?: boolean;
}

const ImageEditorFooter: React.FC<IProps> = (props) => {
	const { canvas, onSave, onCancel, exportJson, showExportJson } = props;

	const handleCancel = (): void => {
		if (!canvas.current) {
			return;
		}

		if (onCancel) {
			onCancel();
		} else {
			const objects = canvas.current.getObjects();
			objects.forEach((object) => {
				canvas.current.remove(object);
			});
			canvas.current.renderAll();
		}
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

	const defaultSave = (blob: Blob): void => {
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `edited-image-${Date.now()}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleSave = async () => {
		if (!canvas.current) {
			return;
		}

		applyCropMask();

		const canvasEdited = canvas.current;
		canvasEdited.discardActiveObject();
		const canvasAsJson = canvasEdited.toJSON();
		const devicePixelRatio = window.devicePixelRatio || 1;
		const multiplier = Math.max(1, devicePixelRatio);
		const dataURL = await canvasEdited.toBlob({
			multiplier,
			format: 'png',
			quality: 1.0,
		});

		if (onSave) {
			onSave(dataURL, canvasAsJson);
		} else {
			defaultSave(dataURL);
		}
	};

	const handleExportJson = () => {
		if (!canvas.current) {
			return;
		}
		if (exportJson) {
			exportJson(canvas.current.toJSON());
		} else {
			const canvasAsJson = canvas.current.toJSON();
			const jsonString = JSON.stringify(canvasAsJson, null, 2);
			const blob = new Blob([jsonString], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `canvas-${Date.now()}.json`;
			link.click();
		}
	};

	return (
		<div style={{ display: 'flex', gap: 8, position: 'absolute', bottom: 10, right: 10 }}>
			<button className={`custom-button`} onClick={handleCancel} type='reset'>
				<CancelIcon /> Reset
			</button>
			<button className={`custom-button`} onClick={() => void handleSave()} type='submit'>
				<SaveIcon /> Save
			</button>
			{showExportJson && (
				<button className={`custom-button`} onClick={() => void handleExportJson()} type='submit'>
					<ExportJsonIcon /> Export JSON
				</button>
			)}
		</div>
	);
};

export default ImageEditorFooter;
