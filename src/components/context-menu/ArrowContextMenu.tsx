/**
 * @author Vikhyat Singh
 * Context menu for arrow shapes
 */

import React from 'react';
import { Canvas } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button } from 'antd';
import { BackgroundColor, Delete } from '@icon-park/react';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
}
const ArrowContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const handleBackgroundColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects[1].set({ fill: val });
			currentObject._objects[0].set({ stroke: val });
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
				<ColorPicker
					size='small'
					value={selectedObject?._objects?.[1]?.fill}
					placement='bottomLeft'
					onChange={handleBackgroundColorChange}
				/>
			</Tooltip>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<Tooltip title='Delete shape'>
				<Button icon={<Delete fill={'red'} />} size='small' type='text' onClick={handleDeleteAnnotations} />
			</Tooltip>
		</div>
	);
};

export default ArrowContextMenu;
