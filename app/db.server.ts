import { PrismaClient } from '@prisma/client';

import { singleton } from './singleton.server';

type Acc = 'left' | 'right' | 'long' | 'short' | 'hit';

const prisma = singleton('prisma', () => {
	return new PrismaClient().$extends({
		result: {
			holeStats: {
				upAndDown: {
					needs: { putts: true, chipShots: true },
					compute(stat) {
						return stat.putts === 1 && stat.chipShots === 1;
					},
				},
				sandSave: {
					needs: { putts: true, sandShots: true },
					compute(stat) {
						return stat.putts === 1 && stat.sandShots === 1;
					},
				},
				// added to trick TS. fakes an enum type, which is not supported by sqlite
				drive: {
					compute(data) {
						return data.drive ? (data.drive as Acc) : undefined;
					},
				},
				// added to trick TS. fakes an enum type, which is not supported by sqlite
				approach: {
					compute(data) {
						return data.approach ? (data.approach as Acc) : undefined;
					},
				},
			},
			round: {
				puttsPerHole: {
					needs: { totalPutts: true, numberOfHoles: true },
					compute(round) {
						return ((round.totalPutts ?? 0) / round.numberOfHoles).toFixed(1);
					},
				},
			},
		},
	});
});

prisma.$connect();

export { prisma };
