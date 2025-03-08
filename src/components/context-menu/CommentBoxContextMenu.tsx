/**
 * @author Vikhyat Singh
 * Context menu for comment box
 */

import React from 'react';
import { Canvas } from 'fabric';
import { Color } from 'antd/es/color-picker';
import { ColorPicker, Button, InputNumber, Input } from 'antd';
import BackgroundColorIcon from 'src/icons/BackgroundColorIcon';
import HandleRoundIcon from 'src/icons/HandleRoundIcon';
import DeleteIcon from 'src/icons/DeleteIcon';
import TextBoldIcon from 'src/icons/TextBoldIcon';
import TextItalicIcon from 'src/icons/TextItalicIcon';
import AddTextIcon from 'src/icons/AddTextIcon';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: any;
	commentBoxRef: React.MutableRefObject<{
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
		strokeWidth: number;
		borderColor: string;
		text: string;
	}>;
}
const CommentBoxContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, commentBoxRef } = props;

	const handleBorderColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (col: Color) => {
		commentBoxRef.current.borderColor = col.toHexString();
	};

	const handleBackgroundColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (col: Color) => {
		commentBoxRef.current.backgroundColor = col.toHexString();
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ strokeWidth: val });
		}
		commentBoxRef.current.strokeWidth = val;
		canvas.current.renderAll();
	};

	const handleFontColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (col: Color) => {
		commentBoxRef.current.fontColor = col.toHexString();
	};

	const handleFontSizeChange = (val: number | null) => {
		if (!val) {
			return;
		}
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({ fontSize: val });
		}
		commentBoxRef.current.fontSize = val;
		canvas.current.renderAll();
	};

	const handleChangeTextboxText = (e: any) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({ text: e.target.value });
		}
		commentBoxRef.current.text = e.target.value;
		canvas.current.renderAll();
	};

	const handleDeleteAnnotations = () => {
		canvas.current.remove(selectedObject);
		canvas.current.renderAll();
	};

	const handleFontStyleChange = () => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({
				fontStyle: currentObject.test.fontStyle === 'italic' ? 'normal' : 'italic',
			});
		}
		commentBoxRef.current.fontStyle = commentBoxRef.current.fontStyle === 'italic' ? 'normal' : 'italic';
		canvas.current.renderAll();
	};

	const handleFontTypeChange = () => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({
				fontWeight: currentObject.test.fontWeight === 'bold' ? 'normal' : 'bold',
			});
		}
		commentBoxRef.current.fontWeight = commentBoxRef.current.fontWeight === 'bold' ? 'normal' : 'bold';
		canvas.current.renderAll();
	};

	return (
		<div className='flex items-center justify-center'>
			<div className='flex items-center justify-center'>
				<BackgroundColorIcon />
				<span className='ml-1 mr-2'>Fill</span>
				<ColorPicker
					size='small'
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.backgroundColor
							: selectedObject.fill
					}
					placement='bottomLeft'
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRoundIcon />
					<span>Stroke</span>
				</div>
				<ColorPicker
					size='small'
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.borderColor
							: selectedObject.stroke
					}
					placement='bottomLeft'
					onChange={handleBorderColorChange}
					onChangeComplete={handleBorderColorChangeComplete}
				/>
				<InputNumber
					size='small'
					className='w-14'
					min={1}
					max={15}
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.strokeWidth
							: selectedObject.strokeWidth
					}
					onChange={handleStrokeWidthChange}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-1'>
				<Button
					onClick={handleFontTypeChange}
					style={{ padding: 4 }}
					size='small'
					icon={<TextBoldIcon />}
					type='text'
					className={
						(Object.keys(selectedObject).length === 0
							? commentBoxRef.current.fontWeight
							: selectedObject.test.fontWeight) === 'bold'
							? 'bg-gray-200 shadow-sm'
							: ''
					}
				/>
				<Button
					onClick={handleFontStyleChange}
					size='small'
					style={{ padding: 4 }}
					icon={<TextItalicIcon />}
					type='text'
					className={
						(Object.keys(selectedObject).length === 0
							? commentBoxRef.current.fontStyle
							: selectedObject.test.fontStyle) === 'italic'
							? 'bg-gray-200 shadow-sm'
							: ''
					}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<AddTextIcon />
					<span>Text</span>
				</div>
				<ColorPicker
					size='small'
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.fontColor
							: selectedObject.test.fill
					}
					placement='bottomLeft'
					onChange={handleFontColorChange}
					onChangeComplete={handleFontColorChangeComplete}
				/>
				<InputNumber
					size='small'
					className='w-24'
					min={1}
					max={100}
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.fontSize
							: selectedObject.test.fontSize
					}
					onChange={handleFontSizeChange}
				/>
				<Input
					size='small'
					value={
						Object.keys(selectedObject).length === 0 ? commentBoxRef.current.text : selectedObject.test.text
					}
					onChange={handleChangeTextboxText}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<Button icon={<DeleteIcon />} size='small' type='text' onClick={handleDeleteAnnotations} />
		</div>
	);
};

export default CommentBoxContextMenu;
