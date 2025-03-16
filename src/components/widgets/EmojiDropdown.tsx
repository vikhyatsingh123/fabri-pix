/**
 * @author Vikhyat Singh
 * Emoji dropdown component
 */

import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

interface IProps {
	handleEmojiClick: (emoji: any) => void;
	handleButtonClick: any;
}

const EmojiDropdown: React.FC<IProps> = (props) => {
	const { handleEmojiClick, handleButtonClick } = props;

	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	const toggleDropdown = () => setIsOpen(!isOpen);
	const closeDropdown = () => setIsOpen(false);

	const handleClick = () => {
		handleButtonClick();
		toggleDropdown();
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			closeDropdown();
		}
	};

	useEffect(() => {
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	return (
		<div className='dropdown-container' ref={dropdownRef}>
			<button className='dropdown-btn' onClick={handleClick}>
				<img
					src='https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f600.png'
					alt='emoji'
					width={16}
					height={16}
				/>
				<span className='dropdown-label'>Emoji</span>
				<span className='dropdown-arrow'>▼</span>
			</button>

			{isOpen && (
				<div className='emoji-picker-container'>
					<EmojiPicker onEmojiClick={handleEmojiClick} skinTonesDisabled />
				</div>
			)}
		</div>
	);
};

export default EmojiDropdown;
