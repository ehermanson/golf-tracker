import { faker } from '@faker-js/faker';

export const createStat = (holeNumber: number, holeId: string) => {
	const drive = faker.helpers.weightedArrayElement([
		{ weight: 5, value: 'hit' },
		{ weight: 3, value: 'right' },
		{ weight: 2, value: 'left' },
	]);

	const approach = faker.helpers.weightedArrayElement([
		{ weight: 5, value: 'hit' },
		{ weight: 1, value: 'left' },
		{ weight: 1, value: 'right' },
		{ weight: 1, value: 'long' },
		{ weight: 2, value: 'short' },
	]);
	const putts = faker.helpers.weightedArrayElement([
		{ weight: 5, value: 2 },
		{ weight: 3, value: 1 },
		{ weight: 2, value: 3 },
	]);

	const shortGame = faker.helpers.weightedArrayElement([
		{ weight: 6, value: 0 },
		{ weight: 3, value: 1 },
		{ weight: 1, value: 2 },
	]);

	const score = faker.helpers.weightedArrayElement([
		{ weight: 4, value: 4 },
		{ weight: 3, value: 5 },
		{ weight: 1, value: 3 },
		{ weight: 1, value: 2 },
		{ weight: 1, value: 6 },
	]);

	return {
		holeId,
		holeNumber,
		score,
		putts,
		drive,
		approach,
		sandShots: shortGame,
		chipShots: shortGame,
	};
};

// export type MockStat = ReturnType<typeof createStat>;

// export const createHoleStats = () =>
// 	Array.from({ length: 18 }).map((_, idx) => createStat(idx + 1));

// export const statsForAllRounds = Array.from({
// 	length: faker.number.int({ min: 20, max: 30 }),
// }).map(createHoleStats);
