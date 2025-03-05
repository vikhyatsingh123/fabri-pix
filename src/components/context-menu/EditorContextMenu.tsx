/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Context menu for image editor
 */

import { Canvas, Object as FabricObject } from 'fabric';
import React from 'react';
import ShapesContextMenu from './ShapesContextMenu';
import TextContextMenu from './TextContextMenu';
import PencilContextMenu from './PencilContextMenu';
import { SubMenu } from '../../utils/utils';
import StepsCreatorContextMenu from './StepsCreatorContextMenu';
import { useActiveAnnotation } from '../../store/ImageEditorStore';
import ArrowContextMenu from './ArrowContextMenu';
import AdvancedArrowContextMenu from './AdvancedArrowContextMenu';
import LineContextMenu from './LineContextMenu';
import CommentBoxContextMenu from './CommentBoxContextMenu';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	selectedObject: FabricObject | null;
}

const EditorContextMenu: React.FC<IProps> = (props) => {
	const { canvas, selectedObject } = props;

	const activeAnnotation = useActiveAnnotation();
	const type = (selectedObject as any)?.shapeType ?? activeAnnotation;

	if (type === '') {
		return null;
	}

	switch (type) {
		case SubMenu.CIRCLE:
		case SubMenu.RECTANGLE:
		case SubMenu.STAR:
			return <ShapesContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.ARROW:
			return <ArrowContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.COMMENT_BOX:
			return <CommentBoxContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.LINE_PATH:
			return <LineContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.ADVANCED_ARROW:
			return <AdvancedArrowContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.TEXT:
			return <TextContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.DRAW:
			return <PencilContextMenu canvas={canvas} selectedObject={selectedObject} />;
		case SubMenu.STEPS_CREATOR:
			return <StepsCreatorContextMenu canvas={canvas} selectedObject={selectedObject} />;
		default:
			return null;
	}
};

export default EditorContextMenu;
