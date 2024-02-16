import { jsonWithError, jsonWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node';
import {
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
	type MetaFunction,
} from '@remix-run/react';

import {
	getAllUsers,
	getUserByEmail,
	updateUserEmail,
	updateUserName,
} from '~/api/user.server';
import { EditableText } from '~/components/editable-text';
import { PageContent, PageHeader } from '~/components/page';
import { requireUser, requireUserId } from '~/session.server';

export const meta: MetaFunction = () => [{ title: 'Profile' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireUser(request);
	invariant(user, 'User not found');

	const allUsers = await getAllUsers();

	return json({ user, allUsers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const intent = formData.get('_intent');

	switch (intent) {
		case 'updateDisplayName': {
			const displayName = String(formData.get('displayName'));

			await updateUserName({
				userId,
				displayName,
			});

			return jsonWithSuccess({}, 'Display name updated');
		}
		case 'updateEmail': {
			const email = String(formData.get('email'));

			const existingUser = await getUserByEmail(email);

			if (existingUser) {
				return jsonWithError(null, 'A user already exists with this email');
			}

			await updateUserEmail({
				userId,
				email,
			});

			return jsonWithSuccess({}, 'Email updated');
		}
	}

	return null;
};

export default function ProfilePage() {
	const { user } = useLoaderData<typeof loader>();

	return (
		<>
			<PageHeader title="Profile" />
			<PageContent>
				<div className="grid grid-cols-[200px_1fr] mb-8">
					<div className="font-bold border-r-2 border-r-secondary border-b-2 border-b-secondary p-4">
						Display Name
					</div>
					<div className="border-b-2 border-b-secondary p-4">
						<EditableText
							fieldName="displayName"
							value={user.displayName ?? ''}
							inputLabel="Name"
							_intent="updateDisplayName"
						/>
					</div>
					<div className="font-bold border-r-2 border-r-secondary border-b-2 border-b-secondary p-4">
						Email
					</div>
					<div className="border-b-2 border-b-secondary p-4">
						<EditableText
							fieldName="email"
							value={user.email}
							inputLabel="Email"
							_intent="updateEmail"
						/>
					</div>
				</div>
				<pre>{JSON.stringify(user, null, 2)}</pre>
			</PageContent>
		</>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (error instanceof Error) {
		return <div>An unexpected error occurred: {error.message}</div>;
	}

	if (!isRouteErrorResponse(error)) {
		return <h1>Unknown Error</h1>;
	}

	if (error.status === 404) {
		return <div>User not found</div>;
	}

	return <div>An unexpected error occurred: {error.statusText}</div>;
}
