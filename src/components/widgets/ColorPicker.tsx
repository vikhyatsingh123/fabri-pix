/**
 * @author Vikhyat Singh
 * ColorPicker component
 */

import React, { useEffect, useState } from 'react';

interface IProps {
	value: string;
	onChange: (color: string) => void;
	onChangeComplete?: (color: string) => void;
}
const ColorPicker: React.FC<IProps> = (props) => {
	const { value, onChange, onChangeComplete } = props;

	const [color, setColor] = useState(value);

	useEffect(() => {
		setColor(value);
	}, [value]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = event.target.value;
		setColor(newColor);
		onChange(newColor);
	};

	const handleBlur = () => {
		if (onChangeComplete) {
			onChangeComplete(color);
		}
	};

	return (
		<div className='color-picker'>
			<input type='color' value={color} onChange={handleChange} onBlur={handleBlur} className='color-input' />
		</div>
	);
};

export default ColorPicker;
