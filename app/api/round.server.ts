import { type HoleStats, type Round, type User } from '@prisma/client';

import { prisma } from '~/db.server';

export function getRounds({
	userId,
	take,
}: {
	userId: Round['userId'];
	take?: number;
}) {
	return prisma.round.findMany({
		where: {
			userId,
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

// @TODO: Use for % of change stats
// function getPercentageDifference(a: number, b: number): number {
//   const absDiff = Math.abs(a-b);
//   const avg = (a + b) / 2;
//   const percent = (absDiff / avg) * 100;

//   return percent;
// }

export async function getRoundsPlayedMonthTrend({
	userId,
	month,
	year,
}: {
	userId: Round['userId'];
	month: number;
	year: number;
}): Promise<number> {
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
}: {
	userId: Round['userId'];
	month: number;
	year: number;
}) {
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

export async function getRoundWithStats({ id }: { id: Round['id'] }) {
	const round = await prisma.round.findUnique({
		where: { id },
		include: {
			course: {
				include: {
					holes: true,
				},
			},
			tees: {
				include: {
					teeForHole: true,
				},
			},
			holeStats: true,
		},
	});

	if (round) {
		const roundWithStats = {
			...round,
			holeByHole: round?.course.holes.map(hole => {
				const teeForHole = round.tees.teeForHole.find(
					tee => tee.holeId === hole.id,
				);
				const statsForHole = round.holeStats.find(
					stat => stat.holeNumber === hole.number,
				);
				return {
					...hole,
					yardage: teeForHole?.yardage ?? 0,
					stats: statsForHole,
				};
			}),
		};

		return roundWithStats;
	}
}

export async function createRound({
	datePlayed,
	courseId,
	numberOfHoles,
	teeId,
	userId,
}: Pick<
	Round,
	'datePlayed' | 'numberOfHoles' | 'courseId' | 'userId' | 'teeId'
> & { userId: User['id'] }): Promise<Round> {
	const course = await prisma.course.findUniqueOrThrow({
		where: {
			id: courseId,
		},
		include: {
			holes: true,
		},
	});
	return await prisma.round.create({
		data: {
			datePlayed,
			numberOfHoles,
			courseId,
			userId,
			teeId,
			totalScore: course.par,
			holeStats: {
				create: course.holes.map(h => ({
					holeNumber: h.number,
					score: h.par,
				})),
			},
		},
	});
}

export async function updateRoundTotals({
	roundId,
	name,
	value,
}: {
	roundId: string;
	name: string;
	value: number;
}) {
	const round = await prisma.round.update({
		where: { id: roundId },
		data: {
			[name]: value,
		},
		include: {
			holeStats: true,
		},
	});

	return round;
}

export function deleteRound({ id }: { id: Round['id'] }) {
	return prisma.round.delete({ where: { id } });
}

type StatType = keyof Pick<
	HoleStats,
	'putts' | 'chipShots' | 'sandShots' | 'score' | 'note' | 'drive' | 'approach'
>;

export async function updateStat({
	holeNumber,
	roundId,
	name,
	value,
}: {
	roundId: string;
	name: StatType;
	value: HoleStats[StatType];
	holeNumber: number;
}) {
	// @TODO - validate against 'impossible' stat lines.
	// e.g. score: 4, putts: 2, chips: 2
	return prisma.$transaction(async tx => {
		const update = await tx.holeStats.upsert({
			where: {
				roundId_holeNumber: {
					roundId,
					holeNumber,
				},
			},
			create: {
				roundId,
				holeNumber,
				[name]: value,
			},
			update: {
				[name]: value,
			},
			include: {
				round: {
					include: {
						holeStats: true,
					},
				},
			},
		});

		if (name === 'score' && typeof value === 'number') {
			const expectedHoles = update.round.numberOfHoles;
			const holesWithScores = await tx.holeStats.aggregate({
				where: { roundId },
				_sum: {
					score: true,
				},
				_count: {
					score: true,
				},
			});

			const fullScorecard = holesWithScores._count.score === expectedHoles;
			if (fullScorecard) {
				await tx.round.update({
					where: { id: roundId },
					data: {
						totalScore: holesWithScores._sum.score,
					},
				});
			}
		}

		if (name === 'putts' && typeof value === 'number') {
			const agg = await tx.holeStats.aggregate({
				where: { roundId },
				_sum: {
					putts: true,
				},
			});

			await tx.round.update({
				where: { id: roundId },
				data: {
					totalPutts: agg._sum.putts ?? 0,
				},
			});
		}

		if (name === 'approach') {
			const count = await tx.holeStats.count({
				where: { roundId, approach: 'hit' },
			});

			await tx.round.update({
				where: { id: roundId },
				data: {
					totalGir: count,
				},
			});
		}

		if (name === 'drive') {
			const count = await tx.holeStats.count({
				where: { roundId, drive: 'hit' },
			});

			await tx.round.update({
				where: { id: roundId },
				data: {
					totalFairways: count,
				},
			});
		}
	});
}
