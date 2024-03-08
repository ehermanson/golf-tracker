import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillHoleIds() {
	await prisma.$transaction(async tx => {
		const holeStatsRecords = await tx.holeStats.findMany({
			include: {
				round: {
					select: {
						courseId: true,
					},
				},
			},
		});

		for (const holeStat of holeStatsRecords) {
			try {
				const hole = await tx.hole.findUniqueOrThrow({
					where: {
						number_courseId: {
							number: holeStat.holeNumber,
							courseId: holeStat.round.courseId,
						},
					},
				});
				await tx.holeStats.update({
					where: {
						id: holeStat.id,
					},
					data: {
						holeId: hole.id,
					},
				});
			} catch (error) {
				// Log detailed error information for troubleshooting
				console.error(`Error updating HoleStat ID: ${holeStat.id}`, error);
			}
		}
	});
}

backfillHoleIds()
	.catch(async e => {
		console.error(e);

		process.exit(1);
	})
	.finally(async () => await prisma.$disconnect());
