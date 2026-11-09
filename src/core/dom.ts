/**
 * @author Vikhyat Singh
 * @description Small DOM helpers
 */

export const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	// revoking synchronously can cancel the download in some browsers
	setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// data urls (unlike object urls) stay valid inside the exported JSON
export const blobToDataUrl = (blob: Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});

/** true while the user types in a form field, a contenteditable element or fabric's hidden textarea */
export const isTypingTarget = (target: EventTarget | null): boolean => {
	const element = target as HTMLElement | null;
	return (
		element?.tagName === 'INPUT' ||
		element?.tagName === 'TEXTAREA' ||
		element?.tagName === 'SELECT' ||
		!!element?.isContentEditable
	);
};
