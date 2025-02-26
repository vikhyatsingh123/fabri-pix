/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Textbox for image editor
 */

import { AddText } from '@icon-park/react';
import { Button } from 'antd';
import { Canvas } from 'fabric';
import React, { useCallback, useEffect, useRef } from 'react';
import { ulid } from 'ulid';

import { SubMenu } from '../utils/utils';
import imageEditorShapes from '../utils/imageEditorShapes';
import { useActiveAnnotation, useImageEditorActions, useTextBox } from '../store/ImageEditorStore';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
}

const EditorTextbox: React.FC<IProps> = (props) => {
	const { canvas } = props;

	const { textBox } = useTextBox();
	const activeAnnotation = useActiveAnnotation();
	const { setActiveAnnotation } = useImageEditorActions();

	const textBoxRef = useRef<{
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	}>(textBox);

	useEffect(() => {
		if (textBox) {
			textBoxRef.current = textBox;
		}
	}, [textBox]);

	const updateTextCursor = () => {
		const canvasElement = document.createElement('canvas');
		canvasElement.width = 120;
		canvasElement.height = 40;

		const ctx = canvasElement.getContext('2d');
		if (!ctx) {
			return;
		}

		ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

		ctx.fillStyle = textBoxRef.current.backgroundColor;
		ctx.globalAlpha = 0.8;
		ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

		ctx.strokeStyle = '#ff0000';
		ctx.setLineDash([4, 2]);
		ctx.lineWidth = 1;
		ctx.strokeRect(5, 5, 110, 30);

		ctx.fillStyle = textBoxRef.current.fontColor;
		ctx.font = '12px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Add your text here', canvasElement.width / 2, canvasElement.height / 2 + 4);

		const cursorUrl = canvasElement.toDataURL();
		canvas.current.setCursor(`url(${cursorUrl}) 35 20, auto`);
		canvas.current.requestRenderAll();
	};

	const handleMouseDown = useCallback((e: any) => {
		const pointer = canvas.current.getPointer(e.e);
		const target = canvas.current.findTarget(e.e);

		if (target) {
			return;
		}

		const id = ulid();
		imageEditorShapes({
			canvas,
			shapeType: SubMenu.TEXT,
			isNewShape: true,
			canvasData: {
				backgroundColor: textBoxRef.current.backgroundColor,
				fill: textBoxRef.current.fontColor,
				fontSize: textBoxRef.current.fontSize,
				fontStyle: textBoxRef.current.fontStyle,
				fontWeight: textBoxRef.current.fontWeight,
				id,
				left: pointer.x - 80,
				scaleX: 1,
				scaleY: 1,
				text: 'Add your text here',
				textAlign: 'left',
				top: pointer.y - 11,
			},
		});
	}, []);

	const handleMouseMove = useCallback((e: any) => {
		const target = canvas.current.findTarget(e.e);
		if (target) {
			canvas.current.setCursor('resize');
		} else {
			updateTextCursor();
		}
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotation !== SubMenu.TEXT) {
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.defaultCursor = 'default';
		}
	}, [activeAnnotation]);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const canvasOverlay = canvas.current;

		return () => {
			canvasOverlay.defaultCursor = 'default';
			canvasOverlay.off('mouse:down', handleMouseDown);
			canvasOverlay.off('mouse:move', handleMouseMove);
		};
	}, []);

	const handleAddText = () => {
		if (activeAnnotation === SubMenu.TEXT) {
			setActiveAnnotation('');
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.setCursor('default');
		} else {
			setActiveAnnotation(SubMenu.TEXT);
			canvas.current.discardActiveObject();
			canvas.current.requestRenderAll();
			canvas.current.on('mouse:down', handleMouseDown);
			canvas.current.on('mouse:move', handleMouseMove);
		}
	};

	return (
		<Button
			onClick={handleAddText}
			shape='round'
			icon={<AddText />}
			type={activeAnnotation === SubMenu.TEXT ? 'default' : 'text'}
			className={activeAnnotation === SubMenu.TEXT ? '!bg-[#F0F0F0]' : ''}
		>
			Text
		</Button>
	);
};

export default EditorTextbox;
