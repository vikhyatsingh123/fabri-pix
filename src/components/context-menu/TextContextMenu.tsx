/**
 * @author Vikhyat Singh
 * Context menu for Text
 */

import { Canvas, Textbox } from 'fabric';
import React from 'react';
import { Segmented } from 'antd';
import BackgroundColorIcon from 'src/icons/BackgroundColorIcon';
import DeleteIcon from 'src/icons/DeleteIcon';
import AddTextIcon from 'src/icons/AddTextIcon';
import TextBoldIcon from 'src/icons/TextBoldIcon';
import TextItalicIcon from 'src/icons/TextItalicIcon';
import AlignTextLeftIcon from 'src/icons/AlignTextLeftIcon';
import AlignTextCenterIcon from 'src/icons/AlignTextCenterIcon';
import AlignTextRightIcon from 'src/icons/AlignTextRightIcon';
import ColorPicker from 'components/widgets/ColorPicker';
import InputNumber from 'components/widgets/InputNumber.tsx';
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

	const handleFontColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (val: string) => {
		textBoxRef.current.fontColor = val;
	};

	const handleBackgroundColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ backgroundColor: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (val: string) => {
		textBoxRef.current.backgroundColor = val;
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
			<div className='flex items-center justify-center'>
				<BackgroundColorIcon />
				<span className='ml-1 mr-2'>Fill</span>
				<ColorPicker
					value={
						Object.keys(selectedObject).length === 0
							? textBoxRef.current.backgroundColor
							: selectedObject.backgroundColor
					}
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<AddTextIcon />
					<span>Text</span>
				</div>
				<ColorPicker
					value={
						Object.keys(selectedObject).length === 0 ? textBoxRef.current.fontColor : selectedObject.fill
					}
					onChange={handleFontColorChange}
					onChangeComplete={handleFontColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={100}
					value={
						Object.keys(selectedObject).length === 0 ? textBoxRef.current.fontSize : selectedObject.fontSize
					}
					onChange={handleFontSizeChange}
				/>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-1'>
				<button
					className={`custom-button ${
						(Object.keys(selectedObject).length === 0
							? textBoxRef.current.fontWeight
							: selectedObject.fontWeight) === 'bold'
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
							? textBoxRef.current.fontStyle
							: selectedObject.fontStyle) === 'italic'
							? 'bg-gray-200 shadow-sm'
							: ''
					}`}
					onClick={handleFontStyleChange}
				>
					<TextItalicIcon />
				</button>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<Segmented
				options={segmentedOptions}
				size='small'
				defaultValue={selectedObject.textAlign}
				onChange={handleAlignChange}
			/>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default TextContextMenu;
