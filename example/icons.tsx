import type { SVGProps } from 'react';

// a small, consistent line icon set for the demo page (24 × 24, 1.75 stroke)
const Icon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.75'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
		{...props}
	/>
);

export const LogoMark = () => (
	<svg width='26' height='26' viewBox='0 0 32 32' aria-hidden='true'>
		<rect width='32' height='32' rx='8' fill='var(--text)' />
		<path d='M9 22V10h9' stroke='var(--bg)' strokeWidth='2.5' fill='none' strokeLinecap='round' />
		<path d='M9 16h6' stroke='var(--bg)' strokeWidth='2.5' strokeLinecap='round' />
		<circle cx='22' cy='21' r='3.5' fill='var(--accent)' />
	</svg>
);

export const CropIcon = () => (
	<Icon>
		<path d='M6 2v14a2 2 0 0 0 2 2h14' />
		<path d='M18 22V8a2 2 0 0 0-2-2H2' />
	</Icon>
);

export const SlidersIcon = () => (
	<Icon>
		<path d='M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' />
	</Icon>
);

export const EyeOffIcon = () => (
	<Icon>
		<path d='M9.9 4.2A10 10 0 0 1 12 4c5 0 9 4.5 10 8a12 12 0 0 1-2.2 3.6M6.6 6.6C4.2 8 2.6 10.2 2 12c1 3.5 5 8 10 8a10 10 0 0 0 5.4-1.6' />
		<path d='M2 2l20 20M9.9 9.9a3 3 0 0 0 4.2 4.2' />
	</Icon>
);

export const PenIcon = () => (
	<Icon>
		<path d='M12 20h9' />
		<path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' />
	</Icon>
);

export const HistoryIcon = () => (
	<Icon>
		<path d='M3 12a9 9 0 1 0 3-6.7L3 8' />
		<path d='M3 3v5h5M12 7v5l3 2' />
	</Icon>
);

export const KeyboardIcon = () => (
	<Icon>
		<rect x='2' y='5' width='20' height='14' rx='2' />
		<path d='M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M9 15h6' />
	</Icon>
);

export const SettingsIcon = () => (
	<Icon>
		<path d='M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0' />
		<circle cx='16' cy='6' r='2' />
		<circle cx='10' cy='12' r='2' />
		<circle cx='18' cy='18' r='2' />
	</Icon>
);

export const PlugIcon = () => (
	<Icon>
		<path d='M12 22v-5M9 8V2M15 8V2M18 8v4a6 6 0 0 1-12 0V8Z' />
	</Icon>
);

export const BugIcon = () => (
	<Icon>
		<rect x='7' y='7' width='10' height='14' rx='5' />
		<path d='M12 7V4M9 4l1 3M15 4l-1 3M3 13h4M17 13h4M4 19l3-2M20 19l-3-2M4 7l3 2M20 7l-3 2' />
	</Icon>
);

export const ShieldIcon = () => (
	<Icon>
		<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z' />
		<path d='M9 12l2 2 4-4' />
	</Icon>
);

export const SparkIcon = () => (
	<Icon>
		<path d='M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8' />
	</Icon>
);

export const GithubIcon = () => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
		<path d='M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z' />
	</svg>
);

export const SunIcon = () => (
	<Icon>
		<circle cx='12' cy='12' r='4' />
		<path d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' />
	</Icon>
);

export const MoonIcon = () => (
	<Icon>
		<path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' />
	</Icon>
);

export const CopyIcon = () => (
	<Icon width='16' height='16'>
		<rect x='9' y='9' width='12' height='12' rx='2' />
		<path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
	</Icon>
);

export const CheckIcon = () => (
	<Icon width='16' height='16'>
		<path d='M20 6 9 17l-5-5' />
	</Icon>
);

export const ArrowRightIcon = () => (
	<Icon width='16' height='16'>
		<path d='M5 12h14M13 6l6 6-6 6' />
	</Icon>
);

export const CodeIcon = () => (
	<Icon width='16' height='16'>
		<path d='m16 18 6-6-6-6M8 6l-6 6 6 6' />
	</Icon>
);

export const UploadIcon = () => (
	<Icon width='16' height='16'>
		<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' />
	</Icon>
);
