/**
 * @author Vikhyat Singh
 * @description Underline icon
 */

import React from 'react';

const UnderlineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M14 6V22C14 27.5 18.5 32 24 32C29.5 32 34 27.5 34 22V6' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
			<path d='M10 42H38' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
		</svg>
	);
};

export default UnderlineIcon;
