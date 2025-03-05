/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for line path
 */

import React from 'react';
import { Canvas } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button, InputNumber } from 'antd';
import { Delete, HandleRound } from '@icon-park/react';
import _ from 'lodash';

import { useImageEditorActions, useLinePath } from '../store/ImageEditorStore';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: any;
}
const LineContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const { linePath } = useLinePath();
	const { setLinePath } = useImageEditorActions();

	const handleBorderColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (col: Color) => {
		setLinePath({ stroke: col.toHexString(), width: linePath.width });
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

		setLinePath({ stroke: linePath.stroke, width: val });
		canvas.current.renderAll();
	};

	return (
		<div className='flex items-center justify-center'>
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRound />
					<span>Stroke</span>
				</div>
				<Tooltip title='Border Color'>
					<ColorPicker
						size='small'
						value={_.isEmpty(selectedObject) ? linePath.stroke : selectedObject.stroke}
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
						value={_.isEmpty(selectedObject) ? linePath.width : selectedObject.strokeWidth}
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

export default LineContextMenu;
