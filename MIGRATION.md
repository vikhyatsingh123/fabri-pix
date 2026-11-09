# Upgrading from fabri-pix 2.x to 3.0

3.0 replaces `ImageEditorWrapper` with a configurable `ImageEditor`. Most apps only need the changes in the first
section. **JSON saved with 2.x still loads**: pass it as `initialState`.

## 1. Update the component and its props

```diff
- import { ImageEditorWrapper } from 'fabri-pix';
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
+ </div>
```

| 2.x                        | 3.0                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `ImageEditorWrapper`       | `ImageEditor`                                                                         |
| `imageUrl`                 | `src` (also accepts a `Blob` / `File`)                                                |
| `loadFromJson`             | `initialState`                                                                        |
| `onSave(blob, json)`       | `onSave({ blob, json })`                                                              |
| `showExportJson`           | add `'exportJson'` to `actions`                                                       |
| `exportJson(json)`         | `onExportJson(json)`                                                                  |
| `onCancel`                 | still `onCancel`, but it now adds a separate **Cancel** button. In 2.x it replaced what the **Reset** button did. |

## 2. Give the editor a size

The editor used a fixed 1000 × 508 canvas. It now fills its parent and resizes with it, so the parent needs a height
(or pass `width` / `height`). A minimum stage height of 400px applies (CSS variable `--fp-stage-min-height`).

## 3. Requirements

-   React **18 or newer** (was 17)
-   Fabric.js **6** (`fabric@^6.0.0`). Fabric 7 positions objects differently and is not supported yet.

## 4. Custom CSS

If you styled the editor through its old class names, use the new `fp-*` classes or the `classNames` prop:

| 2.x                                   | 3.0                                                   |
| ------------------------------------- | ----------------------------------------------------- |
| `.custom-button`                      | `.fp-button` (`classNames.button`)                    |
| `.custom-button.active`               | `.fp-button--active`                                  |
| `.dropdown`, `.dropdown-content`      | `.fp-dropdown`, `.fp-dropdown-content`                |
| `.history-log`                        | `.fp-history-item`                                    |
| `.color-input`                        | `.fp-color-picker`                                    |
| `.number-input`                       | `.fp-number-input`                                    |
| `.text-input`                         | `.fp-text-input`                                      |
| `.segmented-container`                | `.fp-segmented`                                       |
| `#mainCanvas`, `#img-editor-div`      | `.fp-stage` (ids were removed so that several editors can share a page) |

The default styles now have zero specificity, so your rules win without `!important`. Colors can be changed with the
`theme` prop or the `--fp-*` CSS variables.

## 5. Behaviour changes

-   Saved images are exported at the original image resolution and cropped to the crop area. Use
    `exportOptions={{ multiplier: 1 }}` to get the 2.x size (the image fitted into 1000 × 508).
-   Undo history is limited to 50 steps (`historyLimit`).
-   The Delete / Backspace shortcut only affects the editor the user interacted with last, and can be turned off with
    `keyboardShortcuts={false}`.
