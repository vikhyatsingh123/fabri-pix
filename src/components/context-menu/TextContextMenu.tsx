/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for Text
 */

import { Canvas, Textbox } from 'fabric';
import React from 'react';
import { Button, ColorPicker, InputNumber, Segmented, Tooltip } from 'antd';
import {
	AddTextTwo,
	AlignTextCenter,
	AlignTextLeft,
	AlignTextRight,
	BackgroundColor,
	Delete,
	TextBold,
	TextItalic,
} from '@icon-park/react';
import _ from 'lodash';
import { Color } from 'antd/es/color-picker';

import { useImageEditorActions, useTextBox } from '../store/ImageEditorStore';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: any;
}

const segmentedOptions = [
	{ value: 'left', label: <AlignTextLeft theme='outline' size='17' fill='#333' className='mt-0.5' /> },
	{ value: 'center', label: <AlignTextCenter theme='outline' size='17' fill='#333' className='mt-0.5' /> },
	{ value: 'right', label: <AlignTextRight theme='outline' size='17' fill='#333' className='mt-0.5' /> },
];

const TextContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const { setTextBox } = useImageEditorActions();
	const { textBox } = useTextBox();

	const handleFontColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (col: Color) => {
		setTextBox({ ...textBox, fontColor: col.toHexString() });
	};

	const handleBackgroundColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ backgroundColor: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (col: Color) => {
		setTextBox({ ...textBox, backgroundColor: col.toHexString() });
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
		setTextBox({ ...textBox, fontStyle: textBox.fontStyle === 'italic' ? 'normal' : 'italic' });
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
		setTextBox({ ...textBox, fontSize: value });
		canvas.current.renderAll();
	};

	const handleFontTypeChange = () => {
		const currentObject = canvas.current.getActiveObject() as Textbox;
		if (currentObject) {
			currentObject.set({
				fontWeight: currentObject.fontWeight === 'bold' ? 'normal' : 'bold',
			});
		}
		setTextBox({ ...textBox, fontWeight: textBox.fontWeight === 'bold' ? 'normal' : 'bold' });
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
					value={_.isEmpty(selectedObject) ? textBox.backgroundColor : selectedObject.backgroundColor}
					placement='bottomLeft'
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</Tooltip>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<AddTextTwo />
					<span>Text</span>
				</div>
				<Tooltip title='Text Color'>
					<ColorPicker
						size='small'
						value={_.isEmpty(selectedObject) ? textBox.fontColor : selectedObject.fill}
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
						value={_.isEmpty(selectedObject) ? textBox.fontSize : selectedObject.fontSize}
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
						icon={<TextBold />}
						type='text'
						className={
							(_.isEmpty(selectedObject) ? textBox.fontWeight : selectedObject.fontWeight) === 'bold'
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
						icon={<TextItalic />}
						type='text'
						className={
							(_.isEmpty(selectedObject) ? textBox.fontStyle : selectedObject.fontStyle) === 'italic'
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
				<Button icon={<Delete fill={'red'} />} size='small' type='text' onClick={handleDeleteAnnotations} />
			</Tooltip>
		</div>
	);
};

export default TextContextMenu;
