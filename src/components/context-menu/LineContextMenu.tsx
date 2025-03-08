/**
 * @author Vikhyat Singh
 * Context menu for line path
 */

import React from 'react';
import { Canvas } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button, InputNumber } from 'antd';
import DeleteIcon from 'src/icons/DeleteIcon';
import HandleRoundIcon from 'src/icons/HandleRoundIcon';

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

	const handleBorderColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (col: Color) => {
		linePathRef.current.stroke = col.toHexString();
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
				<Tooltip title='Border Color'>
					<ColorPicker
						size='small'
						value={
							Object.keys(selectedObject).length === 0
								? linePathRef.current.stroke
								: selectedObject.stroke
						}
						placement='bottomLeft'
						onChange={handleBorderColorChange}
						onChangeComplete={handleBorderColorChangeComplete}
					/>
				</Tooltip>
				<Tooltip title='Border width'>
					<InputNumber
						size='small'
						className='w-14'
						min={1}
						max={50}
						value={
							Object.keys(selectedObject).length === 0
								? linePathRef.current.width
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

export default LineContextMenu;
