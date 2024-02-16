export function formatDate({ date }: { date: string }) {
	return new Date(date).toLocaleDateString('en-US');
}
