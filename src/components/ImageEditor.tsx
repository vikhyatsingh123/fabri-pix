import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

interface ImageEditorProps {
	imageUrl: string;
	enableCrop?: boolean;
	enableFilter?: boolean;
	enableResize?: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
	imageUrl,
	enableCrop = true,
	enableFilter = true,
	enableResize = true,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	let canvas: fabric.Canvas;

	useEffect(() => {
		const loadImage = async () => {
			if (canvasRef.current) {
				canvas = new fabric.Canvas(canvasRef.current);
				const img = await fabric.Image.fromURL(imageUrl);
				img.scaleToWidth(500);
				canvas.add(img);
			}
		};
		loadImage();
		return () => {
			canvas?.dispose();
		};
	}, [imageUrl]);

	return (
		<div>
			<canvas ref={canvasRef} />
			{enableCrop && <button onClick={() => console.log('Crop clicked')}>Crop</button>}
			{enableFilter && <button onClick={() => console.log('Filter clicked')}>Filter</button>}
			{enableResize && <button onClick={() => console.log('Resize clicked')}>Resize</button>}
		</div>
	);
};
