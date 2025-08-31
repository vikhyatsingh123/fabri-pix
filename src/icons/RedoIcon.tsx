/**
 * @author Vikhyat Singh
 * @description Redo icon
 */

import React from 'react';

interface IProps {
	disabled: boolean;
}

const RedoIcon: React.FC<IProps> = (props) => {
	const { disabled } = props;

	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
			<path
				d='M36.7279 36.7279C33.4706 39.9853 28.9706 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C28.9706 6 33.4706 8.01472 36.7279 11.2721C38.3859 12.9301 42 17 42 17'
				stroke={disabled ? 'rgba(16, 16, 16, 0.3)' : '#333'}
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M42 8V17H33'
				stroke={disabled ? 'rgba(16, 16, 16, 0.3)' : '#333'}
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default RedoIcon;
