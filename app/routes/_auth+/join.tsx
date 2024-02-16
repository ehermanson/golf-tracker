import { getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { z } from 'zod';

import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';

import { Button } from '~/components/ui/button';

import { createUser, getUserByEmail } from '~/api/user.server';
import { InputField } from '~/components/form-fields';
import { Logo } from '~/components/logo';
import { createUserSession, getUserId } from '~/session.server';
import { safeRedirect } from '~/utils';
import { LoginSchema } from './__schema';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await getUserId(request);
	if (userId) return redirect('/');
	return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();

	const submission = await parseWithZod(formData, {
		schema: () =>
			LoginSchema.superRefine(async (data, ctx) => {
				const existingUser = await getUserByEmail(data.email);
				if (existingUser) {
					ctx.addIssue({
						path: ['email'],
						code: z.ZodIssueCode.custom,
						message: 'A user already exists with this email',
					});
					return;
				}
			}).transform(async data => {
				const user = await createUser(data.email, data.password);

				return { ...data, user };
			}),
		async: true,
	});

	if (submission.status !== 'success') {
		return json(submission.reply());
	}

	const { user, redirectTo } = submission.value;

	return createUserSession({
		redirectTo: safeRedirect(redirectTo),
		request,
		userId: user.id,
	});
};

export const meta: MetaFunction = () => [{ title: 'Sign Up' }];

export default function Join() {
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get('redirectTo') ?? undefined;
	const actionData = useActionData<typeof action>();

	const [form, fields] = useForm({
		id: 'join',
		lastResult: actionData,
		constraint: getZodConstraint(LoginSchema),
	});

	return (
		<div className="flex min-h-full flex-col justify-center">
			<div className="mx-auto w-full max-w-md px-8">
				<div className="flex items-center justify-center mb-14">
					<Logo size={150} showName={false} />
				</div>
				<Form method="post" className="space-y-6" {...getFormProps(form)}>
					<div className="flex flex-col gap-4">
						<InputField
							label="Email"
							name={fields.email.name}
							errors={fields.email.errors}
							inputProps={{ type: 'email' }}
						/>
						<InputField
							label="Password"
							name={fields.password.name}
							errors={fields.password.errors}
							inputProps={{ type: 'password', autoComplete: 'new-password' }}
						/>
					</div>
					<input type="hidden" name="redirectTo" value={redirectTo} />
					<Button type="submit" className="w-full">
						Create Account
					</Button>
					<div className="flex items-center justify-center">
						<div className="text-center text-sm text-muted-foreground">
							Already have an account?{' '}
							<Link
								className="text-primary font-bold underline"
								to={{
									pathname: '/login',
									search: searchParams.toString(),
								}}
							>
								Log in
							</Link>
						</div>
					</div>
				</Form>
			</div>
		</div>
	);
}
