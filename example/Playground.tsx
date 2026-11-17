import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { ImageEditor, type ImageEditorController, type SaveResult } from 'fabri-pix';

import { canvasJson } from './canvasJson';
import { accentColors, editorThemes, sampleImages } from './content';
import { CodeIcon, UploadIcon } from './icons';

type Theme = 'light' | 'dark';

interface ExportedImage {
	url: string;
	width: number;
	height: number;
	size: number;
	type: string;
}

const formatBytes = (bytes: number) =>
	bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

function Dialog(props: { title: string; onClose: () => void; children: ReactNode; actions?: ReactNode }) {
	const { title, onClose, children, actions } = props;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	return (
		<div className='dialog-backdrop' onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
			<div className='dialog' role='dialog' aria-modal='true' aria-label={title}>
				<div className='dialog-header'>
					<h3>{title}</h3>
					<button type='button' className='icon-button' aria-label='Close' onClick={onClose}>
						✕
					</button>
				</div>
				<div className='dialog-body'>{children}</div>
				{actions && <div className='dialog-actions'>{actions}</div>}
			</div>
		</div>
	);
}

function Segmented<T extends string>(props: {
	value: T;
	options: { value: T; label: string }[];
	onChange: (value: T) => void;
}) {
	const { value, options, onChange } = props;
	return (
		<div className='segmented' role='group'>
			{options.map((option) => (
				<button
					key={option.value}
					type='button'
					className={option.value === value ? 'active' : ''}
					aria-pressed={option.value === value}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}

export function Playground(props: { theme: Theme }) {
	const { theme } = props;
	const editorRef = useRef<ImageEditorController>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [imageId, setImageId] = useState(sampleImages[0].id);
	const [upload, setUpload] = useState<{ file: File; preview: string } | null>(null);
	const [withAnnotations, setWithAnnotations] = useState(true);
	const [accent, setAccent] = useState(accentColors[0]);
	const [menuPosition, setMenuPosition] = useState<'left' | 'top'>('left');
	const [toolbarPosition, setToolbarPosition] = useState<'bottom' | 'top'>('bottom');
	const [showCode, setShowCode] = useState(false);
	const [exported, setExported] = useState<ExportedImage | null>(null);
	const [json, setJson] = useState<Record<string, any> | null>(null);
	const [copied, setCopied] = useState(false);

	const image = sampleImages.find((sample) => sample.id === imageId) ?? sampleImages[0];
	const annotationsAvailable = !upload && !!image.hasAnnotations;
	const src = upload?.file ?? image.src;
	const initialState = annotationsAvailable && withAnnotations ? canvasJson : undefined;

	// object urls are released when they are replaced
	useEffect(
		() => () => {
			if (upload) {
				URL.revokeObjectURL(upload.preview);
			}
		},
		[upload],
	);
	useEffect(
		() => () => {
			if (exported) {
				URL.revokeObjectURL(exported.url);
			}
		},
		[exported],
	);

	const handleSave = async ({ blob }: SaveResult) => {
		const bitmap = await createImageBitmap(blob);
		setExported({
			url: URL.createObjectURL(blob),
			width: bitmap.width,
			height: bitmap.height,
			size: blob.size,
			type: blob.type,
		});
		bitmap.close();
	};

	const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (file) {
			setUpload({ file, preview: URL.createObjectURL(file) });
		}
	};

	const jsonText = json
		? JSON.stringify(
				{
					...json,
					// the image itself is not interesting here and can be huge
					backgroundImage: json.backgroundImage && { ...json.backgroundImage, src: '…' },
				},
				null,
				2,
			)
		: '';

	const code = `<ImageEditor
  src={imageUrl}${initialState ? '\n  initialState={savedJson}' : ''}
  theme={{ primary: '${accent}' }}${
		menuPosition !== 'left' || toolbarPosition !== 'bottom'
			? `\n  layout={{ menu: '${menuPosition}', toolbar: '${toolbarPosition}' }}`
			: ''
  }
  actions={['load', 'deleteAll', 'reset', 'exportJson', 'save']}
  onSave={({ blob, json }) => upload(blob, json)}
/>`;

	return (
		<section className='playground' id='playground'>
			<div className='window'>
				<div className='window-bar'>
					<span className='window-dots' aria-hidden='true'>
						<span />
						<span />
						<span />
					</span>
					<div className='control-group'>
						<div className='thumbnails' role='group' aria-label='Image'>
							{sampleImages.map((sample) => (
								<button
									key={sample.id}
									type='button'
									className={`thumbnail ${!upload && sample.id === imageId ? 'active' : ''}`}
									title={sample.label}
									aria-label={`Use the ${sample.label} image`}
									onClick={() => {
										setUpload(null);
										setImageId(sample.id);
									}}
								>
									<img src={sample.thumbnail} alt='' loading='lazy' />
								</button>
							))}
							{upload && (
								<button type='button' className='thumbnail active' title={upload.file.name}>
									<img src={upload.preview} alt='' />
								</button>
							)}
							<button
								type='button'
								className='bar-button'
								title='Use your own image'
								onClick={() => fileInputRef.current?.click()}
							>
								<UploadIcon /> Upload
							</button>
							<input ref={fileInputRef} type='file' accept='image/*' hidden onChange={handleUpload} />
						</div>
					</div>

					<span className='bar-divider' />

					<div className='swatches' role='group' aria-label='Accent color'>
						{accentColors.map((color) => (
							<button
								key={color}
								type='button'
								className={`swatch ${color === accent ? 'active' : ''}`}
								style={{ background: color }}
								aria-label={`Accent color ${color}`}
								aria-pressed={color === accent}
								onClick={() => setAccent(color)}
							/>
						))}
					</div>

					<span className='bar-divider' />

					<div className='control-group'>
						<span className='control-label'>Menu</span>
						<Segmented
							value={menuPosition}
							onChange={setMenuPosition}
							options={[
								{ value: 'left', label: 'Left' },
								{ value: 'top', label: 'Top' },
							]}
						/>
					</div>
					<div className='control-group'>
						<span className='control-label'>Tools</span>
						<Segmented
							value={toolbarPosition}
							onChange={setToolbarPosition}
							options={[
								{ value: 'bottom', label: 'Bottom' },
								{ value: 'top', label: 'Top' },
							]}
						/>
					</div>

					<div className='control-group control-group--end'>
						{annotationsAvailable && (
							<label className='toggle'>
								<input
									type='checkbox'
									checked={withAnnotations}
									onChange={(event) => setWithAnnotations(event.target.checked)}
								/>
								<span>Annotations</span>
							</label>
						)}
						<button
							type='button'
							className={`bar-button ${showCode ? 'active' : ''}`}
							aria-pressed={showCode}
							onClick={() => setShowCode((open) => !open)}
						>
							<CodeIcon /> Code
						</button>
					</div>
				</div>

				{showCode && (
					<pre className='code-block code-block--inline'>
						<code>{code}</code>
					</pre>
				)}

				<div className='editor-area'>
					<ImageEditor
						// a new editor when the image or the sample annotations change
						key={`${upload ? upload.preview : imageId}-${withAnnotations}`}
						ref={editorRef}
						src={src}
						initialState={initialState}
						theme={{ ...editorThemes[theme], primary: accent, active: `${accent}1f` }}
						layout={{ menu: menuPosition, toolbar: toolbarPosition }}
						actions={['load', 'deleteAll', 'reset', 'exportJson', 'save']}
						onSave={(result) => void handleSave(result)}
						onExportJson={setJson}
					/>
				</div>
			</div>

			<div className='shortcut-hint'>
				{[
					['⌘Z', 'undo'],
					['⌘D', 'duplicate'],
					['⌘C ⌘V', 'copy & paste'],
					['← →', 'nudge'],
					['⌫', 'delete'],
				].map(([keys, label]) => (
					<span key={label} className='shortcut'>
						<kbd>{keys}</kbd> {label}
					</span>
				))}
			</div>

			{exported && (
				<Dialog
					title='Your edited image'
					onClose={() => setExported(null)}
					actions={
						<>
							<button type='button' className='ghost-button' onClick={() => setExported(null)}>
								Close
							</button>
							<a className='primary-button' href={exported.url} download={`fabri-pix-${Date.now()}.png`}>
								Download
							</a>
						</>
					}
				>
					<div className='result-preview'>
						<img src={exported.url} alt='The exported result' />
					</div>
					<div className='result-meta'>
						<span>
							{exported.width} × {exported.height}px
						</span>
						<span>{formatBytes(exported.size)}</span>
						<span>{exported.type}</span>
					</div>
				</Dialog>
			)}

			{json && (
				<Dialog
					title='Editor state (JSON)'
					onClose={() => setJson(null)}
					actions={
						<>
							<button
								type='button'
								className='ghost-button'
								onClick={() => {
									void navigator.clipboard?.writeText(JSON.stringify(json));
									setCopied(true);
									setTimeout(() => setCopied(false), 1500);
								}}
							>
								{copied ? 'Copied ✓' : 'Copy JSON'}
							</button>
							<button type='button' className='primary-button' onClick={() => setJson(null)}>
								Done
							</button>
						</>
					}
				>
					<p className='dialog-text'>
						Pass this to <code>initialState</code> to continue editing later.
					</p>
					<pre className='code-block code-block--json'>
						<code>{jsonText}</code>
					</pre>
				</Dialog>
			)}
		</section>
	);
}
