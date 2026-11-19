import type { ImageEditorController } from 'fabri-pix';

// the fabric object type as the editor sees it (avoids a second copy of fabric's types)
type FabricObject = NonNullable<ReturnType<NonNullable<ImageEditorController['canvas']>['getActiveObject']>>;

// helpers for the `run` functions of the API pages, so that every example has something to work on

/** the newest object with the given shapeType */
export const lastObject = (editor: ImageEditorController, shapeType: string): FabricObject | undefined =>
	editor
		.canvas!.getObjects()
		.filter((object) => (object as any).shapeType === shapeType)
		.at(-1);

/** a short summary of an object for the output log */
export const describe = (object: FabricObject | null | undefined) =>
	object
		? {
				shapeType: (object as any).shapeType,
				left: Math.round(object.left),
				top: Math.round(object.top),
			}
		: null;

/** the selected object, a new rectangle is added (and selected) when nothing is selected */
export const ensureSelection = async (editor: ImageEditorController): Promise<FabricObject> => {
	const active = editor.canvas!.getActiveObject();
	if (active) {
		return active;
	}
	await editor.addShape('rectangle', {
		left: 120,
		top: 110,
		width: 220,
		height: 130,
		stroke: '#2563eb',
		fill: 'rgba(37, 99, 235, 0.25)',
	});
	return editor.canvas!.getActiveObject()!;
};

/** number of annotations on the canvas (helpers such as arrow heads included) */
export const objectCount = (editor: ImageEditorController) => editor.canvas!.getObjects().length;
