/**
 * @author Vikhyat Singh
 * Emoji dropdown component
 */

import React from 'react';
import EmojiPicker from 'emoji-picker-react';

import DownOneIcon from '../../icons/DownOneIcon';
import { SubMenu } from '../../utils/utils';

interface IProps {
	emojiIconRef: React.RefObject<any>;
	activeAnnotation: SubMenu | '';
	handleEmojiClick: (emoji: any) => void;
	handleButtonClick: () => void;
	handleShowDropdown: () => void;
	handleHideDropdown: () => void;
}

const EmojiDropdown: React.FC<IProps> = (props) => {
	const {
		activeAnnotation,
		emojiIconRef,
		handleEmojiClick,
		handleButtonClick,
		handleShowDropdown,
		handleHideDropdown,
	} = props;

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
				<img
					src={
						emojiIconRef.current
							? emojiIconRef.current.imageUrl
							: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f600.png'
					}
					alt='emoji'
					width={16}
					height={16}
				/>
				Emoji
			</button>
			<div className='dropdown'>
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
