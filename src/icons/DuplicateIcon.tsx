/**
 * @author Vikhyat Singh
 * @description Duplicate icon
 */

import React from 'react';

const DuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<rect x='14' y='14' width='28' height='28' rx='3' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M34 14V8C34 6.9 33.1 6 32 6H9C7.9 6 7 6.9 7 8V31C7 32.1 7.9 33 9 33H14' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default DuplicateIcon;
