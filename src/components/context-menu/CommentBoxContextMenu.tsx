/**
 * @author Vikhyat Singh
 * Context menu for comment box
 */

import React from 'react';
import { Canvas } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button, InputNumber, Input } from 'antd';
import { AddTextTwo, BackgroundColor, Delete, HandleRound, TextBold, TextItalic } from '@icon-park/react';
import _ from 'lodash';

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
			<Tooltip title='Background Color' className='flex items-center justify-center'>
				<BackgroundColor />
				<span className='ml-1 mr-2'>Fill</span>
				<ColorPicker
					size='small'
					value={_.isEmpty(selectedObject) ? commentBoxRef.current.backgroundColor : selectedObject.fill}
					placement='bottomLeft'
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</Tooltip>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRound />
					<span>Stroke</span>
				</div>
				<Tooltip title='Border Color'>
					<ColorPicker
						size='small'
						value={_.isEmpty(selectedObject) ? commentBoxRef.current.borderColor : selectedObject.stroke}
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
							_.isEmpty(selectedObject) ? commentBoxRef.current.strokeWidth : selectedObject.strokeWidth
						}
						onChange={handleStrokeWidthChange}
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
							(_.isEmpty(selectedObject)
								? commentBoxRef.current.fontWeight
								: selectedObject.test.fontWeight) === 'bold'
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
							(_.isEmpty(selectedObject)
								? commentBoxRef.current.fontStyle
								: selectedObject.test.fontStyle) === 'italic'
								? 'bg-gray-200 shadow-sm'
								: ''
						}
					/>
				</Tooltip>
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<AddTextTwo />
					<span>Text</span>
				</div>
				<Tooltip title='Text Color'>
					<ColorPicker
						size='small'
						value={_.isEmpty(selectedObject) ? commentBoxRef.current.fontColor : selectedObject.test.fill}
						placement='bottomLeft'
						onChange={handleFontColorChange}
						onChangeComplete={handleFontColorChangeComplete}
					/>
				</Tooltip>
				<Tooltip title='Text Size'>
					<InputNumber
						size='small'
						className='w-24'
						min={1}
						max={100}
						value={
							_.isEmpty(selectedObject) ? commentBoxRef.current.fontSize : selectedObject.test.fontSize
						}
						onChange={handleFontSizeChange}
					/>
				</Tooltip>
				<Tooltip title='Commentbox Text'>
					<Input
						size='small'
						value={_.isEmpty(selectedObject) ? commentBoxRef.current.text : selectedObject.test.text}
						onChange={handleChangeTextboxText}
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

export default CommentBoxContextMenu;
