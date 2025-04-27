# FabriPix 🎨

[![npm version](https://img.shields.io/npm/v/fabri-pix.svg?style=flat)](https://www.npmjs.com/package/fabri-pix)
[![npm downloads](https://img.shields.io/npm/dw/fabri-pix.svg?style=flat)](https://www.npmjs.com/package/fabri-pix)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


**FabriPix** is a plug-and-play, lightweight, and customizable **React image editor** built using [Fabric.js](http://fabricjs.com/).  
It allows you to **annotate**, **draw**, **add text**, **create callouts**, **insert shapes**, and **apply simple edits** — all inside your React apps easily!

---

## ✨ Features

- ✏️ **Pencil Drawing**
- 🖋 **Text Annotations**
- 📦 **Callouts** with numbers and text
- 📐 **Shapes** like rectangles, circles, arrows, stars
- 🎨 **Color pickers** for shapes and text
- 🔥 **Undo/Redo** capabilities
- 💾 **Export edited image** as PNG
- 📄 **JSON save/load** for annotations
- 📏 **Zoom, Pan and Resize canvas**
- ⚡️ **Fast and responsive** — powered by Fabric.js 6+

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

| Prop         | Type                | Description                                                               | Required |
|--------------|---------------------|---------------------------------------------------------------------------|:--------:|
| `imageUrl`   | `string`             | URL of the image you want to load onto the editor                         | ✅ |
| `onSave`     | `(blob, json) => void`| Callback when the user saves (returns image Blob and canvas JSON)         | ✅ |
| `options`    | `Partial<Options>`   | (optional) Editor customization options (coming soon)                    | ❌ |

---

## 🚀 Planned for Next Releases

- ✂️ **Crop** and **Resize** tools
- 🧠 **AI Auto-Annotation** (detecting objects in the image)
- 🌐 **Localization (i18n)** support
- ⚡️ **Better performance** for huge images

---

## 🔗 Links

- **NPM**: [https://www.npmjs.com/package/fabri-pix](https://www.npmjs.com/package/fabri-pix)
- **GitHub Repo**: [https://github.com/vikhyatsingh123/fabri-pix](https://github.com/vikhyatsingh123/fabri-pix)

---

## 👏 Contributing

Contributions are very welcome!  
Please open issues, bug reports, or submit pull requests 🙌

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-new-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-new-feature`)
5. Create a new Pull Request

---

## 📄 License

MIT © [Vikhyat Singh]

