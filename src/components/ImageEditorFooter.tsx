/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Image editor footer
 */

import React from 'react';
import _ from 'lodash';
import { Button } from 'antd';
import { Canvas } from 'fabric';

import useImageUploadToUrl from '@admin-vite/hooks/mutate/useImageUploadToUrl';
import { useCreateTipsheetActions, useSelectedStep, useImageIdToBeEdited } from '../store/createTipsheetStore';
import { useEditScreenContext } from '@admin-vite/features/edit/context/editScreenContext';
import { useTipSheetActions, useTipSheetData } from '@admin-vite/features/tip-sheet-asset-selection/store/tipSheetStore';
import { Save } from '@icon-park/react';
import blobToFile from '@admin-vite/features/edit/utils/blobToFile';
import { ulid } from 'ulid';

interface IProps {
	canvas: React.MutableRefObject<Canvas>;
	assetVersion: number;
	streamId: string;
}

const ImageEditorFooter: React.FC<IProps> = (props) => {
	const { canvas, assetVersion, streamId } = props;

	const tipSheetData = useTipSheetData();
	const imageIdToBeEdited = useImageIdToBeEdited();
	const { updateAutosaveFile } = useEditScreenContext();
	const { setTipSheetData } = useTipSheetActions();
	const selectedStep = useSelectedStep();
	const { setOpenEditImageModal, setStepImageToBeEdited, setSelectedStep, setImageIdToBeEdited } = useCreateTipsheetActions();

	const imageUploadToUrl = useImageUploadToUrl();

	const handleCancel = (): void => {
		setStepImageToBeEdited(null);
		setSelectedStep(null);
		setImageIdToBeEdited(null);
		setOpenEditImageModal(false);
	};

	const handleSave = async () => {
		if (!canvas.current) {
			return;
		}

		const canvasEdited = canvas.current;
		canvasEdited.discardActiveObject();
		const dataURL = await canvasEdited.toBlob({ multiplier: 1, format: 'png', quality: 1.0 });
		const blobUrl = URL.createObjectURL(dataURL);
		const burnImageIds = _.map(selectedStep?.imageProperties, (obj, index) => {
			if (obj.orgImg === imageIdToBeEdited) {
				return index;
			}
		});
		const burnImageId = _.compact(burnImageIds)[0];
		const burnId = `${ulid()}.png`;

		if ((burnImageId ?? burnId) && dataURL && assetVersion) {
			const imageBlobUrl = _.find(window.imageBlobUrls, ({ id }) => id === (burnImageId ?? burnId));
			if (imageBlobUrl) {
				imageBlobUrl.url = blobUrl;
			}
			// TODO: remove this after testing and when component rerenders properly
			const imgContainer = document.getElementById(burnImageId ?? burnId);
			if (imgContainer) {
				const img = imgContainer.querySelector('img');
				if (img instanceof HTMLImageElement) {
					img.src = blobUrl;
				}
			}
			const imgContainerPreview = document.getElementById(`${burnImageId ?? burnId}preview`);
			if (imgContainerPreview) {
				const img = imgContainerPreview.querySelector('img');
				if (img instanceof HTMLImageElement) {
					img.src = blobUrl;
				}
			}

			imageUploadToUrl.mutate({
				imgFile: blobToFile(dataURL, burnImageId ?? burnId, 'png'),
				imageIds: [burnImageId ?? burnId],
				streamId,
				assetVersion,
			});
		}

		if (imageIdToBeEdited && selectedStep) {
			const steps = _.get(tipSheetData, 'steps', []);
			const updatedSteps = _.map(steps, (step) => {
				let filteredImageIds = [];
				if (!burnImageId) {
					const newImageIds = [...step.imageIds, burnId];
					filteredImageIds = _.filter(newImageIds, (id) => id !== imageIdToBeEdited);
				} else {
					filteredImageIds = step.imageIds;
				}
				if (step.id === selectedStep.id) {
					return {
						...step,
						stepImages: _.map(step.stepImages, (stepImage) => {
							if (stepImage.id === imageIdToBeEdited) {
								return { ...stepImage, imageUrl: dataURL };
							}
							return stepImage;
						}),
						imageIds: filteredImageIds,
						imageProperties: !burnImageId
							? _.isEmpty(step.imageProperties)
								? {
										[burnId]: {
											orgImg: imageIdToBeEdited,
											annotations: [],
										},
									}
								: {
										...step.imageProperties,
										[burnId]: { orgImg: imageIdToBeEdited, annotations: [] },
									}
							: step.imageProperties,
					};
				}
				return step;
			});
			updateAutosaveFile((prev) => ({
				...prev,
				tipsheetData: { ...prev.tipsheetData, steps: updatedSteps },
			}));
			setTipSheetData({
				...tipSheetData,
				steps: updatedSteps,
			});
		}
		handleCancel();
	};

	return (
		<div className='flex gap-2 absolute bottom-0 right-0'>
			<Button onClick={handleCancel}>Cancel</Button>
			<Button type='primary' onClick={() => void handleSave()} icon={<Save />} loading={imageUploadToUrl.isPending}>
				Save
			</Button>
		</div>
	);
};

export default ImageEditorFooter;
