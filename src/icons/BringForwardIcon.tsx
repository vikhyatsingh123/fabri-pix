/**
 * @author Vikhyat Singh
 * @description Bring forward icon
 */

import React from 'react';

const BringForwardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<rect x='6' y='18' width='24' height='24' rx='2' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' strokeDasharray='4 4' />
			<rect x='18' y='6' width='24' height='24' rx='2' fill='currentColor' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default BringForwardIcon;
