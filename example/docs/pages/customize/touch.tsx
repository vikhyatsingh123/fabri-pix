import { useState } from 'react';

import './customize.css';

import {
	Callout,
	CodeBlock,
	Demo,
	DemoButton,
	DemoControls,
	DemoEditor,
	DemoLog,
	DocLink,
	H2,
	H3,
	Kbd,
	PageHeader,
	Table,
	useLog,
} from '../../ui';

function WidthDemo() {
	const [width, setWidth] = useState(390);
	const [gestures, setGestures] = useState(true);
	const { entries, log, clear } = useLog();
	return (
		<Demo
			title='The same editor at any width'
			description={
				<p>
					Drag the slider: below 640px the menu moves above the image and every bar becomes a single row that
					scrolls sideways. Try <Kbd>⌘</Kbd>/<Kbd>Ctrl</Kbd> + scroll (or a trackpad pinch) on the image to
					zoom, then scroll to pan. On a phone, pinch and use two fingers.
				</p>
			}
			code={`<div style={{ width: ${width}, height: 640 }}>
  <ImageEditor
    src={imageUrl}${gestures ? '' : '\n    gestures={false}'}
    onReady={(editor) => editor.on('zoomChange', ({ zoom }) => console.log(zoom))}
  />
</div>`}
		>
			<DemoControls>
				<label>
					Editor width
					<input
						type='range'
						min={320}
						max={900}
						step={10}
						value={width}
						onChange={(event) => setWidth(Number(event.target.value))}
					/>
					<code>{width}px</code>
				</label>
				<DemoButton active={width <= 400} onClick={() => setWidth(390)}>
					Phone
				</DemoButton>
				<DemoButton active={width > 400 && width < 640} onClick={() => setWidth(600)}>
					Small
				</DemoButton>
				<DemoButton active={width >= 640} onClick={() => setWidth(900)}>
					Wide
				</DemoButton>
				<label>
					<input type='checkbox' checked={gestures} onChange={(event) => setGestures(event.target.checked)} />{' '}
					gestures
				</label>
			</DemoControls>
			<div className='cz-phone-stage'>
				<div className='cz-phone' style={{ width }}>
					<DemoEditor
						height={640}
						gestures={gestures}
						onReady={(editor) => editor.on('zoomChange', ({ zoom }) => log(`zoomChange: ${zoom}`))}
					/>
				</div>
			</div>
			<DemoLog entries={entries} onClear={clear} placeholder='Zoom with a pinch or ⌘/Ctrl + scroll' />
		</Demo>
	);
}

export default function TouchPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Phones, tablets & gestures'
				lead='The editor works with fingers, pens, mice and trackpads, and adapts its layout to the space it gets. Nothing has to be configured.'
			/>

			<H2 id='what-works'>What works on touch screens</H2>
			<p>Every tool works with one finger, exactly like with a mouse. On top of that:</p>
			<Table
				head={['Gesture', 'What it does']}
				rows={[
					['One finger', 'Uses the active tool: draws, places shapes, moves and resizes objects.'],
					[
						'Two fingers apart / together',
						'Zooms in and out around the point between the fingers (1× to 4×).',
					],
					['Two fingers moving', 'Moves the zoomed-in view. The photo never leaves the view.'],
					[
						'Double tap',
						'Works as a double click: edits a text, a step number or a callout, and finishes a path.',
					],
					['Tap', 'Selects an object, like a click.'],
				]}
			/>
			<p>With a mouse or trackpad:</p>
			<Table
				head={['Input', 'What it does']}
				rows={[
					[
						<>
							<Kbd>⌘</Kbd> / <Kbd>Ctrl</Kbd> + scroll, trackpad pinch
						</>,
						'Zooms around the pointer.',
					],
					[
						'Scroll / two-finger trackpad swipe',
						'Moves the view while zoomed in. At 1× the page scrolls as usual.',
					],
				]}
			/>
			<WidthDemo />

			<H2 id='how-gestures-work'>How gestures work</H2>
			<ul>
				<li>
					When a finger touches the image, the editor waits a moment (90 ms, or until the finger moves) to see
					whether a second finger follows. A single finger is then passed to the tool; with two fingers, the
					tool never sees the touch, so a pinch draws nothing and moves nothing.
				</li>
				<li>
					If the second finger comes later, whatever the first finger started (moving an object, a stroke) is
					finished first.
				</li>
				<li>Zooming and panning are not undo steps.</li>
				<li>Pinching below the fitted size snaps back to the whole photo.</li>
				<li>Pinches that start outside the image (on the toolbar, the page) are left to the browser.</li>
			</ul>

			<H3 id='turning-gestures-off'>Turning gestures off</H3>
			<CodeBlock code={`<ImageEditor src={url} gestures={false} />`} />
			<p>
				Without gestures every touch goes straight to the tool and the wheel never zooms or pans. Double taps
				still work as double clicks, so texts can be edited. The zoom buttons and pan mode in the header keep
				working.
			</p>

			<H3 id='from-code'>Zoom and pan from your own controls</H3>
			<p>
				Gestures use two controller methods you can call too:{' '}
				<DocLink to='api/view-and-export#setzoom'>
					<code>setZoom(zoom, point?)</code>
				</DocLink>{' '}
				zooms around a spot of the canvas, and{' '}
				<DocLink to='api/view-and-export#panby'>
					<code>panBy(dx, dy)</code>
				</DocLink>{' '}
				moves the zoomed-in view. The <code>zoomChange</code> event reports every change.
			</p>
			<CodeBlock
				code={`editor.setZoom(2, { x: 120, y: 80 }); // 2×, keeping the point (120, 80) of the canvas in place
editor.panBy(0, -100);                 // show more of the bottom
editor.on('zoomChange', ({ zoom }) => setZoomLabel(\`\${Math.round(zoom * 100)}%\`));`}
			/>

			<H2 id='narrow-layout'>The narrow layout</H2>
			<p>
				The layout follows the <strong>width of the editor</strong>, not of the window (a CSS container query on{' '}
				<code>.fp-root</code>). An editor in a 400px sidebar on a desktop looks like the phone version. Below
				640px:
			</p>
			<ul>
				<li>
					A menu on the left or right moves above the image (<code>layout.menu</code> <code>top</code> and{' '}
					<code>bottom</code> stay where they are).
				</li>
				<li>
					The header, menu, toolbar, options and actions each become one row that scrolls sideways, instead of
					wrapping onto several lines. The side with more buttons fades out.
				</li>
				<li>When a menu or tool is chosen, its button scrolls into view.</li>
				<li>
					Popups (the Shapes, Icon and Emoji pickers, the history) open above or below their button and stay
					inside the editor.
				</li>
				<li>
					The image area may shrink below <code>--fp-stage-min-height</code>, down to 55% of the screen
					height.
				</li>
			</ul>
			<p>On touch screens (any width), buttons are at least 40px high and color pickers are larger.</p>

			<H3 id='customizing-narrow'>Changing the narrow layout</H3>
			<p>
				The default styles have zero specificity, so a container query of your own changes the narrow layout.
				The container is called <code>fp-root</code>. For example, icons only in the menu and toolbar:
			</p>
			<CodeBlock
				lang='css'
				code={`@container fp-root (max-width: 640px) {
  .fp-menu-item span,
  .fp-toolbar .fp-tool-button span {
    display: none;
  }
}`}
			/>
			<p>
				Or use your own breakpoint: the editor applies the narrow rules only below 640px, so for an earlier
				switch repeat the rules you need (e.g. <code>{'.fp-body { flex-direction: column; }'}</code>) in a
				container query with a larger width.
			</p>

			<H2 id='page-setup'>Setting up the page</H2>
			<ul>
				<li>
					Your page needs the viewport meta tag, otherwise phones show a zoomed-out desktop page:{' '}
					<code>{'<meta name="viewport" content="width=device-width, initial-scale=1">'}</code>
				</li>
				<li>
					Give the editor the full screen height on phones with <code>dvh</code>, which follows the browser
					bars: <code>{"<div style={{ height: '100dvh' }}>"}</code>.
				</li>
				<li>
					A full-screen modal works best: the page cannot scroll while the user edits, and every touch goes to
					the editor.
				</li>
				<li>
					On touch screens the emoji picker does not focus its search field, so the keyboard does not cover
					it.
				</li>
			</ul>
			<Callout type='note' title='Known limits'>
				<p>
					Objects are rotated with their rotation handle; a two-finger twist rotates nothing. There is no
					long-press menu.
				</p>
			</Callout>
		</>
	);
}
