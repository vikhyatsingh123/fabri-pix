/**
 * @author Vikhyat Singh
 * Emoji dropdown component
 */

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

import DownOneIcon from '../../icons/DownOneIcon';
import { SubMenu } from '../../utils/utils';

// the picker (~60KB gzipped with its emoji data) is split into its own chunk by the consumer's bundler
// and only downloaded when the dropdown is opened for the first time
const EmojiPicker = lazy(() => import('emoji-picker-react'));

interface IProps {
	emojiIcon: any;
	activeAnnotation: SubMenu | '';
	handleEmojiClick: (emoji: any) => void;
	handleButtonClick: () => void;
}

const EmojiDropdown: React.FC<IProps> = (props) => {
	const { activeAnnotation, emojiIcon, handleEmojiClick, handleButtonClick } = props;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSelectEmoji = (emojiData: any) => {
		setIsOpen(false);
		handleEmojiClick(emojiData);
	};

	return (
		<>
			<button
				type='button'
				className={`custom-button ${activeAnnotation === SubMenu.EMOJI ? 'active' : ''}`}
				style={{ paddingRight: '8px' }}
				onClick={handleButtonClick}
			>
				<div className='ml-2'>{emojiIcon ? emojiIcon?.emoji : '😀'}</div>
				Emoji
			</button>
			<div className='dropdown' ref={dropdownRef}>
				<button
					type='button'
					onClick={() => setIsOpen((open) => !open)}
					className='custom-button'
					style={{ padding: '0px' }}
				>
					<DownOneIcon />
				</button>
				<div className={`dropdown-content ${isOpen ? 'show-emoji-dropdown' : ''}`}>
					{/* the picker renders thousands of emojis, only mount it while it is visible */}
					{isOpen && (
						<Suspense fallback={<div style={{ padding: 12, fontSize: 14 }}>Loading...</div>}>
							<EmojiPicker onEmojiClick={handleSelectEmoji} skinTonesDisabled />
						</Suspense>
					)}
				</div>
			</div>
		</>
	);
};

export default EmojiDropdown;
