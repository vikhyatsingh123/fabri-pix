/**
 * @author Vikhyat Singh
 * @description Dashed icon
 */

import React from 'react';

const DashedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M6 24H12M20 24H28M36 24H42' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default DashedIcon;
