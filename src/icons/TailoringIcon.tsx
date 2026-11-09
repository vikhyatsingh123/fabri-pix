/**
 * @author Vikhyat Singh
 * @description Tailoring icon
 */

import React from 'react';

const TailoringIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M12 4V36H44' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M20 12H36V28' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M12 12H4' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
			<path d='M36 44V36' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
		</svg>
	);
};

export default TailoringIcon;
