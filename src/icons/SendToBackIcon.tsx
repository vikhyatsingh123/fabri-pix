/**
 * @author Vikhyat Singh
 * @description Send to back icon
 */

import React from 'react';

const SendToBackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M24 6V30M14 20L24 30L34 20' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M6 34H42M6 42H42' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default SendToBackIcon;
