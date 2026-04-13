/**
 * Distinct pastel surfaces for subscription cards so consecutive adds stay visually different
 * (category alone often repeated the same swatch).
 */
export const SUBSCRIPTION_SURFACE_PALETTE = [
	'#f5c542',
	'#b8d4e3',
	'#e8def8',
	'#b8e8d0',
	'#d4c4f0',
	'#a8d4e8',
	'#e8b8c8',
	'#ffd89b',
	'#c9e4de',
	'#f6e6ff',
	'#dfeadf',
	'#ffecb8',
	'#dce8f8',
	'#f0d9f4',
	'#e8dcc8',
	'#c8e0f0',
	'#f5d4e0',
	'#d8f0e0',
	'#e0d8f8',
	'#f0e8c8',
	'#c8f0e8',
	'#f8e0d0',
	'#d0e8f8',
] as const;

/** Stable index from id + name so the same subscription keeps the same color. */
export function subscriptionSurfaceColor(seed: string): string {
	let h = 0;
	for (let i = 0; i < seed.length; i += 1) {
		h = Math.imul(31, h) + seed.charCodeAt(i);
	}
	const idx = Math.abs(h) % SUBSCRIPTION_SURFACE_PALETTE.length;
	return SUBSCRIPTION_SURFACE_PALETTE[idx];
}
