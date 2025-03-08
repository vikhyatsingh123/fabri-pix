/**
 * @author Vikhyat Singh
 * Context menu for line path
 */

import React from 'react';
import { Canvas } from 'fabric';
import DeleteIcon from 'src/icons/DeleteIcon';
import HandleRoundIcon from 'src/icons/HandleRoundIcon';
import ColorPicker from 'components/widgets/ColorPicker';
import InputNumber from 'components/widgets/InputNumber.tsx';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
	linePathRef: React.RefObject<{
		stroke: string;
		width: number;
	}>;
}
const LineContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, linePathRef } = props;

	const handleBorderColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (val: string) => {
		linePathRef.current.stroke = val;
	};

	const handleDeleteAnnotations = () => {
		canvas.current.remove(selectedObject);
		canvas.current.renderAll();
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ strokeWidth: val });
			currentObject.setCoords();
		}

		linePathRef.current.width = val;
		canvas.current.renderAll();
	};

	return (
		<div className='flex items-center justify-center'>
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRoundIcon />
					<span>Stroke</span>
				</div>
				<ColorPicker
					value={
						Object.keys(selectedObject).length === 0 ? linePathRef.current.stroke : selectedObject.stroke
					}
					onChange={handleBorderColorChange}
					onChangeComplete={handleBorderColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={50}
					value={
						Object.keys(selectedObject).length === 0
							? linePathRef.current.width
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

export default LineContextMenu;
