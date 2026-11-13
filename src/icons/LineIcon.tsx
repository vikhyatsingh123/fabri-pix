/**
 * @author Vikhyat Singh
 * @description Line icon
 */

import React from 'react';

const LineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M8 40L40 8' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
		</svg>
	);
};

export default LineIcon;
