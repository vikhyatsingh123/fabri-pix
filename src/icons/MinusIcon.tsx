/**
 * @author Vikhyat Singh
 * @description Minus icon
 */

import React from 'react';

interface IProps {
	disabled?: boolean;
}

const MinusIcon: React.FC<IProps> = (props) => {
	const { disabled } = props;

	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
			<path
				d='M10.5 24L38.5 24'
				stroke={disabled ? 'rgba(16, 16, 16, 0.3)' : '#333'}
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default MinusIcon;
