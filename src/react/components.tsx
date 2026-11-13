/**
 * @author Vikhyat Singh
 * @description Building blocks of the editor UI. <ImageEditor> combines them in <DefaultLayout>, they can be used to
 * build a custom layout inside <ImageEditorProvider> (or as children of <ImageEditor>).
 */

import React, { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { downloadBlob } from '../core/dom';
import type { ToolGroup } from '../core/types';
import { useEditorState, useEditorUI, useImageEditor } from './context';
import { cx, Divider, Dropdown, Field } from './ui';
import type { EditorTheme } from './types';

const themeVariables: Record<keyof EditorTheme, string> = {
	primary: '--fp-color-primary',
	background: '--fp-color-background',
	surface: '--fp-color-surface',
	text: '--fp-color-text',
	mutedText: '--fp-color-muted-text',
	border: '--fp-color-border',
	hover: '--fp-color-hover',
	active: '--fp-color-active',
	danger: '--fp-color-danger',
	success: '--fp-color-success',
	stageBackground: '--fp-color-stage-background',
	radius: '--fp-radius',
	fontFamily: '--fp-font-family',
	fontSize: '--fp-font-size',
};

export interface EditorRootProps {
	className?: string;
	style?: CSSProperties;
	width?: number | string;
	height?: number | string;
	children?: ReactNode;
}

/** the outer element: applies the theme variables, `classNames.root` / `styles.root` and the size */
export const EditorRoot: React.FC<EditorRootProps> = (props) => {
	const { className, style, width, height, children } = props;
	const ui = useEditorUI();
	const root = ui.slot('root', ui.unstyled && 'fp-unstyled', className);
	const variables = Object.fromEntries(
		Object.entries(ui.theme ?? {})
			.filter(([key, value]) => value !== undefined && key in themeVariables)
			.map(([key, value]) => [themeVariables[key as keyof EditorTheme], value]),
	) as CSSProperties;

	return (
		<div
			className={root.className}
			style={{ width: width ?? '100%', height: height ?? '100%', ...variables, ...root.style, ...style }}
		>
			{children}
		</div>
	);
};

/** the canvas, fills the available space and fits the image into it */
export const EditorCanvas: React.FC<{ className?: string; style?: CSSProperties }> = (props) => {
	const { className, style } = props;
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const stageRef = useRef<HTMLDivElement | null>(null);
	const hostRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// the canvas element is created outside of react, fabric wraps it into its own container
		const host = hostRef.current!;
		const element = document.createElement('canvas');
		host.appendChild(element);
		const detach = editor.attach(element);
		return () => {
			detach();
			host.replaceChildren();
		};
	}, [editor]);

	useEffect(() => {
		const stage = stageRef.current!;
		const updateSize = () => {
			const computed = getComputedStyle(stage);
			const width = stage.clientWidth - parseFloat(computed.paddingLeft) - parseFloat(computed.paddingRight);
			const height = stage.clientHeight - parseFloat(computed.paddingTop) - parseFloat(computed.paddingBottom);
			editor.setViewportSize(Math.max(0, width), Math.max(0, height));
		};
		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(stage);
		return () => observer.disconnect();
	}, [editor]);

	const stage = ui.slot('stage', className);
	return (
		<div ref={stageRef} className={stage.className} style={{ ...stage.style, ...style }}>
			<div ref={hostRef} className='fp-stage-canvas' />
			{state.loading && <div className='fp-loading'>{ui.labels.loading}</div>}
		</div>
	);
};

/** menu tabs (Annotate / Crop / Redact), hidden when there is only one menu */
export const MenuBar: React.FC = () => {
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { Button } = ui.components;
	const menus = editor.getMenus();

	if (menus.length <= 1) {
		return null;
	}

	return (
		<nav {...ui.slot('menu', `fp-menu--${ui.layout.menu}`)}>
			{menus.map((menu) => (
				<Button
					key={menu.id}
					slot='menuItem'
					active={state.activeMenu === menu.id}
					disabled={!state.ready}
					onClick={() => editor.setMenu(menu.id)}
				>
					{ui.menuIcon(menu)}
					<span>{ui.menuLabel(menu)}</span>
				</Button>
			))}
		</nav>
	);
};

/** button of a single tool (or its custom `ToolbarButton`) */
export const ToolButton: React.FC<{ toolId: string }> = (props) => {
	const { toolId } = props;
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { Button } = ui.components;
	const tool = editor.getTool(toolId);

	if (!tool) {
		return null;
	}

	const active = state.activeTool === toolId;
	const onClick = () => editor.toggleTool(toolId);

	if (tool.ToolbarButton) {
		return <tool.ToolbarButton tool={tool} active={active} onClick={onClick} />;
	}

	return (
		<Button slot='toolButton' active={active} disabled={!state.ready} onClick={onClick}>
			{ui.toolIcon(tool)}
			<span>{ui.toolLabel(tool)}</span>
		</Button>
	);
};

/** several tools behind one button and a dropdown (e.g. Shapes) */
export const ToolGroupButton: React.FC<{ group: ToolGroup }> = (props) => {
	const { group } = props;
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { Button } = ui.components;
	const [open, setOpen] = useState(false);

	const tools = group.tools.map((id) => editor.getTool(id)).filter((tool) => !!tool);
	const activeTool = tools.find((tool) => tool.id === state.activeTool);
	const label = ui.menuLabel(group);

	const handleMainClick = () => {
		if (activeTool) {
			editor.setActiveTool(null);
			return;
		}
		const firstToggleTool = tools.find((tool) => tool.type !== 'action');
		if (firstToggleTool) {
			editor.setActiveTool(firstToggleTool.id);
		} else {
			setOpen(true);
		}
	};

	return (
		<Dropdown
			open={open}
			onOpenChange={setOpen}
			trigger={
				<>
					<Button slot='toolButton' active={!!activeTool} disabled={!state.ready} onClick={handleMainClick}>
						{activeTool ? ui.toolIcon(activeTool) : ui.menuIcon(group)}
						<span>{activeTool ? ui.toolLabel(activeTool) : label}</span>
					</Button>
					<Button
						slot='toolButton'
						aria-label={`${label} ${ui.labels.more}`}
						aria-expanded={open}
						disabled={!state.ready}
						onClick={() => setOpen((isOpen) => !isOpen)}
					>
						{ui.icons.dropdown}
					</Button>
				</>
			}
		>
			<div role='menu' className='fp-dropdown-list'>
				{tools.map((tool) => (
					<Button
						key={tool.id}
						role='menuitem'
						active={state.activeTool === tool.id}
						onClick={() => {
							setOpen(false);
							editor.setActiveTool(tool.id);
						}}
					>
						{ui.toolIcon(tool)}
						<span>{ui.toolLabel(tool)}</span>
					</Button>
				))}
			</div>
		</Dropdown>
	);
};

/** tools of the active menu */
export const Toolbar: React.FC = () => {
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const menu = editor.getMenu(state.activeMenu);

	if (!menu) {
		return null;
	}
	// a menu whose only tool is activated automatically (crop, redact) needs no toolbar
	const [onlyItem] = menu.tools;
	if (menu.tools.length === 1 && typeof onlyItem === 'string' && onlyItem === menu.defaultTool) {
		return <div role='toolbar' {...ui.slot('toolbar')} />;
	}

	return (
		<div role='toolbar' {...ui.slot('toolbar')}>
			{menu.tools.map((item) =>
				typeof item === 'string' ? (
					<ToolButton key={item} toolId={item} />
				) : (
					<ToolGroupButton key={item.id} group={item} />
				),
			)}
		</div>
	);
};

const detectChanges = (previous: any, current: any) => {
	const oldObjects: any[] = previous?.objects ?? [];
	const newObjects: any[] = current?.objects ?? [];
	const created = newObjects.filter((obj) => !oldObjects.some((old) => old.id === obj.id));
	const deleted = oldObjects.filter((old) => !newObjects.some((obj) => obj.id === old.id));
	const modified = newObjects.filter((obj) => {
		const old = oldObjects.find((candidate) => candidate.id === obj.id);
		return old && JSON.stringify(old) !== JSON.stringify(obj);
	});
	const cropChanged = JSON.stringify(previous?.clipPath ?? null) !== JSON.stringify(current?.clipPath ?? null);
	// rotation, flip and filters are stored on the photo
	const imageState = (state: any) => {
		const image = state?.backgroundImage;
		return JSON.stringify([
			image?.angle ?? 0,
			!!image?.flipX,
			!!image?.flipY,
			image?.fpFilters ?? {},
			image?.fpResize ?? null,
		]);
	};
	const imageChanged = imageState(previous) !== imageState(current);
	return { created, deleted, modified, cropChanged, hasCrop: !!current?.clipPath, imageChanged };
};

/** list of history entries, click one to go back to it */
export const HistoryPanel: React.FC<{ onSelect?: () => void }> = (props) => {
	const { onSelect } = props;
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { Button } = ui.components;
	const { entries, index: currentIndex } = state.history;

	const items = useMemo(() => {
		const parsed = entries.map((entry) => JSON.parse(entry));
		const shapeLabel = (shapeType: string) => editor.getShape(shapeType)?.label ?? 'Annotation';
		return parsed.map((state, index) => {
			if (index === 0) {
				return [ui.labels.initialState];
			}
			const changes = detectChanges(parsed[index - 1], state);
			return [
				changes.created[0] && `${shapeLabel(changes.created[0].shapeType)} ${ui.labels.created}`,
				changes.modified[0] && `${shapeLabel(changes.modified[0].shapeType)} ${ui.labels.modified}`,
				changes.deleted[0] && `${shapeLabel(changes.deleted[0].shapeType)} ${ui.labels.deleted}`,
				changes.cropChanged && (changes.hasCrop ? ui.labels.cropApplied : ui.labels.cropRemoved),
				changes.imageChanged && ui.labels.imageEdited,
			].filter((label): label is string => !!label);
		});
	}, [entries, editor, ui.labels]);

	return (
		<div {...ui.slot('historyPanel')}>
			{items.map((labels, index) => (
				<Button
					key={index}
					slot='historyItem'
					active={index === currentIndex}
					disabled={state.restoring}
					onClick={() => {
						void editor.goToHistory(index);
						onSelect?.();
					}}
				>
					<span className='fp-history-index'>{index + 1}.</span>
					<span className='fp-history-labels'>
						{labels.map((label) => (
							<span key={label}>{label}</span>
						))}
					</span>
					{index === currentIndex && <span className='fp-history-check'>{ui.icons.check}</span>}
				</Button>
			))}
		</div>
	);
};

export const HistoryControls: React.FC = () => {
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { Button } = ui.components;
	const [open, setOpen] = useState(false);

	const canUndo = !state.restoring && state.history.index > 0;
	const canRedo = !state.restoring && state.history.index < state.history.entries.length - 1;

	return (
		<>
			<Dropdown
				open={open}
				onOpenChange={setOpen}
				placement='bottom'
				trigger={
					<Button
						title={ui.labels.history}
						aria-label={ui.labels.history}
						aria-expanded={open}
						disabled={state.history.entries.length === 0}
						onClick={() => setOpen((isOpen) => !isOpen)}
					>
						{ui.icons.history}
					</Button>
				}
			>
				<HistoryPanel />
			</Dropdown>
			<Button
				title={ui.labels.undo}
				aria-label={ui.labels.undo}
				disabled={!canUndo}
				onClick={() => void editor.undo()}
			>
				{ui.icons.undo}
			</Button>
			<Button
				title={ui.labels.redo}
				aria-label={ui.labels.redo}
				disabled={!canRedo}
				onClick={() => void editor.redo()}
			>
				{ui.icons.redo}
			</Button>
		</>
	);
};

export const ZoomControls: React.FC = () => {
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { Button } = ui.components;
	const zoomed = state.zoom > 1;

	return (
		<>
			<Button
				title={ui.labels.zoomIn}
				aria-label={ui.labels.zoomIn}
				disabled={!state.ready || state.zoom >= 4}
				onClick={() => editor.zoomIn()}
			>
				{ui.icons.zoomIn}
			</Button>
			<Button title={ui.labels.fit} disabled={!zoomed} onClick={() => editor.fitToView()}>
				{ui.labels.fit}
			</Button>
			<Button
				title={ui.labels.zoomOut}
				aria-label={ui.labels.zoomOut}
				disabled={!zoomed}
				onClick={() => editor.zoomOut()}
			>
				{ui.icons.zoomOut}
			</Button>
			<Divider />
			<Button
				title={ui.labels.pan}
				aria-label={ui.labels.pan}
				active={state.panning}
				disabled={!zoomed}
				onClick={() => editor.togglePanning()}
			>
				{ui.icons.pan}
			</Button>
		</>
	);
};

/** history and zoom controls */
export const Header: React.FC = () => {
	const ui = useEditorUI();
	return (
		<div {...ui.slot('header')}>
			<HistoryControls />
			<Divider />
			<ZoomControls />
		</div>
	);
};

/** options of the selected object, or of the active tool when nothing is selected */
export const ContextPanel: React.FC = () => {
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { selection } = state;

	const target = selection.length === 1 ? selection[0] : null;
	const tool = target
		? editor.getToolForShape((target as any).shapeType)
		: selection.length === 0 && state.activeTool
			? editor.getTool(state.activeTool)
			: undefined;
	const Panel = tool?.OptionsPanel;
	// editing UI (e.g. the crop rectangle) has its own controls
	const hasObjects = selection.some((object) => !editor.getShape((object as any).shapeType)?.transient);

	return (
		<div {...ui.slot('contextPanel')}>
			{tool && Panel && (
				<Panel
					// a new panel for every object, so that pending edits of the previous one are committed
					key={`${tool.id}-${(target as any)?.id ?? 'defaults'}`}
					editor={editor}
					tool={tool}
					target={target}
					options={state.toolOptions[tool.id] ?? {}}
					setOptions={(options) => editor.setToolOptions(tool.id, options)}
				/>
			)}
			{hasObjects && (
				<>
					{Panel && <Divider />}
					<ObjectControls />
				</>
			)}
		</div>
	);
};

const DEFAULT_SHADOW = { color: '#000000', blur: 10, offsetX: 5, offsetY: 5 };

/** opacity, shadow, dashes, corners, layer order, duplicate and delete for the selected objects */
export const ObjectControls: React.FC = () => {
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { Button, Slider, ColorPicker, NumberInput } = ui.components;
	const { labels, icons } = ui;

	const objects = state.selection.filter((object) => !editor.getShape((object as any).shapeType)?.transient);
	if (objects.length === 0) {
		return null;
	}

	const style = editor.getObjectStyle(objects[0]);
	const supports = (name: 'opacity' | 'shadow' | 'dashed' | 'cornerRadius') =>
		objects.some((object) => editor.supportsObjectStyle(object, name));
	const shows = (control: (typeof ui.objectControls)[number]) => ui.objectControls.includes(control);

	const parts: Record<string, React.ReactNode> = {
		opacity: supports('opacity') && (
			<Field key='opacity' label={labels.opacity}>
				<Slider
					aria-label={labels.opacity}
					min={0.05}
					max={1}
					step={0.05}
					value={style.opacity}
					onChange={(opacity) => editor.setObjectStyle(objects, { opacity }, { commit: false })}
					onChangeComplete={() => editor.commit()}
				/>
			</Field>
		),
		shadow: supports('shadow') && (
			<Field key='shadow'>
				<Button
					title={labels.shadow}
					aria-label={labels.shadow}
					active={!!style.shadow}
					onClick={() => editor.setObjectStyle(objects, { shadow: style.shadow ? null : DEFAULT_SHADOW })}
				>
					{icons.shadow}
				</Button>
				{style.shadow && (
					<ColorPicker
						aria-label={labels.shadow}
						value={style.shadow.color}
						onChange={(color) =>
							editor.setObjectStyle(objects, { shadow: { ...style.shadow!, color } }, { commit: false })
						}
						onChangeComplete={() => editor.commit()}
					/>
				)}
			</Field>
		),
		dashed: supports('dashed') && (
			<Button
				key='dashed'
				title={labels.dashed}
				aria-label={labels.dashed}
				active={style.dashed}
				onClick={() => editor.setObjectStyle(objects, { dashed: !style.dashed })}
			>
				{icons.dashed}
			</Button>
		),
		cornerRadius: supports('cornerRadius') && (
			<Field key='cornerRadius' label={labels.cornerRadius}>
				<NumberInput
					aria-label={labels.cornerRadius}
					min={0}
					max={200}
					value={style.cornerRadius}
					onChange={(cornerRadius) => editor.setObjectStyle(objects, { cornerRadius }, { commit: false })}
					onChangeComplete={() => editor.commit()}
				/>
			</Field>
		),
		layers: (
			<Field key='layers'>
				{(
					[
						['bringToFront', 'front'],
						['bringForward', 'forward'],
						['sendBackward', 'backward'],
						['sendToBack', 'back'],
					] as const
				).map(([label, direction]) => (
					<Button
						key={direction}
						title={labels[label]}
						aria-label={labels[label]}
						disabled={!editor.canArrangeSelection(direction)}
						onClick={() => editor.arrangeSelection(direction)}
					>
						{icons[label]}
					</Button>
				))}
			</Field>
		),
		duplicate: (
			<Button
				key='duplicate'
				title={labels.duplicate}
				aria-label={labels.duplicate}
				onClick={() => void editor.duplicateSelection()}
			>
				{icons.duplicate}
			</Button>
		),
		delete: (
			<Button
				key='delete'
				danger
				title={labels.delete}
				aria-label={labels.delete}
				onClick={() => editor.deleteSelection()}
			>
				{icons.delete}
			</Button>
		),
	};

	const visible = ui.objectControls.filter((control) => shows(control) && parts[control]);
	return (
		<div {...ui.slot('objectControls')}>
			{visible.map((control, index) => (
				<React.Fragment key={control}>
					{index > 0 && <Divider />}
					{parts[control]}
				</React.Fragment>
			))}
		</div>
	);
};

/** reset / cancel / export / save buttons */
export const Actions: React.FC = () => {
	const editor = useImageEditor();
	const state = useEditorState();
	const ui = useEditorUI();
	const { Button } = ui.components;

	const handlers: Record<string, () => void> = {
		load: () => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';
			input.onchange = () => {
				const file = input.files?.[0];
				if (file) {
					void editor.setSource(file);
				}
			};
			input.click();
		},
		deleteAll: () => editor.clearAnnotations(),
		reset: () => editor.reset(),
		cancel: () => ui.onCancel?.(),
		exportJson: () => {
			const json = editor.toJSON();
			if (ui.onExportJson) {
				ui.onExportJson(json);
			} else {
				downloadBlob(
					new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }),
					`canvas-${Date.now()}.json`,
				);
			}
		},
		save: () => void editor.save(),
	};

	return (
		<div {...ui.slot('actions')}>
			{ui.actions.map((action) => (
				<Button
					key={action}
					className={cx(`fp-action-${action}`)}
					disabled={action !== 'cancel' && !state.ready}
					onClick={handlers[action]}
				>
					{ui.icons[action]}
					<span>{ui.labels[action]}</span>
				</Button>
			))}
		</div>
	);
};

/** the default arrangement of all parts, configured through the `layout` prop */
export const DefaultLayout: React.FC = () => {
	const ui = useEditorUI();
	const {
		Header: HeaderPart,
		MenuBar: MenuPart,
		Toolbar: ToolbarPart,
		ContextPanel: PanelPart,
		Actions: ActionsPart,
	} = ui.components;
	const { layout } = ui;

	const parts = (position: 'top' | 'bottom') => {
		const items = [
			layout.header === position && HeaderPart && <HeaderPart key='header' />,
			layout.actions === position && ActionsPart && <ActionsPart key='actions' />,
			layout.toolbar === position && ToolbarPart && <ToolbarPart key='toolbar' />,
			layout.contextPanel === position && PanelPart && <PanelPart key='contextPanel' />,
		];
		// bottom parts are listed from the canvas outwards as well
		return position === 'top' ? items : items.reverse();
	};

	return (
		<>
			{parts('top')}
			<div {...ui.slot('body', `fp-body--menu-${layout.menu}`)}>
				{layout.menu !== 'none' && MenuPart && <MenuPart />}
				<EditorCanvas />
			</div>
			{parts('bottom')}
		</>
	);
};
