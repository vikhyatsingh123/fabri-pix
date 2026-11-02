/**
 * @author Vikhyat Singh
 * Image editor footer
 */

import React from 'react';
import { Canvas } from 'fabric';

import CancelIcon from '../icons/CancelIcon';
import ExportJsonIcon from '../icons/ExportJsonIcon';
import SaveIcon from '../icons/SaveIcon';
import { applyCropMask, downloadBlob, exportCanvasToBlob } from '../utils/canvasHelpers';

interface IProps {
	canvas: React.RefObject<Canvas>;
	onSave?: (blob: Blob, json: any) => void;
	onCancel?: () => void;
	onReset: () => void;
	exportJson?: (json: any) => void;
	showExportJson?: boolean;
}

const ImageEditorFooter: React.FC<IProps> = (props) => {
	const { canvas, onSave, onCancel, onReset, exportJson, showExportJson } = props;

	const handleCancel = (): void => {
		if (!canvas.current) {
			return;
		}

		if (onCancel) {
			onCancel();
		} else {
			onReset();
		}
	};

	const handleSave = async () => {
		if (!canvas.current) {
			return;
		}

		const canvasEdited = canvas.current;
		applyCropMask(canvasEdited);
		canvasEdited.discardActiveObject();
		const canvasAsJson = canvasEdited.toJSON();

		try {
			const blob = await exportCanvasToBlob(canvasEdited);
			if (!blob) {
				console.error('Unable to export the edited image');
				return;
			}

			if (onSave) {
				onSave(blob, canvasAsJson);
			} else {
				downloadBlob(blob, `edited-image-${Date.now()}.png`);
			}
		} catch (error) {
			// e.g. the image was loaded from a server without CORS headers which taints the canvas
			console.error('Unable to export the edited image', error);
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
			downloadBlob(blob, `canvas-${Date.now()}.json`);
		}
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
			<button className={`custom-button`} onClick={handleCancel} type='button'>
				<CancelIcon /> Reset
			</button>
			<button className={`custom-button`} onClick={() => void handleSave()} type='button'>
				<SaveIcon /> Save
			</button>
			{showExportJson && (
				<button className={`custom-button`} onClick={handleExportJson} type='button'>
					<ExportJsonIcon /> Export JSON
				</button>
			)}
		</div>
	);
};

export default ImageEditorFooter;
