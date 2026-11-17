import { useEffect, useState, type FC } from 'react';

import 'fabri-pix/dist/fabri-pix.css';
import './styles.css';
import { codeExamples, features, useCases, type FeatureIcon, type UseCaseIcon } from './content';
import {
	ArrowRightIcon,
	BugIcon,
	CheckIcon,
	CopyIcon,
	CropIcon,
	EyeOffIcon,
	GithubIcon,
	HistoryIcon,
	KeyboardIcon,
	LogoMark,
	MoonIcon,
	PenIcon,
	PlugIcon,
	SettingsIcon,
	ShieldIcon,
	SlidersIcon,
	SparkIcon,
	SunIcon,
} from './icons';
import { Playground } from './Playground';

type Theme = 'light' | 'dark';

const GITHUB_URL = 'https://github.com/vikhyatsingh123/fabri-pix';
const NPM_URL = 'https://www.npmjs.com/package/fabri-pix';
const DOCS_URL = `${GITHUB_URL}#readme`;
const INSTALL_COMMAND = 'npm install fabri-pix fabric@6';

const featureIcons: Record<FeatureIcon, FC> = {
	crop: CropIcon,
	sliders: SlidersIcon,
	eyeOff: EyeOffIcon,
	pen: PenIcon,
	history: HistoryIcon,
	keyboard: KeyboardIcon,
	settings: SettingsIcon,
	plug: PlugIcon,
};

const useCaseIcons: Record<UseCaseIcon, FC> = {
	bug: BugIcon,
	shield: ShieldIcon,
	spark: SparkIcon,
};

const initialTheme = (): Theme => {
	try {
		const stored = localStorage.getItem('fabri-pix-theme');
		if (stored === 'light' || stored === 'dark') {
			return stored;
		}
	} catch {
		// storage can be blocked
	}
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function CopyButton(props: { text: string; className?: string }) {
	const { text, className = 'copy-button' } = props;
	const [copied, setCopied] = useState(false);
	return (
		<button
			type='button'
			className={className}
			aria-label={copied ? 'Copied' : 'Copy to clipboard'}
			onClick={() => {
				void navigator.clipboard?.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			}}
		>
			{copied ? <CheckIcon /> : <CopyIcon />}
		</button>
	);
}

function Header(props: { theme: Theme; onToggleTheme: () => void }) {
	const { theme, onToggleTheme } = props;
	return (
		<header className='site-header'>
			<div className='site-header-inner'>
				<a className='brand' href='#top'>
					<LogoMark />
					<span>FabriPix</span>
				</a>
				<nav className='site-nav'>
					<a href='#playground'>Demo</a>
					<a href='#features'>Features</a>
					<a href='#code'>Code</a>
					<a href={DOCS_URL} target='_blank' rel='noreferrer'>
						Docs
					</a>
				</nav>
				<div className='site-header-actions'>
					<a className='header-link' href={NPM_URL} target='_blank' rel='noreferrer'>
						npm
					</a>
					<a
						className='icon-button'
						href={GITHUB_URL}
						target='_blank'
						rel='noreferrer'
						aria-label='GitHub repository'
					>
						<GithubIcon />
					</a>
					<button
						type='button'
						className='icon-button'
						aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
						onClick={onToggleTheme}
					>
						{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
					</button>
				</div>
			</div>
		</header>
	);
}

function Hero() {
	return (
		<section className='hero' id='top'>
			<a
				className='announcement'
				href={`${GITHUB_URL}/blob/main/RELEASE_NOTES.md`}
				target='_blank'
				rel='noreferrer'
			>
				<span className='announcement-tag'>New</span>
				Version 3: fully configurable and extensible
				<ArrowRightIcon />
			</a>
			<h1>
				The image editor for React
				<br />
				that you can make <span className='underline'>your own</span>.
			</h1>
			<p className='lead'>
				Crop, rotate, filter, redact and annotate images inside your app. Change any tool, text, icon, color or
				layout, or write your own tools.
			</p>
			<div className='hero-actions'>
				<a className='primary-button' href='#playground'>
					Try the editor
					<ArrowRightIcon />
				</a>
				<div className='install'>
					<code>{INSTALL_COMMAND}</code>
					<CopyButton text={INSTALL_COMMAND} />
				</div>
			</div>
			<ul className='facts'>
				<li>MIT licensed</li>
				<li>TypeScript</li>
				<li>React 18+</li>
				<li>Fabric.js 6</li>
			</ul>
		</section>
	);
}

function UseCases() {
	return (
		<section className='section' id='use-cases'>
			<div className='section-heading'>
				<p className='eyebrow eyebrow--blue'>Built for</p>
				<h2>Real image workflows</h2>
			</div>
			<div className='use-case-grid'>
				{useCases.map((useCase) => {
					const Icon = useCaseIcons[useCase.icon];
					return (
						<article key={useCase.title} className={`use-case-card tone-${useCase.tone}`}>
							<span className='card-icon'>
								<Icon />
							</span>
							<h3>{useCase.title}</h3>
							<p>{useCase.text}</p>
							<ul className='tags'>
								{useCase.tools.map((tool) => (
									<li key={tool}>{tool}</li>
								))}
							</ul>
						</article>
					);
				})}
			</div>
		</section>
	);
}

function Features() {
	return (
		<section className='section band band--soft' id='features'>
			<div className='section-heading'>
				<p className='eyebrow eyebrow--violet'>Features</p>
				<h2>Everything an image editor needs</h2>
				<p className='section-lead'>Ready to use out of the box. Every part can be configured or replaced.</p>
			</div>
			<div className='feature-grid'>
				{features.map((feature) => {
					const Icon = featureIcons[feature.icon];
					return (
						<article key={feature.title} className={`feature tone-${feature.tone}`}>
							<span className='card-icon'>
								<Icon />
							</span>
							<div>
								<h3>{feature.title}</h3>
								<p>{feature.text}</p>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
}

function CodeExamples() {
	const [active, setActive] = useState(codeExamples[0].id);
	const example = codeExamples.find((item) => item.id === active) ?? codeExamples[0];
	return (
		<section className='section band band--code' id='code'>
			<div className='code-section'>
				<div className='section-heading section-heading--left'>
					<p className='eyebrow eyebrow--teal'>Developers</p>
					<h2>A few lines of code</h2>
					<p className='section-lead'>
						Start with one component. Configure it with props, control it through a ref, or build your own
						interface from the exported parts and hooks.
					</p>
					<a className='text-link' href={DOCS_URL} target='_blank' rel='noreferrer'>
						Read the documentation <ArrowRightIcon />
					</a>
				</div>
				<div className='code-card'>
					<div className='code-tabs' role='tablist'>
						{codeExamples.map((item) => (
							<button
								key={item.id}
								type='button'
								role='tab'
								aria-selected={item.id === active}
								className={item.id === active ? 'active' : ''}
								onClick={() => setActive(item.id)}
							>
								{item.label}
							</button>
						))}
						<CopyButton text={example.code} className='copy-button copy-button--dark' />
					</div>
					<pre className='code-block'>
						<code>{example.code}</code>
					</pre>
				</div>
			</div>
		</section>
	);
}

function CallToAction() {
	return (
		<section className='cta'>
			<h2>Add an image editor to your app today.</h2>
			<p>Free and open source under the MIT license.</p>
			<div className='hero-actions'>
				<div className='install'>
					<code>{INSTALL_COMMAND}</code>
					<CopyButton text={INSTALL_COMMAND} />
				</div>
				<a className='secondary-button' href={GITHUB_URL} target='_blank' rel='noreferrer'>
					<GithubIcon /> Star on GitHub
				</a>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className='site-footer'>
			<div className='site-footer-inner'>
				<span className='brand brand--small'>
					<LogoMark />
					FabriPix
				</span>
				<span className='footer-links'>
					<a href={DOCS_URL}>Docs</a>
					<a href={GITHUB_URL}>GitHub</a>
					<a href={NPM_URL}>npm</a>
					<a href={`${GITHUB_URL}/issues`}>Issues</a>
				</span>
				<span className='footer-note'>
					MIT © Vikhyat Singh · Built on <a href='http://fabricjs.com/'>Fabric.js</a>
				</span>
			</div>
		</footer>
	);
}

export default function App() {
	const [theme, setTheme] = useState<Theme>(initialTheme);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('fabri-pix-theme', theme);
		} catch {
			// storage can be blocked
		}
	}, [theme]);

	return (
		<>
			<Header
				theme={theme}
				onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
			/>
			<main>
				<Hero />
				<Playground theme={theme} />
				<UseCases />
				<Features />
				<CodeExamples />
				<CallToAction />
			</main>
			<Footer />
		</>
	);
}
