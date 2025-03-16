/**
 * @author Vikhyat Singh
 * Context menu for comment box
 */

import React from 'react';
import { Canvas } from 'fabric';

import HandleRoundIcon from '../../icons/HandleRoundIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import TextBoldIcon from '../../icons/TextBoldIcon';
import TextItalicIcon from '../../icons/TextItalicIcon';
import AddTextIcon from '../../icons/AddTextIcon';
import ColorPicker from '../widgets/ColorPicker';
import InputNumber from '../widgets/InputNumber.tsx';
import BackgroundColorIcon from '../../icons/BackgroundColorIcon';

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

	const handleBorderColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (val: string) => {
		commentBoxRef.current.borderColor = val;
	};

	const handleBackgroundColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (val: string) => {
		commentBoxRef.current.backgroundColor = val;
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

	const handleFontColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (val: string) => {
		commentBoxRef.current.fontColor = val;
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
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.backgroundColor
							: selectedObject.fill
					}
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
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.borderColor
							: selectedObject.stroke
					}
					onChange={handleBorderColorChange}
					onChangeComplete={handleBorderColorChangeComplete}
				/>
				<InputNumber
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
				<button
					className={`custom-button ${
						(Object.keys(selectedObject).length === 0
							? commentBoxRef.current.fontWeight
							: selectedObject.test.fontWeight) === 'bold'
							? 'bg-gray-200 shadow-sm'
							: ''
					}`}
					onClick={handleFontTypeChange}
				>
					<TextBoldIcon />
				</button>
				<button
					className={`custom-button ${
						(Object.keys(selectedObject).length === 0
							? commentBoxRef.current.fontStyle
							: selectedObject.test.fontStyle) === 'italic'
							? 'bg-gray-200 shadow-sm'
							: ''
					}`}
					onClick={handleFontStyleChange}
				>
					<TextItalicIcon />
				</button>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<AddTextIcon />
					<span>Text</span>
				</div>
				<ColorPicker
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.fontColor
							: selectedObject.test.fill
					}
					onChange={handleFontColorChange}
					onChangeComplete={handleFontColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={100}
					value={
						Object.keys(selectedObject).length === 0
							? commentBoxRef.current.fontSize
							: selectedObject.test.fontSize
					}
					onChange={handleFontSizeChange}
				/>
				<input
					type='text'
					className='text-input small-input'
					value={
						Object.keys(selectedObject).length === 0 ? commentBoxRef.current.text : selectedObject.test.text
					}
					onChange={handleChangeTextboxText}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default CommentBoxContextMenu;
