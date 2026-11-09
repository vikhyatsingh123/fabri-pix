/**
 * @author Vikhyat Singh
 * @description TextItalic icon
 */

import React from 'react';

const TextItalicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='16' height='16' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path d='M20 6H36' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M12 42H28' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
			<path
				d='M29 5.95215L19 41.9998'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default TextItalicIcon;
