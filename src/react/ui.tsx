/**
 * @author Vikhyat Singh
 * @description Small UI building blocks used by the editor, replaceable through the `components` prop
 */

import React, { ReactNode, useEffect, useRef, useState } from 'react';

import { useEditorUI } from './context';
import type { ButtonProps, ColorPickerProps, EditorSlot, NumberInputProps } from './types';

export const cx = (...classNames: (string | false | undefined | null)[]) => classNames.filter(Boolean).join(' ');

export const Button: React.FC<ButtonProps> = (props) => {
	const { active, danger, slot = 'button', className, style, type = 'button', ...rest } = props;
	const ui = useEditorUI();
	const base = ui.slot('button', active && 'fp-button--active', danger && 'fp-button--danger');
	const part = slot !== 'button' ? ui.slot(slot) : { className: '', style: undefined };

	return (
		<button
			type={type}
			aria-pressed={active === undefined ? undefined : active}
			className={cx(base.className, part.className, className)}
			style={{ ...base.style, ...part.style, ...style }}
			{...rest}
		/>
	);
};

// <input type="color"> only accepts #rrggbb, anything else (#fff, rgb(), transparent) is shown as black
export const toHexColor = (value?: string): string => {
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

export const ColorPicker: React.FC<ColorPickerProps> = (props) => {
	const { value, onChange, onChangeComplete, 'aria-label': ariaLabel } = props;
	const ui = useEditorUI();

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
		<input
			ref={inputRef}
			type='color'
			aria-label={ariaLabel}
			value={color}
			onChange={handleChange}
			{...ui.slot('colorPicker')}
		/>
	);
};

export const NumberInput: React.FC<NumberInputProps> = (props) => {
	const { value, onChange, min, max, 'aria-label': ariaLabel } = props;
	const ui = useEditorUI();

	const [inputValue, setInputValue] = useState(value);

	useEffect(() => {
		setInputValue(value);
	}, [value]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		let newValue = parseInt(event.target.value, 10);
		if (isNaN(newValue)) {
			return;
		}
		if (min !== undefined && newValue < min) {
			newValue = min;
		}
		if (max !== undefined && newValue > max) {
			newValue = max;
		}
		setInputValue(newValue);
		onChange(newValue);
	};

	return (
		<input
			type='number'
			aria-label={ariaLabel}
			// never undefined, that switches the input between uncontrolled and controlled
			value={inputValue ?? ''}
			min={min}
			max={max}
			onChange={handleChange}
			{...ui.slot('numberInput')}
		/>
	);
};

export const Divider: React.FC = () => {
	const ui = useEditorUI();
	return <span role='separator' {...ui.slot('divider')} />;
};

/** icon + label + controls, used by the option panels */
export const Field: React.FC<{ icon?: ReactNode; label?: string; children: ReactNode }> = (props) => {
	const { icon, label, children } = props;
	const ui = useEditorUI();
	return (
		<div {...ui.slot('field')}>
			{(icon || label) && (
				<span className='fp-field-label'>
					{icon}
					{label && <span>{label}</span>}
				</span>
			)}
			{children}
		</div>
	);
};

export interface SegmentedOption {
	value: string;
	label: ReactNode;
	title?: string;
}

export const Segmented: React.FC<{
	value: string | undefined;
	options: SegmentedOption[];
	onChange: (value: string) => void;
}> = (props) => {
	const { value, options, onChange } = props;
	const ui = useEditorUI();
	const { Button: ButtonComponent } = ui.components;
	return (
		<div role='group' {...ui.slot('segmented')}>
			{options.map((option) => (
				<ButtonComponent
					key={option.value}
					active={value === option.value}
					title={option.title}
					aria-label={option.title}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</ButtonComponent>
			))}
		</div>
	);
};

export interface DropdownProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** the toggle button(s) */
	trigger: ReactNode;
	children: ReactNode;
	/** where the content opens relative to the trigger, default 'top' (the toolbar is at the bottom) */
	placement?: 'top' | 'bottom';
}

/** a trigger with a popup which closes when clicking outside */
export const Dropdown: React.FC<DropdownProps> = (props) => {
	const { open, onOpenChange, trigger, children, placement = 'top' } = props;
	const ui = useEditorUI();
	const containerRef = useRef<HTMLDivElement | null>(null);
	const onOpenChangeRef = useRef(onOpenChange);
	onOpenChangeRef.current = onOpenChange;

	useEffect(() => {
		if (!open) {
			return;
		}
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				onOpenChangeRef.current(false);
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onOpenChangeRef.current(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	const content = ui.slot('dropdownContent', `fp-dropdown-content--${placement}`);
	return (
		<div ref={containerRef} {...ui.slot('dropdown')}>
			{trigger}
			{open && <div {...content}>{children}</div>}
		</div>
	);
};

export const defaultUIComponents = {
	Button,
	ColorPicker,
	NumberInput,
};

export type { EditorSlot };
