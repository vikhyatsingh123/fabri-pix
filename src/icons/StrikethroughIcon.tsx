/**
 * @author Vikhyat Singh
 * @description Strikethrough icon
 */

import React from 'react';

const StrikethroughIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M34 12C32 8.5 28.5 6 24 6C18.5 6 14 9.5 14 14C14 18 17 20.5 24 22' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
			<path d='M14 36C16 39.5 19.5 42 24 42C29.5 42 34 38.5 34 34C34 31 32.5 29 30 27.5' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
			<path d='M6 24H42' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
		</svg>
	);
};

export default StrikethroughIcon;
