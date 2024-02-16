import { useForm } from '@conform-to/react';
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

import { verifyLogin } from '~/api/user.server';
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
			LoginSchema.transform(async (data, ctx) => {
				const verifiedUser = await verifyLogin(data.email, data.password);
				if (!verifiedUser) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Invalid email or password',
					});
					return z.NEVER;
				}

				return { ...data, verifiedUser };
			}),
		async: true,
	});

	if (submission.status !== 'success') {
		return json(submission.reply());
	}

	const { verifiedUser, redirectTo } = submission.value;

	return createUserSession({
		redirectTo: safeRedirect(redirectTo),
		request,
		userId: verifiedUser.id,
	});
};

export const meta: MetaFunction = () => [{ title: 'Login' }];

export default function LoginPage() {
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get('redirectTo') || '/';
	const actionData = useActionData<typeof action>();

	const [form, fields] = useForm({
		id: 'login',
		lastResult: actionData,
		constraint: getZodConstraint(LoginSchema),
	});

	return (
		<div className="flex min-h-full flex-col justify-center">
			<div className="mx-auto w-full max-w-md px-8">
				<div className="flex items-center justify-center mb-14">
					<Logo size={150} showName={false} />
				</div>
				{form.errors ? (
					<div className="mb-6">
						{form.errors.map(err => {
							return (
								<p className="text-red-600" key={err}>
									{err}
								</p>
							);
						})}
					</div>
				) : null}
				<Form
					method="post"
					className="space-y-6"
					id={form.id}
					onSubmit={form.onSubmit}
				>
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
							inputProps={{
								type: 'password',
								autoComplete: 'current-password',
							}}
						/>
					</div>
					<input type="hidden" name="redirectTo" value={redirectTo} />
					<Button type="submit" className="w-full">
						Log in
					</Button>
					<div className="text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{' '}
						<Link
							className="text-primary font-bold underline"
							to={{
								pathname: '/join',
								search: searchParams.toString(),
							}}
						>
							Sign up
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
}
