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
	freeDrawingBrushContextMenu: { color: string; width: number };
	setFreeDrawingBrushContextMenu: React.Dispatch<React.SetStateAction<{ color: string; width: number }>>;
}

const PencilContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, freeDrawingBrushContextMenu, setFreeDrawingBrushContextMenu } = props;

	const handleStrokeColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleStrokeColorChangeComplete = (val: string) => {
		setFreeDrawingBrushContextMenu({ ...freeDrawingBrushContextMenu, color: val });
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ strokeWidth: val });
		}
		setFreeDrawingBrushContextMenu({ ...freeDrawingBrushContextMenu, width: val });
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
							? freeDrawingBrushContextMenu.color
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
							? freeDrawingBrushContextMenu.width
							: selectedObject.strokeWidth
					}
					onChange={handleStrokeWidthChange}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default PencilContextMenu;
