import React from 'react';

import { ImageEditorWrapper } from '../src';

export default function App() {
	return (
		<div>
			<h1 style={{ marginBottom: '0px' }}>FabriPix Image Editor</h1>
			<ImageEditorWrapper imageUrl='https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630' />
		</div>
	);
}
