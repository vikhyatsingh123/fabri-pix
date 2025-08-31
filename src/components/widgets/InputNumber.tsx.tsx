/**
 * @author Vikhyat Singh
 * InputNumber component
 */

import React, { useEffect, useState } from 'react';

interface IProps {
	value: number;
	onChange: (val: number) => void;
	min?: number;
	max?: number;
	className?: string;
}
const InputNumber: React.FC<IProps> = (props) => {
	const { value, onChange, min, max, className } = props;

	const [inputValue, setInputValue] = useState(value);

	useEffect(() => {
		setInputValue(value);
	}, [value]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		let newValue = parseInt(event.target.value, 10);
		if (isNaN(newValue)) {
			return;
		}
		if (newValue < min) {
			newValue = min;
		}
		if (newValue > max) {
			newValue = max;
		}
		setInputValue(newValue);
		onChange(newValue);
	};

	return (
		<input
			type='number'
			className={`number-input ${className}`}
			value={inputValue}
			min={min}
			max={max}
			onChange={handleChange}
		/>
	);
};

export default InputNumber;
