import {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { ImageEditor, type ImageEditorController, type ImageEditorProps } from 'fabri-pix';
import { Highlight, themes } from 'prism-react-renderer';

import { editorThemes, sampleImages } from '../content';
import { CopyButton } from '../CopyButton';
import { ArrowRightIcon } from '../icons';
import { Link } from '../router';
import { useSiteTheme } from '../theme';
import { docsPath } from './nav';

// ---------------------------------------------------------------- text

export function PageHeader(props: { eyebrow?: string; title: ReactNode; lead?: ReactNode }) {
	const { eyebrow, title, lead } = props;
	return (
		<header className='doc-header'>
			{eyebrow && <p className='doc-eyebrow'>{eyebrow}</p>}
			<h1>{title}</h1>
			{lead && <p className='doc-lead'>{lead}</p>}
		</header>
	);
}

function Heading(props: { level: 2 | 3; id: string; children: ReactNode; className?: string }) {
	const { level, id, children, className } = props;
	const Tag = level === 2 ? 'h2' : 'h3';
	return (
		<Tag id={id} className={className}>
			{children}
			<a className='anchor' href={`#${id}`} aria-label='Link to this section'>
				#
			</a>
		</Tag>
	);
}

/** a section heading, listed in "On this page" */
export const H2 = (props: { id: string; children: ReactNode }) => <Heading level={2} {...props} />;

/** a sub section heading, listed in "On this page" */
export const H3 = (props: { id: string; children: ReactNode }) => <Heading level={3} {...props} />;

/** link to another docs page: `to` is the slug, optionally with a hash, e.g. `api/objects#addshape` */
export function DocLink(props: { to: string; children: ReactNode }) {
	const [slug, hash] = props.to.split('#');
	return <Link to={`${docsPath(slug)}${hash ? `#${hash}` : ''}`}>{props.children}</Link>;
}

export function Callout(props: { type?: 'note' | 'tip' | 'warning'; title?: string; children: ReactNode }) {
	const { type = 'note', title, children } = props;
	const icon = type === 'warning' ? '!' : type === 'tip' ? '✓' : 'i';
	return (
		<div className={`callout callout--${type}`} role='note'>
			<span className='callout-icon' aria-hidden='true'>
				{icon}
			</span>
			<div>
				{title && <p className='callout-title'>{title}</p>}
				{children}
			</div>
		</div>
	);
}

export const Kbd = (props: { children: ReactNode }) => <kbd>{props.children}</kbd>;

/** numbered steps, every child is one step */
export function Steps(props: { children: ReactNode }) {
	return <ol className='doc-steps'>{props.children}</ol>;
}

export function LinkCard(props: { to: string; title: string; children: ReactNode }) {
	const { to, title, children } = props;
	const [slug, hash] = to.split('#');
	return (
		<Link className='link-card' to={`${docsPath(slug)}${hash ? `#${hash}` : ''}`}>
			<span className='link-card-title'>
				{title} <ArrowRightIcon />
			</span>
			<span className='link-card-text'>{children}</span>
		</Link>
	);
}

export const CardGrid = (props: { children: ReactNode }) => <div className='card-grid'>{props.children}</div>;

// ---------------------------------------------------------------- code

export type CodeLanguage = 'tsx' | 'ts' | 'bash' | 'json' | 'css' | 'diff' | 'text';

function highlightLines(code: string, lineClass: (line: string) => string | null): ReactNode[] {
	return code.split('\n').flatMap((line, index) => {
		const className = lineClass(line);
		const content = className ? <span className={className}>{line}</span> : line;
		return index === 0 ? [<span key={index}>{content}</span>] : ['\n', <span key={index}>{content}</span>];
	});
}

const prismLanguage: Partial<Record<CodeLanguage, string>> = { tsx: 'tsx', ts: 'typescript', json: 'json', css: 'css' };

/** syntax highlighted code (Prism for tsx / ts / json / css, simple line rules for bash and diffs) */
export function Highlighted(props: { code: string; lang: CodeLanguage }) {
	const { code, lang } = props;
	const language = prismLanguage[lang];
	if (!language) {
		if (lang === 'bash') {
			return <>{highlightLines(code, (line) => (line.trim().startsWith('#') ? 'tok-comment' : null))}</>;
		}
		if (lang === 'diff') {
			return (
				<>
					{highlightLines(code, (line) =>
						line.startsWith('+') ? 'tok-added' : line.startsWith('-') ? 'tok-removed' : null,
					)}
				</>
			);
		}
		return <>{code}</>;
	}
	return (
		<Highlight code={code} language={language} theme={themes.nightOwl}>
			{({ tokens, getLineProps, getTokenProps }) =>
				tokens.map((line, index) => {
					const { key: _lineKey, ...lineProps } = getLineProps({ line }) as any;
					return (
						<span key={index} {...lineProps} style={undefined}>
							{line.map((token, tokenIndex) => {
								const { key: _tokenKey, ...tokenProps } = getTokenProps({ token }) as any;
								return <span key={tokenIndex} {...tokenProps} />;
							})}
							{index < tokens.length - 1 ? '\n' : null}
						</span>
					);
				})
			}
		</Highlight>
	);
}

/** a code block with syntax highlighting and a copy button */
export function CodeBlock(props: { code: string; lang?: CodeLanguage; title?: string; className?: string }) {
	const { lang = 'tsx', title, className } = props;
	const code = props.code.replace(/^\n+|\s+$/g, '');
	return (
		<div className={`doc-code ${className ?? ''}`}>
			<div className='doc-code-bar'>
				<span className='doc-code-title'>{title ?? lang}</span>
				<CopyButton text={code} className='copy-button copy-button--dark' />
			</div>
			<pre>
				<code>
					<Highlighted code={code} lang={lang} />
				</code>
			</pre>
		</div>
	);
}

/** code blocks with tabs, e.g. npm / yarn / pnpm */
export function CodeTabs(props: { tabs: { label: string; code: string; lang?: CodeLanguage }[] }) {
	const { tabs } = props;
	const [active, setActive] = useState(0);
	const tab = tabs[active] ?? tabs[0];
	const code = tab.code.replace(/^\n+|\s+$/g, '');
	return (
		<div className='doc-code'>
			<div className='doc-code-bar' role='tablist'>
				<span className='doc-code-tabs'>
					{tabs.map((item, index) => (
						<button
							key={item.label}
							type='button'
							role='tab'
							aria-selected={index === active}
							className={index === active ? 'active' : ''}
							onClick={() => setActive(index)}
						>
							{item.label}
						</button>
					))}
				</span>
				<CopyButton text={code} className='copy-button copy-button--dark' />
			</div>
			<pre>
				<code>
					<Highlighted code={code} lang={tab.lang ?? 'tsx'} />
				</code>
			</pre>
		</div>
	);
}

// ---------------------------------------------------------------- tables

export interface PropRow {
	name: string;
	type?: string;
	default?: string;
	required?: boolean;
	description: ReactNode;
}

/** a reference table of props / options / parameters */
export function PropTable(props: { rows: PropRow[]; nameLabel?: string; showDefault?: boolean }) {
	const { rows, nameLabel = 'Prop' } = props;
	const showDefault = props.showDefault ?? rows.some((row) => row.default !== undefined);
	return (
		<div className='table-wrap'>
			<table className='prop-table'>
				<thead>
					<tr>
						<th>{nameLabel}</th>
						<th>Type</th>
						{showDefault && <th>Default</th>}
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.name}>
							<td>
								<code className='prop-name'>{row.name}</code>
								{row.required && <span className='required'>required</span>}
							</td>
							<td>{row.type && <code className='prop-type'>{row.type}</code>}</td>
							{showDefault && <td>{row.default !== undefined && <code>{row.default}</code>}</td>}
							<td>{row.description}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/** a simple table: the first row is the header */
export function Table(props: { head: ReactNode[]; rows: ReactNode[][] }) {
	return (
		<div className='table-wrap'>
			<table className='prop-table'>
				<thead>
					<tr>
						{props.head.map((cell, index) => (
							<th key={index}>{cell}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{props.rows.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{row.map((cell, index) => (
								<td key={index}>{cell}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

// ---------------------------------------------------------------- live demos

export const DEMO_IMAGE = sampleImages[0].src;
export const DEMO_IMAGES = sampleImages;

const useInView = <T extends Element>() => {
	const ref = useRef<T>(null);
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const element = ref.current;
		if (!element || inView) {
			return;
		}
		if (typeof IntersectionObserver === 'undefined') {
			setInView(true);
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setInView(true);
				}
			},
			{ rootMargin: '300px' },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [inView]);
	return [ref, inView] as const;
};

export type DemoEditorProps = ImageEditorProps & {
	/** height of the editor in px, default 560 */
	height?: number;
};

/**
 * A live `<ImageEditor>` sized for the docs. It mounts once it scrolls into view, uses the demo image unless `src`
 * is passed and follows the site theme (a `theme` prop is merged on top).
 */
export const DemoEditor = forwardRef<ImageEditorController, DemoEditorProps>((props, ref) => {
	const { height = 560, theme, src = DEMO_IMAGE, ...rest } = props;
	const siteTheme = useSiteTheme();
	const [containerRef, inView] = useInView<HTMLDivElement>();
	return (
		<div ref={containerRef} className='demo-editor' style={{ height }}>
			{inView ? (
				<ImageEditor
					ref={ref}
					src={src}
					theme={{ ...editorThemes[siteTheme], primary: '#2563eb', active: '#2563eb1f', ...theme }}
					{...rest}
				/>
			) : (
				<div className='demo-placeholder'>Loading editor…</div>
			)}
		</div>
	);
});

DemoEditor.displayName = 'DemoEditor';

/** a live example: the preview (usually a `DemoEditor` plus controls) and its code below */
export function Demo(props: {
	title?: string;
	description?: ReactNode;
	code?: string;
	lang?: CodeLanguage;
	children: ReactNode;
}) {
	const { title, description, code, lang = 'tsx', children } = props;
	const [showCode, setShowCode] = useState(true);
	return (
		<figure className='demo'>
			<div className='demo-head'>
				<span className='demo-badge'>Live example</span>
				{title && <span className='demo-title'>{title}</span>}
				{code && (
					<button type='button' className='demo-toggle' onClick={() => setShowCode((value) => !value)}>
						{showCode ? 'Hide code' : 'Show code'}
					</button>
				)}
			</div>
			{description && <div className='demo-description'>{description}</div>}
			<div className='demo-preview'>{children}</div>
			{code && showCode && <CodeBlock code={code} lang={lang} className='demo-code' />}
		</figure>
	);
}

/** a row of buttons / inputs above or below a demo editor */
export const DemoControls = (props: { children: ReactNode }) => <div className='demo-controls'>{props.children}</div>;

export function DemoButton(props: {
	onClick: () => void;
	children: ReactNode;
	active?: boolean;
	disabled?: boolean;
	title?: string;
}) {
	const { onClick, children, active, disabled, title } = props;
	return (
		<button
			type='button'
			className={`demo-button ${active ? 'active' : ''}`}
			aria-pressed={active}
			disabled={disabled}
			title={title}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

/** output lines of a demo (events, return values) */
export function DemoLog(props: { entries: string[]; placeholder?: string; onClear?: () => void }) {
	const { entries, placeholder = 'Output appears here', onClear } = props;
	const ref = useRef<HTMLPreElement>(null);
	useEffect(() => {
		ref.current?.scrollTo({ top: ref.current.scrollHeight });
	}, [entries]);
	return (
		<div className='demo-log'>
			<div className='demo-log-bar'>
				<span>Output</span>
				{onClear && entries.length > 0 && (
					<button type='button' onClick={onClear}>
						Clear
					</button>
				)}
			</div>
			<pre ref={ref}>
				{entries.length === 0 ? (
					<span className='demo-log-empty'>{placeholder}</span>
				) : (
					entries.map((entry, index) => <div key={index}>{entry}</div>)
				)}
			</pre>
		</div>
	);
}

/** keeps the last `limit` log lines */
export const useLog = (limit = 60) => {
	const [entries, setEntries] = useState<string[]>([]);
	const log = useCallback(
		(...values: unknown[]) =>
			setEntries((current) => [...current, values.map(formatValue).join(' ')].slice(-limit)),
		[limit],
	);
	const clear = useCallback(() => setEntries([]), []);
	return { entries, log, clear };
};

const formatBytes = (bytes: number) =>
	bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** readable output for the demo logs: fabric objects, blobs and large JSON are summarized */
export function formatValue(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	if (value === undefined) {
		return 'undefined';
	}
	if (typeof Blob !== 'undefined' && value instanceof Blob) {
		return `Blob { type: '${value.type}', size: ${formatBytes(value.size)} }`;
	}
	const replacer = (_key: string, item: any) => {
		if (item && typeof item === 'object' && typeof item.toObject === 'function' && 'canvas' in item) {
			return `<${item.type}${item.shapeType ? ` shapeType="${item.shapeType}"` : ''}>`;
		}
		if (typeof item === 'string' && item.length > 80) {
			return `${item.slice(0, 40)}…(${item.length} chars)`;
		}
		if (Array.isArray(item) && item.length > 8 && typeof item[0] !== 'string') {
			return [...item.slice(0, 3), `…${item.length - 3} more`];
		}
		return item;
	};
	try {
		const text = JSON.stringify(value, replacer);
		return text && text.length > 400 ? `${text.slice(0, 400)}…` : (text ?? String(value));
	} catch {
		return String(value);
	}
}

// ---------------------------------------------------------------- API pages

interface ApiPlaygroundValue {
	editor: () => ImageEditorController | null;
	log: (...values: unknown[]) => void;
}

const ApiPlaygroundContext = createContext<ApiPlaygroundValue | null>(null);

/**
 * Layout of the API pages: the content on the left, a live editor (sticky) and an output log on the right. Every
 * `ApiMethod` inside can run its example against that editor.
 */
export function ApiPlayground(props: { children: ReactNode; editorProps?: DemoEditorProps; note?: ReactNode }) {
	const { children, editorProps, note } = props;
	const editorRef = useRef<ImageEditorController>(null);
	const { entries, log, clear } = useLog();
	const value = useMemo<ApiPlaygroundValue>(() => ({ editor: () => editorRef.current, log }), [log]);
	return (
		<ApiPlaygroundContext.Provider value={value}>
			<div className='api-layout'>
				<div className='api-content'>{children}</div>
				<aside className='api-aside' aria-label='Live editor'>
					<div className='api-aside-inner'>
						<p className='api-aside-title'>
							<span className='demo-badge'>Live editor</span>
							{note ??
								'Press Run on any method to try it here. You can also click and edit on the canvas.'}
						</p>
						<DemoEditor
							ref={editorRef}
							height={400}
							// only the canvas and the history / zoom header: the methods drive everything else
							layout={{ menu: 'none', toolbar: 'none', contextPanel: 'none', actions: 'none' }}
							{...editorProps}
						/>
						<DemoLog entries={entries} onClear={clear} placeholder='Return values and events appear here' />
					</div>
				</aside>
			</div>
		</ApiPlaygroundContext.Provider>
	);
}

/** the editor and log of the surrounding `ApiPlayground` */
export const useApiPlayground = () => {
	const value = useContext(ApiPlaygroundContext);
	if (!value) {
		throw new Error('useApiPlayground must be used inside <ApiPlayground>');
	}
	return value;
};

/**
 * One method / property of the API. `run` executes the example against the live editor of the page, its return
 * value (awaited) is printed to the output.
 */
export function ApiMethod(props: {
	name: string;
	/** anchor id, defaults to the lowercased name */
	id?: string;
	signature: string;
	returns?: string;
	children: ReactNode;
	params?: PropRow[];
	example?: string;
	run?: (editor: ImageEditorController, log: (...values: unknown[]) => void) => unknown;
	runLabel?: string;
}) {
	const { name, signature, returns, children, params, example, run, runLabel = 'Run' } = props;
	const id = props.id ?? name.toLowerCase();
	const playground = useContext(ApiPlaygroundContext);
	const [running, setRunning] = useState(false);

	const handleRun = async () => {
		const editor = playground?.editor();
		if (!playground || !run) {
			return;
		}
		if (!editor || !editor.getState().ready) {
			playground.log('The editor is still loading, try again in a moment.');
			return;
		}
		setRunning(true);
		try {
			const result = await run(editor, playground.log);
			playground.log(`${name} →`, result === undefined ? 'done' : result);
		} catch (error) {
			playground.log(`${name} threw:`, error instanceof Error ? error.message : String(error));
		} finally {
			setRunning(false);
		}
	};

	return (
		<section className='api-method'>
			<Heading level={3} id={id} className='api-method-name'>
				<code>{name}</code>
			</Heading>
			<div className='api-signature'>
				<code>
					<Highlighted code={signature} lang='ts' />
				</code>
				{returns && (
					<span className='api-returns'>
						returns <code>{returns}</code>
					</span>
				)}
			</div>
			<div className='api-description'>{children}</div>
			{params && params.length > 0 && <PropTable rows={params} nameLabel='Parameter' />}
			{example && (
				<div className='api-example'>
					<CodeBlock code={example} lang='tsx' title='Example' />
					{run && playground && (
						<button
							type='button'
							className='run-button'
							disabled={running}
							onClick={() => void handleRun()}
						>
							▶ {running ? 'Running…' : runLabel}
						</button>
					)}
				</div>
			)}
		</section>
	);
}
