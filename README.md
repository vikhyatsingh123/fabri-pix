# FabriPix 🎨

[![npm version](https://img.shields.io/npm/v/fabri-pix.svg?style=flat)](https://www.npmjs.com/package/fabri-pix)
[![npm downloads](https://img.shields.io/npm/dw/fabri-pix.svg?style=flat)](https://www.npmjs.com/package/fabri-pix)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**FabriPix** is a plug-and-play, lightweight, and fully customizable **React image editor** built using
[Fabric.js](http://fabricjs.com/). It allows you to **annotate**, **draw**, **add text**, **insert shapes**, **blur**,
**crop** and **apply simple edits** — all inside your React apps easily!

---

## ✨ Features

### 🖼️ Image Editing

-   ✂️ **Crop Images** — easily crop any part of the image.
-   🔒 **Blur Multiple Parts** — hide or censor sensitive information.
-   🔍 **Zoom In and Zoom Out** — zoom for precise edits.
-   ✋ **Pan Mode** — move around the canvas smoothly.
-   ↩️ **Undo and Redo** — quickly revert or redo any action.
-   🕒 **Edit History Tracking** — view and manage all your edits step-by-step.
-   💾 **Download edited image** as PNG with high quality
-   📄 **JSON save/load** for annotations
-   ⚡️ **Fast and responsive** — powered by Fabric.js 6+

### 🖍️ Annotations

-   🔢 **Step Creator** — add sequential numbered steps to guide users.
-   🟥 **Step Creator with Rectangle Box** — highlight steps inside rectangular shapes.
-   🧩 **Shapes** — draw Rectangles, Circles, Stars, and Arrows effortlessly.
-   🎯 **Advanced Arrow Tool** — create flexible at both end arrows.
-   🗨️ **Callout Boxes** — create callouts with text and numbers pointing anywhere.
-   📝 **Textbox** — add simple or styled text anywhere on the image.
-   😄 **Emoji Support** — insert fun emojis to express better.
-   🖼️ **Add Custom Images** — upload and place your own icons, stamps, or logos.
-   ✏️ **Pencil Draw Tool** — free-hand drawing for rough annotations.
-   ➰ **Line Paths** — connect points smoothly using lines.
-   🎨 **Color pickers** and **Other Context Menu** for all the annotations

---

## 📦 Installation

```bash
yarn add fabri-pix
# or
npm install fabri-pix
```

---

## ⚙️ Usage

```bash
import { ImageEditorWrapper } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css'; // Required: Import the CSS for styles

export default function App() {
  return (
      <ImageEditorWrapper
        imageUrl="https://your-image-url.com/sample.png"
      />
  );
}
```

---

## 🛠️ Props

| Prop             | Type                   | Description                                                               | Required |
| ---------------- | ---------------------- | ------------------------------------------------------------------------- | :------: |
| `imageUrl`       | `string`               | URL of the image you want to load onto the editor                         |    ✅    |
| `onSave`         | `(blob, json) => void` | Callback when the user saves (returns image Blob and canvas JSON)         |    ✅    |
| `onCancel`       | `() => void`           | Callback when the user clicks on cancel button                            |    ✅    |
| `loadFromJson`   | `any`                  | JSON to pre load annotations                                              |    ✅    |
| `exportJson`     | `(json) => void`       | Callback when the user clicks on export json button (returns canvas JSON) |    ✅    |
| `showExportJson` | `boolean`              | Whether to show the export json button                                    |    ✅    |
| `options`        | `Partial<Options>`     | (optional) Editor fully customization options (coming soon)               |    ❌    |

---

## 🚀 Upcoming Features

-   ✂️ **Filter** and **Resize** tools
-   🔄 **Rotate** and **Flip** tools
-   🧠 **AI Auto-Annotation** (detecting objects in the image)
-   ⚡️ **Better performance** for huge images

---

## 🔗 Links

-   **NPM**: [https://www.npmjs.com/package/fabri-pix](https://www.npmjs.com/package/fabri-pix)
-   **GitHub Repo**: [https://github.com/vikhyatsingh123/fabri-pix](https://github.com/vikhyatsingh123/fabri-pix)

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
