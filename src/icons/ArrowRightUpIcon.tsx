/**
 * @author Vikhyat Singh
 * @description Arrow-right-up icon
 */

import React from 'react';

const ArrowRightUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M19 11H37V29' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path
				d='M11.5439 36.4559L36.9997 11'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default ArrowRightUpIcon;
