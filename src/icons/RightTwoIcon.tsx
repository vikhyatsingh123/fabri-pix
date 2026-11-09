/**
 * @author Vikhyat Singh
 * @description RightTwoIcon icon
 */

import React from 'react';

const RightTwoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path
				d='M24 43L42 24L24 5L24 17L6 17V31H24V43Z'
				fill='none'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default RightTwoIcon;
