/**
 * @author Vikhyat Singh
 * @description Flip horizontal icon
 */

import React from 'react';

const FlipHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M24 6V42' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeDasharray='4 6' />
			<path d='M18 12L6 36H18V12Z' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
			<path d='M30 12L42 36H30V12Z' fill='currentColor' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
		</svg>
	);
};

export default FlipHorizontalIcon;
