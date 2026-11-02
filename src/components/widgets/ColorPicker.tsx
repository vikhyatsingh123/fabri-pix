/**
 * @author Vikhyat Singh
 * ColorPicker component
 */

import React, { useEffect, useRef, useState } from 'react';

// <input type="color"> only accepts #rrggbb, anything else (#fff, rgb(), transparent) is shown as black
const toHexColor = (value?: string): string => {
	if (typeof value !== 'string') {
		return '#000000';
	}

	const color = value.trim();
	if (/^#[0-9a-f]{6}$/i.test(color)) {
		return color.toLowerCase();
	}
	if (/^#[0-9a-f]{3}$/i.test(color)) {
		return `#${color
			.slice(1)
			.split('')
			.map((char) => char + char)
			.join('')}`.toLowerCase();
	}

	const rgb = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
	if (rgb) {
		return `#${rgb
			.slice(1, 4)
			.map((channel) => Math.min(255, Number(channel)).toString(16).padStart(2, '0'))
			.join('')}`;
	}

	return '#000000';
};

interface IProps {
	value: string;
	onChange: (color: string) => void;
	onChangeComplete?: (color: string) => void;
}
const ColorPicker: React.FC<IProps> = (props) => {
	const { value, onChange, onChangeComplete } = props;

	const [color, setColor] = useState(toHexColor(value));
	const inputRef = useRef<HTMLInputElement | null>(null);
	const onChangeCompleteRef = useRef(onChangeComplete);
	onChangeCompleteRef.current = onChangeComplete;

	useEffect(() => {
		setColor(toHexColor(value));
	}, [value]);

	// React's onChange is the native "input" event (fires while dragging), the native "change" event
	// fires once the user has picked the color
	useEffect(() => {
		const input = inputRef.current;
		const handleNativeChange = (event: Event) => {
			onChangeCompleteRef.current?.((event.target as HTMLInputElement).value);
		};

		input?.addEventListener('change', handleNativeChange);
		return () => {
			input?.removeEventListener('change', handleNativeChange);
		};
	}, []);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = event.target.value;
		setColor(newColor);
		onChange(newColor);
	};

	return (
		<div className='color-picker'>
			<input ref={inputRef} type='color' value={color} onChange={handleChange} className='color-input' />
		</div>
	);
};

export default ColorPicker;
