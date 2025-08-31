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
	textBoxContextMenu: {
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	};
	setTextBoxContextMenu: React.Dispatch<
		React.SetStateAction<{
			backgroundColor: string;
			fontColor: string;
			fontSize: number;
			fontStyle: string;
			fontWeight: string;
		}>
	>;
}

const TextContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, textBoxContextMenu, setTextBoxContextMenu } = props;

	const handleFontColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (val: string) => {
		setTextBoxContextMenu({ ...textBoxContextMenu, fontColor: val });
	};

	const handleBackgroundColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ backgroundColor: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (val: string) => {
		setTextBoxContextMenu({ ...textBoxContextMenu, backgroundColor: val });
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
		setTextBoxContextMenu({
			...textBoxContextMenu,
			fontStyle: textBoxContextMenu.fontStyle === 'italic' ? 'normal' : 'italic',
		});
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
		setTextBoxContextMenu({ ...textBoxContextMenu, fontSize: value });
		canvas.current.renderAll();
	};

	const handleFontTypeChange = () => {
		const currentObject = canvas.current.getActiveObject() as Textbox;
		if (currentObject) {
			currentObject.set({
				fontWeight: currentObject.fontWeight === 'bold' ? 'normal' : 'bold',
			});
		}
		setTextBoxContextMenu({
			...textBoxContextMenu,
			fontWeight: textBoxContextMenu.fontWeight === 'bold' ? 'normal' : 'bold',
		});
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
							? textBoxContextMenu.backgroundColor
							: selectedObject.backgroundColor
					}
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<div style={{ display: 'flex', gap: 4 }}>
					<AddTextIcon />
					<span>Text</span>
				</div>
				<ColorPicker
					value={
						Object.keys(selectedObject).length === 0 ? textBoxContextMenu.fontColor : selectedObject.fill
					}
					onChange={handleFontColorChange}
					onChangeComplete={handleFontColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={100}
					value={
						Object.keys(selectedObject).length === 0 ? textBoxContextMenu.fontSize : selectedObject.fontSize
					}
					onChange={handleFontSizeChange}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
				<button
					className={`custom-button ${
						(Object.keys(selectedObject).length === 0
							? textBoxContextMenu.fontWeight
							: selectedObject.fontWeight) === 'bold'
							? 'active'
							: ''
					}`}
					onClick={handleFontTypeChange}
				>
					<TextBoldIcon />
				</button>
				<button
					className={`custom-button ${
						(Object.keys(selectedObject).length === 0
							? textBoxContextMenu.fontStyle
							: selectedObject.fontStyle) === 'italic'
							? 'active'
							: ''
					}`}
					onClick={handleFontStyleChange}
				>
					<TextItalicIcon />
				</button>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />
			<TextAlignSegmented defaultValue={selectedObject.textAlign} onChange={handleAlignChange} />
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default TextContextMenu;
