/**
 * @author Vikhyat Singh
 * @description Bring to front icon
 */

import React from 'react';

const BringToFrontIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M24 30V6M14 16L24 6L34 16' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M6 34H42M6 42H42' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default BringToFrontIcon;
