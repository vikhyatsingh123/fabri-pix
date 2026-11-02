/**
 * @author Vikhyat Singh
 * @description Utils for the image editor
 */

export enum Menu {
	CROP = 'crop',
	ANNOTATE = 'annotate',
	BLUR = 'blur',
	RESIZE = 'resize',
}

export enum SubMenu {
	EMOJI = 'emoji',
	ARROW = 'arrow',
	LINE = 'line',
	PENCIL = 'pencil',
	RECTANGLE = 'rectangle',
	CIRCLE = 'circle',
	TRIANGLE = 'triangle',
	STAR = 'star',
	BLUR = 'blur',
	TEXT = 'text',
	DRAW = 'draw',
	AI_RECTANGLE = 'ai_rectangle',
	AI_CIRCLE = 'ai_circle',
	AI_ARROW = 'ai_arrow',
	BLUR_INNER_PART = 'blur_inner_part',
	COMMENT_BOX = 'comment_box',
	COMMENT_BOX_TEXTBOX = 'comment_box_textbox',
	CUSTOM_SHAPE = 'custom_shape',
	STEPS_CREATOR = 'steps_creator',
	RECT_STEPS_CREATOR = 'rect_steps_creator',
	TEXT_STEPS_CREATOR = 'text_steps_creator',
	ADVANCED_ARROW = 'advanced_arrow',
	ADVANCED_ARROW_HEAD = 'advanced_arrow_head',
	TEMP_ADVANCED_ARROW_HEAD = 'temp_advanced_arrow_head',
	TEMP_ADVANCED_ARROW = 'temp_advanced_arrow',
	CROP_RECTANGLE = 'crop_rectangle',
	CROP_GREYED_TOP = 'crop_greyed_top',
	CROP_GREYED_LEFT = 'crop_greyed_left',
	CROP_GREYED_RIGHT = 'crop_greyed_right',
	CROP_GREYED_BOTTOM = 'crop_greyed_bottom',
	CROP_CLIP_PATH_DELETED = 'crop_clip_path_deleted',
	TEMP_LINE_PATH = 'temp_line_path',
	LINE_PATH = 'line_path',
	FREE_HAND_ENABLED = 'free_hand_enabled',
	FREE_HAND_DISABLED = 'free_hand_disabled',
}

export const historyLogs = {
	emoji: 'Emoji',
	arrow: 'Arrow',
	line: 'Line',
	pencil: 'Pencil',
	rectangle: 'Rectangle',
	circle: 'Circle',
	triangle: 'Triangle',
	star: 'Star',
	blur: 'Blur',
	text: 'Text',
	draw: 'Draw',
	comment_box: 'Comment Box',
	custom_shape: 'Custom Shape',
	steps_creator: 'Steps Creator',
	advanced_arrow: 'Advanced Arrow',
	crop_rectangle: 'Crop Rectangle',
	line_path: 'Line Path',
};

export const multiSelectAnnotation: Partial<SubMenu | ''>[] = [
	SubMenu.ADVANCED_ARROW,
	SubMenu.LINE_PATH,
	SubMenu.STEPS_CREATOR,
];

export const overlaysConstants = [
	SubMenu.CROP_GREYED_TOP,
	SubMenu.CROP_GREYED_LEFT,
	SubMenu.CROP_GREYED_RIGHT,
	SubMenu.CROP_GREYED_BOTTOM,
];

// helper objects that are created/removed alongside a "real" annotation and must not create history entries
export const nonHistoryShapeTypes: string[] = [
	SubMenu.BLUR_INNER_PART,
	SubMenu.ADVANCED_ARROW_HEAD,
	SubMenu.RECT_STEPS_CREATOR,
	SubMenu.TEXT_STEPS_CREATOR,
	SubMenu.AI_RECTANGLE,
	SubMenu.AI_CIRCLE,
	SubMenu.AI_ARROW,
	SubMenu.CROP_RECTANGLE,
	SubMenu.CROP_GREYED_TOP,
	SubMenu.CROP_GREYED_LEFT,
	SubMenu.CROP_GREYED_RIGHT,
	SubMenu.CROP_GREYED_BOTTOM,
	SubMenu.COMMENT_BOX_TEXTBOX,
	SubMenu.TEMP_LINE_PATH,
	SubMenu.TEMP_ADVANCED_ARROW_HEAD,
	SubMenu.TEMP_ADVANCED_ARROW,
];

// editing UI objects which should never end up in the exported image
export const transientShapeTypes: string[] = [
	SubMenu.AI_RECTANGLE,
	SubMenu.AI_CIRCLE,
	SubMenu.AI_ARROW,
	SubMenu.CROP_RECTANGLE,
	SubMenu.RECT_STEPS_CREATOR,
	SubMenu.TEMP_LINE_PATH,
	SubMenu.TEMP_ADVANCED_ARROW,
	SubMenu.TEMP_ADVANCED_ARROW_HEAD,
	...overlaysConstants,
];

// crypto.randomUUID is only available in secure contexts (https / localhost)
export const generateId = (): string => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	const randomPart = () => Math.random().toString(36).slice(2, 10);
	return `${Date.now().toString(36)}-${randomPart()}-${randomPart()}`;
};
