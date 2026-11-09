# fabri-pix 3.0.0

A new, fully configurable editor, plus a large stability and size release. Undo/redo, crop, redaction and saving all
work more reliably, the package is smaller, and your users download less when the editor loads.

**This release changes the component API.** See [MIGRATION.md](./MIGRATION.md). It is a short list of renamed props.
JSON saved with 2.x still loads.

## Highlights

-   🎛️ **Configure everything.** Choose the tools and menus, set their defaults, translate the texts, swap icons, theme
    with CSS variables, add class names or styles to any part, move or hide parts of the layout, and plug in your own
    `Button` / `ColorPicker` / `NumberInput` components.
-   🧱 **Build your own UI.** Every part of the editor is exported (`EditorCanvas`, `Toolbar`, `HistoryControls`,
    `ContextPanel`...) together with hooks (`useImageEditor`, `useEditorState`, `useToolOptions`).
-   🔌 **Custom tools.** A tool is a plain object; add your own or replace the built-in ones.
-   🧭 **Control it from code.** `ref` gives you the editor: `undo()`, `setActiveTool()`, `addShape()`, `exportImage()`,
    `toJSON()`, events, and the Fabric.js canvas itself.
-   📐 **Fills its container** and resizes with it, instead of a fixed 1000 × 508 canvas.
-   🔒 **Redaction now works in Safari.** The blurred area used to be saved unblurred in Safari.
-   ↩️ **Undo/redo is reliable.** Crops, style changes and text edits are recorded, and undo no longer wipes redo.
-   💾 **Saved images are cropped and at full resolution**, no matter how far you are zoomed in.
-   📦 **Smaller install and app bundle.** The emoji picker (~62 KB gzipped) is only downloaded when it is opened.

## Before you upgrade

1. **Renamed component and props.** `ImageEditorWrapper` → `ImageEditor`, `imageUrl` → `src`, `loadFromJson` →
   `initialState`, `onSave(blob, json)` → `onSave({ blob, json })`, `showExportJson` / `exportJson` → `actions` /
   `onExportJson`. `onCancel` now adds a Cancel button instead of changing the Reset button. Details in
   [MIGRATION.md](./MIGRATION.md).
2. **The editor fills its parent.** Give the parent a height (or pass `width` / `height`).
3. **React 18+ and fabric 6 are required.** The peer dependencies are now `react@>=18` and `fabric@^6.0.0`. fabric 7
   changed how objects are positioned and is not supported yet. If you have fabric 7 installed, run
   `npm install fabric@6`.
4. **New CSS class names.** Styles now use `fp-*` classes (`.custom-button` is now `.fp-button`, and so on), and the
   default rules have zero specificity, so your own CSS wins without `!important`.
5. **Saved images have different dimensions.** `onSave` (and the default download) returns the image at its **original
   resolution**, cropped to the crop area, regardless of zoom. Very large images are capped at about 16 megapixels so
   browsers can still export them. `exportOptions={{ multiplier: 1 }}` gives the 2.x size.
6. **Undo history is limited to 50 steps** by default (`historyLimit`).
7. **Shapes no longer snap to predefined regions.** Leftover test data made Rectangle, Circle and Arrow snap to fixed
   boxes on every image. They now place a default-size shape where you click.
8. **Reset** also removes an applied crop, and can be undone in a single step.
9. **Steps** continue from the highest step on the image instead of restarting at 1.
10. **Uploaded images** ("Add Image") are scaled to fit within half of the image instead of being added at full size.
11. **Editor buttons no longer submit or reset a surrounding `<form>`.**

## Bug fixes

### Redaction, crop and saving

-   Redaction did not blur in Safari, so the "redacted" text was readable in the saved image. It now pixelates the area
    when the browser can't blur it.
-   Saving while zoomed in exported only the zoomed-in part of the image.
-   Saving a cropped image kept the full canvas size, with transparent space around the crop.
-   Clicking (without dragging) in crop mode left the whole image greyed out.
-   A crop was lost after any undo or redo.
-   The shape preview used while picking a shape could stay on the canvas and appear in the saved image.

### Undo, redo and history

-   Undo with an uploaded image on the canvas added a new history step and cleared the redo history.
-   Applying or removing a crop was not recorded in history.
-   Changes made from the context menu (colours, sizes, bold, italic, alignment, text) were not recorded.
-   Editing the text of a comment box or a step number was not recorded.
-   Each pencil stroke could be recorded twice after toggling Draw off and on.
-   Reset created one history step per object.
-   Undo/redo left a random object selected, and fast repeated clicks could restore the wrong state.
-   The history list now shows "Crop Applied" / "Crop Removed" and labels drawings correctly.

### Editing

-   Backspace while editing text deleted two characters.
-   The Delete key did nothing when several objects were selected.
-   Backspace in an input of your own app could delete the selected annotation.
-   Typing in the comment box's text field reset the field after every key.
-   The comment box's bold / italic buttons did not show their current state.
-   Text, emoji, arrows, paths, steps, crop and redaction were placed in the wrong spot when zoomed in.
-   After panning, objects could not be clicked where they appeared.
-   Redact drew the selection box on top of the area being drawn.
-   Finishing a path with a double click added duplicate points, and a single click created an invisible path.
-   Selecting the same image file twice in "Add Custom" did nothing the second time.
-   The step fill colour picker showed the wrong colour.
-   Colour pickers showed black for colours such as `#fff`, `rgb(...)` or `transparent`.
-   The pencil cursor was drawn incorrectly.

### Stability and memory

-   Every comment box created a hidden extra canvas that was never freed.
-   Event listeners piled up when tools were switched on and off.
-   Unmounting the editor (or React StrictMode) while the image was still loading could set up the canvas twice.
-   The editor crashed on plain `http://` pages (other than localhost) because `crypto.randomUUID` is unavailable there.
-   Each history step stored another copy of the background image, which used a lot of memory with large images.
-   The stylesheet changed the cursor of every disabled button in your app, not just the editor's.
-   Fixed React warnings about missing `key` props and uncontrolled inputs.

## Performance

-   The emoji picker is loaded on demand. Bundlers put it in a separate chunk, which removes ~62 KB (gzipped) from the
    initial download.
-   Custom cursors are no longer re-created on every mouse move.
-   The history list is only computed while it is open.

## Package

-   React's JSX runtime is no longer bundled into the package. A bundled React 19 runtime broke apps on React 18.
-   `emoji-picker-react` is no longer copied into the package. It is a regular dependency instead.
-   The CommonJS build is now `dist/index.cjs`, so `require('fabri-pix')` works (Jest, Node).
-   Types are a single `dist/index.d.ts`.
-   Added `"sideEffects": ["*.css"]` so bundlers can tree-shake safely.
-   The JavaScript bundle went from 586 KB to 138 KB (31 KB gzipped). The package now contains 7 files instead of 73.
-   Types are documented: hovering a prop or method in your editor shows what it does.

The CSS import is unchanged: `import 'fabri-pix/dist/fabri-pix.css';`

## For contributors

-   `yarn lint` works again (ESLint 9 flat config in `eslint.config.js`).
-   `yarn build` type-checks without writing extra files (the generated `vite.config.js` is gone).
