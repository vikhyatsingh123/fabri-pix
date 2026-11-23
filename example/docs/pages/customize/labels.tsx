import { useState } from 'react';
import { defaultLabels, type EditorLabels, type ImageEditorProps } from 'fabri-pix';

import {
	Callout,
	CodeBlock,
	Demo,
	DemoButton,
	DemoControls,
	DemoEditor,
	DocLink,
	H2,
	H3,
	PageHeader,
	Table,
} from '../../ui';

// where each text appears, keyed like EditorLabels
const labelUsage: Record<keyof EditorLabels, string> = {
	undo: 'Undo button (tooltip)',
	redo: 'Redo button (tooltip)',
	history: 'History button (tooltip)',
	zoomIn: 'Zoom in button (tooltip)',
	zoomOut: 'Zoom out button (tooltip)',
	fit: 'Button that resets the zoom',
	pan: 'Pan button (tooltip)',
	reset: "'reset' action button",
	cancel: "'cancel' action button, crop panel cancel",
	save: "'save' action button",
	exportJson: "'exportJson' action button",
	delete: 'Delete button of selected objects',
	more: 'Appended to the label of dropdown toggles for screen readers',
	fill: 'Fill color field',
	stroke: 'Stroke color field',
	text: 'Text fields of the option panels',
	size: 'Size inputs (font size, stroke width…)',
	bold: 'Bold button',
	italic: 'Italic button',
	alignLeft: 'Align left button',
	alignCenter: 'Align center button',
	alignRight: 'Align right button',
	stepNumber: 'Step number field',
	initialState: 'First entry of the history panel',
	created: "History entry, e.g. 'Rectangle Created'",
	modified: "History entry, e.g. 'Text Modified'",
	deleted: "History entry, e.g. 'Arrow Deleted'",
	cropApplied: 'History entry',
	cropRemoved: 'History entry',
	imageEdited: 'History entry for rotation, flip, filters and resize',
	loading: 'Shown while the image (or emoji picker) loads',
	underline: 'Underline button',
	strikethrough: 'Strikethrough button',
	font: 'Font select',
	color: 'Color fields (icon, arrow shape…)',
	rotateLeft: 'Rotate panel',
	rotateRight: 'Rotate panel',
	rotation: 'Angle slider of the rotate panel',
	flipHorizontal: 'Rotate panel',
	flipVertical: 'Rotate panel',
	resetImage: 'Rotate panel: back to 0° and no flip',
	ratio: 'Ratio field of the crop panel',
	ratioCustom: 'Crop panel: the built-in "Custom" (free) ratio button',
	ratioSquare: 'Crop panel: the built-in "Square" ratio button',
	apply: 'Crop panel apply button',
	load: "'load' action button",
	deleteAll: "'deleteAll' action button",
	clearFilters: 'Filter panel: removes all filters',
	duplicate: 'Duplicate button of selected objects',
	bringForward: 'Layer buttons',
	sendBackward: 'Layer buttons',
	bringToFront: 'Layer buttons',
	sendToBack: 'Layer buttons',
	opacity: 'Opacity slider of selected objects',
	shadow: 'Shadow button of selected objects',
	dashed: 'Dashed button of selected objects',
	cornerRadius: 'Corner radius of rectangles',
	width: 'Resize panel',
	height: 'Resize panel',
	keepAspect: 'Resize panel lock button',
	originalSize: 'Resize panel',
	resetAdjustments: 'Adjust panel',
};

const german: ImageEditorProps['labels'] = {
	undo: 'Rückgängig',
	redo: 'Wiederholen',
	history: 'Verlauf',
	zoomIn: 'Vergrößern',
	zoomOut: 'Verkleinern',
	fit: 'Einpassen',
	pan: 'Verschieben',
	reset: 'Zurücksetzen',
	cancel: 'Abbrechen',
	save: 'Speichern',
	exportJson: 'JSON exportieren',
	delete: 'Löschen',
	more: 'Optionen',
	fill: 'Füllung',
	stroke: 'Rahmen',
	text: 'Text',
	size: 'Größe',
	bold: 'Fett',
	italic: 'Kursiv',
	alignLeft: 'Linksbündig',
	alignCenter: 'Zentriert',
	alignRight: 'Rechtsbündig',
	stepNumber: 'Schritt',
	initialState: 'Ausgangszustand',
	created: 'erstellt',
	modified: 'geändert',
	deleted: 'gelöscht',
	cropApplied: 'Zugeschnitten',
	cropRemoved: 'Zuschnitt entfernt',
	imageEdited: 'Bild bearbeitet',
	loading: 'Wird geladen…',
	underline: 'Unterstrichen',
	strikethrough: 'Durchgestrichen',
	font: 'Schriftart',
	color: 'Farbe',
	rotateLeft: 'Nach links drehen',
	rotateRight: 'Nach rechts drehen',
	rotation: 'Winkel',
	flipHorizontal: 'Horizontal spiegeln',
	flipVertical: 'Vertikal spiegeln',
	resetImage: 'Drehung zurücksetzen',
	ratio: 'Format',
	ratioCustom: 'Frei',
	ratioSquare: 'Quadrat',
	apply: 'Anwenden',
	load: 'Öffnen',
	deleteAll: 'Alle löschen',
	clearFilters: 'Entfernen',
	duplicate: 'Duplizieren',
	bringForward: 'Nach vorne',
	sendBackward: 'Nach hinten',
	bringToFront: 'Ganz nach vorne',
	sendToBack: 'Ganz nach hinten',
	opacity: 'Deckkraft',
	shadow: 'Schatten',
	dashed: 'Gestrichelt',
	cornerRadius: 'Ecken',
	width: 'Breite',
	height: 'Höhe',
	keepAspect: 'Seitenverhältnis beibehalten',
	originalSize: 'Original',
	resetAdjustments: 'Korrekturen zurücksetzen',
	tools: {
		steps: 'Schritte',
		rectangle: 'Rechteck',
		circle: 'Kreis',
		triangle: 'Dreieck',
		arrowShape: 'Pfeil',
		star: 'Stern',
		comment: 'Kommentar',
		image: 'Bild einfügen',
		icon: 'Symbol',
		emoji: 'Emoji',
		text: 'Text',
		draw: 'Zeichnen',
		line: 'Linie',
		arrow: 'Pfeil',
		path: 'Pfad',
		shapes: 'Formen',
	},
	menus: {
		annotate: 'Markieren',
		crop: 'Zuschneiden',
		transform: 'Drehen',
		resize: 'Größe',
		adjust: 'Korrigieren',
		filter: 'Filter',
		redact: 'Schwärzen',
	},
	filters: {
		brightness: 'Helligkeit',
		contrast: 'Kontrast',
		saturation: 'Sättigung',
		vibrance: 'Dynamik',
		hue: 'Farbton',
		gamma: 'Gamma',
		grayscale: 'Graustufen',
		blackWhite: 'Schwarz-Weiß',
		invert: 'Invertieren',
		sepia: 'Sepia',
		vintage: 'Vintage',
		blur: 'Weichzeichnen',
		sharpen: 'Schärfen',
		noise: 'Rauschen',
		pixelate: 'Verpixeln',
		tint: 'Tönen',
	},
};

const germanCode = `const labelsDe = {
	undo: 'Rückgängig',
	redo: 'Wiederholen',
	reset: 'Zurücksetzen',
	save: 'Speichern',
	delete: 'Löschen',
	// … every other key you want to translate
	tools: { rectangle: 'Rechteck', text: 'Text', draw: 'Zeichnen', shapes: 'Formen' },
	menus: { annotate: 'Markieren', crop: 'Zuschneiden', transform: 'Drehen', redact: 'Schwärzen' },
	filters: { brightness: 'Helligkeit', grayscale: 'Graustufen', sepia: 'Sepia' },
};

<ImageEditor src={imageUrl} labels={language === 'de' ? labelsDe : undefined} />`;

function TranslationDemo() {
	const [language, setLanguage] = useState<'en' | 'de'>('de');
	return (
		<Demo
			title='Switch the language'
			description='Labels can change at any time, the editor keeps its content. Hover the header buttons and open the menus to see the translated texts.'
			code={germanCode}
		>
			<DemoControls>
				<DemoButton active={language === 'en'} onClick={() => setLanguage('en')}>
					English
				</DemoButton>
				<DemoButton active={language === 'de'} onClick={() => setLanguage('de')}>
					Deutsch
				</DemoButton>
			</DemoControls>
			<DemoEditor
				labels={language === 'de' ? german : undefined}
				actions={['load', 'deleteAll', 'reset', 'save']}
			/>
		</Demo>
	);
}

function LabelsPage() {
	return (
		<>
			<PageHeader
				eyebrow='Customization'
				title='Labels & translations'
				lead='Every text of the editor UI can be changed through the labels prop: to translate the editor, or simply to use your own wording.'
			/>

			<H2 id='labels-prop'>The labels prop</H2>
			<p>
				Pass only the keys you want to change. Missing keys fall back to the English defaults, which are
				exported as <code>defaultLabels</code>.
			</p>
			<CodeBlock
				code={`<ImageEditor
	src={imageUrl}
	labels={{
		save: 'Done',
		reset: 'Start over',
		tools: { draw: 'Pen', redact: 'Hide' },
		menus: { annotate: 'Mark up' },
		filters: { blackWhite: 'Noir' },
	}}
/>`}
			/>
			<p>Besides the UI texts, three nested objects rename things by their id:</p>
			<Table
				head={['Key', 'Renames', 'Example']}
				rows={[
					[
						<code key='k'>labels.tools</code>,
						'Tool buttons, by tool id',
						<code key='e'>{`{ draw: 'Pen' }`}</code>,
					],
					[
						<code key='k'>labels.menus</code>,
						'Menu tabs and tool groups (like Shapes), by id. Falls back to labels.tools for the same id.',
						<code key='e'>{`{ annotate: 'Mark up', shapes: 'Forms' }`}</code>,
					],
					[
						<code key='k'>labels.filters</code>,
						'Filters and adjustments, by filter id',
						<code key='e'>{`{ brightness: 'Light' }`}</code>,
					],
				]}
			/>

			<TranslationDemo />

			<H2 id='i18n'>Using an i18n library</H2>
			<p>
				Build the object from your translation function. Memoize it so the editor only updates when the language
				changes.
			</p>
			<CodeBlock
				code={`import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageEditor, type ImageEditorProps } from 'fabri-pix';

function Editor({ src }: { src: string }) {
	const { t, i18n } = useTranslation();
	const labels = useMemo<ImageEditorProps['labels']>(
		() => ({
			save: t('editor.save'),
			undo: t('editor.undo'),
			tools: { text: t('editor.tools.text') },
		}),
		[t, i18n.language],
	);
	return <ImageEditor src={src} labels={labels} />;
}`}
			/>
			<Callout type='tip'>
				<p>
					History entries are built from a shape name plus a label, e.g. <em>Rectangle</em> +{' '}
					<code>created</code>. The shape names come from the <code>label</code> of the shape definitions (see{' '}
					<DocLink to='custom-shapes'>Custom shapes</DocLink>). Texts inside the emoji picker come from the
					picker itself and are not translated.
				</p>
			</Callout>

			<H2 id='all-labels'>All label keys</H2>
			<p>
				The type is <code>EditorLabels</code>. The <code>labels</code> prop accepts{' '}
				<code>Partial&lt;EditorLabels&gt;</code> plus <code>tools</code>, <code>menus</code> and{' '}
				<code>filters</code>.
			</p>
			<H3 id='label-table'>Keys, defaults and where they appear</H3>
			<Table
				head={['Key', 'Default', 'Used for']}
				rows={(Object.keys(defaultLabels) as (keyof EditorLabels)[]).map((key) => [
					<code key='k'>{key}</code>,
					defaultLabels[key],
					labelUsage[key] ?? '',
				])}
			/>
		</>
	);
}

export default LabelsPage;
