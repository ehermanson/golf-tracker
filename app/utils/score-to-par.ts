interface FormatScoreToPar {
	par: number;
	score: number;
}

export function formatScoreToPar({ par, score }: FormatScoreToPar): string {
	if (typeof par !== 'number' || typeof score !== 'number') {
		throw new Error('Invalid input: par and score must be numbers');
	}
	if (isNaN(par) || isNaN(score)) {
		throw new Error('Invalid input: par and score must be numbers');
	}

	const difference = score - par;
	if (difference === 0) {
		return 'E';
	} else if (difference > 0) {
		return `+${difference}`;
	} else {
		return `${difference}`;
	}
}
