import { useRef, useState, type ComponentType } from 'react';
import type { ImageEditorController, SaveResult } from 'fabri-pix';

import './start.css';
import { canvasJson } from '../../canvasJson';
import {
	Callout,
	CardGrid,
	CodeBlock,
	CodeTabs,
	Demo,
	DemoButton,
	DemoControls,
	DemoEditor,
	DemoLog,
	DEMO_IMAGES,
	DocLink,
	H2,
	H3,
	LinkCard,
	PageHeader,
	PropTable,
	Steps,
	Table,
	useLog,
} from '../ui';

const formatBytes = (bytes: number) =>
	bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// ---------------------------------------------------------------- introduction

function Introduction() {
	return (
		<>
			<PageHeader
				eyebrow='FabriPix documentation'
				title='The image editor for React'
				lead={
					<>
						FabriPix is a React component for cropping, rotating, filtering, redacting and annotating
						images. It works out of the box, and almost every part of it can be changed: the tools, their
						defaults, texts, icons, colors and layout. You can also add your own tools or build a completely
						custom interface.
					</>
				}
			/>

			<Demo
				title='The default editor'
				description='This is the editor with no configuration at all, loaded with an image and a few saved annotations. Try the menus on the left, select an object, undo with ⌘Z / Ctrl+Z.'
				code={`import { ImageEditor } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

<div style={{ height: 560 }}>
  <ImageEditor src={imageUrl} initialState={savedJson} />
</div>`}
			>
				<DemoEditor height={560} initialState={canvasJson} />
			</Demo>

			<H2 id='what-you-can-do'>What you can do with it</H2>
			<ul>
				<li>
					<strong>Edit the photo:</strong> crop (free or fixed ratios), rotate by 90° or any angle, flip,
					resize the output, adjust brightness, contrast, saturation, vibrance, hue and gamma, and apply 18
					filters.
				</li>
				<li>
					<strong>Annotate:</strong> rectangles, circles, triangles, stars, arrow shapes, lines, arrows,
					curved paths, free drawing, text, emoji, icons, callouts, numbered steps and your own images.
				</li>
				<li>
					<strong>Redact:</strong> blur sensitive areas. The blur is part of the exported image.
				</li>
				<li>
					<strong>Work comfortably:</strong> undo / redo with a history panel, zoom and pan, keyboard
					shortcuts, copy / paste / duplicate, layer order, opacity, shadows and dashed outlines.
				</li>
				<li>
					<strong>Save:</strong> export PNG, JPEG or WebP at the original resolution, and save the whole
					editing state as JSON to continue later.
				</li>
			</ul>

			<H2 id='how-it-works'>How it fits together</H2>
			<p>There are four ideas worth knowing before you start. Each one has its own page later on.</p>
			<Table
				head={['Concept', 'What it is', 'Read more']}
				rows={[
					[
						<code>{'<ImageEditor>'}</code>,
						'The ready-to-use component. You configure it with props: the image, which tools to show, texts, theme, layout and callbacks like onSave.',
						<DocLink to='api/image-editor'>Props reference</DocLink>,
					],
					[
						'The controller',
						'An object you get through a ref (or the useImageEditor hook) to control the editor from your own code: undo, rotate, add shapes, export…',
						<DocLink to='api/controller'>Editor controller</DocLink>,
					],
					[
						'Tools',
						'Every button in the toolbar is a tool: a plain object with an id, a label, an icon and what it does on the canvas. You can remove, reorder, replace or write tools.',
						<DocLink to='custom-tools'>Custom tools</DocLink>,
					],
					[
						'The JSON state',
						'Everything the user did can be saved as JSON and loaded again later, so editing can continue where it stopped.',
						<DocLink to='editor-state'>Editor state & JSON</DocLink>,
					],
				]}
			/>

			<H2 id='where-to-go'>Where to go next</H2>
			<CardGrid>
				<LinkCard to='installation' title='Installation'>
					Add the package and its peer dependencies to your project.
				</LinkCard>
				<LinkCard to='quick-start' title='Quick start'>
					Show your first editor and receive the edited image.
				</LinkCard>
				<LinkCard to='tools-and-menus' title='Customization'>
					Choose tools, change defaults, texts, icons, colors and the layout.
				</LinkCard>
				<LinkCard to='custom-tools' title='Extending'>
					Write your own tools, shapes and filters, or your own interface.
				</LinkCard>
				<LinkCard to='api/image-editor' title='API reference'>
					Every prop, method, event, hook and type, with runnable examples.
				</LinkCard>
				<LinkCard to='troubleshooting' title='Troubleshooting'>
					Answers to the most common problems: CORS, sizing, SSR.
				</LinkCard>
			</CardGrid>
		</>
	);
}

// ---------------------------------------------------------------- installation

function Installation() {
	return (
		<>
			<PageHeader
				eyebrow='Getting started'
				title='Installation'
				lead='FabriPix is published on npm. It needs React and Fabric.js, which you install next to it.'
			/>

			<H2 id='install-the-package'>Install the package</H2>
			<p>
				Install <code>fabri-pix</code> together with <code>fabric</code> version 6. React is most likely in your
				project already.
			</p>
			<CodeTabs
				tabs={[
					{ label: 'npm', code: 'npm install fabri-pix fabric@6', lang: 'bash' },
					{ label: 'yarn', code: 'yarn add fabri-pix fabric@6', lang: 'bash' },
					{ label: 'pnpm', code: 'pnpm add fabri-pix fabric@6', lang: 'bash' },
				]}
			/>

			<H3 id='requirements'>Requirements</H3>
			<Table
				head={['Package', 'Version', 'Why']}
				rows={[
					[
						<code>react</code>,
						'18 or newer',
						'The editor uses hooks such as useSyncExternalStore (React 18+).',
					],
					[<code>react-dom</code>, '18 or newer', 'Same version as react.'],
					[
						<code>fabric</code>,
						'6.x',
						'The canvas engine. It is a peer dependency so that your app and the editor share one copy. Fabric 7 is not supported yet.',
					],
				]}
			/>
			<Callout type='warning' title='Only one copy of fabric'>
				<p>
					If your app already uses Fabric.js, make sure it is version 6 and that only one copy is installed (
					<code>npm ls fabric</code>). Two copies make objects from one copy unknown to the other.
				</p>
			</Callout>

			<H2 id='import-the-styles'>Import the styles</H2>
			<p>
				The component and its styles are imported separately. Import the CSS file once, for example in your root
				component or entry file:
			</p>
			<CodeBlock
				code={`import { ImageEditor } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';`}
			/>
			<p>
				All default styles have zero specificity, so your own CSS always wins. See{' '}
				<DocLink to='theming'>Theme & styling</DocLink> for changing colors, or use the <code>unstyled</code>{' '}
				prop to start from a blank slate.
			</p>

			<H2 id='typescript'>TypeScript</H2>
			<p>
				Type definitions are included, there is nothing extra to install. All public types are exported from the
				package:
			</p>
			<CodeBlock
				code={`import type { ImageEditorController, ImageEditorProps, SaveResult, ToolDefinition } from 'fabri-pix';`}
			/>

			<H2 id='frameworks'>Frameworks</H2>
			<H3 id='vite-cra'>Vite, Create React App and other client-side apps</H3>
			<p>Nothing special is needed. Import the component and the CSS and render it.</p>

			<H3 id='nextjs'>Next.js</H3>
			<p>
				The editor draws on an HTML canvas, so it only runs in the browser. In the App Router, put it in a
				client component:
			</p>
			<CodeBlock
				title='app/edit/ImageEditorClient.tsx'
				code={`'use client';

import { ImageEditor } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

export default function ImageEditorClient({ src }: { src: string }) {
  return (
    <div style={{ height: '80vh' }}>
      <ImageEditor src={src} onSave={({ blob }) => upload(blob)} />
    </div>
  );
}`}
			/>
			<p>
				A client component is still rendered once on the server for the first html. The editor supports that:
				it renders its layout there, and the canvas starts in the browser.
			</p>
			<p>
				If you don't want the editor in the server html at all, or another library of yours fails on the
				server (an error like <code>window is not defined</code>), load it only in the browser with{' '}
				<code>next/dynamic</code>:
			</p>
			<CodeBlock
				code={`import dynamic from 'next/dynamic';

const ImageEditorClient = dynamic(() => import('./ImageEditorClient'), { ssr: false });`}
			/>

			<H2 id='check'>Check that it works</H2>
			<p>
				Render the editor with any image URL. If you see the image and the menus, you are done. Continue with
				the <DocLink to='quick-start'>Quick start</DocLink>.
			</p>
		</>
	);
}

// ---------------------------------------------------------------- quick start

function QuickStartSizeDemo() {
	const [height, setHeight] = useState(540);
	return (
		<Demo
			title='The editor fills its parent'
			description='Change the height of the parent element. The image is fitted into the available space again.'
			code={`<div style={{ height: ${height} }}>
  <ImageEditor src={imageUrl} />
</div>`}
		>
			<DemoControls>
				<label>
					Parent height
					<input
						type='range'
						min={480}
						max={700}
						step={10}
						value={height}
						onChange={(event) => setHeight(Number(event.target.value))}
					/>
					<code>{height}px</code>
				</label>
			</DemoControls>
			<DemoEditor height={height} />
		</Demo>
	);
}

function QuickStartSaveDemo() {
	const [result, setResult] = useState<{ url: string; size: number; type: string } | null>(null);
	const handleSave = ({ blob }: SaveResult) => {
		if (result) {
			URL.revokeObjectURL(result.url);
		}
		setResult({ url: URL.createObjectURL(blob), size: blob.size, type: blob.type });
	};
	return (
		<Demo
			title='Receive the edited image'
			description='Draw something, then press Save in the bottom right corner. The exported image is shown below the editor.'
			code={`function Editor() {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <div style={{ height: 500 }}>
        <ImageEditor
          src={imageUrl}
          onSave={({ blob, json }) => setPreview(URL.createObjectURL(blob))}
        />
      </div>
      {preview && <img src={preview} alt='Edited image' />}
    </>
  );
}`}
		>
			<DemoEditor onSave={handleSave} />
			{result && (
				<div className='st-result'>
					<img src={result.url} alt='The exported result' />
					<span>
						{result.type} · {formatBytes(result.size)}
					</span>
				</div>
			)}
		</Demo>
	);
}

function QuickStart() {
	return (
		<>
			<PageHeader
				eyebrow='Getting started'
				title='Quick start'
				lead='Show an editor, let the user edit the image and receive the result. This takes about five lines of code.'
			/>

			<Steps>
				<li>
					<p>
						<strong>Install</strong> the package and Fabric.js (see{' '}
						<DocLink to='installation'>Installation</DocLink>
						).
					</p>
					<CodeBlock code='npm install fabri-pix fabric@6' lang='bash' />
				</li>
				<li>
					<p>
						<strong>Import</strong> the component and its styles.
					</p>
					<CodeBlock
						code={`import { ImageEditor } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';`}
					/>
				</li>
				<li>
					<p>
						<strong>Render it</strong> inside an element that has a height, and pass the image to edit as{' '}
						<code>src</code>.
					</p>
					<CodeBlock
						code={`export default function App() {
  return (
    <div style={{ height: '80vh' }}>
      <ImageEditor
        src='https://example.com/photo.jpg'
        onSave={({ blob, json }) => upload(blob, json)}
      />
    </div>
  );
}`}
					/>
				</li>
				<li>
					<p>
						<strong>Handle the result.</strong> When the user presses <em>Save</em>, <code>onSave</code>{' '}
						receives the edited image as a <code>Blob</code> and the editing state as JSON. Without{' '}
						<code>onSave</code> the image is downloaded.
					</p>
				</li>
			</Steps>

			<H2 id='size'>Give the editor a size</H2>
			<p>
				The editor is as large as its parent element: <code>width</code> and <code>height</code> default to{' '}
				<code>100%</code>. The most common mistake is a parent without a height, which makes the editor
				collapse. Either give the parent a height, or pass a size to the editor:
			</p>
			<CodeBlock
				code={`// the parent decides
<div style={{ height: 600 }}>
  <ImageEditor src={url} />
</div>

// or the editor itself (numbers are pixels, strings any CSS length)
<ImageEditor src={url} width='100%' height={600} />`}
			/>
			<QuickStartSizeDemo />
			<Callout type='note'>
				<p>
					The canvas area never gets smaller than 400px (the CSS variable <code>--fp-stage-min-height</code>).
					Lower it if you need a smaller editor, see{' '}
					<DocLink to='theming#css-variables'>CSS variables</DocLink>.
				</p>
			</Callout>

			<H2 id='save'>Receive the edited image</H2>
			<QuickStartSaveDemo />
			<p>
				A typical <code>onSave</code> uploads the image to your server. The JSON lets the user continue editing
				later, store it too if you need that:
			</p>
			<CodeBlock
				code={`const handleSave = async ({ blob, json }: SaveResult) => {
  const body = new FormData();
  body.append('image', blob, 'edited.png');
  body.append('state', JSON.stringify(json));
  await fetch('/api/images', { method: 'POST', body });
};

<ImageEditor src={url} onSave={handleSave} />`}
			/>

			<H2 id='next-steps'>Next steps</H2>
			<CardGrid>
				<LinkCard to='loading-images' title='Loading images'>
					URLs, uploaded files and images from other domains.
				</LinkCard>
				<LinkCard to='saving-and-exporting' title='Saving & exporting'>
					Formats, quality, size and exporting from your own buttons.
				</LinkCard>
				<LinkCard to='tools-and-menus' title='Choose the tools'>
					Show only the tools your users need.
				</LinkCard>
				<LinkCard to='api/controller' title='Control it from code'>
					Undo, rotate, add shapes or export through a ref.
				</LinkCard>
			</CardGrid>
		</>
	);
}

// ---------------------------------------------------------------- loading images

function SourceDemo() {
	const [source, setSource] = useState<string | Blob>(DEMO_IMAGES[1].src);
	const [label, setLabel] = useState(DEMO_IMAGES[1].label);
	const [url, setUrl] = useState('');
	const fileInput = useRef<HTMLInputElement>(null);
	const { entries, log, clear } = useLog();

	return (
		<Demo
			title='Change the image'
			description='Pick a sample, upload a file from your computer or paste an image URL. Every new image starts a new editing session.'
			code={`const [src, setSrc] = useState<string | Blob>(firstImageUrl);

<input type='file' accept='image/*' onChange={(event) => {
  const file = event.target.files?.[0];
  if (file) setSrc(file); // a File is a Blob, no need to read it yourself
}} />

<ImageEditor
  src={src}
  onReady={(editor) => console.log('loaded', editor.getNaturalSize())}
  onError={(error) => console.error('could not load the image', error)}
/>`}
		>
			<DemoControls>
				{DEMO_IMAGES.map((image) => (
					<DemoButton
						key={image.id}
						active={source === image.src}
						onClick={() => {
							setSource(image.src);
							setLabel(image.label);
						}}
					>
						{image.label}
					</DemoButton>
				))}
				<DemoButton onClick={() => fileInput.current?.click()}>Upload a file…</DemoButton>
				<input
					ref={fileInput}
					type='file'
					accept='image/*'
					hidden
					onChange={(event) => {
						const file = event.target.files?.[0];
						event.target.value = '';
						if (file) {
							setSource(file);
							setLabel(file.name);
						}
					}}
				/>
			</DemoControls>
			<DemoControls>
				<input
					type='url'
					placeholder='https://… image URL'
					value={url}
					style={{ flex: 1, minWidth: 200 }}
					onChange={(event) => setUrl(event.target.value)}
				/>
				<DemoButton
					disabled={!url}
					onClick={() => {
						setSource(url);
						setLabel(url);
					}}
				>
					Load URL
				</DemoButton>
			</DemoControls>
			<DemoEditor
				src={source}
				height={560}
				onReady={(editor) => log(`ready: ${label}, natural size`, editor.getNaturalSize())}
				onError={(error) =>
					log('error:', error instanceof Error ? error.message : 'the image could not be loaded')
				}
			/>
			<DemoLog entries={entries} onClear={clear} placeholder='onReady and onError are logged here' />
		</Demo>
	);
}

function LoadingImages() {
	return (
		<>
			<PageHeader
				eyebrow='Getting started'
				title='Loading images'
				lead='The image to edit is passed as the src prop. It can be a URL, a data URL or a file the user picked.'
			/>

			<H2 id='src'>The src prop</H2>
			<Table
				head={['Value', 'Example', 'Notes']}
				rows={[
					[
						'URL',
						<code>'https://cdn.example.com/photo.jpg'</code>,
						'Images from another domain need CORS headers, see below.',
					],
					['Relative URL', <code>'/uploads/photo.png'</code>, 'Same origin, always works.'],
					[
						'Data URL',
						<code>'data:image/png;base64,…'</code>,
						'Works, but large data URLs are slow to pass around.',
					],
					[
						<>
							<code>Blob</code> / <code>File</code>
						</>,
						<code>event.target.files[0]</code>,
						'E.g. from a file input, drag and drop or the clipboard. The editor reads it for you.',
					],
					[
						<>
							<code>null</code> / <code>undefined</code>
						</>,
						'',
						'An empty editor. Useful together with initialState, which can contain the image itself.',
					],
				]}
			/>
			<SourceDemo />

			<H2 id='changing-the-image'>Changing the image</H2>
			<p>
				When <code>src</code> changes, the new image is loaded and editing starts over: annotations, crop,
				filters and the undo history of the previous image are discarded. Save them first (<code>onChange</code>{' '}
				or <code>editor.toJSON()</code>) if you need them.
			</p>
			<p>
				You can also load an image from code with{' '}
				<DocLink to='api/history#setsource'>editor.setSource()</DocLink>, which optionally takes a saved state
				as its second argument:
			</p>
			<CodeBlock code={`await editor.setSource(file, savedJson);`} />
			<Callout type='tip' title='Force a fresh editor'>
				<p>
					To reset everything, including tool options the user changed, give the editor a <code>key</code>{' '}
					that changes, e.g. <code>{'<ImageEditor key={imageId} … />'}</code>. React then creates a new
					editor.
				</p>
			</Callout>

			<H2 id='cors'>Images from other domains (CORS)</H2>
			<p>
				Browsers protect images from other domains: they can be <em>shown</em> on a canvas, but the canvas can
				no longer be <em>exported</em> unless the server allows it. FabriPix loads images with{' '}
				<code>crossOrigin='anonymous'</code>, so the server must respond with a CORS header such as:
			</p>
			<CodeBlock code='Access-Control-Allow-Origin: *' lang='text' title='HTTP response header' />
			<p>Most image CDNs (Cloudinary, imgix, S3 with a CORS rule, Unsplash, …) can send it.</p>
			<PropTable
				rows={[
					{
						name: 'crossOrigin',
						type: "'anonymous' | 'use-credentials' | null",
						default: "'anonymous'",
						description: (
							<>
								<p>
									How the image is requested. Use <code>'use-credentials'</code> when the image needs
									cookies (the server must then allow credentials and name your origin).
								</p>
								<p>
									<code>null</code> loads without CORS: the image is shown, but saving fails because
									the canvas is &ldquo;tainted&rdquo;.
								</p>
							</>
						),
					},
				]}
			/>
			<Callout type='warning' title='"Tainted canvas" error when saving'>
				<p>
					If saving fails with an error like <em>Tainted canvases may not be exported</em>, the image server
					did not send CORS headers. Fix the headers, proxy the image through your own server, or load it as a{' '}
					<code>Blob</code> first (<code>await (await fetch(url)).blob()</code>, which also needs CORS, but
					your server can do the fetch).
				</p>
			</Callout>

			<H2 id='ready-and-errors'>Knowing when the image is ready</H2>
			<p>
				Loading is asynchronous. While it runs, the editor shows the <code>loading</code> label and its buttons
				are disabled. Use these to react to the result:
			</p>
			<PropTable
				rows={[
					{
						name: 'onReady',
						type: '(editor: ImageEditorController) => void',
						description:
							'The editor finished loading the image (and initialState) and can be used. Called again for every new src. Not called when the image fails to load.',
					},
					{
						name: 'onError',
						type: '(error: unknown) => void',
						description:
							'Loading or exporting failed, e.g. a 404 or a CORS error. After a failed load the editor stays empty and disabled until another src loads. Without onError (and without an error listener) the error is logged to the console.',
					},
				]}
			/>
			<p>
				Inside your own components you can also read <code>ready</code> and <code>loading</code> from{' '}
				<DocLink to='api/hooks#useeditorstate'>useEditorState()</DocLink>.
			</p>

			<H2 id='resolution'>Large images and resolution</H2>
			<p>
				Images of any size can be edited. On screen, the image is scaled to fit the editor. When the image is
				exported, it is rendered again at its <strong>original resolution</strong> (limited to 16 megapixels by
				default, see <DocLink to='saving-and-exporting#export-options'>export options</DocLink>), so nothing is
				lost by editing on a small screen.
			</p>
		</>
	);
}

// ---------------------------------------------------------------- saving and exporting

function ExportDemo() {
	const editor = useRef<ImageEditorController>(null);
	const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('jpeg');
	const [quality, setQuality] = useState(0.8);
	const [preview, setPreview] = useState<string | null>(null);
	const { entries, log, clear } = useLog();

	const exportNow = async () => {
		if (!editor.current) {
			return;
		}
		const started = performance.now();
		const blob = await editor.current.exportImage({ format, quality });
		const bitmap = await createImageBitmap(blob);
		log(
			`${format} quality ${quality}: ${bitmap.width} × ${bitmap.height}px, ${formatBytes(blob.size)} in ${Math.round(performance.now() - started)} ms`,
		);
		bitmap.close();
		if (preview) {
			URL.revokeObjectURL(preview);
		}
		setPreview(URL.createObjectURL(blob));
	};

	return (
		<Demo
			title='Export from your own button'
			description='Choose a format and quality, then export. Compare the file sizes in the output.'
			code={`const editor = useRef<ImageEditorController>(null);

const exportImage = async () => {
  const blob = await editor.current!.exportImage({ format: '${format}', quality: ${quality} });
  // blob.type === 'image/${format}'
};

<ImageEditor ref={editor} src={imageUrl} />
<button onClick={exportImage}>Export</button>`}
		>
			<DemoControls>
				<label>
					Format
					<select value={format} onChange={(event) => setFormat(event.target.value as typeof format)}>
						<option value='png'>png</option>
						<option value='jpeg'>jpeg</option>
						<option value='webp'>webp</option>
					</select>
				</label>
				<label>
					Quality
					<input
						type='range'
						min={0.1}
						max={1}
						step={0.05}
						value={quality}
						disabled={format === 'png'}
						onChange={(event) => setQuality(Number(event.target.value))}
					/>
					<code>{quality}</code>
				</label>
				<DemoButton onClick={() => void exportNow()}>Export</DemoButton>
			</DemoControls>
			<DemoEditor ref={editor} height={560} />
			<DemoLog entries={entries} onClear={clear} placeholder='Press Export' />
			{preview && (
				<div className='st-result'>
					<img src={preview} alt='The exported result' />
				</div>
			)}
		</Demo>
	);
}

function SavingAndExporting() {
	return (
		<>
			<PageHeader
				eyebrow='Getting started'
				title='Saving & exporting'
				lead='Get the edited image as a file: through the Save button, or from your own code at any time.'
			/>

			<H2 id='save-button'>The Save button</H2>
			<p>
				The actions bar shows a <em>Save</em> button. When it is pressed, the editor renders the edited image
				and calls <code>onSave</code> with a <code>SaveResult</code>:
			</p>
			<PropTable
				nameLabel='Field'
				rows={[
					{
						name: 'blob',
						type: 'Blob',
						description:
							'The edited image (PNG by default), cropped, rotated, filtered and resized as the user chose.',
					},
					{
						name: 'json',
						type: 'Record<string, any>',
						description: (
							<>
								The editing state. Pass it to <code>initialState</code> to continue editing later, see{' '}
								<DocLink to='editor-state'>Editor state & JSON</DocLink>.
							</>
						),
					},
				]}
			/>
			<p>
				If you don&rsquo;t pass <code>onSave</code>, the image is downloaded as{' '}
				<code>edited-image-&lt;timestamp&gt;.png</code>. Any active tool finishes first, e.g. an unapplied crop
				is applied before the image is exported.
			</p>
			<CodeBlock
				code={`<ImageEditor
  src={url}
  onSave={async ({ blob, json }) => {
    await uploadImage(blob);
    await saveState(json);
    closeEditor();
  }}
/>`}
			/>

			<H3 id='upload-examples'>Uploading the blob</H3>
			<CodeTabs
				tabs={[
					{
						label: 'FormData',
						code: `const body = new FormData();
body.append('file', blob, 'edited.png');
await fetch('/api/upload', { method: 'POST', body });`,
					},
					{
						label: 'Presigned URL (S3, GCS)',
						code: `const { uploadUrl } = await fetch('/api/upload-url').then((response) => response.json());
await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': blob.type } });`,
					},
					{
						label: 'Preview in the page',
						code: `const url = URL.createObjectURL(blob);
setPreview(url);
// later: URL.revokeObjectURL(url) to free the memory`,
					},
					{
						label: 'Base64 data URL',
						code: `const dataUrl = await new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.readAsDataURL(blob);
});`,
					},
				]}
			/>

			<H2 id='export-from-code'>Exporting from your own code</H2>
			<p>
				With a <code>ref</code> you get the <DocLink to='api/controller'>editor controller</DocLink>. Two
				methods export:
			</p>
			<ul>
				<li>
					<DocLink to='api/view-and-export#exportimage'>
						<code>editor.exportImage(options?)</code>
					</DocLink>{' '}
					returns a <code>Promise&lt;Blob&gt;</code>. It does not call <code>onSave</code>, so you can use it
					for previews, thumbnails or your own Save button.
				</li>
				<li>
					<DocLink to='api/view-and-export#save'>
						<code>editor.save()</code>
					</DocLink>{' '}
					does exactly what the Save button does (calls <code>onSave</code> or downloads) and returns the{' '}
					<code>SaveResult</code>, or <code>null</code> when exporting failed.
				</li>
			</ul>
			<ExportDemo />

			<H2 id='export-options'>Export options</H2>
			<p>
				Pass options to <code>exportImage()</code>, or set defaults for every export (including the Save button)
				with the <code>exportOptions</code> prop:
			</p>
			<CodeBlock code={`<ImageEditor src={url} exportOptions={{ format: 'webp', quality: 0.85 }} />`} />
			<PropTable
				nameLabel='Option'
				rows={[
					{
						name: 'format',
						type: "'png' | 'jpeg' | 'webp'",
						default: "'png'",
						description:
							'File format. PNG keeps transparency (rotated images have transparent corners). JPEG has no transparency.',
					},
					{
						name: 'quality',
						type: 'number',
						default: '1',
						description:
							'From 0 to 1, used for jpeg and webp. 0.8 is usually a good balance of size and quality.',
					},
					{
						name: 'multiplier',
						type: 'number',
						default: 'original resolution',
						description: (
							<>
								Scale relative to the size the image is edited at (the image fitted into 1000 × 508). By
								default the image is exported at its original resolution and the Resize menu&rsquo;s
								size is applied. Passing a multiplier ignores the Resize size.{' '}
								<code>multiplier: 1</code> gives the 2.x export size.
							</>
						),
					},
					{
						name: 'maxPixels',
						type: 'number',
						default: '16 000 000',
						description:
							'Upper limit of exported pixels (width × height). Larger exports are scaled down, because browsers fail to create very large canvases.',
					},
				]}
			/>

			<H2 id='output-size'>Output size</H2>
			<p>
				Users can change the exported size in the <strong>Resize</strong> menu. From code, use{' '}
				<DocLink to='api/image#setoutputsize'>editor.setOutputSize()</DocLink>. For example, to always export at
				most 1200 pixels wide:
			</p>
			<CodeBlock
				code={`<ImageEditor
  src={url}
  onReady={(editor) => {
    if (editor.getNaturalSize().width > 1200) {
      editor.setOutputSize({ width: 1200 }, { commit: false });
    }
  }}
/>`}
			/>

			<H2 id='export-json'>Exporting the JSON</H2>
			<p>
				Add <code>'exportJson'</code> to <DocLink to='layout#actions'>actions</DocLink> to show an{' '}
				<em>Export JSON</em> button. It calls <code>onExportJson(json)</code>, or downloads the JSON as a file
				if you don&rsquo;t pass it. From code, use <code>editor.toJSON()</code>.
			</p>
			<CodeBlock
				code={`<ImageEditor
  src={url}
  actions={['reset', 'exportJson', 'save']}
  onExportJson={(json) => saveDraft(json)}
/>`}
			/>

			<H2 id='what-is-exported'>What ends up in the image</H2>
			<ul>
				<li>Only the crop area, at the original resolution (or the Resize size).</li>
				<li>Rotation, flips, filters and adjustments of the photo.</li>
				<li>All annotations, with blur areas baked in.</li>
				<li>
					Not the editing UI: selection handles, the crop frame and the dimmed area around it are never
					exported.
				</li>
			</ul>
		</>
	);
}

// ---------------------------------------------------------------- editor state

function RestoreDemo() {
	const editor = useRef<ImageEditorController>(null);
	const [saved, setSaved] = useState<Record<string, any> | null>(null);
	const [restoreKey, setRestoreKey] = useState(0);

	return (
		<Demo
			title='Save the state, continue later'
			description='Edit the first image (add a shape, a filter, crop it…), press "Save state", then "Open in a new editor". The new editor continues exactly where you stopped, with undo history starting there.'
			code={`const editor = useRef<ImageEditorController>(null);
const [saved, setSaved] = useState(null);

// 1. save
<ImageEditor ref={editor} src={imageUrl} />
<button onClick={() => setSaved(editor.current!.toJSON())}>Save state</button>

// 2. later: continue editing
<ImageEditor src={imageUrl} initialState={saved} />`}
		>
			<div className='st-two'>
				<div>
					<DemoControls>
						<DemoButton onClick={() => setSaved(editor.current?.toJSON() ?? null)}>Save state</DemoButton>
						<DemoButton disabled={!saved} onClick={() => setRestoreKey((key) => key + 1)}>
							Open in a new editor →
						</DemoButton>
					</DemoControls>
					<DemoEditor ref={editor} height={480} layout={{ menu: 'top' }} />
				</div>
				<div>
					<DemoControls>
						<span className='st-caption'>
							{saved ? `Restored from ${saved.objects?.length ?? 0} saved objects` : 'Nothing saved yet'}
						</span>
					</DemoControls>
					{saved && restoreKey > 0 ? (
						<DemoEditor key={restoreKey} height={480} layout={{ menu: 'top' }} initialState={saved} />
					) : (
						<div className='demo-editor st-empty' style={{ height: 400 }}>
							The restored editor appears here
						</div>
					)}
				</div>
			</div>
		</Demo>
	);
}

function AutosaveDemo() {
	const [changes, setChanges] = useState(0);
	const [size, setSize] = useState(0);
	return (
		<Demo
			title='Autosave'
			description='onChange runs after every change, undo and redo. Here it counts the changes and measures the JSON.'
			code={`<ImageEditor
  src={imageUrl}
  onChange={(json) => {
    localStorage.setItem('draft', JSON.stringify(json));
  }}
/>`}
		>
			<DemoControls>
				<span className='st-caption'>
					Changes: <strong>{changes}</strong> · JSON size: <strong>{formatBytes(size)}</strong>
				</span>
			</DemoControls>
			<DemoEditor
				height={560}
				onChange={(json) => {
					setChanges((count) => count + 1);
					setSize(JSON.stringify(json).length);
				}}
			/>
		</Demo>
	);
}

function EditorState() {
	return (
		<>
			<PageHeader
				eyebrow='Getting started'
				title='Editor state & JSON'
				lead='Everything the user did can be saved as JSON and restored later, so editing can continue where it stopped.'
			/>

			<H2 id='what-is-saved'>What the JSON contains</H2>
			<p>
				The state is the Fabric.js canvas serialized as JSON, plus a few properties of FabriPix. You get it from{' '}
				<code>onSave</code>, <code>onChange</code>, <code>onExportJson</code> or <code>editor.toJSON()</code>:
			</p>
			<CodeBlock
				lang='json'
				code={`{
  "version": "6.6.1",
  "objects": [
    { "type": "Rect", "shapeType": "rectangle", "id": "c1f…", "left": 120, "top": 80, "width": 100, "height": 50, "stroke": "#ff0000", … },
    { "type": "Textbox", "shapeType": "text", "text": "Look here", … }
  ],
  "clipPath": { "left": 40, "top": 20, "width": 600, "height": 400, … },
  "backgroundImage": {
    "src": "https://example.com/photo.jpg",
    "angle": 90,
    "fpFilters": { "brightness": { "value": 0.2 }, "sepia": {} },
    "fpResize": { "x": 0.5, "y": 0.5 },
    …
  }
}`}
			/>
			<Table
				head={['Part', 'Meaning']}
				rows={[
					[<code>objects</code>, 'Every annotation, in stacking order (first = bottom).'],
					[
						<code>shapeType</code>,
						'Which kind of object it is (rectangle, text, blur…). Used to restore it correctly.',
					],
					[<code>id</code>, 'A unique id per object. Helper objects (e.g. an arrow head) refer to it.'],
					[<code>clipPath</code>, 'The crop area, if the image is cropped.'],
					[<code>backgroundImage</code>, 'The photo: its source, rotation and flips.'],
					[<code>fpFilters</code>, 'Active filters and adjustments: { [filterId]: options }.'],
					[<code>fpResize</code>, 'The output scale chosen in the Resize menu.'],
				]}
			/>

			<H2 id='restore'>Restoring a state</H2>
			<p>
				Pass the JSON as <code>initialState</code>. It is applied once the image has loaded, and the undo
				history starts from it.
			</p>
			<RestoreDemo />
			<p>Three ways to apply a state, depending on the situation:</p>
			<Table
				head={['API', 'When to use']}
				rows={[
					[
						<code>initialState</code>,
						'When the editor opens. It is read whenever the image loads (on mount and when src changes); changing only initialState later has no effect.',
					],
					[
						<DocLink to='api/history#loadstate'>
							<code>editor.loadState(json)</code>
						</DocLink>,
						'Replace the current content of a running editor, e.g. "load draft". Starts a new undo history.',
					],
					[
						<DocLink to='api/history#setsource'>
							<code>editor.setSource(src, json)</code>
						</DocLink>,
						'Load another image and its state together.',
					],
				]}
			/>

			<H3 id='without-the-image'>Storing the state without the image</H3>
			<p>
				<code>backgroundImage.src</code> is the image you passed as <code>src</code>. If that was a{' '}
				<code>Blob</code> or <code>File</code>, it is a data URL of the whole image, which can be megabytes.
				When you store the image separately anyway, remove it from the JSON and pass the image as{' '}
				<code>src</code> again when restoring. The saved rotation, filters and size are still applied:
			</p>
			<CodeBlock
				code={`// saving
const { backgroundImage, ...rest } = json;
const state = { ...rest, backgroundImage: { ...backgroundImage, src: undefined } };
await saveState(state);

// restoring
<ImageEditor src={imageUrl} initialState={state} />`}
			/>
			<p>
				Without <code>src</code>, the editor loads the image from <code>backgroundImage.src</code>, so a
				complete JSON is enough on its own: <code>{'<ImageEditor initialState={json} />'}</code>.
			</p>

			<H2 id='autosave'>Autosave with onChange</H2>
			<p>
				<code>onChange(json)</code> is called whenever a new undo step is recorded, and after undo and redo. It
				is the place for drafts and autosave. For large images, debounce it:
			</p>
			<AutosaveDemo />
			<CodeBlock
				code={`const saveDraft = useMemo(
  () => debounce((json) => fetch('/api/draft', { method: 'PUT', body: JSON.stringify(json) }), 1000),
  [],
);

<ImageEditor src={url} onChange={saveDraft} />`}
			/>

			<H2 id='history'>Undo history</H2>
			<p>
				Every change is one entry in the history: adding, moving, styling or deleting objects, cropping,
				rotating and filters. The history panel in the header lists them. Some details:
			</p>
			<ul>
				<li>
					At most <code>historyLimit</code> steps are kept (default <code>50</code>). Each step is a full JSON
					snapshot without the image, so a lower limit saves memory with many large annotations.
				</li>
				<li>Identical states are not recorded twice.</li>
				<li>
					The history is not part of the JSON. A restored state starts a new history; the restored state is
					its first entry.
				</li>
			</ul>
			<p>
				See <DocLink to='api/history'>History & state</DocLink> for <code>undo()</code>, <code>redo()</code>,{' '}
				<code>goToHistory()</code> and recording your own changes.
			</p>

			<H2 id='coordinates'>Coordinates</H2>
			<p>
				When an image loads, it is scaled to fit into a box of <strong>1000 × 508</strong> units (
				<code>SCENE_REFERENCE_SIZE</code>). All object positions in the JSON and in the API use these units, not
				screen pixels. That keeps a saved state identical on every screen size. The editor then zooms the view
				to fit its container.
			</p>
			<ul>
				<li>
					A 4000 × 3000 photo becomes about 677 × 508 units (the height limits it). An object at{' '}
					<code>left: 338</code> is in the middle.
				</li>
				<li>
					<code>editor.getSceneSize()</code> returns the size of the image in these units, and{' '}
					<code>editor.getSceneCenter()</code> its center. Use them to place objects with{' '}
					<DocLink to='api/objects#addshape'>addShape()</DocLink>.
				</li>
				<li>
					Exports are rendered at the original resolution, so a 4-unit line is about 24 pixels wide in the
					exported 4000 × 3000 image.
				</li>
			</ul>
			<CodeBlock
				code={`const { width, height } = editor.getSceneSize();
// a rectangle covering the right half of the image
await editor.addShape('rectangle', { left: width / 2, top: 0, width: width / 2, height });`}
			/>

			<H2 id='compatibility'>Compatibility</H2>
			<p>
				JSON saved with FabriPix 2.x loads in 3.x, pass it as <code>initialState</code>. The custom property
				names are stable, so states saved today will keep loading in later versions.
			</p>
		</>
	);
}

// ---------------------------------------------------------------- troubleshooting

function Troubleshooting() {
	return (
		<>
			<PageHeader
				eyebrow='Help'
				title='Troubleshooting & FAQ'
				lead='Solutions for the problems people run into most often.'
			/>

			<H2 id='display'>Display</H2>

			<H3 id='nothing-visible'>The editor is empty or has no height</H3>
			<p>
				The editor fills its parent. If the parent has no height (e.g. a plain <code>div</code> in a flex column
				without <code>flex: 1</code>), the editor collapses. Give the parent a height, or pass{' '}
				<code>height</code> to the editor. See <DocLink to='quick-start#size'>Give the editor a size</DocLink>.
			</p>

			<H3 id='no-styles'>The editor looks unstyled</H3>
			<p>
				Import the CSS once: <code>import 'fabri-pix/dist/fabri-pix.css';</code>. If you passed{' '}
				<code>unstyled</code>, the colors, borders and spacing are removed on purpose.
			</p>

			<H3 id='image-not-loading'>The image does not load</H3>
			<p>
				Open the browser console. A CORS error means the server does not allow the image to be loaded with{' '}
				<code>crossOrigin='anonymous'</code>; see <DocLink to='loading-images#cors'>CORS</DocLink>. Pass{' '}
				<code>onError</code> to show your own message.
			</p>

			<H3 id='modal'>The editor is blurry or wrongly sized inside a modal or tab</H3>
			<p>
				The editor measures its container and follows its size with a <code>ResizeObserver</code>, so it adapts
				once the modal is open. If your modal animates its size, the image is fitted again when the animation
				ends.
			</p>

			<H2 id='saving'>Saving</H2>

			<H3 id='tainted-canvas'>Saving fails with &ldquo;Tainted canvases may not be exported&rdquo;</H3>
			<p>
				The image came from another domain without CORS headers. The browser lets the editor show it but not
				export it. Fix the server&rsquo;s headers (<code>Access-Control-Allow-Origin</code>), serve the image
				from your own domain, or proxy it.
			</p>

			<H3 id='export-size'>The exported image is larger or smaller than expected</H3>
			<p>
				Exports use the original image resolution of the cropped area, then the size from the Resize menu. A{' '}
				<code>multiplier</code> in <code>exportOptions</code> replaces both. Very large exports are limited to{' '}
				<code>maxPixels</code> (16 megapixels). See{' '}
				<DocLink to='saving-and-exporting#export-options'>Export options</DocLink>.
			</p>

			<H3 id='transparent-corners'>Rotated images have transparent or black corners</H3>
			<p>
				Rotating by an angle that is not a multiple of 90° makes the image larger than the photo. The corners
				are transparent in PNG and WebP, and black in JPEG (which has no transparency). Crop after rotating to
				remove them.
			</p>

			<H2 id='frameworks'>Frameworks</H2>

			<H3 id='ssr'>&ldquo;window is not defined&rdquo; or &ldquo;document is not defined&rdquo;</H3>
			<p>
				The canvas only runs in the browser. In Next.js, render the editor in a <code>'use client'</code>{' '}
				component; it can be rendered on the server once, the canvas starts in the browser. If the error comes
				from code around it, load the editor with <code>next/dynamic</code> and <code>ssr: false</code>. See{' '}
				<DocLink to='installation#nextjs'>Next.js</DocLink>.
			</p>

			<H3 id='fabric-version'>Errors from fabric, or objects behave strangely</H3>
			<p>
				FabriPix needs Fabric.js <strong>6</strong>. Check with <code>npm ls fabric</code> that only one copy of
				version 6 is installed. With Vite, <code>resolve.dedupe: ['fabric']</code> forces a single copy in a
				monorepo.
			</p>

			<H2 id='interaction'>Interaction</H2>

			<H3 id='shortcuts'>Keyboard shortcuts do not work</H3>
			<ul>
				<li>Shortcuts apply to the editor the user clicked last. Click on the canvas once.</li>
				<li>They are ignored while typing in an input, a textarea or a text on the canvas.</li>
				<li>
					Check that <code>keyboardShortcuts</code> is not <code>false</code>, and that the shortcut was not
					rebound. See <DocLink to='keyboard-shortcuts'>Keyboard shortcuts</DocLink>.
				</li>
			</ul>

			<H3 id='several-editors'>Can I show several editors on one page?</H3>
			<p>
				Yes. Each <code>{'<ImageEditor>'}</code> is independent. Keyboard shortcuts go to the one used last, and
				copied objects can be pasted into another editor.
			</p>

			<H3 id='fonts'>My web font is not used in text</H3>
			<p>
				The canvas can only draw fonts the browser has loaded. Add the font to <code>defaults.text.fonts</code>{' '}
				and make sure it is loaded before the user picks it, e.g. with{' '}
				<code>await document.fonts.load('16px Inter')</code>.
			</p>

			<H3 id='mobile'>Does it work on phones and tablets?</H3>
			<p>
				Yes. Every tool works with a finger, pinch zooms, two fingers pan, and a double tap works like a double
				click. When the editor is narrower than 640px its bars become single rows that scroll sideways. See{' '}
				<DocLink to='touch-and-mobile'>Phones, tablets &amp; gestures</DocLink>.
			</p>

			<H3 id='page-zooms'>Pinching zooms the whole page instead of the image</H3>
			<p>
				The editor only handles pinches that start on the image. Check that <code>gestures</code> is not{' '}
				<code>false</code>, and that the viewport meta tag of your page is set (
				<code>{'<meta name="viewport" content="width=device-width, initial-scale=1">'}</code>).
			</p>

			<H2 id='more-help'>Still stuck?</H2>
			<p>
				Search the <a href='https://github.com/vikhyatsingh123/fabri-pix/issues'>GitHub issues</a> or open a new
				one with a small example. Bug reports with the browser, versions and the steps to reproduce are fixed
				fastest.
			</p>
		</>
	);
}

// ---------------------------------------------------------------- migration

function Migration() {
	return (
		<>
			<PageHeader
				eyebrow='Help'
				title='Upgrading from 2.x'
				lead={
					<>
						Version 3 replaces <code>ImageEditorWrapper</code> with a configurable <code>ImageEditor</code>.
						Most apps only need the changes in the first section. JSON saved with 2.x still loads.
					</>
				}
			/>

			<H2 id='component'>1. Update the component and its props</H2>
			<CodeBlock
				lang='diff'
				code={`- import { ImageEditorWrapper } from 'fabri-pix';
+ import { ImageEditor } from 'fabri-pix';
  import 'fabri-pix/dist/fabri-pix.css';

- <ImageEditorWrapper
-   imageUrl={url}
-   loadFromJson={savedJson}
-   onSave={(blob, json) => upload(blob, json)}
-   showExportJson
-   exportJson={(json) => store(json)}
-   onCancel={close}
- />
+ <div style={{ height: '80vh' }}>
+   <ImageEditor
+     src={url}
+     initialState={savedJson}
+     onSave={({ blob, json }) => upload(blob, json)}
+     actions={['cancel', 'reset', 'exportJson', 'save']}
+     onExportJson={(json) => store(json)}
+     onCancel={close}
+   />
+ </div>`}
			/>
			<Table
				head={['2.x', '3.x']}
				rows={[
					[<code>ImageEditorWrapper</code>, <code>ImageEditor</code>],
					[
						<code>imageUrl</code>,
						<>
							<code>src</code> (also accepts a <code>Blob</code> / <code>File</code>)
						</>,
					],
					[<code>loadFromJson</code>, <code>initialState</code>],
					[<code>onSave(blob, json)</code>, <code>{'onSave({ blob, json })'}</code>],
					[
						<code>showExportJson</code>,
						<>
							add <code>'exportJson'</code> to <code>actions</code>
						</>,
					],
					[<code>exportJson(json)</code>, <code>onExportJson(json)</code>],
					[
						<code>onCancel</code>,
						<>
							still <code>onCancel</code>, but it now adds a separate <strong>Cancel</strong> button. In
							2.x it replaced what the Reset button did.
						</>,
					],
				]}
			/>

			<H2 id='size'>2. Give the editor a size</H2>
			<p>
				2.x used a fixed 1000 × 508 canvas. The editor now fills its parent and resizes with it, so the parent
				needs a height (or pass <code>width</code> / <code>height</code>). The canvas area is at least 400px
				high (CSS variable <code>--fp-stage-min-height</code>).
			</p>

			<H2 id='requirements'>3. Requirements</H2>
			<ul>
				<li>
					React <strong>18 or newer</strong> (was 17).
				</li>
				<li>
					Fabric.js <strong>6</strong> (<code>fabric@^6.0.0</code>). Fabric 7 positions objects differently
					and is not supported yet.
				</li>
			</ul>

			<H2 id='css'>4. Custom CSS</H2>
			<p>
				If you styled the editor through its old class names, use the new <code>fp-*</code> classes or the{' '}
				<DocLink to='theming'>classNames prop</DocLink>:
			</p>
			<Table
				head={['2.x', '3.x']}
				rows={[
					[<code>.custom-button</code>, <code>.fp-button (classNames.button)</code>],
					[<code>.custom-button.active</code>, <code>.fp-button--active</code>],
					[<code>.dropdown, .dropdown-content</code>, <code>.fp-dropdown, .fp-dropdown-content</code>],
					[<code>.history-log</code>, <code>.fp-history-item</code>],
					[<code>.color-input</code>, <code>.fp-color-picker</code>],
					[<code>.number-input</code>, <code>.fp-number-input</code>],
					[<code>.text-input</code>, <code>.fp-text-input</code>],
					[<code>.segmented-container</code>, <code>.fp-segmented</code>],
					[
						<code>#mainCanvas, #img-editor-div</code>,
						<>
							<code>.fp-stage</code> (ids were removed so that several editors can share a page)
						</>,
					],
				]}
			/>
			<p>
				The default styles now have zero specificity, so your rules win without <code>!important</code>. Colors
				can be changed with the <code>theme</code> prop or the <code>--fp-*</code> CSS variables.
			</p>

			<H2 id='behaviour'>5. Behaviour changes</H2>
			<ul>
				<li>
					Saved images are exported at the original image resolution and cropped to the crop area. Use{' '}
					<code>{'exportOptions={{ multiplier: 1 }}'}</code> to get the 2.x size (the image fitted into 1000 ×
					508).
				</li>
				<li>
					Undo history is limited to 50 steps (<code>historyLimit</code>).
				</li>
				<li>
					The Delete / Backspace shortcut only affects the editor the user interacted with last, and can be
					turned off with <code>{'keyboardShortcuts={false}'}</code>.
				</li>
			</ul>

			<H2 id='new'>What&rsquo;s new</H2>
			<p>
				Besides being configurable, 3.x adds many tools and features: rotate and flip, resize, adjustments, 18
				filters, triangles, lines, icons, keyboard shortcuts, copy / paste, layer order and object styles. The{' '}
				<a href='https://github.com/vikhyatsingh123/fabri-pix/blob/main/RELEASE_NOTES.md'>release notes</a> list
				everything.
			</p>
		</>
	);
}

export const pages: Record<string, ComponentType> = {
	'': Introduction,
	installation: Installation,
	'quick-start': QuickStart,
	'loading-images': LoadingImages,
	'saving-and-exporting': SavingAndExporting,
	'editor-state': EditorState,
	troubleshooting: Troubleshooting,
	migration: Migration,
};
