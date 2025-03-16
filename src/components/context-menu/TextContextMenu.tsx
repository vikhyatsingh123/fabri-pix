/**
 * @author Vikhyat Singh
 * Context menu for Text
 */

import { Canvas, Textbox } from 'fabric';
import React from 'react';

import ColorPicker from '../widgets/ColorPicker';
import InputNumber from '../widgets/InputNumber.tsx';
import TextAlignSegmented from '../widgets/TextAlignSegmented';
import BackgroundColorIcon from '../../icons/BackgroundColorIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import AddTextIcon from '../../icons/AddTextIcon';
import TextBoldIcon from '../../icons/TextBoldIcon';
import TextItalicIcon from '../../icons/TextItalicIcon';

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
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<BackgroundColorIcon />
				<span style={{ margin: '0 8px 0 4px' }}>Fill</span>
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
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<div style={{ display: 'flex', gap: 4 }}>
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
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
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
			<TextAlignSegmented defaultValue={selectedObject.textAlign} onChange={handleAlignChange} />
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default TextContextMenu;
