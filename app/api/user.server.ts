import bcrypt from 'bcryptjs';

import { type Password, type User } from '@prisma/client';

import { prisma } from '~/db.server';

export type { User } from '@prisma/client';

export async function getUserById(id: User['id']) {
	return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User['email']) {
	return prisma.user.findUnique({ where: { email } });
}

export async function getAllUsers() {
	return prisma.user.findMany({
		select: {
			displayName: true,
			email: true,
		},
	});
}

export async function createUser(email: User['email'], password: string) {
	const hashedPassword = await bcrypt.hash(password, 10);

	return prisma.user.create({
		data: {
			email,
			password: {
				create: {
					hash: hashedPassword,
				},
			},
		},
	});
}

export async function updateUserName({
	userId,
	displayName,
}: {
	userId: User['id'];
	displayName: User['displayName'];
}) {
	return prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			displayName,
		},
	});
}

export async function updateUserEmail({
	userId,
	email,
}: {
	userId: User['id'];
	email: User['email'];
}) {
	return prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			email,
		},
	});
}

export async function deleteUserByEmail(email: User['email']) {
	return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
	email: User['email'],
	password: Password['hash'],
) {
	const userWithPassword = await prisma.user.findUnique({
		where: { email },
		include: {
			password: true,
		},
	});

	if (!userWithPassword || !userWithPassword.password) {
		return null;
	}

	const isValid = await bcrypt.compare(
		password,
		userWithPassword.password.hash,
	);

	if (!isValid) {
		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { password: _password, ...userWithoutPassword } = userWithPassword;

	return userWithoutPassword;
}
