/**
 * @author Vikhyat Singh
 * @description History icon
 */

import React from 'react';

interface IProps {
	disabled: boolean;
}

const HistoryIcon: React.FC<IProps> = (props) => {
	const { disabled } = props;

	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
			<path
				d='M5.81836 6.72729V14H13.0911'
				stroke={disabled ? 'rgba(16, 16, 16, 0.3)' : '#333'}
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M4 24C4 35.0457 12.9543 44 24 44V44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C16.598 4 10.1351 8.02111 6.67677 13.9981'
				stroke={disabled ? 'rgba(16, 16, 16, 0.3)' : '#333'}
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M24.005 12L24.0038 24.0088L32.4832 32.4882'
				stroke={disabled ? 'rgba(16, 16, 16, 0.3)' : '#333'}
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default HistoryIcon;
