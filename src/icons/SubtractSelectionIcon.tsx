/**
 * @author Vikhyat Singh
 * @description SubtractSelectionIcon icon
 */

import React from 'react';

const SubtractSelectionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<rect
				x='16'
				y='16'
				width='27'
				height='27'
				rx='2'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M16 32H7C5.89543 32 5 31.1046 5 30V7C5 5.89543 5.89543 5 7 5H30C31.1046 5 32 5.89543 32 7V16'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path d='M29 16L16 30' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M38 16L16 40' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M43 21L23 43' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M43 32L33 43' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default SubtractSelectionIcon;
