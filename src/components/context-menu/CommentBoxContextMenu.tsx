/**
 * @author Vikhyat Singh
 * Context menu for comment box
 */

import React, { useEffect, useReducer, useRef } from 'react';
import { Canvas, FabricObject } from 'fabric';

import HandleRoundIcon from '../../icons/HandleRoundIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import TextBoldIcon from '../../icons/TextBoldIcon';
import TextItalicIcon from '../../icons/TextItalicIcon';
import AddTextIcon from '../../icons/AddTextIcon';
import ColorPicker from '../widgets/ColorPicker';
import InputNumber from '../widgets/InputNumber';
import BackgroundColorIcon from '../../icons/BackgroundColorIcon';
import { commitActiveObjectChange, removeCanvasObject } from '../../utils/canvasHelpers';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
	commentBoxRef: React.RefObject<{
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

	// the values shown here live on the fabric object / ref, which don't trigger a re-render by themselves
	const [, forceUpdate] = useReducer((count: number) => count + 1, 0);
	// clicking the canvas deselects the callout before the input blurs, so remember what is being edited
	const editedObjectRef = useRef<FabricObject | null>(null);

	const hasSelection = Object.keys(selectedObject).length > 0 && !!selectedObject.test;

	const handleBorderColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (val: string) => {
		commentBoxRef.current.borderColor = val;
		commitActiveObjectChange(canvas.current);
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
		commitActiveObjectChange(canvas.current);
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
		commitActiveObjectChange(canvas.current);
		forceUpdate();
	};

	const handleFontColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject?.test) {
			currentObject.test.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (val: string) => {
		commentBoxRef.current.fontColor = val;
		commitActiveObjectChange(canvas.current);
	};

	const handleFontSizeChange = (val: number | null) => {
		if (!val) {
			return;
		}
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject?.test) {
			currentObject.test.set({ fontSize: val });
		}
		commentBoxRef.current.fontSize = val;
		canvas.current.renderAll();
		commitActiveObjectChange(canvas.current);
		forceUpdate();
	};

	const handleChangeTextboxText = (e: React.ChangeEvent<HTMLInputElement>) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject?.test) {
			currentObject.test.set({ text: e.target.value });
		}
		commentBoxRef.current.text = e.target.value;
		canvas.current.renderAll();
		// the input is controlled by values outside of react state, without a re-render it would reset
		forceUpdate();
	};

	// the menu can unmount (callout deselected) before the input receives its blur event
	useEffect(() => {
		return () => handleTextboxTextBlur();
	}, []);

	const handleTextboxTextFocus = () => {
		editedObjectRef.current = canvas.current.getActiveObject() ?? null;
	};

	const handleTextboxTextBlur = () => {
		const target = editedObjectRef.current;
		editedObjectRef.current = null;
		if (target?.canvas) {
			canvas.current.fire('object:modified', { target });
		}
	};

	const handleDeleteAnnotations = () => {
		removeCanvasObject(canvas.current, selectedObject);
	};

	const handleFontStyleChange = () => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject?.test) {
			currentObject.test.set({
				fontStyle: currentObject.test.fontStyle === 'italic' ? 'normal' : 'italic',
			});
		}
		commentBoxRef.current.fontStyle = commentBoxRef.current.fontStyle === 'italic' ? 'normal' : 'italic';
		canvas.current.renderAll();
		commitActiveObjectChange(canvas.current);
		forceUpdate();
	};

	const handleFontTypeChange = () => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject?.test) {
			currentObject.test.set({
				fontWeight: currentObject.test.fontWeight === 'bold' ? 'normal' : 'bold',
			});
		}
		commentBoxRef.current.fontWeight = commentBoxRef.current.fontWeight === 'bold' ? 'normal' : 'bold';
		canvas.current.renderAll();
		commitActiveObjectChange(canvas.current);
		forceUpdate();
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<BackgroundColorIcon />
				<span style={{ margin: '0 8px 0 4px' }}>Fill</span>
				<ColorPicker
					value={hasSelection ? selectedObject.fill : commentBoxRef.current.backgroundColor}
					onChange={handleBackgroundColorChange}
					onChangeComplete={handleBackgroundColorChangeComplete}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<div style={{ display: 'flex', gap: 4 }}>
					<HandleRoundIcon />
					<span>Stroke</span>
				</div>
				<ColorPicker
					value={hasSelection ? selectedObject.stroke : commentBoxRef.current.borderColor}
					onChange={handleBorderColorChange}
					onChangeComplete={handleBorderColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={15}
					value={hasSelection ? selectedObject.strokeWidth : commentBoxRef.current.strokeWidth}
					onChange={handleStrokeWidthChange}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<button
					type='button'
					className={`custom-button ${
						(hasSelection ? selectedObject.test.fontWeight : commentBoxRef.current.fontWeight) === 'bold'
							? 'active'
							: ''
					}`}
					onClick={handleFontTypeChange}
				>
					<TextBoldIcon />
				</button>
				<button
					type='button'
					className={`custom-button ${
						(hasSelection ? selectedObject.test.fontStyle : commentBoxRef.current.fontStyle) === 'italic'
							? 'active'
							: ''
					}`}
					onClick={handleFontStyleChange}
				>
					<TextItalicIcon />
				</button>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<div style={{ display: 'flex', gap: 4 }}>
					<AddTextIcon />
					<span>Text</span>
				</div>
				<ColorPicker
					value={hasSelection ? selectedObject.test.fill : commentBoxRef.current.fontColor}
					onChange={handleFontColorChange}
					onChangeComplete={handleFontColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={100}
					value={hasSelection ? selectedObject.test.fontSize : commentBoxRef.current.fontSize}
					onChange={handleFontSizeChange}
				/>
				<input
					type='text'
					className='text-input small-input'
					value={hasSelection ? selectedObject.test.text : commentBoxRef.current.text}
					onChange={handleChangeTextboxText}
					onFocus={handleTextboxTextFocus}
					onBlur={handleTextboxTextBlur}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<button type='button' className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default CommentBoxContextMenu;
