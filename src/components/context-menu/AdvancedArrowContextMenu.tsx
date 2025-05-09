/**
 * @author Vikhyat Singh
 * Context menu for Advanced Arrow
 */

import React from 'react';
import { Canvas, Triangle } from 'fabric';
import HandleRoundIcon from '../../icons/HandleRoundIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import ColorPicker from '../widgets/ColorPicker';
import InputNumber from '../widgets/InputNumber.tsx';
interface IProps {
	canvas: React.RefObject<Canvas>;
	selectedObject: any;
	advancedArrowRef: React.RefObject<{
		stroke: string;
		width: number;
	}>;
}
const AdvancedArrowContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject, advancedArrowRef } = props;

	const handleBorderColorChange = (val: string) => {
		const currentObject = canvas.current.getActiveObject();
		const arrowHead = canvas.current?.getObjects().find((obj: any) => obj.id === selectedObject.id + '-arrowhead');
		if (currentObject) {
			currentObject.set({ stroke: val });
		}
		if (arrowHead) {
			arrowHead.set({ fill: val });
		}
		canvas.current.renderAll();
	};

	const handleBorderColorChangeComplete = (val: string) => {
		advancedArrowRef.current.stroke = val;
	};

	const handleDeleteAnnotations = () => {
		const arrowHead = canvas.current?.getObjects().find((obj: any) => obj.id === selectedObject.id + '-arrowhead');
		if (arrowHead) {
			canvas.current?.remove(arrowHead);
		}
		canvas.current.remove(selectedObject);
		canvas.current.renderAll();
	};

	const modifyArrowHeadOnMoving = (arrowHead: Triangle, coords: any) => {
		const dx = coords.p1.x - coords.p0.x;
		const dy = coords.p1.y - coords.p0.y;
		const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
		arrowHead?.set({
			left: coords.p1.x,
			top: coords.p1.y,
			angle: angle + 90,
		});
	};

	const handleStrokeWidthChange = (val: number | null) => {
		if (!val) {
			return;
		}

		const currentObject = canvas.current.getActiveObject();
		const arrowHead = canvas.current?.getObjects().find((obj: any) => obj.id === selectedObject.id + '-arrowhead');

		if (currentObject) {
			currentObject.set({ strokeWidth: val });
			currentObject.setCoords();
		}
		if (arrowHead) {
			arrowHead.set({
				width: val * 2,
				height: val * 2,
			});
		}

		modifyArrowHeadOnMoving(arrowHead, currentObject?.oCoords);
		advancedArrowRef.current.width = val;
		canvas.current.renderAll();
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
				<div style={{ display: 'flex', gap: 4 }}>
					<HandleRoundIcon />
					<span>Stroke</span>
				</div>
				<ColorPicker
					value={
						Object.keys(selectedObject).length === 0
							? advancedArrowRef.current.stroke
							: selectedObject.stroke
					}
					onChange={handleBorderColorChange}
					onChangeComplete={handleBorderColorChangeComplete}
				/>
				<InputNumber
					min={1}
					max={50}
					value={
						Object.keys(selectedObject).length === 0
							? advancedArrowRef.current.width
							: selectedObject.strokeWidth
					}
					onChange={handleStrokeWidthChange}
				/>
			</div>
			<hr style={{ borderTop: '30px solid #d9d9d9', margin: '0 5px' }} />

			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default AdvancedArrowContextMenu;
