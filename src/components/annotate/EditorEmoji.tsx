/**
 * @author Vikhyat Singh
 * Emoji for image editor
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';

import EmojiDropdown from '../widgets/EmojiDropdown';
import imageEditorShapes from '../../utils/imageEditorShapes';
import { SubMenu } from '../../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
}

const EditorEmoji: React.FC<IProps> = (props) => {
	const { canvas, activeAnnotation, setActiveAnnotation } = props;

	const [emojiIcon, setEmojiIcon] = useState<any>(null);
	const emojiIconRef = useRef<any>(null);

	// we need active annotation ref here to avoid closure issue happening in emojiPicker package
	const activeAnnotationRef = useRef<SubMenu | ''>(activeAnnotation);

	useEffect(() => {
		activeAnnotationRef.current = activeAnnotation;
	}, [activeAnnotation]);

	useEffect(() => {
		emojiIconRef.current = emojiIcon;
	}, [emojiIcon]);

	const updateEmojiCursor = () => {
		const canvasElement = document.createElement('canvas');
		const ctx = canvasElement.getContext('2d');

		const width = 40;
		const height = 40;
		canvasElement.width = width;
		canvasElement.height = height;

		if (ctx) {
			ctx.clearRect(0, 0, width, height);

			ctx.font = '32px "Apple Color Emoji", sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.globalAlpha = 0.7;

			ctx.fillText(emojiIconRef.current?.emoji ?? '😀', width / 2, height / 2);
		}

		const cursorUrl = canvasElement.toDataURL();

		canvas.current.setCursor(`url(${cursorUrl}) 20 20, auto`);
		canvas.current.requestRenderAll();
	};

	const handleMouseDown = useCallback((e: any) => {
		const pointer = canvas.current.getViewportPoint(e.e);
		const target = canvas.current.findTarget(e.e);

		if (target) {
			return;
		}

		const id = crypto.randomUUID();
		imageEditorShapes({
			canvas,
			shapeType: SubMenu.EMOJI,
			isNewShape: true,
			canvasData: {
				text: emojiIconRef.current?.emoji,
				id,
				left: pointer.x - 20,
				top: pointer.y - 20,
				scaleX: 1,
				scaleY: 1,
			},
		});
	}, []);

	const handleMouseMove = useCallback((e: any) => {
		const target = canvas.current.findTarget(e.e);
		if (target) {
			canvas.current.setCursor('resize');
		} else {
			updateEmojiCursor();
		}
	}, []);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (activeAnnotationRef.current !== SubMenu.EMOJI) {
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

	const handleShowDropdown = () => {
		document.getElementById('emoji-dropdown').classList.add('show-emoji-dropdown');
	};

	const handleHideDropdown = () => {
		document.getElementById('emoji-dropdown').classList.remove('show-emoji-dropdown');
	};

	const handleEmojiClick = (emojiData: any) => {
		setEmojiIcon(emojiData);
		handleHideDropdown();
		if (activeAnnotationRef.current !== SubMenu.EMOJI) {
			setActiveAnnotation(SubMenu.EMOJI);
			canvas.current.discardActiveObject();
			canvas.current.requestRenderAll();
			canvas.current.on('mouse:down', handleMouseDown);
			canvas.current.on('mouse:move', handleMouseMove);
		}
	};

	const handleButtonClick = () => {
		if (activeAnnotationRef.current === SubMenu.EMOJI) {
			setActiveAnnotation('');
			setEmojiIcon(null);
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.setCursor('default');
		} else {
			handleEmojiClick({
				activeSkinTone: '1f3fe',
				emoji: '😀',
				isCustom: false,
				names: ['grinning', 'grinning face'],
				unified: '1f600',
				unifiedWithoutSkinTone: '1f600',
			});
		}
	};

	return (
		<EmojiDropdown
			emojiIcon={emojiIcon}
			activeAnnotation={activeAnnotation}
			handleEmojiClick={handleEmojiClick}
			handleButtonClick={handleButtonClick}
			handleShowDropdown={handleShowDropdown}
			handleHideDropdown={handleHideDropdown}
		/>
	);
};

export default EditorEmoji;
