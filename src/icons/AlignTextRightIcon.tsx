/**
 * @author Vikhyat Singh
 * @description AlignTextRight icon
 */

import React from 'react';

const AlignTextRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='16' height='16' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M42 9H6' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M42 19H14' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M42 29H6' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M42 39H14' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default AlignTextRightIcon;
