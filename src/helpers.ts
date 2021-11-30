export function now(): number {
	const d = new Date();
	return Math.round(d.getTime() / 1000);
}
