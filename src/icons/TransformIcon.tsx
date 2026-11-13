/**
 * @author Vikhyat Singh
 * @description Transform icon
 */

import React from 'react';

const TransformIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<rect x='10' y='10' width='28' height='28' rx='2' stroke='currentColor' strokeWidth='4' transform='rotate(15 24 24)' />
			<path d='M40 6A20 20 0 0 1 44 18' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
		</svg>
	);
};

export default TransformIcon;
