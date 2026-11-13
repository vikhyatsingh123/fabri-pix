/**
 * @author Vikhyat Singh
 * @description Rotate right icon
 */

import React from 'react';

const RotateRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M36 10V20H26' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M34.5 19A16 16 0 1 0 38 30' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default RotateRightIcon;
