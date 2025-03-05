/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for Advanced Arrow
 */

import React from 'react';
import { Canvas, Triangle } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button, InputNumber } from 'antd';
import { Delete, HandleRound } from '@icon-park/react';
import _ from 'lodash';

import { useAdvancedArrow, useImageEditorActions } from '../store/ImageEditorStore';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: any;
}
const AdvancedArrowContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const { advancedArrow } = useAdvancedArrow();
	const { setAdvancedArrow } = useImageEditorActions();

	const handleBorderColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		const arrowHead = _.find(
			canvas.current?.getObjects(),
			(obj) => _.get(obj, 'id') === _.get(selectedObject, 'id') + '-arrowhead',
		);
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		if (arrowHead) {
			arrowHead.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (col: Color) => {
		setAdvancedArrow({ stroke: col.toHexString(), width: advancedArrow.width });
	};

	const handleDeleteAnnotations = () => {
		const arrowHead = _.find(
			canvas.current?.getObjects(),
			(obj) => _.get(obj, 'id') === _.get(selectedObject, 'id') + '-arrowhead',
		);
		if (arrowHead) {
			canvas.current?.remove(arrowHead);
		}
		canvas.current.remove(selectedObject);
		canvas.current.renderAll();
	};

	const modifyArrowHeadOnMoving = (arrowHead: Triangle, coords: any) => {
		const dx = coords.p1.x - coords.p0.x;
		const dy = coords.p1.y - coords.p0.y;
		const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
		arrowHead?.set({
			left: coords.p1.x,
			top: coords.p1.y,
			angle: angle + 90,
		});
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		const arrowHead = _.find(
			canvas.current?.getObjects(),
			(obj) => _.get(obj, 'id') === _.get(selectedObject, 'id') + '-arrowhead',
		);

		if (currentObject) {
			currentObject.set({ strokeWidth: val });
			currentObject.setCoords();
		}
		if (arrowHead) {
			arrowHead.set({
				width: val * 2,
				height: val * 2,
			});
		}

		modifyArrowHeadOnMoving(arrowHead, currentObject?.oCoords);
		setAdvancedArrow({ stroke: advancedArrow.stroke, width: val });
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
						value={_.isEmpty(selectedObject) ? advancedArrow.stroke : selectedObject.stroke}
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
						value={_.isEmpty(selectedObject) ? advancedArrow.width : selectedObject.strokeWidth}
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

export default AdvancedArrowContextMenu;
