/**
 * @author Vikhyat Singh
 * @description Image filters applied to the photo (the background image)
 */

import { filters } from 'fabric';

import type { FilterDefinition } from './types';

const SHARPEN_MATRIX = [0, -1, 0, -1, 5, -1, 0, -1, 0];
const EMBOSS_MATRIX = [1, 1, 1, 1, 0.7, -1, -1, -1, -1];

/**
 * Built-in filters, applied in this order. The editor stores only `{ [id]: options }` in the JSON (`fpFilters`), so
 * the definitions can change without breaking saved states.
 */
export const builtInFilters: FilterDefinition[] = [
	{ id: 'grayscale', label: 'Grayscale', create: () => new filters.Grayscale() },
	{ id: 'invert', label: 'Invert', create: () => new filters.Invert() },
	{ id: 'sepia', label: 'Sepia', create: () => new filters.Sepia() },
	{ id: 'vintage', label: 'Vintage', create: () => new filters.Vintage() },
	{
		id: 'brightness',
		label: 'Brightness',
		defaultOptions: { value: 0.1 },
		controls: [{ key: 'value', min: -1, max: 1, step: 0.01 }],
		create: ({ value }) => new filters.Brightness({ brightness: value }),
	},
	{
		id: 'contrast',
		label: 'Contrast',
		defaultOptions: { value: 0.1 },
		controls: [{ key: 'value', min: -1, max: 1, step: 0.01 }],
		create: ({ value }) => new filters.Contrast({ contrast: value }),
	},
	{
		id: 'saturation',
		label: 'Saturation',
		defaultOptions: { value: 0.3 },
		controls: [{ key: 'value', min: -1, max: 1, step: 0.01 }],
		create: ({ value }) => new filters.Saturation({ saturation: value }),
	},
	{
		id: 'blur',
		label: 'Blur',
		defaultOptions: { value: 0.1 },
		controls: [{ key: 'value', min: 0, max: 1, step: 0.01 }],
		create: ({ value }) => new filters.Blur({ blur: value }),
	},
	{
		id: 'sharpen',
		label: 'Sharpen',
		create: () => new filters.Convolute({ matrix: SHARPEN_MATRIX }),
	},
	{
		id: 'emboss',
		label: 'Emboss',
		create: () => new filters.Convolute({ matrix: EMBOSS_MATRIX }),
	},
	{
		id: 'removeWhite',
		label: 'Remove White',
		defaultOptions: { distance: 0.1 },
		controls: [{ key: 'distance', min: 0, max: 1, step: 0.01 }],
		create: ({ distance }) => new filters.RemoveColor({ color: '#ffffff', distance }),
	},
	{
		id: 'noise',
		label: 'Noise',
		defaultOptions: { value: 100 },
		controls: [{ key: 'value', min: 0, max: 1000, step: 10 }],
		create: ({ value }) => new filters.Noise({ noise: value }),
	},
	{
		id: 'pixelate',
		label: 'Pixelate',
		defaultOptions: { value: 4 },
		controls: [{ key: 'value', min: 2, max: 20, step: 1 }],
		create: ({ value }) => new filters.Pixelate({ blocksize: value }),
	},
	{
		id: 'tint',
		label: 'Tint',
		defaultOptions: { color: '#ffbb3b', alpha: 0.4 },
		controls: [{ key: 'color', type: 'color' }, { key: 'alpha', min: 0, max: 1, step: 0.01 }],
		create: ({ color, alpha }) => new filters.BlendColor({ color, mode: 'tint', alpha }),
	},
	{
		id: 'multiply',
		label: 'Multiply',
		defaultOptions: { color: '#515bd4' },
		controls: [{ key: 'color', type: 'color' }],
		create: ({ color }) => new filters.BlendColor({ color, mode: 'multiply' }),
	},
	{
		id: 'blend',
		label: 'Blend',
		defaultOptions: { color: '#00ff00', mode: 'add' },
		controls: [
			{ key: 'color', type: 'color' },
			{
				key: 'mode',
				type: 'select',
				options: ['add', 'diff', 'subtract', 'multiply', 'screen', 'lighten', 'darken', 'overlay', 'exclusion'],
			},
		],
		create: ({ color, mode }) => new filters.BlendColor({ color, mode }),
	},
];
