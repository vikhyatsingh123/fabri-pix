/**
 * @author Vikhyat Singh
 * @description Adjust icon
 */

import React from 'react';

const AdjustIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M8 12H40M8 24H40M8 36H40' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<circle cx='16' cy='12' r='4' fill='currentColor' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<circle cx='32' cy='24' r='4' fill='currentColor' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<circle cx='20' cy='36' r='4' fill='currentColor' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default AdjustIcon;
