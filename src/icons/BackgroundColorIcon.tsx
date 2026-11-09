/**
 * @author Vikhyat Singh
 * @description BackgroundColorIcon icon
 */

import React from 'react';

const BackgroundColorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M10 10H38V38H10V10Z' fill='none' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
			<path d='M10 10V38H38V10H10Z' fill='none' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
		</svg>
	);
};

export default BackgroundColorIcon;
