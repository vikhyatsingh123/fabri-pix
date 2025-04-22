/**
 * @author Vikhyat Singh
 * Context menu for shapes
 */

import React from 'react';
import { Canvas } from 'fabric';

import HandleRoundIcon from '../../icons/HandleRoundIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import BackgroundColorIcon from '../../icons/BackgroundColorIcon';
import ColorPicker from '../widgets/ColorPicker';
import InputNumber from '../widgets/InputNumber.tsx';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
}
const ShapesContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const handleBorderColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		canvas.current.renderAll();
	};

	const handleBackgroundColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleStrokeWidthChange = (val: number) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		if (currentObject) {
			currentObject.set({ strokeWidth: val });
		}
		canvas.current.renderAll();
	};

	const handleDeleteAnnotations = () => {
		canvas.current.remove(selectedObject);
		canvas.current.renderAll();
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<BackgroundColorIcon />
			<span style={{ margin: '0 8px 0 4px' }}>Fill</span>
			<ColorPicker value={selectedObject.fill} onChange={handleBackgroundColorChange} />
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<div style={{ display: 'flex', gap: 4 }}>
					<HandleRoundIcon />
					<span>Stroke</span>
				</div>
				<ColorPicker value={selectedObject.stroke} onChange={handleBorderColorChange} />
				<InputNumber min={1} max={50} value={selectedObject.strokeWidth} onChange={handleStrokeWidthChange} />
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default ShapesContextMenu;
