/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for pencil drawing
 */

import { Delete, HandleRound } from '@icon-park/react';
import { ColorPicker, Tooltip, Button, InputNumber } from 'antd';
import { Color } from 'antd/es/color-picker';
import { Canvas } from 'fabric';
import React from 'react';
import _ from 'lodash';

import { useFreeDrawingBrush, useImageEditorActions } from '../store/ImageEditorStore';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: any;
}

const PencilContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const { setFreeDrawingBrush } = useImageEditorActions();
	const { freeDrawingBrush } = useFreeDrawingBrush();

	const handleStrokeColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleStrokeColorChangeComplete = (col: Color) => {
		setFreeDrawingBrush({ color: col.toHexString(), width: freeDrawingBrush.width });
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ strokeWidth: val });
		}
		setFreeDrawingBrush({ color: freeDrawingBrush.color, width: val });
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
					<HandleRound />
					<span>Stroke</span>
				</div>
				<Tooltip title='Line Color'>
					<ColorPicker
						size='small'
						value={_.isEmpty(selectedObject) ? freeDrawingBrush.color : selectedObject.stroke}
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
						value={_.isEmpty(selectedObject) ? freeDrawingBrush.width : selectedObject.strokeWidth}
						onChange={handleStrokeWidthChange}
					/>
				</Tooltip>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<Tooltip title='Delete shape'>
				<Button icon={<Delete fill={'red'} />} size='small' type='text' onClick={handleDeleteAnnotations} />
			</Tooltip>
		</div>
	);
};

export default PencilContextMenu;
