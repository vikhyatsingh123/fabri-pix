/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for shapes
 */

import React from 'react';
import { Canvas } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, InputNumber } from 'antd';
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
			<BackgroundColor />
			<span className='ml-1 mr-2'>Fill</span>
			<ColorPicker
				size='small'
				value={selectedObject.fill}
				placement='bottomLeft'
				onChange={handleBackgroundColorChange}
			/>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRound />
					<span>Stroke</span>
				</div>
				<ColorPicker
					size='small'
					value={selectedObject.stroke}
					placement='bottomLeft'
					onChange={handleBorderColorChange}
				/>
				<InputNumber
					size='small'
					className='w-14'
					min={1}
					max={50}
					defaultValue={selectedObject.strokeWidth}
					onChange={handleStrokeWidthChange}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<Delete />
			</button>
		</div>
	);
};

export default ShapesContextMenu;
