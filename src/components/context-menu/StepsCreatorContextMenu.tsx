/**
 * @author Vikhyat Singh
 * Context menu for steps creator
 */

import React from 'react';
import { Canvas, Circle, IText } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button, InputNumber } from 'antd';
import BackgroundColorIcon from 'src/icons/BackgroundColorIcon';
import HandleRoundIcon from 'src/icons/HandleRoundIcon';
import DeleteIcon from 'src/icons/DeleteIcon';
import AddTextIcon from 'src/icons/AddTextIcon';
import ListNumbersIcon from 'src/icons/ListNumbersIcon';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
	stepCreatorRef: React.RefObject<{
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		stepNumber: number;
		strokeWidth: number;
	}>;
}
const StepsCreatorContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, stepCreatorRef } = props;

	const handleBorderColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[0].set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (col: Color) => {
		stepCreatorRef.current.borderColor = col.toHexString();
	};

	const handleBackgroundColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[0]?.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (col: Color) => {
		stepCreatorRef.current.backgroundColor = col.toHexString();
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[0].set({ strokeWidth: val });
		}
		stepCreatorRef.current.strokeWidth = val;
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
		stepCreatorRef.current.fontColor = col.toHexString();
	};

	const handleSizeChange = (currentObject: any) => {
		const textObject = currentObject._objects?.[1]._objects?.[1] as IText;
		const circleObject = currentObject._objects?.[1]._objects?.[0] as Circle;
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
		stepCreatorRef.current.fontSize = val;
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
		stepCreatorRef.current.stepNumber = val;
		canvas.current.renderAll();
	};

	const handleDeleteAnnotations = () => {
		canvas.current.remove(selectedObject);
		canvas.current.renderAll();
	};

	return (
		<div className='flex items-center justify-center'>
			<Tooltip title='Background Color' className='flex items-center justify-center'>
				<BackgroundColorIcon />
				<span className='ml-1 mr-2'>Fill</span>
				<ColorPicker
					size='small'
					defaultValue={
						Object.keys(selectedObject).length === 0
							? stepCreatorRef.current.backgroundColor
							: selectedObject._objects?.[1].fill
					}
					placement='bottomLeft'
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</Tooltip>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
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
								? stepCreatorRef.current.borderColor
								: selectedObject._objects?.[0].stroke
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
						max={15}
						value={
							Object.keys(selectedObject).length === 0
								? stepCreatorRef.current.strokeWidth
								: selectedObject._objects?.[0].strokeWidth
						}
						onChange={handleStrokeWidthChange}
					/>
				</Tooltip>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<AddTextIcon />
					<span>Text</span>
				</div>
				<Tooltip title='Text Color'>
					<ColorPicker
						size='small'
						value={
							Object.keys(selectedObject).length === 0
								? stepCreatorRef.current.fontColor
								: selectedObject._objects?.[1]._objects?.[1].fill
						}
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
						value={
							Object.keys(selectedObject).length === 0
								? stepCreatorRef.current.fontSize
								: selectedObject._objects?.[1]._objects?.[1].fontSize
						}
						onChange={handleFontSizeChange}
					/>
				</Tooltip>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<ListNumbersIcon />
					<span>Step Number</span>
				</div>
				<Tooltip title='Start Step Number'>
					<InputNumber
						size='small'
						min={1}
						value={
							Object.keys(selectedObject).length === 0
								? stepCreatorRef.current.stepNumber
								: selectedObject._objects?.[1]._objects?.[1].text
						}
						onChange={handleStartStepNumberChange}
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

export default StepsCreatorContextMenu;
