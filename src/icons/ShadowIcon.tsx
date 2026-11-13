/**
 * @author Vikhyat Singh
 * @description Shadow icon
 */

import React from 'react';

const ShadowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<rect x='16' y='16' width='26' height='26' rx='3' fill='currentColor' opacity='0.35' />
			<rect x='6' y='6' width='26' height='26' rx='3' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default ShadowIcon;
