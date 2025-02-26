/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Emoji for image editor
 */

import { DownOne } from '@icon-park/react';
import { Dropdown } from 'antd';
import { Canvas } from 'fabric';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ulid } from 'ulid';

import { SubMenu } from '../utils/utils';
import imageEditorShapes from '../utils/imageEditorShapes';
import { useActiveAnnotation, useImageEditorActions } from '../store/ImageEditorStore';
import EmojiPicker from 'emoji-picker-react';
import _ from 'lodash';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
}

const EditorEmoji: React.FC<IProps> = (props) => {
	const { canvas } = props;

	const [openEmojiPicker, setOpenEmojiPicker] = useState<boolean>(false);

	const activeAnnotation = useActiveAnnotation();
	const { setActiveAnnotation } = useImageEditorActions();

	const emojiIconRef = useRef<any>(null);

	const updateEmojiCursor = () => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.src = emojiIconRef.current.imageUrl;

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

		const id = ulid();
		imageEditorShapes({
			canvas,
			shapeType: SubMenu.EMOJI,
			isNewShape: true,
			canvasData: {
				text: _.get(emojiIconRef.current, 'emoji'),
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

	const handleEmojiClick = (emojiData: any) => {
		emojiIconRef.current = emojiData;
		setOpenEmojiPicker(false);
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
		<Dropdown.Button
			onOpenChange={(open) => {
				if (open) {
					setOpenEmojiPicker(open);
				}
			}}
			trigger={['click']}
			dropdownRender={() => <EmojiPicker skinTonesDisabled open={openEmojiPicker} onEmojiClick={handleEmojiClick} />}
			type={activeAnnotation === SubMenu.EMOJI ? 'default' : 'text'}
			className={`w-fit shapes-btn ${activeAnnotation === SubMenu.EMOJI ? 'image-shapes-btn' : ''}`}
			icon={<DownOne theme='filled' size={18} />}
			placement='bottom'
			onClick={handleButtonClick}
		>
			<img
				src={
					emojiIconRef.current
						? emojiIconRef.current.imageUrl
						: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f600.png'
				}
				alt='emoji'
				className='w-4 h-4 ml-2'
			/>
			<span className='mr-2'>Emoji</span>
		</Dropdown.Button>
	);
};

export default EditorEmoji;
