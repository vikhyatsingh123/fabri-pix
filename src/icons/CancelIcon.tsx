/**
 * @author Vikhyat Singh
 * @description Cancel icon
 */

import React from 'react';

const CancelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<circle
				cx='24'
				cy='24'
				r='20'
				fill='none'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path d='M33 15L15 33' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M15 15L33 33' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default CancelIcon;
