import React from 'react';

import { ImageEditorWrapper } from '../src';

export default function App() {
	return (
		<div>
			<h1 style={{ marginBottom: '0px' }}>FabriPix Image Editor</h1>
			<ImageEditorWrapper imageUrl='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1rHjvktRKnlYH_KhsC0dw4sMizgnKR_0QiQ&s' />
		</div>
	);
}
