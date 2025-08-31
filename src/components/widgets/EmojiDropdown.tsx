/**
 * @author Vikhyat Singh
 * Emoji dropdown component
 */

import React, { useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

import DownOneIcon from '../../icons/DownOneIcon';
import { SubMenu } from '../../utils/utils';

interface IProps {
	emojiIcon: any;
	activeAnnotation: SubMenu | '';
	handleEmojiClick: (emoji: any) => void;
	handleButtonClick: () => void;
	handleShowDropdown: () => void;
	handleHideDropdown: () => void;
}

const EmojiDropdown: React.FC<IProps> = (props) => {
	const { activeAnnotation, emojiIcon, handleEmojiClick, handleButtonClick, handleShowDropdown, handleHideDropdown } =
		props;

	const dropdownRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const dropdown = document.getElementById('emoji-dropdown');
			const isDropdownOpen = dropdown?.classList.contains('show-emoji-dropdown');

			if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				handleHideDropdown();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleDropdownClick = () => {
		if (document.getElementById('emoji-dropdown').classList.contains('show-emoji-dropdown')) {
			handleHideDropdown();
		} else {
			handleShowDropdown();
		}
	};

	return (
		<>
			<button
				className={`custom-button ${activeAnnotation === SubMenu.EMOJI ? 'active' : ''}`}
				style={{ paddingRight: '8px' }}
				onClick={handleButtonClick}
			>
				<div className='ml-2'>{emojiIcon ? emojiIcon?.emoji : '😀'}</div>
				Emoji
			</button>
			<div className='dropdown' ref={dropdownRef}>
				<button onClick={handleDropdownClick} className='custom-button' style={{ padding: '0px' }}>
					<DownOneIcon />
				</button>
				<div id='emoji-dropdown' className='dropdown-content'>
					<EmojiPicker onEmojiClick={handleEmojiClick} skinTonesDisabled />
				</div>
			</div>
		</>
	);
};

export default EmojiDropdown;
