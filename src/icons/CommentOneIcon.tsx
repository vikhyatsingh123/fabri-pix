/**
 * @author Vikhyat Singh
 * @description CommentOneIcon icon
 */

import React from 'react';

const CommentOneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg width='20' height='20' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
			<path
				d='M44 6H4V36H13V41L23 36H44V6Z'
				fill='none'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path d='M14 21H34' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
};

export default CommentOneIcon;
