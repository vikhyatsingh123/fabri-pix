/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for steps creator
 */

import React from 'react';
import { Canvas, Circle, IText } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button, InputNumber, Divider } from 'antd';
import { AddTextTwo, BackgroundColor, Delete, HandleRound, ListNumbers } from '@icon-park/react';
import _ from 'lodash';

import { useImageEditorActions, useStepCreator } from '../store/ImageEditorStore';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: any;
}
const StepsCreatorContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const { stepCreator } = useStepCreator();
	const { setStepCreator } = useImageEditorActions();

	const handleBorderColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[0].set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (col: Color) => {
		setStepCreator({ ...stepCreator, borderColor: col.toHexString() });
	};

	const handleBackgroundColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[0]?.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (col: Color) => {
		setStepCreator({ ...stepCreator, backgroundColor: col.toHexString() });
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[0].set({ strokeWidth: val });
		}
		setStepCreator({ ...stepCreator, strokeWidth: val });
		canvas.current.renderAll();
	};

	const handleFontColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[1]?.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (col: Color) => {
		setStepCreator({ ...stepCreator, fontColor: col.toHexString() });
	};

	const handleSizeChange = (currentObject: any) => {
		const textObject = _.get(currentObject, ['_objects', '1', '_objects', '1']) as IText;
		const circleObject = _.get(currentObject, ['_objects', '1', '_objects', '0']) as Circle;
		const textWidth = textObject.width;
		const textHeight = textObject.height;
		const radius = circleObject.radius;
		const newRadius = Math.max(textWidth / 2 + 10, textHeight / 2 + 10);

		circleObject.set({
			radius: newRadius,
			left: circleObject.left - (newRadius - radius),
			top: circleObject.top - (newRadius - radius),
		});

		textObject.set({
			left: 0,
			top: 0,
		});

		canvas.current.discardActiveObject();
		canvas.current.setActiveObject(currentObject);
		canvas.current.requestRenderAll();
	};

	const handleFontSizeChange = (val: number | null) => {
		if (!val) {
			return;
		}
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[1]?.set({ fontSize: val });
			handleSizeChange(currentObject);
		}
		setStepCreator({ ...stepCreator, fontSize: val });
		canvas.current.renderAll();
	};

	const handleStartStepNumberChange = (val: number | null) => {
		if (!val) {
			return;
		}
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[1]?.set({ text: val.toString() });
			handleSizeChange(currentObject);
		}
		setStepCreator({ ...stepCreator, stepNumber: val });
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
					defaultValue={_.isEmpty(selectedObject) ? stepCreator.backgroundColor : selectedObject._objects?.[1].fill}
					placement='bottomLeft'
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</Tooltip>
			<Divider type='vertical' className='mx-3 bg-[#d9d9d9]' />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRound />
					<span>Stroke</span>
				</div>
				<Tooltip title='Border Color'>
					<ColorPicker
						size='small'
						value={_.isEmpty(selectedObject) ? stepCreator.borderColor : selectedObject._objects?.[0].stroke}
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
						max={15}
						value={_.isEmpty(selectedObject) ? stepCreator.strokeWidth : selectedObject._objects?.[0].strokeWidth}
						onChange={handleStrokeWidthChange}
					/>
				</Tooltip>
			</div>
			<Divider type='vertical' className='mx-3 bg-[#d9d9d9]' />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<AddTextTwo />
					<span>Text</span>
				</div>
				<Tooltip title='Text Color'>
					<ColorPicker
						size='small'
						value={_.isEmpty(selectedObject) ? stepCreator.fontColor : selectedObject._objects?.[1]._objects?.[1].fill}
						placement='bottomLeft'
						onChange={handleFontColorChange}
						onChangeComplete={handleFontColorChangeComplete}
					/>
				</Tooltip>
				<Tooltip title='Text Size'>
					<InputNumber
						size='small'
						className='w-14'
						min={1}
						max={100}
						value={_.isEmpty(selectedObject) ? stepCreator.fontSize : selectedObject._objects?.[1]._objects?.[1].fontSize}
						onChange={handleFontSizeChange}
					/>
				</Tooltip>
			</div>
			<Divider type='vertical' className='mx-3 bg-[#d9d9d9]' />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<ListNumbers />
					<span>Step Number</span>
				</div>
				<Tooltip title='Start Step Number'>
					<InputNumber
						size='small'
						min={1}
						value={_.isEmpty(selectedObject) ? stepCreator.stepNumber : selectedObject._objects?.[1]._objects?.[1].text}
						onChange={handleStartStepNumberChange}
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

export default StepsCreatorContextMenu;
