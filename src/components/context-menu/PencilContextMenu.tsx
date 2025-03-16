/**
 * @author Vikhyat Singh
 * Context menu for pencil drawing
 */

import { Canvas } from 'fabric';
import React from 'react';

import DeleteIcon from '../../icons/DeleteIcon';
import HandleRoundIcon from '../../icons/HandleRoundIcon';
import ColorPicker from '../widgets/ColorPicker';
import InputNumber from '../widgets/InputNumber.tsx';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
	freeDrawingBrushRef: React.RefObject<{
		color: string;
		width: number;
	}>;
}

const PencilContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, freeDrawingBrushRef } = props;

	const handleStrokeColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleStrokeColorChangeComplete = (val: string) => {
		freeDrawingBrushRef.current.color = val;
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ strokeWidth: val });
		}
		freeDrawingBrushRef.current.width = val;
		canvas.current.renderAll();
	};

	const handleDeleteAnnotations = () => {
		canvas.current.remove(selectedObject);
		canvas.current.renderAll();
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<div style={{ display: 'flex', gap: 4 }}>
					<HandleRoundIcon />
					<span>Stroke</span>
				</div>
				<ColorPicker
					value={
						Object.keys(selectedObject).length === 0
							? freeDrawingBrushRef.current.color
							: selectedObject.stroke
					}
					onChange={handleStrokeColorChange}
					onChangeComplete={handleStrokeColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={50}
					value={
						Object.keys(selectedObject).length === 0
							? freeDrawingBrushRef.current.width
							: selectedObject.strokeWidth
					}
					onChange={handleStrokeWidthChange}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default PencilContextMenu;
