// score differential calculation:
// (86 – 68.7) * (113 / 124) = 15.8
//  ^score ^rating ^base ^slope  ^ differential
// Base rating is 113. Not sure where that comes from.
const BASE_RATING = 113;

export function calculateScoreDifferential({
	score,
	rating,
	slope,
}: {
	score: number;
	rating: number;
	slope: number;
}) {
	const diff = (score - rating) * (BASE_RATING / slope);

	return (Math.round(diff * 100) / 100).toFixed(1);
}
