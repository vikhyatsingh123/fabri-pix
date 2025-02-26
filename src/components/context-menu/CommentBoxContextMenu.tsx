/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for comment box
 */

import React from 'react';
import { Canvas } from 'fabric';
import { Color } from 'antd/lib/color-picker';
import { ColorPicker, Tooltip, Button, InputNumber, Divider, Input } from 'antd';
import { AddTextTwo, BackgroundColor, Delete, HandleRound, TextBold, TextItalic } from '@icon-park/react';
import _ from 'lodash';

import { useCommentBox, useImageEditorActions } from '../store/ImageEditorStore';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: any;
}
const CommentBoxContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const { commentBox } = useCommentBox();
	const { setCommentBox } = useImageEditorActions();

	const handleBorderColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (col: Color) => {
		setCommentBox({ ...commentBox, borderColor: col.toHexString() });
	};

	const handleBackgroundColorChange = (__: Color, val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (col: Color) => {
		setCommentBox({ ...commentBox, backgroundColor: col.toHexString() });
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ strokeWidth: val });
		}
		setCommentBox({ ...commentBox, strokeWidth: val });
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
		setCommentBox({ ...commentBox, fontColor: col.toHexString() });
	};

	const handleFontSizeChange = (val: number | null) => {
		if (!val) {
			return;
		}
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({ fontSize: val });
		}
		setCommentBox({ ...commentBox, fontSize: val });
		canvas.current.renderAll();
	};

	const handleChangeTextboxText = (e: any) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({ text: e.target.value });
		}
		setCommentBox({ ...commentBox, text: e.target.value });
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
		setCommentBox({ ...commentBox, fontStyle: commentBox.fontStyle === 'italic' ? 'normal' : 'italic' });
		canvas.current.renderAll();
	};

	const handleFontTypeChange = () => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject.test.set({
				fontWeight: currentObject.test.fontWeight === 'bold' ? 'normal' : 'bold',
			});
		}
		setCommentBox({ ...commentBox, fontWeight: commentBox.fontWeight === 'bold' ? 'normal' : 'bold' });
		canvas.current.renderAll();
	};

	return (
		<div className='flex items-center justify-center'>
			<Tooltip title='Background Color' className='flex items-center justify-center'>
				<BackgroundColor />
				<span className='ml-1 mr-2'>Fill</span>
				<ColorPicker
					size='small'
					value={_.isEmpty(selectedObject) ? commentBox.backgroundColor : selectedObject.fill}
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
						value={_.isEmpty(selectedObject) ? commentBox.borderColor : selectedObject.stroke}
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
						value={_.isEmpty(selectedObject) ? commentBox.strokeWidth : selectedObject.strokeWidth}
						onChange={handleStrokeWidthChange}
					/>
				</Tooltip>
			</div>
			<Divider type='vertical' className='mx-3 bg-[#d9d9d9]' />
			<div className='flex items-center justify-center gap-1'>
				<Tooltip title='Bold'>
					<Button
						onClick={handleFontTypeChange}
						style={{ padding: 4 }}
						size='small'
						icon={<TextBold />}
						type='text'
						className={
							(_.isEmpty(selectedObject) ? commentBox.fontWeight : selectedObject.test.fontWeight) === 'bold'
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
							(_.isEmpty(selectedObject) ? commentBox.fontStyle : selectedObject.test.fontStyle) === 'italic'
								? 'bg-gray-200 shadow-sm'
								: ''
						}
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
						value={_.isEmpty(selectedObject) ? commentBox.fontColor : selectedObject.test.fill}
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
						value={_.isEmpty(selectedObject) ? commentBox.fontSize : selectedObject.test.fontSize}
						onChange={handleFontSizeChange}
					/>
				</Tooltip>
				<Tooltip title='Commentbox Text'>
					<Input
						size='small'
						value={_.isEmpty(selectedObject) ? commentBox.text : selectedObject.test.text}
						onChange={handleChangeTextboxText}
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

export default CommentBoxContextMenu;
