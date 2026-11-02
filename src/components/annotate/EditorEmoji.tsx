/**
 * @author Vikhyat Singh
 * Emoji for image editor
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';

import EmojiDropdown from '../widgets/EmojiDropdown';
import imageEditorShapes from '../../utils/imageEditorShapes';
import { generateId, SubMenu } from '../../utils/utils';

interface IProps {
	canvas: React.RefObject<Canvas>;
	activeAnnotation: SubMenu | '';
	setActiveAnnotation: React.Dispatch<React.SetStateAction<SubMenu | ''>>;
}

const EditorEmoji: React.FC<IProps> = (props) => {
	const { canvas, activeAnnotation, setActiveAnnotation } = props;

	const [emojiIcon, setEmojiIcon] = useState<any>(null);
	const emojiIconRef = useRef<any>(null);
	// generating the cursor image is expensive, it is only re-created when the emoji changes
	const cursorRef = useRef<{ emoji: string; cursor: string } | null>(null);

	// we need active annotation ref here to avoid closure issue happening in emojiPicker package
	const activeAnnotationRef = useRef<SubMenu | ''>(activeAnnotation);

	useEffect(() => {
		activeAnnotationRef.current = activeAnnotation;
	}, [activeAnnotation]);

	useEffect(() => {
		emojiIconRef.current = emojiIcon;
	}, [emojiIcon]);

	const updateEmojiCursor = () => {
		const emoji = emojiIconRef.current?.emoji ?? '😀';
		if (cursorRef.current?.emoji === emoji) {
			canvas.current.setCursor(cursorRef.current.cursor);
			return;
		}

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

			ctx.fillText(emoji, width / 2, height / 2);
		}

		const cursorUrl = canvasElement.toDataURL();
		cursorRef.current = { emoji, cursor: `url(${cursorUrl}) 20 20, auto` };
		canvas.current.setCursor(cursorRef.current.cursor);
	};

	const handleMouseDown = useCallback((e: any) => {
		const pointer = canvas.current.getScenePoint(e.e);
		const target = canvas.current.findTarget(e.e);

		if (target) {
			return;
		}

		const id = generateId();
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
			canvas.current.setCursor('move');
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

	const handleEmojiClick = (emojiData: any) => {
		setEmojiIcon(emojiData);
		// keep the ref in sync right away, the cursor and new emojis read it before the effect runs
		emojiIconRef.current = emojiData;
		if (activeAnnotationRef.current !== SubMenu.EMOJI) {
			setActiveAnnotation(SubMenu.EMOJI);
			canvas.current.discardActiveObject();
			canvas.current.requestRenderAll();
			// remove first so that the listeners can never be registered twice
			canvas.current.off('mouse:down', handleMouseDown);
			canvas.current.off('mouse:move', handleMouseMove);
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
		/>
	);
};

export default EditorEmoji;
