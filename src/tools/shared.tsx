/**
 * @author Vikhyat Singh
 * @description Helpers shared by the built-in tools, also useful for custom tools
 */

import type { FabricObject } from 'fabric';

import type { ToolContext, ToolOptions, ToolPanelProps } from '../core/types';
import { useEditorUI } from '../react/context';

/** cursor images are expensive to create, this re-creates them only when their key changes */
export const createCursorCache = () => {
	let cached: { key: string; cursor: string } | null = null;
	return (key: string, draw: (ctx: CanvasRenderingContext2D, element: HTMLCanvasElement) => string) => {
		if (cached?.key !== key) {
			const element = document.createElement('canvas');
			const ctx = element.getContext('2d');
			if (!ctx) {
				return 'default';
			}
			cached = { key, cursor: draw(ctx, element) };
		}
		return cached.cursor;
	};
};

/** shows `cursor()` over empty canvas areas and a move cursor over objects */
export const followCursor = (context: ToolContext<any>, cursor: () => string) => {
	context.on('mouse:move', (event: any) => {
		context.canvas.setCursor(context.canvas.findTarget(event.e) ? 'move' : cursor());
	});
};

/** calls `place` with the scene point of every click on an empty canvas area */
export const placeOnClick = (context: ToolContext<any>, place: (point: { x: number; y: number }) => void) => {
	context.canvas.discardActiveObject();
	context.canvas.requestRenderAll();
	context.on('mouse:down', (event: any) => {
		if (context.canvas.findTarget(event.e)) {
			return;
		}
		place(context.canvas.getScenePoint(event.e));
	});
};

/**
 * Helpers for option panels: `value` reads from the selected object (or the tool defaults when nothing is selected),
 * `preview` changes the object without a history entry (while dragging a color), `apply` changes the object,
 * records a history entry and remembers the value as default for new objects.
 */
export const usePanel = <O extends ToolOptions>(props: ToolPanelProps<O>) => {
	const { editor, target, options, setOptions } = props;
	const ui = useEditorUI();

	const value = <K extends keyof O & string>(key: K, objectKey: string = key) =>
		target ? (target as any)[objectKey] : options[key];

	const preview = (objectProps: Record<string, any>, object: FabricObject | null = target) => {
		if (object) {
			editor.updateObject(object, objectProps);
		}
	};

	const apply = (optionValues: Partial<O>, objectProps?: Record<string, any>, object: FabricObject | null = target) => {
		if (object && objectProps) {
			editor.updateObject(object, objectProps, { commit: true });
		}
		setOptions(optionValues);
	};

	return { ui, ...ui.components, labels: ui.labels, icons: ui.icons, value, preview, apply };
};
