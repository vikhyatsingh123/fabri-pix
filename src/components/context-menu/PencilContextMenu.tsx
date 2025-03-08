/**
 * @author Vikhyat Singh
 * Context menu for pencil drawing
 */

import { ColorPicker, Tooltip, Button, InputNumber } from 'antd';
import { Color } from 'antd/es/color-picker';
import { Canvas } from 'fabric';
import React from 'react';
import DeleteIcon from 'src/icons/DeleteIcon';
import HandleRoundIcon from 'src/icons/HandleRoundIcon';

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

	const handleStrokeColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleStrokeColorChangeComplete = (col: Color) => {
		freeDrawingBrushRef.current.color = col.toHexString();
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
		<div className='flex items-center justify-center'>
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRoundIcon />
					<span>Stroke</span>
				</div>
				<Tooltip title='Line Color'>
					<ColorPicker
						size='small'
						value={
							Object.keys(selectedObject).length === 0
								? freeDrawingBrushRef.current.color
								: selectedObject.stroke
						}
						placement='bottomLeft'
						onChange={handleStrokeColorChange}
						onChangeComplete={handleStrokeColorChangeComplete}
					/>
				</Tooltip>
				<Tooltip title='Line Width'>
					<InputNumber
						size='small'
						className='w-14'
						min={1}
						max={50}
						value={
							Object.keys(selectedObject).length === 0
								? freeDrawingBrushRef.current.width
								: selectedObject.strokeWidth
						}
						onChange={handleStrokeWidthChange}
					/>
				</Tooltip>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<Tooltip title='Delete shape'>
				<Button icon={<DeleteIcon />} size='small' type='text' onClick={handleDeleteAnnotations} />
			</Tooltip>
		</div>
	);
};

export default PencilContextMenu;
