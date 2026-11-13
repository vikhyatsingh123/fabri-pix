/**
 * @author Vikhyat Singh
 * @description React contexts and hooks to access the editor from any component inside the provider
 */

import { createContext, CSSProperties, ReactNode, useCallback, useContext, useSyncExternalStore } from 'react';

import type { ImageEditorController } from '../core/controller';
import type { EditorState, MenuDefinition, ToolDefinition, ToolOptions } from '../core/types';
import type {
	EditorAction,
	EditorComponents,
	EditorIcons,
	EditorLabels,
	EditorLayout,
	EditorSlot,
	EditorTheme,
	EditorUIOptions,
} from './types';

export interface EditorUIContextValue {
	labels: EditorLabels;
	icons: EditorIcons;
	components: EditorComponents;
	layout: Required<EditorLayout>;
	actions: EditorAction[];
	theme?: EditorTheme;
	unstyled: boolean;
	onCancel?: () => void;
	onExportJson?: EditorUIOptions['onExportJson'];
	/** class name (default `fp-*` class + the one from `classNames`) and style of an editor part */
	slot: (name: EditorSlot, ...extraClassNames: (string | false | undefined | null)[]) => {
		className: string;
		style?: CSSProperties;
	};
	toolLabel: (tool: ToolDefinition<any>) => string;
	toolIcon: (tool: ToolDefinition<any>) => ReactNode;
	menuLabel: (menu: { id: string; label: string }) => string;
	menuIcon: (menu: MenuDefinition | { id: string; icon?: ReactNode }) => ReactNode;
	filterLabel: (filter: { id: string; label: string }) => string;
}

export const EditorContext = createContext<ImageEditorController | null>(null);
export const EditorUIContext = createContext<EditorUIContextValue | null>(null);

/** the editor controller, use it to call `undo()`, `setActiveTool()`, `exportImage()`... */
export const useImageEditor = (): ImageEditorController => {
	const editor = useContext(EditorContext);
	if (!editor) {
		throw new Error('fabri-pix: useImageEditor must be used inside <ImageEditorProvider> or <ImageEditor>');
	}
	return editor;
};

/** re-renders the component whenever the editor state changes */
export const useEditorState = (): EditorState => {
	const editor = useImageEditor();
	return useSyncExternalStore(editor.subscribe, editor.getState, editor.getState);
};

export const useEditorUI = (): EditorUIContextValue => {
	const ui = useContext(EditorUIContext);
	if (!ui) {
		throw new Error('fabri-pix: useEditorUI must be used inside <ImageEditorProvider> or <ImageEditor>');
	}
	return ui;
};

/** current options of a tool and a function to change them */
export const useToolOptions = <O extends ToolOptions = ToolOptions>(
	toolId: string,
): [O, (options: Partial<O>) => void] => {
	const editor = useImageEditor();
	const state = useEditorState();
	const setOptions = useCallback(
		(options: Partial<O>) => editor.setToolOptions<O>(toolId, options),
		[editor, toolId],
	);
	return [(state.toolOptions[toolId] ?? {}) as O, setOptions];
};
