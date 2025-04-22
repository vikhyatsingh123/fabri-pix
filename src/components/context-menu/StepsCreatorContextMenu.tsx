/**
 * @author Vikhyat Singh
 * Context menu for steps creator
 */

import React from 'react';
import { Canvas, Circle, IText } from 'fabric';

import BackgroundColorIcon from '../../icons/BackgroundColorIcon';
import HandleRoundIcon from '../../icons/HandleRoundIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import AddTextIcon from '../../icons/AddTextIcon';
import ListNumbersIcon from '../../icons/ListNumbersIcon';
import ColorPicker from '../widgets/ColorPicker';
import InputNumber from '../widgets/InputNumber.tsx';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
	stepCreatorRef: React.RefObject<{
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		stepNumber: number;
		strokeWidth: number;
	}>;
}
const StepsCreatorContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, stepCreatorRef } = props;

	const handleBorderColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[0].set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (val: string) => {
		stepCreatorRef.current.borderColor = val;
	};

	const handleBackgroundColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[0]?.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChangeComplete = (val: string) => {
		stepCreatorRef.current.backgroundColor = val;
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[0].set({ strokeWidth: val });
		}
		stepCreatorRef.current.strokeWidth = val;
		canvas.current.renderAll();
	};

	const handleFontColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[1]?.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleFontColorChangeComplete = (val: string) => {
		stepCreatorRef.current.fontColor = val;
	};

	const handleSizeChange = (currentObject: any) => {
		const textObject = currentObject._objects?.[1]._objects?.[1] as IText;
		const circleObject = currentObject._objects?.[1]._objects?.[0] as Circle;
		const textWidth = textObject.width;
		const textHeight = textObject.height;
		const radius = circleObject.radius;
		const newRadius = Math.max(textWidth / 2 + 10, textHeight / 2 + 10);

		circleObject.set({
			radius: newRadius,
			left: circleObject.left - (newRadius - radius),
			top: circleObject.top - (newRadius - radius),
		});

		textObject.set({
			left: 0,
			top: 0,
		});

		canvas.current.discardActiveObject();
		canvas.current.setActiveObject(currentObject);
		canvas.current.requestRenderAll();
	};

	const handleFontSizeChange = (val: number | null) => {
		if (!val) {
			return;
		}
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[1]?.set({ fontSize: val });
			handleSizeChange(currentObject);
		}
		stepCreatorRef.current.fontSize = val;
		canvas.current.renderAll();
	};

	const handleStartStepNumberChange = (val: number | null) => {
		if (!val) {
			return;
		}
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects?.[1]?._objects?.[1]?.set({ text: val.toString() });
			handleSizeChange(currentObject);
		}
		stepCreatorRef.current.stepNumber = val;
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
							? stepCreatorRef.current.backgroundColor
							: selectedObject._objects?.[1].fill
					}
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
					value={
						Object.keys(selectedObject).length === 0
							? stepCreatorRef.current.borderColor
							: selectedObject._objects?.[0].stroke
					}
					onChange={handleBorderColorChange}
					onChangeComplete={handleBorderColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={15}
					value={
						Object.keys(selectedObject).length === 0
							? stepCreatorRef.current.strokeWidth
							: selectedObject._objects?.[0].strokeWidth
					}
					onChange={handleStrokeWidthChange}
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
						Object.keys(selectedObject).length === 0
							? stepCreatorRef.current.fontColor
							: selectedObject._objects?.[1]._objects?.[1].fill
					}
					onChange={handleFontColorChange}
					onChangeComplete={handleFontColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={100}
					value={
						Object.keys(selectedObject).length === 0
							? stepCreatorRef.current.fontSize
							: selectedObject._objects?.[1]._objects?.[1].fontSize
					}
					onChange={handleFontSizeChange}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<div style={{ display: 'flex', gap: 4 }}>
					<ListNumbersIcon />
					<span>Step Number</span>
				</div>
				<InputNumber
					min={1}
					value={
						Object.keys(selectedObject).length === 0
							? stepCreatorRef.current.stepNumber
							: selectedObject._objects?.[1]._objects?.[1].text
					}
					onChange={handleStartStepNumberChange}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default StepsCreatorContextMenu;
