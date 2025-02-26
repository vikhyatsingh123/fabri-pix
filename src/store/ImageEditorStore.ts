/**
 * @author Vikhyat Singh <vikhyat.singh@314ecorp.com>
 * @description Image Editor Store
 */

import { create } from 'zustand';
import { SubMenu } from '../utils/utils';

interface IAction {
	setFreeDrawingBrush: (freeDrawingBrush: { color: string; width: number }) => void;
	setActiveAnnotation: (activeAnnotation: SubMenu | '') => void;
	setAdvancedArrow: (advancedArrow: { stroke: string; width: number }) => void;
	setLinePath: (linePath: { stroke: string; width: number }) => void;
	setStepCreator: (stepCreator: {
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		stepNumber: number;
		strokeWidth: number;
		fontSize: number;
	}) => void;
	setTextBox: (textBox: { backgroundColor: string; fontColor: string; fontSize: number; fontStyle: string; fontWeight: string }) => void;
	setCommentBox: (commentBox: {
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
		strokeWidth: number;
		borderColor: string;
		text: string;
	}) => void;
}

interface IStore {
	freeDrawingBrush: {
		color: string;
		width: number;
	};
	advancedArrow: {
		stroke: string;
		width: number;
	};
	linePath: {
		stroke: string;
		width: number;
	};
	stepCreator: {
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		stepNumber: number;
		strokeWidth: number;
		fontSize: number;
	};
	textBox: {
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	};
	commentBox: {
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
		strokeWidth: number;
		borderColor: string;
		text: string;
	};
	activeAnnotation: SubMenu | '';
	actions: IAction;
}

const useImageEditorStore = create<IStore>()((set) => ({
	freeDrawingBrush: {
		color: '#ff0000',
		width: 1,
	},
	advancedArrow: {
		stroke: '#ff0000',
		width: 4,
	},
	linePath: {
		stroke: '#ff0000',
		width: 3,
	},
	stepCreator: {
		borderColor: '#ff0000',
		backgroundColor: '#ff0000',
		fontColor: '#fff',
		fontSize: 20,
		stepNumber: 1,
		strokeWidth: 2,
	},
	commentBox: {
		backgroundColor: '#ff0000',
		fontColor: '#fff',
		fontSize: 16,
		fontStyle: 'normal',
		fontWeight: 'normal',
		strokeWidth: 2,
		borderColor: '#0386B5',
		text: 'Textbox',
	},
	textBox: {
		backgroundColor: '#fff',
		fontColor: '#ff0000',
		fontSize: 20,
		fontStyle: 'normal',
		fontWeight: 'normal',
	},
	activeAnnotation: '',
	actions: {
		setFreeDrawingBrush: (freeDrawingBrush: { color: string; width: number }) => set(() => ({ freeDrawingBrush })),
		setActiveAnnotation: (activeAnnotation: SubMenu | '') => set(() => ({ activeAnnotation })),
		setAdvancedArrow: (advancedArrow: { stroke: string; width: number }) => set(() => ({ advancedArrow })),
		setLinePath: (linePath: { stroke: string; width: number }) => set(() => ({ linePath })),
		setStepCreator: (stepCreator: {
			borderColor: string;
			backgroundColor: string;
			fontColor: string;
			stepNumber: number;
			strokeWidth: number;
			fontSize: number;
		}) => set(() => ({ stepCreator })),
		setTextBox: (textBox: { backgroundColor: string; fontColor: string; fontSize: number; fontStyle: string; fontWeight: string }) =>
			set(() => ({ textBox })),
		setCommentBox: (commentBox: {
			backgroundColor: string;
			fontColor: string;
			fontSize: number;
			fontStyle: string;
			fontWeight: string;
			strokeWidth: number;
			borderColor: string;
			text: string;
		}) => set(() => ({ commentBox })),
	},
}));

export const useFreeDrawingBrush = (): { freeDrawingBrush: { color: string; width: number } } =>
	useImageEditorStore((state) => ({ freeDrawingBrush: state.freeDrawingBrush }));
export const useStepCreator = (): {
	stepCreator: {
		borderColor: string;
		backgroundColor: string;
		fontColor: string;
		stepNumber: number;
		strokeWidth: number;
		fontSize: number;
	};
} => useImageEditorStore((state) => ({ stepCreator: state.stepCreator }));
export const useTextBox = (): {
	textBox: {
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
	};
} => useImageEditorStore((state) => ({ textBox: state.textBox }));
export const useActiveAnnotation = (): SubMenu | '' => useImageEditorStore((state) => state.activeAnnotation);
export const useImageEditorActions = (): IAction => useImageEditorStore((state) => state.actions);
export const useAdvancedArrow = (): { advancedArrow: { stroke: string; width: number } } =>
	useImageEditorStore((state) => ({ advancedArrow: state.advancedArrow }));
export const useLinePath = (): { linePath: { stroke: string; width: number } } =>
	useImageEditorStore((state) => ({ linePath: state.linePath }));
export const useCommentBox = (): {
	commentBox: {
		backgroundColor: string;
		fontColor: string;
		fontSize: number;
		fontStyle: string;
		fontWeight: string;
		strokeWidth: number;
		borderColor: string;
		text: string;
	};
} => useImageEditorStore((state) => ({ commentBox: state.commentBox }));
