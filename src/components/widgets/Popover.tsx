/**
 * @author Vikhyat Singh
 * Popover component
 */

import React, { useState, useRef } from 'react';

interface IProps {
	content: React.ReactNode;
	children: React.ReactNode;
	disabled?: boolean;
}

const Popover: React.FC<IProps> = (props) => {
	const { content, children, disabled } = props;
	const [isOpen, setIsOpen] = useState(false);
	const popoverRef = useRef<HTMLDivElement | null>(null);

	const togglePopover = () => {
		if (!disabled) {
			setIsOpen((prev) => !prev);
		}
	};

	return (
		<div className='relative inline-block'>
			<button
				className={`custom-button ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
				onClick={togglePopover}
				disabled={disabled}
			>
				{children}
			</button>

			{isOpen && (
				<div ref={popoverRef} className='absolute left-0 mt-2 w-48 bg-white border shadow-lg rounded-lg p-2'>
					{content}
				</div>
			)}
		</div>
	);
};

export default Popover;
