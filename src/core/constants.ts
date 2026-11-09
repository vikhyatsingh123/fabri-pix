/**
 * @author Vikhyat Singh
 * @description Constants shared by the editor core, the built-in tools and the react components
 */

/**
 * Value of the custom `shapeType` property of every object created by the built-in tools.
 * The values are stored in the exported JSON, so they must never change.
 */
export const ShapeType = {
	EMOJI: 'emoji',
	ARROW: 'arrow',
	RECTANGLE: 'rectangle',
	CIRCLE: 'circle',
	STAR: 'star',
	BLUR: 'blur',
	TEXT: 'text',
	DRAW: 'draw',
	BLUR_INNER_PART: 'blur_inner_part',
	COMMENT_BOX: 'comment_box',
	COMMENT_BOX_TEXTBOX: 'comment_box_textbox',
	CUSTOM_SHAPE: 'custom_shape',
	STEPS_CREATOR: 'steps_creator',
	RECT_STEPS_CREATOR: 'rect_steps_creator',
	TEXT_STEPS_CREATOR: 'text_steps_creator',
	ADVANCED_ARROW: 'advanced_arrow',
	ADVANCED_ARROW_HEAD: 'advanced_arrow_head',
	TEMP_ADVANCED_ARROW_HEAD: 'temp_advanced_arrow_head',
	TEMP_ADVANCED_ARROW: 'temp_advanced_arrow',
	CROP_RECTANGLE: 'crop_rectangle',
	CROP_GREYED_TOP: 'crop_greyed_top',
	CROP_GREYED_LEFT: 'crop_greyed_left',
	CROP_GREYED_RIGHT: 'crop_greyed_right',
	CROP_GREYED_BOTTOM: 'crop_greyed_bottom',
	TEMP_LINE_PATH: 'temp_line_path',
	LINE_PATH: 'line_path',
} as const;

export type BuiltInShapeType = (typeof ShapeType)[keyof typeof ShapeType];

export const cropOverlayShapeTypes: string[] = [
	ShapeType.CROP_GREYED_TOP,
	ShapeType.CROP_GREYED_LEFT,
	ShapeType.CROP_GREYED_RIGHT,
	ShapeType.CROP_GREYED_BOTTOM,
];

/**
 * Images are scaled into this box when loaded. Object coordinates (and therefore the exported JSON) are relative to
 * it, which keeps saved states portable between screens. The visible size is applied on top as a viewport zoom.
 */
export const SCENE_REFERENCE_SIZE = { width: 1000, height: 508 };

/** custom object properties which are serialized together with fabric's own properties */
export const CUSTOM_OBJECT_PROPERTIES = ['id', 'shapeType', 'lastLeft', 'lastTop', 'test'];

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 0.1;

// crypto.randomUUID is only available in secure contexts (https / localhost)
export const generateId = (): string => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	const randomPart = () => Math.random().toString(36).slice(2, 10);
	return `${Date.now().toString(36)}-${randomPart()}-${randomPart()}`;
};
