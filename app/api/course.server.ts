import {
	type Course,
	type Hole,
	type Tee,
	type TeeForHole,
} from '@prisma/client';

import { prisma } from '~/db.server';

export function getAllCourses() {
	return prisma.course.findMany({
		orderBy: {
			name: 'asc',
		},
	});
}

export function getPlayableCourses() {
	return prisma.course.findMany({
		orderBy: {
			name: 'asc',
		},
		where: {
			tees: {
				some: {},
			},
		},
		include: {
			tees: true,
		},
	});
}

export async function getCourse({ id }: { id: Course['id'] }) {
	const course = await prisma.course.findUnique({
		where: { id },
		include: {
			holes: {
				include: {
					teeForHole: true,
				},
			},
			tees: {
				include: {
					teeForHole: true,
				},
				orderBy: {
					yardage: 'desc',
				},
			},
		},
	});
	return course;
}

export async function createCourse({
	name,
	address,
	city,
	state,
	country,
	holes,
}: Omit<Course, 'id' | 'userId' | 'par'> & {
	holes: Omit<Hole, 'id' | 'courseId'>[];
}) {
	const totalPar = holes.reduce((tot, curr) => tot + curr.par, 0);

	const course = await prisma.course.create({
		data: {
			name,
			address,
			city,
			par: totalPar,
			state,
			country,
		},
	});

	// apparently SQLITE doesn't support `createMany` -
	// so prisma has a `transaction` API to support batching
	const inserts = [];
	for (const hole of holes) {
		inserts.push(
			prisma.hole.create({
				data: {
					number: hole.number,
					par: hole.par,
					strokeIndex: hole.strokeIndex,
					courseId: course.id,
				},
			}),
		);
	}
	await prisma.$transaction(inserts);

	return course;
}

export async function updateCourseHoles({
	holes,
	courseId,
}: {
	holes: Pick<Hole, 'id' | 'par' | 'strokeIndex'>[];
	courseId: Course['id'];
}) {
	const inserts = [];

	for (const hole of holes) {
		inserts.push(
			prisma.hole.update({
				where: {
					id: hole.id,
				},
				data: {
					par: hole.par,
					strokeIndex: hole.strokeIndex,
				},
			}),
		);
	}

	const totalPar = holes.reduce((tot, curr) => tot + curr.par, 0);
	const updateTotal = prisma.course.update({
		where: {
			id: courseId,
		},
		data: {
			par: totalPar,
		},
	});

	await prisma.$transaction([...inserts, updateTotal]);
}

type Holes = Omit<TeeForHole, 'id' | 'teeId'>[];
export async function addTee({
	name,
	holes,
	rating,
	slope,
	courseId,
}: Omit<Tee, 'id' | 'yardage'> & { holes: Holes }) {
	const yardage = holes.reduce((tot, curr) => tot + curr.yardage, 0);

	const tee = await prisma.tee.create({
		data: {
			courseId,
			rating,
			slope,
			name,
			yardage,
		},
	});

	const inserts = [];

	for (const hole of holes) {
		inserts.push(
			prisma.teeForHole.create({
				data: {
					teeId: tee.id,
					holeId: hole.holeId,
					yardage: hole.yardage,
				},
			}),
		);
	}

	await prisma.$transaction(inserts);

	return tee;
}

// Delete all tee related stuff and start over
// export const deleteTeeForHole = async () => {
// 	const deleteTee = prisma.tee.deleteMany();
// 	const deleteTeeForHole = prisma.teeForHole.deleteMany();

// 	await prisma.$transaction([deleteTeeForHole, deleteTee]);
// };

export const deleteTee = async ({ id }: { id: string }) => {
	await prisma.tee.delete({ where: { id } });
};

export async function updateCourse({
	id,
	name,
	address,
	city,
	state,
}: Omit<Course, 'par' | 'country'>) {
	const update = await prisma.course.update({
		where: {
			id,
		},
		select: {
			name: true,
			address: true,
			city: true,
			state: true,
		},
		data: {
			name,
			address,
			city,
			state,
		},
	});

	return update;
}

type CourseInfo = keyof Pick<
	Course,
	'name' | 'address' | 'city' | 'country' | 'state'
>;

export async function updateCourseInfo({
	id,
	name,
	value,
}: {
	id: Course['id'];
	name: CourseInfo;
	value: string;
}) {
	const update = await prisma.course.update({
		where: {
			id,
		},
		data: {
			[name]: value,
		},
	});

	return update;
}

export async function updateCourseName({
	id,
	name,
}: {
	id: Course['id'];
	name: Course['name'];
}) {
	const update = await prisma.course.update({
		where: {
			id,
		},
		data: {
			name,
		},
	});

	return update;
}

export function deleteCourse({ id }: { id: Course['id'] }) {
	return prisma.course.delete({ where: { id } });
}
