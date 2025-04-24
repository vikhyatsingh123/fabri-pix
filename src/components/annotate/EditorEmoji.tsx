/**
 * @author Vikhyat Singh
 * Emoji for image editor
 */

import { Canvas } from 'fabric';
import React, { useCallback, useEffect, useRef } from 'react';

import { SubMenu } from '../../utils/utils';
import imageEditorShapes from '../../utils/imageEditorShapes';
import EmojiDropdown from '../widgets/EmojiDropdown';

interface IProps {
	canvas: React.RefObject<Canvas>;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
}

const EditorEmoji: React.FC<IProps> = (props) => {
	const { canvas, activeAnnotation, setActiveAnnotation } = props;

	const emojiIconRef = useRef<any>(null);

	const updateEmojiCursor = () => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = emojiIconRef.current?.imageUrl;

		img.onload = () => {
			const canvasElement = document.createElement('canvas');
			const ctx = canvasElement.getContext('2d');

			const width = 40;
			const height = 40;
			canvasElement.width = width;
			canvasElement.height = height;

			ctx.globalAlpha = 0.7;
			ctx.drawImage(img, 0, 0, width, height);

			const cursorUrl = canvasElement.toDataURL();

			canvas.current.setCursor(`url(${cursorUrl}) 20 20, auto`);
			canvas.current.requestRenderAll();
		};
	};

	const handleMouseDown = useCallback((e: any) => {
		const pointer = canvas.current.getPointer(e.e);
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

		if (activeAnnotation !== SubMenu.EMOJI) {
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
		emojiIconRef.current = emojiData;
		handleHideDropdown();
		if (activeAnnotation !== SubMenu.EMOJI) {
			setActiveAnnotation(SubMenu.EMOJI);
			canvas.current.discardActiveObject();
			canvas.current.requestRenderAll();
			canvas.current.on('mouse:down', handleMouseDown);
			canvas.current.on('mouse:move', handleMouseMove);
		}
	};

	const handleButtonClick = () => {
		if (activeAnnotation === SubMenu.EMOJI) {
			setActiveAnnotation('');
			emojiIconRef.current = null;
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
			canvas.current.setCursor('default');
		} else {
			handleEmojiClick({
				activeSkinTone: '1f3fe',
				emoji: '😀',
				imageUrl: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f600.png',
				isCustom: false,
				names: ['grinning', 'grinning face'],
				unified: '1f600',
				unifiedWithoutSkinTone: '1f600',
			});
		}
	};

	return (
		<EmojiDropdown
			emojiIconRef={emojiIconRef}
			activeAnnotation={activeAnnotation}
			handleEmojiClick={handleEmojiClick}
			handleButtonClick={handleButtonClick}
			handleShowDropdown={handleShowDropdown}
			handleHideDropdown={handleHideDropdown}
		/>
	);
};

export default EditorEmoji;
