/**
 * @author Vikhyat Singh
 * Context menu for arrow shapes
 */

import React from 'react';
import { Canvas } from 'fabric';

import DeleteIcon from '../../icons/DeleteIcon';
import BackgroundColorIcon from '../../icons/BackgroundColorIcon';
import ColorPicker from '../widgets/ColorPicker';

interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
}
const ArrowContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const handleBackgroundColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject() as any;
		if (currentObject) {
			currentObject._objects[1].set({ fill: val });
			currentObject._objects[0].set({ stroke: val });
		}
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
				<ColorPicker value={selectedObject?._objects?.[1]?.fill} onChange={handleBackgroundColorChange} />
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default ArrowContextMenu;
