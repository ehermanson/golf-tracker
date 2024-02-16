import { z } from 'zod';

export const PasswordSchema = z
	.string({ required_error: 'Password is required' })
	.min(6, { message: 'Password is too short' });

export const EmailSchema = z
	.string({ required_error: 'Email is required' })
	.email({ message: 'Email is invalid' })
	.min(3, { message: 'Email is too short' });

export const LoginSchema = z.object({
	password: PasswordSchema,
	email: EmailSchema,
	redirectTo: z.string().optional(),
});
