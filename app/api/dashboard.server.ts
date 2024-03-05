import { type Round } from '@prisma/client';

import { prisma } from '~/db.server';

interface BaseDashboardWidgetInput {
	userId: string;
	month: number;
	year: number;
}

export async function getScoreDistribution({
	userId,
	month,
	year,
}: BaseDashboardWidgetInput) {
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const rounds = await prisma.round.findMany({
		where: {
			userId,
			totalScore: { not: null },
			datePlayed: {
				gte: firstDay,
				lte: lastDay,
			},
		},
		take: 5,
		select: {
			id: true,
		},
	});

	const scoreDistribution = {
		eagles: 0,
		birdies: 0,
		pars: 0,
		bogeys: 0,
		dblBogeys: 0,
		tripBogeys: 0,
		worse: 0,
	};

	const roundStats = await Promise.all(
		rounds.map(async round => {
			return prisma.holeStats.findMany({
				where: {
					roundId: round.id,
				},
				select: {
					score: true,
					hole: {
						select: {
							par: true,
						},
					},
				},
			});
		}),
	);

	roundStats.forEach(holeStats => {
		holeStats.forEach(holeStat => {
			const score = holeStat.score;
			const par = holeStat.hole?.par;

			if (!score || !par) {
				return;
			}

			const scoreDiff = score - par;

			switch (true) {
				case scoreDiff === -2:
					scoreDistribution.eagles++;
					break;
				case scoreDiff === -1:
					scoreDistribution.birdies++;
					break;
				case scoreDiff === 0:
					scoreDistribution.pars++;
					break;
				case scoreDiff === 1:
					scoreDistribution.bogeys++;
					break;
				case scoreDiff === 2:
					scoreDistribution.dblBogeys++;
					break;
				case scoreDiff === 3:
					scoreDistribution.tripBogeys++;
					break;
				case scoreDiff > 3:
					scoreDistribution.worse++;
					break;
			}
		});
	});

	return scoreDistribution;
}

export function getCompletedRounds({
	userId,
	take,
}: {
	userId: Round['userId'];
	take?: number;
}) {
	return prisma.round.findMany({
		where: {
			userId,
			totalScore: { not: null },
		},
		take,
		orderBy: {
			datePlayed: 'desc',
		},
		include: {
			course: true,
			tees: true,
		},
	});
}

export async function getRoundsPlayedMonthTrend({
	userId,
	month,
	year,
}: BaseDashboardWidgetInput): Promise<number> {
	const previousFirstDay = new Date(year, month - 1, 1);
	const previousLastDay = new Date(year, month, 0);
	const previousRounds = await prisma.round.count({
		where: {
			userId,
			totalScore: { not: null },
			datePlayed: {
				gte: previousFirstDay,
				lte: previousLastDay,
			},
		},
	});
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const rounds = await prisma.round.count({
		where: {
			userId,
			totalScore: { not: null },
			datePlayed: {
				gte: firstDay,
				lte: lastDay,
			},
		},
	});

	const diff = rounds - previousRounds;
	return diff;
}

async function getRoundsWithFairwaysHit({
	userId,
	gte,
	lte,
}: {
	userId: string;
	gte: Date;
	lte: Date;
}) {
	return await prisma.round.findMany({
		where: {
			userId,
			totalScore: { not: null },
			datePlayed: {
				gte,
				lte,
			},
		},
		select: {
			totalFairways: true,
			course: {
				select: {
					_count: {
						select: {
							holes: {
								where: {
									par: {
										not: 3,
									},
								},
							},
						},
					},
				},
			},
		},
	});
}

export async function getFairwaysHitTrend({
	userId,
	month,
	year,
}: BaseDashboardWidgetInput) {
	const previousFirstDay = new Date(year, month - 1, 1);
	const previousLastDay = new Date(year, month, 0);
	const previousRounds = await getRoundsWithFairwaysHit({
		userId,
		gte: previousFirstDay,
		lte: previousLastDay,
	});

	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const currentRounds = await getRoundsWithFairwaysHit({
		userId,
		gte: firstDay,
		lte: lastDay,
	});

	const getAggregates = (rounds: typeof currentRounds) => {
		const totals = rounds.reduce(
			(acc, round) => {
				const possibleFairways = round.course._count.holes;
				const totalFairways = round.totalFairways ?? 0;
				acc.totalFairways += totalFairways;
				acc.possibleFairways += possibleFairways;

				return acc;
			},
			{ totalFairways: 0, possibleFairways: 0 },
		);

		const percent =
			totals.possibleFairways > 0
				? totals.totalFairways / totals.possibleFairways
				: 0;

		return { ...totals, percent };
	};

	const previous = getAggregates(previousRounds);
	const current = getAggregates(currentRounds);
	const diff = current.percent - previous.percent;

	return {
		currentPercent: current.percent,
		previousPercent: previous.percent,
		diff,
	};
}

async function getRoundsWithGir({
	userId,
	gte,
	lte,
}: {
	userId: string;
	gte: Date;
	lte: Date;
}) {
	return await prisma.round.findMany({
		where: {
			userId,
			totalScore: { not: null },
			datePlayed: {
				gte,
				lte,
			},
		},
		select: {
			numberOfHoles: true,
			totalGir: true,
		},
	});
}

export async function getGirTrend({
	userId,
	month,
	year,
}: BaseDashboardWidgetInput) {
	const previousFirstDay = new Date(year, month - 1, 1);
	const previousLastDay = new Date(year, month, 0);
	const previousRounds = await getRoundsWithGir({
		userId,
		gte: previousFirstDay,
		lte: previousLastDay,
	});

	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const currentRounds = await getRoundsWithGir({
		userId,
		gte: firstDay,
		lte: lastDay,
	});

	const getAggregates = (rounds: typeof currentRounds) => {
		const totals = rounds.reduce(
			(acc, round) => {
				acc.numberOfHoles += round.numberOfHoles;
				acc.gir += round.totalGir ?? 0;

				return acc;
			},
			{ numberOfHoles: 0, gir: 0 },
		);

		const percent =
			totals.numberOfHoles > 0 ? totals.gir / totals.numberOfHoles : 0;

		return { ...totals, percent };
	};

	const previous = getAggregates(previousRounds);
	const current = getAggregates(currentRounds);
	const diff = current.percent - previous.percent;

	return {
		currentPercent: current.percent,
		previousPercent: previous.percent,
		diff,
	};
}
