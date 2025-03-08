/**
 * @author Vikhyat Singh
 * Context menu for Advanced Arrow
 */

import React from 'react';
import { Canvas, Triangle } from 'fabric';
import HandleRoundIcon from 'src/icons/HandleRoundIcon';
import DeleteIcon from 'src/icons/DeleteIcon';
import ColorPicker from 'components/widgets/ColorPicker';
import InputNumber from 'components/widgets/InputNumber.tsx';
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
		<div className='flex items-center justify-center'>
			<div className='flex items-center justify-center gap-2'>
				<div className='flex gap-1'>
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
			<hr style={{ border: 'none', borderTop: '1px solid #d9d9d9', margin: '4px 0' }} />
			<button className={`custom-button`} onClick={handleDeleteAnnotations}>
				<DeleteIcon />
			</button>
		</div>
	);
};

export default AdvancedArrowContextMenu;
