import { lazy, Suspense, useEffect, useState, type FC } from 'react';

import 'fabri-pix/dist/fabri-pix.css';
import './styles.css';
import { codeExamples, features, useCases, type FeatureIcon, type UseCaseIcon } from './content';
import { CopyButton } from './CopyButton';
import {
	ArrowRightIcon,
	BugIcon,
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
import { isDocsPath, loadedDocs } from './preload';
import { Link, scrollToHash, usePath } from './router';
import { HOME_TITLE } from './seo';
import { SiteThemeContext, type Theme } from './theme';

// the documentation is its own chunk
const LazyDocs = lazy(() => import('./docs/Docs'));

const GITHUB_URL = 'https://github.com/vikhyatsingh123/fabri-pix';
const NPM_URL = 'https://www.npmjs.com/package/fabri-pix';
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
	if (typeof window === 'undefined') {
		return 'light';
	}
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

function Header(props: { theme: Theme; onToggleTheme: () => void; inDocs: boolean }) {
	const { theme, onToggleTheme, inDocs } = props;
	return (
		<header className={`site-header ${inDocs ? 'site-header--wide' : ''}`}>
			<div className='site-header-inner'>
				<Link className='brand' to='/'>
					<LogoMark />
					<span>FabriPix</span>
				</Link>
				<nav className='site-nav'>
					<Link to='/#playground'>Demo</Link>
					<Link to='/docs' className={inDocs ? 'active' : ''}>
						Docs
					</Link>
					<Link to='/docs/api/image-editor'>API</Link>
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
				<Link className='secondary-button' to='/docs/quick-start'>
					Get started
				</Link>
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
					<Link className='text-link' to='/docs'>
						Read the documentation <ArrowRightIcon />
					</Link>
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

function NotFound() {
	return (
		<section className='cta not-found'>
			<h2>Page not found</h2>
			<p>This page does not exist. It may have moved to the documentation.</p>
			<div className='hero-actions'>
				<Link className='secondary-button' to='/'>
					Home
				</Link>
				<Link className='secondary-button' to='/docs'>
					Documentation <ArrowRightIcon />
				</Link>
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
					<Link to='/docs'>Docs</Link>
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
	const path = usePath();
	const inDocs = isDocsPath(path);
	const Docs = loadedDocs()?.default ?? LazyDocs;

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('fabri-pix-theme', theme);
		} catch {
			// storage can be blocked
		}
	}, [theme]);

	useEffect(() => {
		if (!inDocs) {
			document.title = path === '/' ? HOME_TITLE : 'Page not found · FabriPix';
		}
	}, [inDocs, path]);

	useEffect(() => {
		if (window.location.hash) {
			scrollToHash();
		}
	}, []);

	return (
		<SiteThemeContext.Provider value={theme}>
			<Header
				theme={theme}
				inDocs={inDocs}
				onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
			/>
			{inDocs ? (
				<main className='docs-main'>
					<Suspense fallback={<div className='docs-loading'>Loading…</div>}>
						<Docs path={path} />
					</Suspense>
				</main>
			) : path !== '/' ? (
				<>
					<main>
						<NotFound />
					</main>
					<Footer />
				</>
			) : (
				<>
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
			)}
		</SiteThemeContext.Provider>
	);
}
