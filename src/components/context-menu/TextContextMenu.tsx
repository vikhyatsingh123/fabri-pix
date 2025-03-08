/**
 * @author Vikhyat Singh
 * Context menu for Text
 */

import { Canvas, Textbox } from 'fabric';
import React from 'react';
import { Button, ColorPicker, InputNumber, Segmented, Tooltip } from 'antd';
import { Color } from 'antd/es/color-picker';
import BackgroundColorIcon from 'src/icons/BackgroundColorIcon';
import DeleteIcon from 'src/icons/DeleteIcon';
import AddTextIcon from 'src/icons/AddTextIcon';
import TextBoldIcon from 'src/icons/TextBoldIcon';
import TextItalicIcon from 'src/icons/TextItalicIcon';
import AlignTextLeftIcon from 'src/icons/AlignTextLeftIcon';
import AlignTextCenterIcon from 'src/icons/AlignTextCenterIcon';
import AlignTextRightIcon from 'src/icons/AlignTextRightIcon';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
	textBoxRef: React.RefObject<{
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	}>;
}

const segmentedOptions = [
	{ value: 'left', label: <AlignTextLeftIcon /> },
	{ value: 'center', label: <AlignTextCenterIcon /> },
	{ value: 'right', label: <AlignTextRightIcon /> },
];

const TextContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, textBoxRef } = props;

	const handleFontColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (col: Color) => {
		textBoxRef.current.fontColor = col.toHexString();
	};

	const handleBackgroundColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ backgroundColor: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (col: Color) => {
		textBoxRef.current.backgroundColor = col.toHexString();
	};

	const handleAlignChange = (value: string) => {
		const currentObject = canvas.current.getActiveObject() as Textbox;
		if (currentObject) {
			currentObject.set({
				textAlign: value,
			});
		}
		canvas.current.renderAll();
	};

	const handleFontStyleChange = () => {
		const currentObject = canvas.current.getActiveObject() as Textbox;
		if (currentObject) {
			currentObject.set({
				fontStyle: currentObject.fontStyle === 'italic' ? 'normal' : 'italic',
			});
		}
		textBoxRef.current.fontStyle = textBoxRef.current.fontStyle === 'italic' ? 'normal' : 'italic';
		canvas.current.renderAll();
	};

	const handleFontSizeChange = (value: number | null) => {
		if (value === null) {
			return;
		}
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fontSize: value });
		}
		textBoxRef.current.fontSize = value;
		canvas.current.renderAll();
	};

	const handleFontTypeChange = () => {
		const currentObject = canvas.current.getActiveObject() as Textbox;
		if (currentObject) {
			currentObject.set({
				fontWeight: currentObject.fontWeight === 'bold' ? 'normal' : 'bold',
			});
		}
		textBoxRef.current.fontWeight = textBoxRef.current.fontWeight === 'bold' ? 'normal' : 'bold';
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
					value={
						Object.keys(selectedObject).length === 0
							? textBoxRef.current.backgroundColor
							: selectedObject.backgroundColor
					}
					placement='bottomLeft'
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</Tooltip>
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
								? textBoxRef.current.fontColor
								: selectedObject.fill
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
								? textBoxRef.current.fontSize
								: selectedObject.fontSize
						}
						onChange={handleFontSizeChange}
					/>
				</Tooltip>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-1'>
				<Tooltip title='Bold'>
					<Button
						onClick={handleFontTypeChange}
						style={{ padding: 4 }}
						size='small'
						icon={<TextBoldIcon />}
						type='text'
						className={
							(Object.keys(selectedObject).length === 0
								? textBoxRef.current.fontWeight
								: selectedObject.fontWeight) === 'bold'
								? 'bg-gray-200 shadow-sm'
								: ''
						}
					/>
				</Tooltip>
				<Tooltip title='Italic'>
					<Button
						onClick={handleFontStyleChange}
						size='small'
						style={{ padding: 4 }}
						icon={<TextItalicIcon />}
						type='text'
						className={
							(Object.keys(selectedObject).length === 0
								? textBoxRef.current.fontStyle
								: selectedObject.fontStyle) === 'italic'
								? 'bg-gray-200 shadow-sm'
								: ''
						}
					/>
				</Tooltip>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<Tooltip title='Align Text'>
				<Segmented
					options={segmentedOptions}
					size='small'
					defaultValue={selectedObject.textAlign}
					onChange={handleAlignChange}
				/>
			</Tooltip>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<Tooltip title='Delete shape'>
				<Button icon={<DeleteIcon />} size='small' type='text' onClick={handleDeleteAnnotations} />
			</Tooltip>
		</div>
	);
};

export default TextContextMenu;
