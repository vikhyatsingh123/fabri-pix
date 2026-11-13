/**
 * @author Vikhyat Singh
 * @description Triangle icon
 */

import React from 'react';

const TriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M24 6L44 40H4L24 6Z' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
		</svg>
	);
};

export default TriangleIcon;
