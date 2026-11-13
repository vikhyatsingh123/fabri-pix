# FabriPix 🎨

[![npm version](https://img.shields.io/npm/v/fabri-pix.svg?style=flat)](https://www.npmjs.com/package/fabri-pix)
[![npm downloads](https://img.shields.io/npm/dw/fabri-pix.svg?style=flat)](https://www.npmjs.com/package/fabri-pix)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**FabriPix** is a plug-and-play **React image editor** built on [Fabric.js](http://fabricjs.com/). Use it as a ready-made
editor, or customize every part of it: which tools are shown, their defaults, texts, icons, styling, layout, the buttons
it renders, and your own tools. You can also build a completely custom UI on top of its editor core.

---

## ✨ Features

-   ✂️ **Crop** (free or 1:1, 3:2, 4:3, 5:4, 7:5, 16:9), 🔄 **Rotate** (90° steps or any angle) and ↔️ **Flip**
-   🎨 **Filters**: grayscale, black & white, invert, sepia, vintage, kodachrome, polaroid, technicolor, brownie, blur,
    sharpen, emboss, remove white, noise, pixelate, tint, multiply, blend (and your own)
-   🎚️ **Adjust**: brightness, contrast, saturation, vibrance, hue, gamma; 📐 **Resize** the output (with or without
    keeping the aspect ratio)
-   🔒 **Redact** (blur) sensitive parts, 🔍 **Zoom** and ✋ **Pan**
-   ⌨️ **Keyboard shortcuts**, 📋 **copy / cut / paste / duplicate** (also images from the clipboard), 🗂️ **layer order**
-   🖌️ **Object styles**: opacity, shadow, dashed strokes, rounded corners
-   ↩️ **Undo / Redo** with an 🕒 **edit history** panel
-   🔢 **Steps**, 🧩 **Shapes** (rectangle, circle, triangle, arrow, star), 🗨️ **Callouts**, ⭐ **Icons**,
    📝 **Text** (bold, italic, underline, strikethrough, fonts), 😄 **Emoji**, 🖼️ **Images**, ✏️ **Free drawing**,
    📏 **Lines**, 🎯 **Arrows**, ➰ **Paths**
-   💾 **Export** as PNG / JPEG / WebP at the original resolution, 📄 **save and restore** the editing state as JSON
-   🎛️ **Fully configurable**: tools, defaults, labels (i18n), icons, theme, class names, layout, components
-   🧱 **Composable**: every part of the UI is exported, build your own layout with hooks
-   🔌 **Extensible**: add your own tools, or replace the built-in ones

---

## 📦 Installation

```bash
npm install fabri-pix fabric@6
# or
yarn add fabri-pix fabric@6
```

Requires React 18+ and Fabric.js 6.

---

## ⚙️ Quick start

```tsx
import { ImageEditor } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

export default function App() {
	return (
		// the editor fills its parent, so give the parent a size
		<div style={{ height: '80vh' }}>
			<ImageEditor
				src='https://your-image-url.com/sample.png'
				onSave={({ blob, json }) => upload(blob, json)}
			/>
		</div>
	);
}
```

`src` accepts a URL, a data URL or a `Blob` / `File`. Images from another origin need CORS headers to be exported.

---

## 🛠️ Props

### Editor

| Prop                | Type                                        | Description                                                                                             |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src`               | `string \| Blob`                            | Image to edit. Changing it loads the new image.                                                         |
| `initialState`      | `object \| string`                          | JSON from `onSave` / `editor.toJSON()` to continue editing                                              |
| `crossOrigin`       | `'anonymous' \| 'use-credentials' \| null`  | Used to load `src` (default `'anonymous'`)                                                              |
| `tools`             | `(string \| ToolDefinition)[]`              | Tools to show (default: all). Custom tool definitions are added, same id replaces a built-in tool       |
| `menus`             | `MenuDefinition[]`                          | Menus (tabs) and the tools in each (default: Annotate / Crop / Redact)                                  |
| `defaults`          | `Record<toolId, options>`                   | Default options per tool, e.g. `{ text: { fontSize: 32 } }`                                             |
| `shapes`            | `ShapeDefinition[]`                         | Additional / replacement object definitions (restore, delete, history behaviour)                       |
| `filters`           | `FilterDefinition[]`                        | Additional / replacement filters of the Filter menu                                                     |
| `exportOptions`     | `{ format, quality, multiplier, maxPixels }` | Image export settings (default: PNG at the original resolution)                                         |
| `historyLimit`      | `number`                                    | Maximum undo steps (default `50`)                                                                       |
| `keyboardShortcuts` | `boolean \| Partial<Record<EditorShortcut, string[] \| null>>` | Keyboard shortcuts, see [Keyboard shortcuts](#-keyboard-shortcuts) (default: on) |
| `onSave`            | `({ blob, json }) => void`                  | Called by the Save button. Without it the image is downloaded                                           |
| `onCancel`          | `() => void`                                | Shows a Cancel button                                                                                   |
| `onExportJson`      | `(json) => void`                            | Called by the Export JSON button. Without it the JSON is downloaded                                     |
| `onChange`          | `(json) => void`                            | Called after every change (new history entry, undo, redo)                                               |
| `onReady`           | `(editor) => void`                          | The image is loaded, `editor.canvas` is the Fabric.js canvas                                            |
| `onToolChange`      | `(toolId \| null) => void`                  | The active tool changed                                                                                 |
| `onSelectionChange` | `(objects) => void`                         | The selection changed                                                                                   |
| `onError`           | `(error) => void`                           | Loading or exporting failed                                                                             |

### UI

| Prop         | Type                                          | Description                                                                              |
| ------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `width`, `height` | `number \| string`                       | Size of the editor (default `100%` of the parent)                                        |
| `className`, `style` | —                                      | Applied to the root element                                                              |
| `actions`    | `('load' \| 'deleteAll' \| 'reset' \| 'cancel' \| 'exportJson' \| 'save')[]` | Buttons of the actions bar and their order (default `['reset', 'save']`). `load` opens another image, `deleteAll` removes the annotations, `reset` also the crop, rotation and filters |
| `layout`     | `EditorLayout`                                | Where the menu, header, toolbar, options panel and actions are placed                    |
| `labels`     | `Partial<EditorLabels>`                       | Texts of the UI, plus `labels.tools` / `labels.menus` keyed by id (i18n)                 |
| `icons`      | `Partial<EditorIcons>`                        | Icons of the UI, plus `icons.tools` / `icons.menus` keyed by id                          |
| `theme`      | `EditorTheme`                                 | Colors, radius and font (sets the CSS variables)                                         |
| `classNames` | `Partial<Record<EditorSlot, string>>`         | Extra class name per part (`root`, `toolbar`, `button`, `toolButton`, `stage`...)        |
| `styles`     | `Partial<Record<EditorSlot, CSSProperties>>`  | Inline styles per part                                                                   |
| `unstyled`   | `boolean`                                     | Drop all default colors, borders and spacing (keeps the layout)                          |
| `components` | `Partial<EditorComponents>`                   | Replace the `Button`, `ColorPicker`, `NumberInput`, `Slider`, `Select` or whole layout parts |
| `objectControls` | `ObjectControl[]`                         | Controls shown for selected objects: `opacity`, `shadow`, `dashed`, `cornerRadius`, `layers`, `duplicate`, `delete` (default: all) |
| `children`   | `ReactNode`                                   | Replaces the default layout (see [Custom layout](#-custom-layout))                       |

---

## 🎛️ Customization

### Choose the tools

```tsx
<ImageEditor src={url} tools={['text', 'draw', 'arrow', 'crop']} />
```

Built-in tool ids: `steps`, `rectangle`, `circle`, `triangle`, `arrowShape`, `star`, `comment`, `image`, `icon`,
`emoji`, `text`, `draw`, `line`, `arrow`, `path`, `crop`, `transform` (rotate & flip), `resize`, `adjust`, `filter`,
`redact`. Menus without any visible tool are hidden, and so is the menu bar when only one menu is
left.

Arrange tools and menus yourself with `menus` (a group is shown as a dropdown):

```tsx
<ImageEditor
	src={url}
	menus={[
		{ id: 'draw', label: 'Draw', tools: ['text', 'draw', { id: 'shapes', label: 'Shapes', tools: ['rectangle', 'circle'] }] },
		{ id: 'crop', label: 'Crop', tools: ['crop'], defaultTool: 'crop' },
	]}
/>
```

### Defaults of the tools

```tsx
<ImageEditor
	src={url}
	defaults={{
		text: { fontSize: 32, fill: '#ffffff', backgroundColor: '#000000', fontFamily: 'Inter' },
		draw: { color: '#00aaff', width: 4 },
		rectangle: { stroke: '#00aaff', strokeWidth: 3 },
		crop: { ratio: 16 / 9 },
		text: { fonts: ['Inter', 'Roboto', 'Georgia'] },
	}}
/>
```

### Icons and filters

The Icon tool uses a library of SVG paths which you can extend or replace:

```tsx
import { defaultIconLibrary } from 'fabri-pix';

<ImageEditor
	src={url}
	defaults={{ icon: { library: [...defaultIconLibrary, { id: 'logo', label: 'Logo', path: 'M12 2L2 22H22Z' }] } }}
/>;
```

Filters are definitions too (`group: 'adjust'` shows a filter as a slider in the Adjust menu, removed again at its
`neutral` value). Add your own (any [Fabric.js filter](http://fabricjs.com/image-filters)) or replace a
built-in one with the same id:

```tsx
import { filters } from 'fabric';

<ImageEditor
	src={url}
	filters={[
		{
			id: 'hue',
			label: 'Hue',
			defaultOptions: { rotation: 0.5 },
			controls: [{ key: 'rotation', min: -1, max: 1, step: 0.01 }],
			create: ({ rotation }) => new filters.HueRotation({ rotation }),
		},
	]}
/>;
```

The option types (`TextOptions`, `DrawOptions`, `RectangleOptions`...) are exported.

### Texts and translations

```tsx
<ImageEditor
	src={url}
	labels={{
		save: 'Speichern',
		reset: 'Zurücksetzen',
		tools: { text: 'Text', draw: 'Zeichnen' },
		menus: { annotate: 'Bearbeiten' },
	}}
/>
```

### Icons

```tsx
<ImageEditor src={url} icons={{ undo: <MyUndoIcon />, save: <SaveIcon />, tools: { text: <TypeIcon /> } }} />
```

The built-in icons use `currentColor`, so they follow the text color.

### Theme and styling

```tsx
<ImageEditor
	src={url}
	theme={{ primary: '#6d28d9', active: '#ede9fe', radius: '6px', fontFamily: 'Inter, sans-serif' }}
	classNames={{ root: 'my-editor', toolbar: 'my-toolbar', button: 'my-button' }}
	styles={{ stage: { background: '#111' } }}
/>
```

All default styles use `:where()` (zero specificity), so your own classes always win, no `!important` needed. Every part
has an `fp-*` class (`fp-root`, `fp-header`, `fp-menu`, `fp-stage`, `fp-toolbar`, `fp-tool-button`, `fp-context-panel`,
`fp-actions`, `fp-button`, `fp-button--active`...) and the theme is a set of CSS variables (`--fp-color-primary`,
`--fp-color-text`, `--fp-color-hover`, `--fp-radius`, `--fp-stage-min-height`...) which you can set in your own CSS too.
Pass `unstyled` to start from a blank slate (Tailwind, CSS modules...).

### Layout

```tsx
<ImageEditor
	src={url}
	layout={{ menu: 'top', header: 'top', toolbar: 'top', contextPanel: 'bottom', actions: 'none' }}
	actions={['cancel', 'save']}
	onCancel={close}
/>
```

### Your own components

Replace the primitives used everywhere in the editor, e.g. with your design system:

```tsx
import type { ButtonProps } from 'fabri-pix';

const MyButton = ({ active, danger, slot, ...props }: ButtonProps) => (
	<MuiButton variant={active ? 'contained' : 'text'} color={danger ? 'error' : 'primary'} {...props} />
);

<ImageEditor src={url} components={{ Button: MyButton, ColorPicker: MyColorPicker }} />;
```

Layout parts can be replaced or hidden the same way: `components={{ Header: MyHeader, Actions: null }}`.

---

## ⌨️ Keyboard shortcuts

| Action                                    | Default                 |
| ----------------------------------------- | ----------------------- |
| `undo` / `redo`                           | ⌘Z / ⇧⌘Z, ⌘Y            |
| `delete`                                  | Delete, Backspace       |
| `copy` / `cut` / `paste`                  | ⌘C / ⌘X / ⌘V            |
| `duplicate`                               | ⌘D                      |
| `selectAll` / `deselect`                  | ⌘A / Escape             |
| `nudgeLeft` / `nudgeRight` / `nudgeUp` / `nudgeDown` | Arrow keys (⇧ = 10 px) |
| `bringForward` / `sendBackward`           | ⌘] / ⌘[                 |
| `bringToFront` / `sendToBack`             | ⇧⌘] / ⇧⌘[               |

⌘ is Ctrl on Windows and Linux. Shortcuts only apply to the editor the user worked with last and never while typing.
Pasting an image copied in another application (e.g. a screenshot) adds it to the photo.

```tsx
// rebind or disable single shortcuts (`mod` = ⌘ on macOS, Ctrl elsewhere)
<ImageEditor src={url} keyboardShortcuts={{ duplicate: ['mod+j'], selectAll: null }} />

// disable all of them
<ImageEditor src={url} keyboardShortcuts={false} />
```

The defaults are exported as `defaultShortcuts`.

---

## 🧭 Controlling the editor

The `ref` (or the `useImageEditor()` hook) gives you the editor:

```tsx
const editor = useRef<ImageEditorController>(null);

<ImageEditor ref={editor} src={url} />;

editor.current.setActiveTool('text');
editor.current.undo();
editor.current.addShape('rectangle', { left: 50, top: 50, width: 200, height: 100, stroke: '#ff0000' });
editor.current.addImage(logoFile);
editor.current.rotateImage(90);
editor.current.setImageFilter('brightness', { value: 0.2 });
editor.current.setOutputSize({ width: 1200 });
editor.current.setObjectStyle(editor.current.canvas.getActiveObject(), { opacity: 0.5, dashed: true });
const blob = await editor.current.exportImage({ format: 'jpeg', quality: 0.9 });
const json = editor.current.toJSON();
editor.current.on('change', ({ json }) => autosave(json));
editor.current.canvas; // the Fabric.js canvas for anything else
```

| Method                                                    | Description                                         |
| --------------------------------------------------------- | --------------------------------------------------- |
| `setActiveTool(id \| null)`, `toggleTool(id)`, `setMenu(id)` | Tools and menus                                   |
| `undo()`, `redo()`, `goToHistory(index)`, `canUndo()`, `canRedo()` | History                                     |
| `zoomIn()`, `zoomOut()`, `setZoom(zoom)`, `fitToView()`, `setPanning(on)` | View                                  |
| `addShape(type, data)`, `addImage(src)`, `updateObject(object, props)`, `deleteObject(object)`, `deleteSelection()`, `clearAnnotations()`, `reset()` | Objects |
| `rotateImage(degrees)`, `setImageRotation(degrees)`, `flipImage('horizontal' \| 'vertical')`, `getImageRotation()`, `getImageFlip()` | Rotate / flip the photo (annotations follow) |
| `setImageFilter(id, options \| null)`, `getImageFilters()`, `clearImageFilters()` | Filters and adjustments |
| `setOutputSize({ width, height }, { keepAspect })`, `setOutputScale(x, y?)`, `getOutputSize()`, `getNaturalSize()` | Size of the exported image |
| `copySelection()`, `cutSelection()`, `paste()`, `duplicateSelection()`, `selectAll()`, `deselect()`, `nudgeSelection(dx, dy)` | Selection and clipboard |
| `arrangeSelection('forward' \| 'backward' \| 'front' \| 'back')`, `canArrangeSelection(direction)` | Layer order |
| `setObjectStyle(objects, { opacity, shadow, dashed, cornerRadius })`, `getObjectStyle(object)` | Object styles |
| `exportImage(options)`, `save()`, `toJSON()`, `loadState(json)`, `setSource(src, state?)` | Import / export |
| `getState()`, `subscribe(listener)`, `on(event, listener)` | State and events                                   |
| `getToolOptions(id)`, `setToolOptions(id, options)`       | Tool options                                        |

---

## 🧱 Custom layout

Every part of the default UI is exported. Put them (and your own components) inside `<ImageEditorProvider>`, or pass
them as children of `<ImageEditor>`:

```tsx
import {
	ImageEditorProvider,
	EditorCanvas,
	HistoryControls,
	ToolButton,
	ContextPanel,
	useImageEditor,
	useEditorState,
} from 'fabri-pix';

function MyEditor({ src }) {
	return (
		<ImageEditorProvider src={src} onSave={upload}>
			<div className='my-editor'>
				<aside>
					<ToolButton toolId='text' />
					<ToolButton toolId='draw' />
					<SaveButton />
				</aside>
				<EditorCanvas />
				<HistoryControls />
				<ContextPanel />
			</div>
		</ImageEditorProvider>
	);
}

function SaveButton() {
	const editor = useImageEditor();
	const { ready, history } = useEditorState();
	return (
		<button disabled={!ready || history.index === 0} onClick={() => editor.save()}>
			Save
		</button>
	);
}
```

Exported parts: `EditorRoot`, `EditorCanvas`, `DefaultLayout`, `Header`, `MenuBar`, `Toolbar`, `ToolButton`,
`ToolGroupButton`, `HistoryControls`, `HistoryPanel`, `ZoomControls`, `ContextPanel`, `Actions`, plus the primitives
`Button`, `ColorPicker`, `NumberInput`, `Dropdown`, `Field`, `Segmented`, `Divider`. Hooks: `useImageEditor`,
`useEditorState`, `useToolOptions`, `useEditorUI`.

---

## 🔌 Custom tools

A tool is a plain object. `activate` receives a context whose listeners are removed automatically when the tool is
deactivated:

```tsx
import { Rect } from 'fabric';
import type { ToolDefinition } from 'fabri-pix';

const highlightTool: ToolDefinition<{ color: string }> = {
	id: 'highlight',
	label: 'Highlight',
	icon: <HighlighterIcon />,
	defaultOptions: { color: 'rgba(255, 230, 0, 0.4)' },
	shapeTypes: ['highlight'],
	activate: (context) => {
		context.setCursor('crosshair');
		context.on('mouse:down', (event) => {
			if (context.canvas.findTarget(event.e)) return;
			const { x, y } = context.canvas.getScenePoint(event.e);
			const rect = new Rect({ left: x, top: y, width: 160, height: 24, fill: context.options.color });
			rect.set({ shapeType: 'highlight', id: crypto.randomUUID() });
			context.canvas.add(rect); // recorded in the history automatically
		});
	},
	OptionsPanel: ({ target, options, setOptions, editor }) => (
		<input
			type='color'
			value={options.color}
			onChange={(event) => {
				setOptions({ color: event.target.value });
				if (target) editor.updateObject(target, { fill: event.target.value }, { commit: true });
			}}
		/>
	),
};

<ImageEditor src={url} tools={['text', 'draw', highlightTool]} />;
```

-   `type: 'action'` makes a button that runs once (`run(context)`) instead of a toggle.
-   `OptionsPanel` is shown while the tool is active and when one of its objects (`shapeTypes`) is selected.
-   `ToolbarButton` replaces the toolbar button (the emoji tool uses it for its picker).
-   Override a built-in tool by passing a definition with its id, e.g. `{ ...textTool, label: 'Write' }`.
-   Built-in tool definitions, option panels and helpers (`placeOnClick`, `followCursor`, `usePanel`) are exported.

---

## 🔗 Links

-   **NPM**: [https://www.npmjs.com/package/fabri-pix](https://www.npmjs.com/package/fabri-pix)
-   **GitHub Repo**: [https://github.com/vikhyatsingh123/fabri-pix](https://github.com/vikhyatsingh123/fabri-pix)
-   **Upgrading from 2.x**: [MIGRATION.md](./MIGRATION.md)

---

## 👏 Contributing

Contributions are very welcome! Please open issues, bug reports, or submit pull requests 🙌

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-new-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-new-feature`)
5. Create a new Pull Request

---

## 📄 License

MIT © Vikhyat Singh
