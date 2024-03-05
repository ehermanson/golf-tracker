import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';

import { pebble } from './mock_data/course-mocks';
import { createStat } from './mock_data/hole-stats-mocks';

const prisma = new PrismaClient();

async function seed() {
	console.log('🌱 Seeding...');
	console.time(`🌱 Database has been seeded`);

	console.time('🧹 Cleaned up the database...');
	await cleanupDb(prisma);
	console.timeEnd('🧹 Cleaned up the database...');

	const email = 'test@fake.com';

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
		data: pebble,
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

	console.time('🏌️ Created rounds...');

	async function createRound(date: Date) {
		const statPromises = Array.from({ length: 18 }).map(async (_, idx) => {
			const holeNumber = idx + 1;
			const hole = seedCourse.holes.find(hole => hole.number === holeNumber);

			if (!hole) {
				throw new Error('could not find matching hole');
			}

			return createStat(holeNumber, hole.id);
		});

		const stats = await Promise.all(statPromises);

		return await prisma.round.create({
			data: {
				datePlayed: date.toISOString(),
				numberOfHoles: 18,
				courseId: seedCourse.id,
				userId: seedUser.id,
				teeId: seedTee.id,
				totalScore: stats.reduce((tot, curr) => tot + curr.score, 0),
				totalPutts: stats.reduce((tot, curr) => tot + curr.putts, 0),
				totalFairways: stats.filter(d => d.drive === 'hit').length,
				totalGir: stats.filter(d => d.approach === 'hit').length,
				holeStats: {
					create: stats,
				},
			},
		});
	}

	const date = new Date();
	const month = date.getMonth();
	const year = date.getFullYear();

	Array.from({
		length: faker.number.int({ min: 20, max: 30 }),
	}).map(() => {
		return createRound(
			faker.date.between({
				from: new Date(year, month - 1, 1),
				to: new Date(year, month + 1, -1),
			}),
		);
	});

	console.timeEnd('🏌️ Created rounds...');
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
