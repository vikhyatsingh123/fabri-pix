/**
 * @author Vikhyat Singh
 * Text align component
 */

import React, { useState } from 'react';

import AlignTextCenterIcon from '../../icons/AlignTextCenterIcon';
import AlignTextLeftIcon from '../../icons/AlignTextLeftIcon';
import AlignTextRightIcon from '../../icons/AlignTextRightIcon';

const segmentedOptions = [
	{ value: 'left', label: <AlignTextLeftIcon /> },
	{ value: 'center', label: <AlignTextCenterIcon /> },
	{ value: 'right', label: <AlignTextRightIcon /> },
];

interface IProps {
	defaultValue: string;
	onChange: (value: string) => void;
}
const TextAlignSegmented: React.FC<IProps> = (props) => {
	const { defaultValue, onChange } = props;

	const [selected, setSelected] = useState(defaultValue);

	const handleSelection = (value: string) => {
		setSelected(value);
		onChange(value);
	};

	return (
		<div className='segmented-container'>
			{segmentedOptions.map((option) => (
				<button
					key={option.value}
					className={`segmented-option ${selected === option.value ? 'active' : ''}`}
					onClick={() => handleSelection(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
};

export default TextAlignSegmented;
