import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillHoleIds() {
	await prisma.$transaction(async tx => {
		// Fetch all HoleStats records
		const holeStatsRecords = await tx.holeStats.findMany({
			include: {
				round: {
					select: {
						teeId: true,
					},
				},
			},
		});

		for (const holeStat of holeStatsRecords) {
			try {
				const teeForHole = await tx.teeForHole.findFirst({
					where: {
						teeId: holeStat.round.teeId,
						hole: {
							number: holeStat.holeNumber,
						},
					},
				});

				if (teeForHole) {
					console.log(teeForHole);

					await tx.holeStats.update({
						where: {
							id: holeStat.id,
						},
						data: {
							holeId: teeForHole.id,
						},
					});
				} else {
					// Log cases where no matching TeeForHole is found
					console.log(
						`No matching TeeForHole found for HoleStat ID: ${holeStat.id}`,
					);
				}
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
