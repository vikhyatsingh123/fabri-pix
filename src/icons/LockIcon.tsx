/**
 * @author Vikhyat Singh
 * @description Lock icon
 */

import React from 'react';

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<rect x='8' y='22' width='32' height='20' rx='2' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M16 22V14C16 9.6 19.6 6 24 6C28.4 6 32 9.6 32 14V22' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default LockIcon;
