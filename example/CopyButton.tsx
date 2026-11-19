import { useEffect, useRef, useState } from 'react';

import { CheckIcon, CopyIcon } from './icons';

export function CopyButton(props: { text: string; className?: string; label?: string }) {
	const { text, className = 'copy-button', label } = props;
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(timer.current), []);
	return (
		<button
			type='button'
			className={className}
			aria-label={copied ? 'Copied' : 'Copy to clipboard'}
			onClick={() => {
				void navigator.clipboard?.writeText(text);
				setCopied(true);
				clearTimeout(timer.current);
				timer.current = setTimeout(() => setCopied(false), 1500);
			}}
		>
			{copied ? <CheckIcon /> : <CopyIcon />}
			{label && <span>{copied ? 'Copied' : label}</span>}
		</button>
	);
}
