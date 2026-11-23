import { useState } from 'react';
import { ImageEditor, type SaveResult } from 'fabri-pix';
import 'fabri-pix/dist/fabri-pix.css';

// any image url (it needs CORS headers to be exported), a data url or a File / Blob
const IMAGE_URL = 'https://picsum.photos/id/1015/1600/1067';

export default function App() {
	const [savedUrl, setSavedUrl] = useState<string | null>(null);

	const handleSave = ({ blob, json }: SaveResult) => {
		// upload `blob` (the edited image) and keep `json` to continue editing later with `initialState`
		console.log('saved', blob.size, 'bytes', json);
		setSavedUrl((previous) => {
			if (previous) {
				URL.revokeObjectURL(previous);
			}
			return URL.createObjectURL(blob);
		});
	};

	return (
		<div className='app'>
			<header>
				<strong>FabriPix starter</strong>
				<span>Edit the image, then press Save.</span>
				{savedUrl && <img src={savedUrl} alt='Saved result' />}
			</header>
			{/* the editor fills its parent, so the parent needs a size */}
			<div className='editor'>
				<ImageEditor src={IMAGE_URL} onSave={handleSave} actions={['reset', 'exportJson', 'save']} />
			</div>
		</div>
	);
}
