import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
	console.log('🌱 Seeding...');
	console.time(`🌱 Database has been seeded`);

	console.time('🧹 Cleaned up the database...');
	await cleanupDb(prisma);
	console.timeEnd('🧹 Cleaned up the database...');

	const email = 'test@fake.com';

	// // cleanup the existing database
	// await prisma.user.delete({ where: { email } }).catch(() => {
	// 	// no worries if it doesn't exist yet
	// });

	const hashedPassword = await bcrypt.hash('password', 10);

	const seedUser = await prisma.user.create({
		data: {
			email,
			displayName: 'Hacker',
			password: {
				create: {
					hash: hashedPassword,
				},
			},
		},
	});

	console.time('⛳️ Created course...');
	const seedCourse = await prisma.course.create({
		data: {
			name: 'Pebble Beach Golf Links',
			address: '1700 17 Mile Drive',
			city: 'Pebble Beach',
			state: 'CA',
			country: 'United States',
			holes: {
				create: [
					{
						number: 1,
						strokeIndex: 6,
						par: 4,
					},
					{
						number: 2,
						strokeIndex: 10,
						par: 5,
					},
					{
						number: 3,
						strokeIndex: 12,
						par: 4,
					},
					{
						number: 4,
						strokeIndex: 16,
						par: 4,
					},
					{
						number: 5,
						strokeIndex: 14,
						par: 3,
					},
					{
						number: 6,
						strokeIndex: 2,
						par: 5,
					},
					{
						number: 7,
						strokeIndex: 18,
						par: 3,
					},
					{
						number: 8,
						strokeIndex: 4,
						par: 4,
					},
					{
						number: 9,
						strokeIndex: 8,
						par: 4,
					},
					{
						number: 10,
						strokeIndex: 3,
						par: 4,
					},
					{
						number: 11,
						strokeIndex: 9,
						par: 4,
					},
					{
						number: 12,
						strokeIndex: 17,
						par: 3,
					},
					{
						number: 13,
						strokeIndex: 7,
						par: 4,
					},
					{
						number: 14,
						strokeIndex: 1,
						par: 5,
					},
					{
						number: 15,
						strokeIndex: 13,
						par: 4,
					},
					{
						number: 16,
						strokeIndex: 11,
						par: 4,
					},
					{
						number: 17,
						strokeIndex: 15,
						par: 3,
					},
					{
						number: 18,
						strokeIndex: 5,
						par: 5,
					},
				],
			},
		},
		include: {
			holes: true,
		},
	});

	const yardages = [
		378, 509, 397, 333, 189, 498, 107, 416, 483, 444, 370, 202, 401, 559, 393,
		400, 182, 541,
	];

	const seedTee = await prisma.tee.create({
		data: {
			courseId: seedCourse.id,
			rating: 74.9,
			slope: 144,
			name: 'Blue',
			yardage: yardages.reduce((tot, curr) => tot + curr, 0),
		},
	});

	seedCourse.holes.forEach(async (hole, i) => {
		await prisma.teeForHole.create({
			data: {
				teeId: seedTee.id,
				holeId: hole.id,
				yardage: yardages[i],
			},
		});
	});

	console.timeEnd('⛳️ Created course...');

	console.time('🏌️ Created round...');

	const holeData = [
		{
			holeNumber: 1,
			score: 4,
			drive: 'hit',
			approach: 'hit',
			putts: 2,
		},
		{
			holeNumber: 2,
			score: 5,
			drive: 'hit',
			approach: 'left',
			putts: 1,
			sandShots: 1,
		},
		{
			holeNumber: 3,
			score: 5,
			drive: 'right',
			approach: 'right',
			putts: 2,
		},
		{
			holeNumber: 4,
			score: 4,
			drive: 'right',
			approach: 'hit',
			putts: 2,
		},
		{
			holeNumber: 5,
			score: 2,
			drive: null,
			approach: 'hit',
			putts: 1,
		},
		{
			holeNumber: 6,
			score: 6,
			drive: 'hit',
			approach: 'right',
			putts: 2,
		},
		{
			holeNumber: 7,
			score: 2,
			drive: null,
			approach: 'hit',
			putts: 1,
		},
		{
			holeNumber: 8,
			score: 3,
			drive: 'hit',
			approach: 'hit',
			putts: 1,
		},
		{
			holeNumber: 9,
			score: 6,
			drive: 'right',
			approach: 'right',
			putts: 2,
		},
		{
			holeNumber: 10,
			score: 4,
			drive: 'left',
			approach: 'short',
			putts: 1,
			chipShots: 1,
		},
		{
			holeNumber: 11,
			score: 8,
			drive: 'left',
			approach: 'left',
			putts: 3,
			chipShots: 1,
			note: 'I suck.',
		},
		{
			holeNumber: 12,
			score: 3,
			drive: null,
			approach: 'hit',
			putts: 2,
		},
		{
			holeNumber: 13,
			score: 4,
			drive: 'hit',
			approach: 'hit',
			putts: 2,
		},
		{
			holeNumber: 14,
			score: 3,
			drive: 'hit',
			approach: 'hit',
			putts: 1,
			note: 'cool',
		},
		{
			holeNumber: 15,
			score: 4,
			drive: 'hit',
			approach: 'hit',
			putts: 2,
		},
		{
			holeNumber: 16,
			score: 5,
			drive: 'left',
			approach: 'left',
			putts: 1,
			chipShots: 1,
		},
		{
			holeNumber: 17,
			score: 4,
			drive: null,
			approach: 'hit',
			putts: 3,
		},
		{
			holeNumber: 18,
			score: 5,
			drive: 'hit',
			approach: 'hit',
			putts: 2,
		},
	];

	const date = new Date();
	const seedRound = await prisma.round.create({
		data: {
			datePlayed: date.toISOString(),
			numberOfHoles: 18,
			courseId: seedCourse.id,
			userId: seedUser.id,
			teeId: seedTee.id,
			totalScore: holeData.reduce((tot, curr) => tot + curr.score, 0),
			totalPutts: holeData.reduce((tot, curr) => tot + curr.putts, 0),
			totalFairways: holeData.filter(d => d.drive === 'hit').length,
			totalGir: holeData.filter(d => d.approach === 'hit').length,
		},
	});

	holeData.forEach(async hole => {
		await prisma.holeStats.create({
			data: {
				roundId: seedRound.id,
				...hole,
			},
		});
	});

	console.timeEnd('🏌️ Created round...');

	console.timeEnd(`🌱 Database has been seeded`);
}

seed()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

async function cleanupDb(prisma: PrismaClient) {
	const tables = await prisma.$queryRaw<
		{ name: string }[]
	>`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`;

	await prisma.$transaction([
		// Disable FK constraints to avoid relation conflicts during deletion
		prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`),
		// Delete all rows from each table, preserving table structures
		...tables.map(({ name }) =>
			prisma.$executeRawUnsafe(`DELETE from "${name}"`),
		),
		prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON`),
	]);
}
