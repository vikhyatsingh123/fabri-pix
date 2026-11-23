import { useEffect } from 'react';
import { DefaultLayout, useImageEditor, type EditorEvents } from 'fabri-pix';

import {
	ApiMethod,
	Callout,
	CodeBlock,
	Demo,
	DemoEditor,
	DemoLog,
	DocLink,
	formatValue,
	H2,
	PageHeader,
	Table,
	useLog,
} from '../../ui';

const c = (text: string) => <code>{text}</code>;

const eventRows = [
	[
		c('ready'),
		c('{ editor }'),
		'The image (and initial state) is loaded. Again after every new image, not after a failed load.',
		c('onReady'),
	],
	[
		c('change'),
		c('{ json }'),
		'The content changed: a new history entry, undo, redo, a history jump or loadState. json = editor.toJSON().',
		c('onChange'),
	],
	[
		c('historyChange'),
		c('{ history: { entries, index } }'),
		'The history changed (same moments as change, plus when an image is loaded).',
		'—',
	],
	[c('toolChange'), c('{ tool: string | null }'), 'The active tool changed.', c('onToolChange')],
	[c('menuChange'), c('{ menu: string | null }'), 'Another menu tab was opened.', '—'],
	[
		c('selectionChange'),
		c('{ objects: FabricObject[] }'),
		'Objects were selected or deselected.',
		c('onSelectionChange'),
	],
	[c('zoomChange'), c('{ zoom: number }'), 'The zoom changed.', '—'],
	[c('save'), c('{ blob, json }'), 'editor.save() (the Save button) finished, after onSave.', c('onSave')],
	[c('error'), c('{ error }'), 'Loading, restoring, a tool or the export failed.', c('onError')],
];

const ALL_EVENTS: (keyof EditorEvents)[] = [
	'ready',
	'change',
	'historyChange',
	'toolChange',
	'menuChange',
	'selectionChange',
	'zoomChange',
	'save',
	'error',
];

/** short, readable payloads for the log */
const summarize = (event: keyof EditorEvents, payload: any) => {
	switch (event) {
		case 'ready':
			return 'editor ready';
		case 'change':
			return `${payload.json.objects?.length ?? 0} objects`;
		case 'historyChange':
			return `index ${payload.history.index} of ${payload.history.entries.length - 1}`;
		case 'selectionChange':
			return `${payload.objects.length} selected`;
		case 'save':
			return formatValue(payload.blob);
		case 'error':
			return String(payload.error);
		default:
			return formatValue(payload);
	}
};

// rendered inside the editor, so it can use the hook; subscribes on mount and unsubscribes on unmount
function EventLogger(props: { log: (...values: unknown[]) => void }) {
	const { log } = props;
	const editor = useImageEditor();
	useEffect(() => {
		const unsubscribers = ALL_EVENTS.map((event) =>
			editor.on(event, (payload) => log(`${event}`.padEnd(16), summarize(event, payload))),
		);
		return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
	}, [editor, log]);
	return null;
}

const demoCode = `import { useEffect } from 'react';
import { ImageEditor, DefaultLayout, useImageEditor } from 'fabri-pix';

function EventLogger() {
  const editor = useImageEditor();

  useEffect(() => {
    const events = ['ready', 'change', 'historyChange', 'toolChange', 'menuChange',
                    'selectionChange', 'zoomChange', 'save', 'error'] as const;
    // editor.on returns a function that removes the listener
    const unsubscribers = events.map((event) =>
      editor.on(event, (payload) => console.log(event, payload)),
    );
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [editor]);

  return null;
}

<ImageEditor src={url} onSave={() => {}}>
  <DefaultLayout />
  <EventLogger />
</ImageEditor>`;

export function EventsPage() {
	const { entries, log, clear } = useLog(80);
	return (
		<>
			<PageHeader
				eyebrow='API reference'
				title='Events'
				lead='React to what happens in the editor: changes, the selection, the active tool, saving and errors.'
			/>

			<p>There are two ways to listen, and they receive the same notifications:</p>
			<ul>
				<li>
					<strong>Callback props</strong> such as <code>onChange</code> and <code>onSelectionChange</code>:
					simplest when you render the editor yourself.
				</li>
				<li>
					<strong>
						<code>editor.on(event, listener)</code>
					</strong>
					: from anywhere you have the controller (a ref, <code>useImageEditor()</code>, a custom tool), for
					events without a prop, and for several listeners.
				</li>
			</ul>

			<Demo
				title='Every event, logged'
				description={
					<p>
						Draw, select, undo, zoom or save. A component inside the editor subscribes to all events with{' '}
						<code>editor.on</code>.
					</p>
				}
				code={demoCode}
			>
				<DemoEditor height={440} onSave={() => {}}>
					<DefaultLayout />
					<EventLogger log={log} />
				</DemoEditor>
				<DemoLog entries={entries} onClear={clear} placeholder='Events appear here' />
			</Demo>

			<H2 id='event-list'>Events</H2>
			<Table head={['Event', 'Payload', 'When', 'Callback prop']} rows={eventRows} />
			<p>
				The callback prop of an event is called first, then the <code>on</code> listeners. An exception in a
				listener is logged and does not stop the others.
			</p>

			<H2 id='on'>
				<code>editor.on</code>
			</H2>
			<ApiMethod
				name='on'
				signature='editor.on<K extends keyof EditorEvents>(event: K, listener: (payload: EditorEvents[K]) => void): () => void'
				returns='() => void (removes the listener)'
				params={[
					{ name: 'event', type: 'keyof EditorEvents', description: <span>One of the events above.</span> },
					{
						name: 'listener',
						type: '(payload) => void',
						description: <span>Receives the payload; typed per event.</span>,
					},
				]}
				example={`const unsubscribe = editor.on('change', ({ json }) => {
  localStorage.setItem('draft', JSON.stringify(json));
});

// later
unsubscribe();`}
			>
				<p>
					Adds a listener and returns a function that removes it. Listeners live as long as the controller, so
					always remove them when the component that added them unmounts.
				</p>
			</ApiMethod>

			<H2 id='in-react'>Using events in React</H2>
			<p>Subscribe in an effect and return the unsubscribe function as its cleanup:</p>
			<CodeBlock
				code={`function SelectionInfo() {
  const editor = useImageEditor();
  const [count, setCount] = useState(0);

  useEffect(
    () => editor.on('selectionChange', ({ objects }) => setCount(objects.length)),
    [editor],
  );

  return <span>{count} selected</span>;
}`}
			/>
			<Callout type='tip' title='Only need to re-render?'>
				<p>
					For values that are part of the editor state (selection, active tool, zoom, history) the{' '}
					<DocLink to='api/hooks#useeditorstate'>useEditorState()</DocLink> hook is shorter: it re-renders the
					component whenever the state changes. Use events for side effects such as autosave or analytics.
				</p>
			</Callout>

			<H2 id='autosave'>Example: autosave</H2>
			<CodeBlock
				code={`function Editor({ url, draft }: { url: string; draft?: object }) {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  return (
    <ImageEditor
      src={url}
      initialState={draft}
      onChange={(json) => {
        // debounce: one request after the user stops editing
        clearTimeout(timer.current);
        timer.current = setTimeout(() => saveDraft(json), 1000);
      }}
    />
  );
}`}
			/>

			<H2 id='typescript'>TypeScript</H2>
			<p>
				<code>EditorEvents</code> maps every event name to its payload type, so listeners are typed
				automatically:
			</p>
			<CodeBlock
				lang='ts'
				code={`import type { EditorEvents } from 'fabri-pix';

type ChangePayload = EditorEvents['change']; // { json: Record<string, any> }

editor.on('zoomChange', ({ zoom }) => console.log(zoom.toFixed(1))); // zoom: number`}
			/>
		</>
	);
}
