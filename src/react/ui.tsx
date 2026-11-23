/**
 * @author Vikhyat Singh
 * @description Small UI building blocks used by the editor, replaceable through the `components` prop
 */

import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { useEditorUI } from './context';
import type { ButtonProps, ColorPickerProps, EditorSlot, NumberInputProps, SelectProps, SliderProps } from './types';

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

/** alpha of a partly transparent color (rgba() / #rrggbbaa), `null` for opaque or fully transparent colors */
const partialAlpha = (value?: string): number | null => {
	const color = value?.trim() ?? '';
	const rgba = color.match(/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)$/i);
	const hex = color.match(/^#[0-9a-f]{6}([0-9a-f]{2})$/i);
	const alpha = rgba ? Number(rgba[1]) : hex ? parseInt(hex[1], 16) / 255 : 1;
	return alpha > 0 && alpha < 1 ? Math.round(alpha * 1000) / 1000 : null;
};

/** the picked #rrggbb color with the alpha of the previous color, so that a translucent fill stays translucent */
const withAlpha = (hex: string, alpha: number | null) => {
	if (alpha === null) {
		return hex;
	}
	const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ColorPicker: React.FC<ColorPickerProps> = (props) => {
	const { value, onChange, onChangeComplete, 'aria-label': ariaLabel } = props;
	const ui = useEditorUI();

	const [color, setColor] = useState(toHexColor(value));
	const inputRef = useRef<HTMLInputElement | null>(null);
	const onChangeCompleteRef = useRef(onChangeComplete);
	onChangeCompleteRef.current = onChangeComplete;
	const alphaRef = useRef(partialAlpha(value));
	alphaRef.current = partialAlpha(value);

	useEffect(() => {
		setColor(toHexColor(value));
	}, [value]);

	// React's onChange is the native "input" event (fires while dragging), the native "change" event
	// fires once the user has picked the color
	useEffect(() => {
		const input = inputRef.current;
		const handleNativeChange = (event: Event) => {
			onChangeCompleteRef.current?.(withAlpha((event.target as HTMLInputElement).value, alphaRef.current));
		};

		input?.addEventListener('change', handleNativeChange);
		return () => {
			input?.removeEventListener('change', handleNativeChange);
		};
	}, []);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = event.target.value;
		setColor(newColor);
		onChange(withAlpha(newColor, alphaRef.current));
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
	const { value, onChange, onChangeComplete, min, max, 'aria-label': ariaLabel } = props;
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
			onBlur={() => onChangeComplete?.(Number(inputValue))}
			onKeyDown={(event) => {
				if (event.key === 'Enter') {
					onChangeComplete?.(Number(inputValue));
				}
			}}
			{...ui.slot('numberInput')}
		/>
	);
};

export const Slider: React.FC<SliderProps> = (props) => {
	const { value, min, max, step = 1, onChange, onChangeComplete, 'aria-label': ariaLabel } = props;
	const ui = useEditorUI();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const onChangeCompleteRef = useRef(onChangeComplete);
	onChangeCompleteRef.current = onChangeComplete;

	// the native "change" event fires once the thumb is released
	useEffect(() => {
		const input = inputRef.current;
		const handleNativeChange = (event: Event) => {
			onChangeCompleteRef.current?.(Number((event.target as HTMLInputElement).value));
		};
		input?.addEventListener('change', handleNativeChange);
		return () => {
			input?.removeEventListener('change', handleNativeChange);
		};
	}, []);

	return (
		<input
			ref={inputRef}
			type='range'
			aria-label={ariaLabel}
			value={value}
			min={min}
			max={max}
			step={step}
			onChange={(event) => onChange(Number(event.target.value))}
			{...ui.slot('slider')}
		/>
	);
};

export const Select: React.FC<SelectProps> = (props) => {
	const { value, options, onChange, 'aria-label': ariaLabel } = props;
	const ui = useEditorUI();
	return (
		<select
			aria-label={ariaLabel}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			{...ui.slot('select')}
		>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
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

/** where the popup goes: measured from the trigger, relative to the popup's containing block (the editor root) */
const placeDropdown = (
	trigger: HTMLElement,
	content: HTMLElement,
	placement: 'top' | 'bottom',
): { left: number; top: number } | null => {
	const parent = content.offsetParent as HTMLElement | null;
	if (!parent) {
		return null;
	}
	const triggerRect = trigger.getBoundingClientRect();
	const usesPage = parent === content.ownerDocument.body && getComputedStyle(parent).position === 'static';
	const parentRect = usesPage
		? { left: -window.scrollX, top: -window.scrollY, width: document.documentElement.clientWidth }
		: (() => {
				const rect = parent.getBoundingClientRect();
				return {
					left: rect.left + parent.clientLeft - parent.scrollLeft,
					top: rect.top + parent.clientTop - parent.scrollTop,
					width: parent.clientWidth,
				};
			})();
	const gap = 4;
	const top =
		placement === 'top'
			? triggerRect.top - parentRect.top - content.offsetHeight - gap
			: triggerRect.bottom - parentRect.top + gap;
	// stays inside the editor horizontally
	const maxLeft = Math.max(0, parentRect.width - content.offsetWidth);
	const left = Math.min(Math.max(0, triggerRect.left - parentRect.left), maxLeft);
	return { left, top };
};

/**
 * A trigger with a popup which closes when clicking outside. The popup is rendered into the editor root (a portal), so
 * a bar that scrolls sideways on narrow screens does not cut it off.
 */
export const Dropdown: React.FC<DropdownProps> = (props) => {
	const { open, onOpenChange, trigger, children, placement = 'top' } = props;
	const ui = useEditorUI();
	const containerRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
	const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
	const onOpenChangeRef = useRef(onOpenChange);
	onOpenChangeRef.current = onOpenChange;

	useEffect(() => {
		if (!open) {
			return;
		}
		const handleClickOutside = (event: PointerEvent) => {
			const target = event.target as Node;
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				!contentRef.current?.contains(target)
			) {
				onOpenChangeRef.current(false);
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onOpenChangeRef.current(false);
			}
		};
		document.addEventListener('pointerdown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('pointerdown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	useLayoutEffect(() => {
		if (open) {
			setPortalTarget(containerRef.current?.closest<HTMLElement>('.fp-root') ?? document.body);
		}
	}, [open]);

	// follows the trigger when the toolbar scrolls, the page resizes or the content changes size (lazy emoji picker)
	useLayoutEffect(() => {
		const container = containerRef.current;
		const content = contentRef.current;
		if (!open || !container || !content) {
			setPosition(null);
			return;
		}
		const update = () => setPosition(placeDropdown(container, content, placement));
		update();
		const observer = new ResizeObserver(update);
		observer.observe(content);
		window.addEventListener('resize', update);
		window.addEventListener('scroll', update, true);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', update);
			window.removeEventListener('scroll', update, true);
		};
	}, [open, placement, portalTarget]);

	const content = ui.slot('dropdownContent', `fp-dropdown-content--${placement}`);
	return (
		<div ref={containerRef} {...ui.slot('dropdown')}>
			{trigger}
			{open &&
				portalTarget &&
				createPortal(
					<div
						ref={contentRef}
						className={content.className}
						style={{
							...content.style,
							...(position
								? { left: position.left, top: position.top, bottom: 'auto' }
								: { visibility: 'hidden' }),
						}}
					>
						{children}
					</div>,
					portalTarget,
				)}
		</div>
	);
};

export const defaultUIComponents = {
	Button,
	ColorPicker,
	NumberInput,
	Slider,
	Select,
};

export type { EditorSlot };
