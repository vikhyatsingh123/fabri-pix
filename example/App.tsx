import React from 'react';

import { ImageEditorWrapper } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

export default function App() {
	return (
		<div>
			<h1 style={{ display: 'flex', justifyContent: 'center', textDecoration: 'underline' }}>
				FabriPix Image Editor
			</h1>
			<ImageEditorWrapper imageUrl='https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630' />
		</div>
	);
}
