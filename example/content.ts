import type { EditorTheme } from 'fabri-pix';

export interface SampleImage {
	id: string;
	label: string;
	src: string;
	thumbnail: string;
	/** the sample annotations (canvasJson.ts) were made for this image */
	hasAnnotations?: boolean;
}

export const sampleImages: SampleImage[] = [
	{
		id: 'nature',
		label: 'Nature',
		src: 'https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630',
		thumbnail:
			'https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=240&h=126',
		hasAnnotations: true,
	},
	{
		id: 'workspace',
		label: 'Workspace',
		src: 'https://picsum.photos/id/180/1600/1067',
		thumbnail: 'https://picsum.photos/id/180/240/160',
	},
	{
		id: 'river',
		label: 'River',
		src: 'https://picsum.photos/id/1015/1600/1067',
		thumbnail: 'https://picsum.photos/id/1015/240/160',
	},
	{
		id: 'portrait',
		label: 'Portrait',
		src: 'https://picsum.photos/id/1025/1000/1400',
		thumbnail: 'https://picsum.photos/id/1025/160/224',
	},
];

export const accentColors = ['#2563eb', '#7c3aed', '#0d9488', '#ea580c', '#db2777'];

export const editorThemes: Record<'light' | 'dark', EditorTheme> = {
	light: {
		background: '#ffffff',
		surface: '#f8fafc',
		text: '#111216',
		mutedText: 'rgba(17, 18, 22, 0.35)',
		border: '#e2e8f0',
		hover: '#f2f2f4',
		active: '#f2f2f4',
		stageBackground: '#f1f5f9',
		radius: '10px',
	},
	dark: {
		background: '#141b31',
		surface: '#1a2340',
		text: '#f1f5f9',
		mutedText: 'rgba(241, 245, 249, 0.35)',
		border: '#2a3554',
		hover: '#1e2846',
		active: '#1e2846',
		stageBackground: '#0e1428',
		radius: '10px',
	},
};

export type FeatureIcon = 'crop' | 'sliders' | 'eyeOff' | 'pen' | 'history' | 'keyboard' | 'settings' | 'plug';

export type Tone = 'blue' | 'violet' | 'teal' | 'amber' | 'rose' | 'sky';

export const features: { icon: FeatureIcon; title: string; text: string; tone: Tone }[] = [
	{
		icon: 'crop',
		title: 'Crop, rotate & resize',
		text: 'Free or fixed ratios, any angle, flip, and export at any size.',
		tone: 'blue',
	},
	{
		icon: 'sliders',
		title: 'Filters & adjustments',
		text: '18 filters plus brightness, contrast, saturation, hue and gamma.',
		tone: 'violet',
	},
	{
		icon: 'eyeOff',
		title: 'Redact',
		text: 'Blur sensitive areas. They stay blurred in every browser and in the export.',
		tone: 'rose',
	},
	{
		icon: 'pen',
		title: 'Annotate',
		text: 'Shapes, arrows, lines, paths, icons, emoji, text, callouts and numbered steps.',
		tone: 'amber',
	},
	{
		icon: 'history',
		title: 'Undo, history & JSON',
		text: 'Every change can be undone, and the whole editing state saves to JSON.',
		tone: 'teal',
	},
	{
		icon: 'keyboard',
		title: 'Shortcuts & clipboard',
		text: 'Copy, paste, duplicate, layer order and nudging, all rebindable.',
		tone: 'sky',
	},
	{
		icon: 'settings',
		title: 'Configure everything',
		text: 'Tools, defaults, labels, icons, theme, class names and layout.',
		tone: 'violet',
	},
	{
		icon: 'plug',
		title: 'Extend it',
		text: 'Write your own tools and filters, or build a custom UI with hooks.',
		tone: 'blue',
	},
];

export type UseCaseIcon = 'bug' | 'shield' | 'spark';

export const useCases: { icon: UseCaseIcon; title: string; text: string; tools: string[]; tone: Tone }[] = [
	{
		icon: 'bug',
		tone: 'blue',
		title: 'Screenshots & bug reports',
		text: 'Let users point at what is wrong: numbered steps, arrows and callouts on top of a screenshot.',
		tools: ['Steps', 'Arrow', 'Comment', 'Crop'],
	},
	{
		icon: 'shield',
		tone: 'rose',
		title: 'Redact before sharing',
		text: 'Blur names, emails and IDs before an image leaves the browser. The blur is baked into the export.',
		tools: ['Redact', 'Crop', 'Resize'],
	},
	{
		icon: 'spark',
		tone: 'teal',
		title: 'Polish user uploads',
		text: 'Straighten, crop to a fixed ratio and adjust colors before an avatar or product photo is uploaded.',
		tools: ['Crop ratios', 'Rotate', 'Adjust', 'Filter'],
	},
];

export const codeExamples = [
	{
		id: 'quick',
		label: 'Quick start',
		code: `import { ImageEditor } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

export default function App() {
  return (
    <div style={{ height: '80vh' }}>
      <ImageEditor
        src="https://example.com/photo.jpg"
        onSave={({ blob, json }) => upload(blob, json)}
      />
    </div>
  );
}`,
	},
	{
		id: 'customize',
		label: 'Customize',
		code: `<ImageEditor
  src={url}
  tools={['crop', 'transform', 'text', 'draw', 'arrow']}
  defaults={{ text: { fontSize: 32, fill: '#ffffff' } }}
  labels={{ save: 'Done', tools: { draw: 'Pen' } }}
  icons={{ save: <CheckIcon /> }}
  theme={{ primary: '#6d5dfc', radius: '8px' }}
  classNames={{ toolbar: 'my-toolbar' }}
  components={{ Button: MyButton }}
  layout={{ menu: 'top', toolbar: 'top' }}
  keyboardShortcuts={{ duplicate: ['mod+j'] }}
/>`,
	},
	{
		id: 'tool',
		label: 'Custom tool',
		code: `const highlightTool: ToolDefinition = {
  id: 'highlight',
  label: 'Highlight',
  activate: (context) => {
    context.on('mouse:down', (event) => {
      const { x, y } = context.canvas.getScenePoint(event.e);
      const rect = new Rect({
        left: x, top: y, width: 160, height: 24,
        fill: 'rgba(255, 230, 0, 0.4)',
      });
      context.canvas.add(rect); // undoable automatically
    });
  },
};

<ImageEditor src={url} tools={['text', highlightTool]} />`,
	},
	{
		id: 'control',
		label: 'Control from code',
		code: `const editor = useRef<ImageEditorController>(null);

<ImageEditor ref={editor} src={url} />

editor.current.rotateImage(90);
editor.current.setImageFilter('sepia', {});
editor.current.addShape('rectangle', { left: 40, top: 40 });
editor.current.undo();
const blob = await editor.current.exportImage({ format: 'jpeg' });
editor.current.on('change', ({ json }) => autosave(json));`,
	},
];
