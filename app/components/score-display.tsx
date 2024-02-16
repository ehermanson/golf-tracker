import { cn, formatScoreToPar } from '~/utils';

const getClasses = (toPar: string) => {
	if (Number(toPar) < 0) {
		return 'text-red-600 dark:text-red-500';
	}

	if (toPar === 'E') {
		return 'text-green-600 dark:text-green-500';
	}
	return '';
};

export function Score({
	score,
	par,
	className,
}: {
	score: number;
	par: number;
	className?: string;
}) {
	const toPar = formatScoreToPar({
		par,
		score,
	});

	return <span className={cn(getClasses(toPar), className)}>{score}</span>;
}

export function ScoreToPar({
	score,
	par,
	className,
	wrap,
}: {
	score: number;
	par: number;
	className?: string;
	wrap?: boolean;
}) {
	const toPar = formatScoreToPar({
		par,
		score,
	});

	return (
		<span className={cn(getClasses(toPar), className)}>
			{wrap ? `(${toPar})` : toPar}
		</span>
	);
}
