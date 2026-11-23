/**
 * @author Vikhyat Singh
 * @description Touch and trackpad gestures of the canvas: pinch to zoom, two-finger pan, double tap, ⌘/Ctrl + wheel
 */

import type { Canvas } from 'fabric';

export interface GestureHandlers {
	/** pinch / pan / wheel gestures are skipped (all input goes to fabric) while this returns false */
	enabled: () => boolean;
	/** two fingers touched down */
	pinchStart: () => void;
	/** `scale`: finger distance relative to the start, `center` / `pan`: midpoint and its movement in canvas pixels */
	pinch: (scale: number, center: { x: number; y: number }, pan: { x: number; y: number }) => void;
	pinchEnd: () => void;
	/** ⌘/Ctrl + wheel (also a trackpad pinch), `scale` relative to the current zoom */
	wheelZoom: (scale: number, center: { x: number; y: number }) => void;
	/** plain wheel / two-finger trackpad scroll, returns true when it was used to pan */
	wheelPan: (dx: number, dy: number) => boolean;
}

// a first finger is held back this long (unless it moves) to see whether a second one follows
const HOLD_MS = 90;
const MOVE_TOLERANCE = 8;
const TAP_MS = 300;
const DOUBLE_TAP_MS = 350;
const DOUBLE_TAP_DISTANCE = 24;

type Position = { x: number; y: number };

/**
 * Listens before fabric (capture phase). A single finger is handed to fabric unchanged, two fingers become a pinch /
 * pan which fabric never sees. Fabric must use pointer events (`enablePointerEvents`). Returns a function that removes
 * the listeners.
 */
export const attachGestures = (canvas: Canvas, handlers: GestureHandlers): (() => void) => {
	const element = canvas.upperCanvasEl;
	const view = element.ownerDocument.defaultView ?? window;
	const touches = new Map<number, { position: Position; event: PointerEvent }>();
	let mode: 'idle' | 'pending' | 'passthrough' | 'gesture' = 'idle';
	let pending: PointerEvent | null = null;
	let holdTimer: ReturnType<typeof setTimeout> | undefined;
	let replaying = false;
	let gestureStart: { distance: number; center: Position } | null = null;
	let previousCenter: Position | null = null;
	let tapStart: { time: number; position: Position } | null = null;
	let lastTap: { time: number; position: Position } | null = null;
	let suppressNativeDoubleClickUntil = 0;

	const local = (position: Position): Position => {
		const rect = element.getBoundingClientRect();
		return { x: position.x - rect.left, y: position.y - rect.top };
	};
	const positionOf = (event: PointerEvent): Position => ({ x: event.clientX, y: event.clientY });
	const distance = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.y - b.y);

	const measure = () => {
		const [first, second] = Array.from(touches.values()).map((touch) => touch.position);
		return {
			distance: Math.max(1, distance(first, second)),
			center: local({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }),
		};
	};

	// sends a copy of a touch event to fabric (our own listeners let it through)
	const replay = (type: 'pointerdown' | 'pointerup', source: PointerEvent) => {
		replaying = true;
		try {
			element.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					cancelable: true,
					composed: true,
					pointerId: source.pointerId,
					pointerType: 'touch',
					isPrimary: true,
					clientX: source.clientX,
					clientY: source.clientY,
					screenX: source.screenX,
					screenY: source.screenY,
					width: source.width,
					height: source.height,
					pressure: type === 'pointerup' ? 0 : 0.5,
					button: 0,
					buttons: type === 'pointerup' ? 0 : 1,
				}),
			);
		} finally {
			replaying = false;
		}
	};

	// the held finger turned out to be a single touch: fabric gets its pointerdown now
	const flush = () => {
		clearTimeout(holdTimer);
		if (mode === 'pending' && pending) {
			const event = pending;
			pending = null;
			mode = 'passthrough';
			replay('pointerdown', event);
		}
	};

	const isOwnTouch = (event: PointerEvent) => !replaying && event.pointerType === 'touch';

	const handlePointerDown = (event: PointerEvent) => {
		if (!isOwnTouch(event) || event.target !== element) {
			return;
		}
		if (!handlers.enabled()) {
			// no pinch / pan: fabric gets every touch right away, double taps still become double clicks
			if (event.isPrimary) {
				touches.clear();
				touches.set(event.pointerId, { position: positionOf(event), event });
				tapStart = { time: event.timeStamp, position: positionOf(event) };
				mode = 'passthrough';
			}
			return;
		}
		if (event.isPrimary) {
			// a new touch sequence, forget anything a missed pointerup left behind
			touches.clear();
			clearTimeout(holdTimer);
			mode = 'idle';
		}
		touches.set(event.pointerId, { position: positionOf(event), event });

		if (touches.size === 1) {
			event.stopPropagation();
			mode = 'pending';
			pending = event;
			tapStart = { time: event.timeStamp, position: positionOf(event) };
			holdTimer = setTimeout(flush, HOLD_MS);
			return;
		}

		event.stopPropagation();
		event.preventDefault();
		if (touches.size !== 2 || mode === 'gesture') {
			return;
		}
		if (mode === 'pending') {
			clearTimeout(holdTimer);
			pending = null;
		} else if (mode === 'passthrough') {
			// the first finger already started something in fabric (moving an object, drawing): finish it there
			const first = Array.from(touches.entries()).find(([id]) => id !== event.pointerId)?.[1];
			if (first) {
				replay('pointerup', first.event);
			}
		}
		mode = 'gesture';
		tapStart = null;
		lastTap = null;
		gestureStart = measure();
		previousCenter = gestureStart.center;
		handlers.pinchStart();
	};

	const handlePointerMove = (event: PointerEvent) => {
		const touch = isOwnTouch(event) ? touches.get(event.pointerId) : undefined;
		if (!touch) {
			return;
		}
		touch.position = positionOf(event);
		touch.event = event;

		if (mode === 'pending') {
			if (pending && distance(positionOf(pending), touch.position) > MOVE_TOLERANCE) {
				// a drag with one finger: hand it to fabric, this move continues it
				flush();
			} else {
				event.stopPropagation();
			}
			return;
		}
		if (mode === 'gesture') {
			event.stopPropagation();
			event.preventDefault();
			if (touches.size >= 2 && gestureStart && previousCenter) {
				const current = measure();
				handlers.pinch(current.distance / gestureStart.distance, current.center, {
					x: current.center.x - previousCenter.x,
					y: current.center.y - previousCenter.y,
				});
				previousCenter = current.center;
			}
		}
	};

	const handleDoubleTap = (event: PointerEvent) => {
		const position = positionOf(event);
		const isTap =
			tapStart &&
			event.timeStamp - tapStart.time < TAP_MS &&
			distance(tapStart.position, position) <= MOVE_TOLERANCE;
		tapStart = null;
		if (!isTap) {
			lastTap = null;
			return;
		}
		if (
			lastTap &&
			event.timeStamp - lastTap.time < DOUBLE_TAP_MS &&
			distance(lastTap.position, position) <= DOUBLE_TAP_DISTANCE
		) {
			lastTap = null;
			// a double click edits text, finishes a path... Fired by a listener added after fabric's own pointerup
			// listener, so it runs right after fabric handled this pointerup and still counts as a user gesture (iOS only
			// opens the keyboard for text editing inside one)
			element.ownerDocument.addEventListener(
				'pointerup',
				() => {
					suppressNativeDoubleClickUntil = performance.now() + 500;
					element.dispatchEvent(
						new MouseEvent('dblclick', {
							bubbles: true,
							cancelable: true,
							composed: true,
							view,
							detail: 2,
							clientX: event.clientX,
							clientY: event.clientY,
							screenX: event.screenX,
							screenY: event.screenY,
						}),
					);
				},
				{ once: true },
			);
			return;
		}
		lastTap = { time: event.timeStamp, position };
	};

	const handlePointerUp = (event: PointerEvent) => {
		const touch = isOwnTouch(event) ? touches.get(event.pointerId) : undefined;
		if (!touch) {
			return;
		}
		touches.delete(event.pointerId);

		if (mode === 'gesture') {
			event.stopPropagation();
			if (touches.size === 0) {
				mode = 'idle';
				gestureStart = null;
				previousCenter = null;
				handlers.pinchEnd();
			} else if (touches.size === 1) {
				// one finger left: nothing happens until it is lifted too
				gestureStart = null;
			}
			return;
		}

		if (mode === 'pending') {
			// a quick tap: fabric gets the pointerdown first, then this pointerup
			flush();
		}
		if (event.type === 'pointerup') {
			handleDoubleTap(event);
		}
		if (touches.size === 0) {
			mode = 'idle';
		}
	};

	// browsers that fire their own dblclick for a double tap would edit twice
	const handleDoubleClick = (event: MouseEvent) => {
		if (event.target === element && event.isTrusted && performance.now() < suppressNativeDoubleClickUntil) {
			event.stopPropagation();
			event.preventDefault();
		}
	};

	const handleWheel = (event: WheelEvent) => {
		if (!handlers.enabled()) {
			return;
		}
		const lineHeight = event.deltaMode === 1 ? 16 : 1;
		if (event.ctrlKey || event.metaKey) {
			event.preventDefault();
			// a mouse wheel notch (±100) is capped so that it zooms about as much as a few steps of a trackpad pinch
			const delta = Math.max(-30, Math.min(30, event.deltaY * lineHeight));
			handlers.wheelZoom(Math.exp(-delta * 0.01), local(positionOf(event as any)));
			return;
		}
		if (handlers.wheelPan(-event.deltaX * lineHeight, -event.deltaY * lineHeight)) {
			event.preventDefault();
		}
	};

	const capture = { capture: true };
	const activeCapture = { capture: true, passive: false };
	// on the window: a capture listener on the canvas itself could not stop fabric's listener on the same element
	view.addEventListener('pointerdown', handlePointerDown, activeCapture);
	view.addEventListener('pointermove', handlePointerMove, activeCapture);
	view.addEventListener('pointerup', handlePointerUp, capture);
	view.addEventListener('pointercancel', handlePointerUp, capture);
	view.addEventListener('dblclick', handleDoubleClick, capture);
	element.addEventListener('wheel', handleWheel, { passive: false });

	return () => {
		clearTimeout(holdTimer);
		view.removeEventListener('pointerdown', handlePointerDown, activeCapture);
		view.removeEventListener('pointermove', handlePointerMove, activeCapture);
		view.removeEventListener('pointerup', handlePointerUp, capture);
		view.removeEventListener('pointercancel', handlePointerUp, capture);
		view.removeEventListener('dblclick', handleDoubleClick, capture);
		element.removeEventListener('wheel', handleWheel);
	};
};
