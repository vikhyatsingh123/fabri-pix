/**
 * @author Vikhyat Singh
 * @description Add text icon
 */

import React from 'react';

const AddTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M4 8H32' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
			<path d='M28 21H44' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
			<path d='M18 42L18 8' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
			<path d='M36 42L36 21' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
		</svg>
	);
};

export default AddTextIcon;
