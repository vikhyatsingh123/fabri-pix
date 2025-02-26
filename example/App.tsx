import React from 'react';
import { ImageEditor } from '../src';

export default function App() {
	return (
		<div>
			<h1>FabriPix Image Editor</h1>
			<ImageEditor imageUrl='https://via.placeholder.com/500' enableCrop enableFilter />
		</div>
	);
}
