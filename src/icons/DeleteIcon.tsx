/**
 * @author Vikhyat Singh
 * @description DeleteIcon icon
 */

import React from 'react';

const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M9 10V44H39V10H9Z' fill='none' stroke='currentColor' strokeWidth='4' strokeLinejoin='round' />
			<path d='M20 20V33' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M28 20V33' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M4 10H44' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path
				d='M16 10L19.289 4H28.7771L32 10H16Z'
				fill='none'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default DeleteIcon;
