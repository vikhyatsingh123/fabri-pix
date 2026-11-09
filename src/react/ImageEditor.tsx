/**
 * @author Vikhyat Singh
 * @description <ImageEditorProvider> creates the editor for a custom layout, <ImageEditor> is the ready to use editor
 */

import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { ImageEditorController } from '../core/controller';
import type { ImageEditorOptions } from '../core/types';
import { builtInTools, defaultMenus } from '../tools';
import {
	Actions,
	ContextPanel,
	DefaultLayout,
	EditorRoot,
	Header,
	MenuBar,
	Toolbar,
} from './components';
import { EditorContext, EditorUIContext, EditorUIContextValue } from './context';
import { defaultIcons, defaultLabels } from './defaults';
import { cx, defaultUIComponents } from './ui';
import type { EditorAction, EditorComponents, EditorSlot, ImageEditorProps, ImageEditorProviderProps } from './types';

const toKebabCase = (value: string) => value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

export const ImageEditorProvider = forwardRef<ImageEditorController, ImageEditorProviderProps>((props, ref) => {
	const {
		children,
		classNames,
		styles,
		icons,
		labels,
		components,
		theme,
		unstyled = false,
		layout,
		actions,
		onCancel,
		onExportJson,
		...options
	} = props;
	const editorOptions: ImageEditorOptions = options;

	const [editor] = useState(
		() => new ImageEditorController(editorOptions, { tools: builtInTools, menus: defaultMenus }),
	);
	useImperativeHandle(ref, () => editor, [editor]);

	// keeps callbacks and configuration up to date without re-creating the editor
	useLayoutEffect(() => {
		editor.setOptions(editorOptions);
	});

	// a new image (the first one is loaded when the canvas mounts)
	const loadedSource = useRef(editorOptions.src);
	useEffect(() => {
		if (loadedSource.current === editorOptions.src) {
			return;
		}
		loadedSource.current = editorOptions.src;
		void editor.setSource(editorOptions.src, editorOptions.initialState);
	}, [editor, editorOptions.src]);

	const ui = useMemo<EditorUIContextValue>(() => {
		const { tools: toolLabels, menus: menuLabels, ...textLabels } = labels ?? {};
		const { tools: toolIcons, menus: menuIcons, ...uiIcons } = icons ?? {};
		const resolvedComponents: EditorComponents = {
			...defaultUIComponents,
			Header,
			MenuBar,
			Toolbar,
			ContextPanel,
			Actions,
			...components,
		};
		const resolvedActions: EditorAction[] = actions ?? (onCancel ? ['cancel', 'reset', 'save'] : ['reset', 'save']);

		return {
			labels: { ...defaultLabels, ...textLabels },
			icons: { ...defaultIcons, ...uiIcons },
			components: resolvedComponents,
			layout: {
				menu: layout?.menu ?? 'left',
				header: layout?.header ?? 'top',
				toolbar: layout?.toolbar ?? 'bottom',
				contextPanel: layout?.contextPanel ?? 'bottom',
				actions: layout?.actions ?? 'bottom',
			},
			actions: resolvedActions,
			theme,
			unstyled,
			onCancel,
			onExportJson,
			slot: (name: EditorSlot, ...extraClassNames) => ({
				className: cx(`fp-${toKebabCase(name)}`, classNames?.[name], ...extraClassNames),
				style: styles?.[name],
			}),
			toolLabel: (tool) => toolLabels?.[tool.id] ?? tool.label,
			toolIcon: (tool) => (toolIcons && tool.id in toolIcons ? toolIcons[tool.id] : tool.icon),
			menuLabel: (menu) => menuLabels?.[menu.id] ?? toolLabels?.[menu.id] ?? menu.label,
			menuIcon: (menu) =>
				menuIcons && menu.id in menuIcons
					? menuIcons[menu.id]
					: toolIcons && menu.id in toolIcons
						? toolIcons[menu.id]
						: menu.icon,
		};
	}, [labels, icons, components, classNames, styles, layout, actions, theme, unstyled, onCancel, onExportJson]);

	return (
		<EditorContext.Provider value={editor}>
			<EditorUIContext.Provider value={ui}>{children}</EditorUIContext.Provider>
		</EditorContext.Provider>
	);
});

ImageEditorProvider.displayName = 'ImageEditorProvider';

/**
 * The image editor. Fills its parent by default (give the parent a height, or pass `width` / `height`).
 * Pass children to replace the default layout with your own arrangement of the exported building blocks.
 */
export const ImageEditor = forwardRef<ImageEditorController, ImageEditorProps>((props, ref) => {
	const { className, style, width, height, children, ...providerProps } = props;

	return (
		<ImageEditorProvider ref={ref} {...providerProps}>
			<EditorRoot className={className} style={style} width={width} height={height}>
				{children ?? <DefaultLayout />}
			</EditorRoot>
		</ImageEditorProvider>
	);
});

ImageEditor.displayName = 'ImageEditor';
