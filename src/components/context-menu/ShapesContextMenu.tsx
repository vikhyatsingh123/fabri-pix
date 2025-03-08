/**
 * @author Vikhyat Singh
 * Context menu for shapes
 */

import React from 'react';
import { Canvas } from 'fabric';
import HandleRoundIcon from 'src/icons/HandleRoundIcon';
import DeleteIcon from 'src/icons/DeleteIcon';
import BackgroundColorIcon from 'src/icons/BackgroundColorIcon';
import ColorPicker from 'components/widgets/ColorPicker';
import InputNumber from 'components/widgets/InputNumber.tsx';

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
		<div className='flex items-center justify-center'>
			<BackgroundColorIcon />
			<span className='ml-1 mr-2'>Fill</span>
			<ColorPicker value={selectedObject.fill} onChange={handleBackgroundColorChange} />
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
					<HandleRoundIcon />
					<span>Stroke</span>
				</div>
				<ColorPicker value={selectedObject.stroke} onChange={handleBorderColorChange} />
				<InputNumber min={1} max={50} value={selectedObject.strokeWidth} onChange={handleStrokeWidthChange} />
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default ShapesContextMenu;
