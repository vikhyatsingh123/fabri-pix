/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for shapes
 */

import React from 'react';
import { Canvas } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button, InputNumber, Divider } from 'antd';
import { BackgroundColor, Delete, HandleRound } from '@icon-park/react';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: any;
}
const ShapesContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const handleBorderColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ strokeWidth: val });
		}
		canvas.current.renderAll();
	};

	const handleDeleteAnnotations = () => {
		canvas.current.remove(selectedObject);
		canvas.current.renderAll();
	};

	return (
		<div className='flex items-center justify-center'>
			<Tooltip title='Background Color' className='flex items-center justify-center'>
				<BackgroundColor />
				<span className='ml-1 mr-2'>Fill</span>
				<ColorPicker size='small' value={selectedObject.fill} placement='bottomLeft' onChange={handleBackgroundColorChange} />
			</Tooltip>
			<Divider type='vertical' className='mx-3 bg-[#d9d9d9]' />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRound />
					<span>Stroke</span>
				</div>
				<Tooltip title='Border Color'>
					<ColorPicker size='small' value={selectedObject.stroke} placement='bottomLeft' onChange={handleBorderColorChange} />
				</Tooltip>
				<Tooltip title='Border width'>
					<InputNumber
						size='small'
						className='w-14'
						min={1}
						max={50}
						defaultValue={selectedObject.strokeWidth}
						onChange={handleStrokeWidthChange}
					/>
				</Tooltip>
			</div>
			<Divider type='vertical' className='mx-3 bg-[#d9d9d9]' />
			<Tooltip title='Delete shape'>
				<Button icon={<Delete fill={'red'} />} size='small' type='text' onClick={handleDeleteAnnotations} />
			</Tooltip>
		</div>
	);
};

export default ShapesContextMenu;
