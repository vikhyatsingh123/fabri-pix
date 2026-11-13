/**
 * @author Vikhyat Singh
 * @description Clear icon
 */

import React from 'react';

const ClearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M8 12H40' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
			<path d='M18 12V6H30V12' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
			<path d='M12 12L14 42H34L36 12' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
			<path d='M20 20L28 34M28 20L20 34' stroke='currentColor' strokeWidth='4' strokeLinecap='round' />
		</svg>
	);
};

export default ClearIcon;
