/**
 * @author Vikhyat Singh
 * @description Flip vertical icon
 */

import React from 'react';

const FlipVerticalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M6 24H42' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeDasharray='4 6' />
			<path d='M12 18L36 6V18H12Z' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
			<path d='M12 30L36 42V30H12Z' fill='currentColor' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
		</svg>
	);
};

export default FlipVerticalIcon;
