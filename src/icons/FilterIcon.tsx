/**
 * @author Vikhyat Singh
 * @description Filter icon
 */

import React from 'react';

const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<circle cx='18' cy='18' r='12' stroke='currentColor' strokeWidth='4' />
			<circle cx='30' cy='18' r='12' stroke='currentColor' strokeWidth='4' />
			<circle cx='24' cy='30' r='12' stroke='currentColor' strokeWidth='4' />
		</svg>
	);
};

export default FilterIcon;
