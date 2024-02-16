import invariant from 'tiny-invariant';

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
	isRouteErrorResponse,
	Link,
	useRouteError,
	type MetaFunction,
} from '@remix-run/react';

import { PageContent, PageHeader } from '~/components/page';
import { requireUser } from '~/session.server';

export const meta: MetaFunction = () => [{ title: 'Stat Builder' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireUser(request);
	invariant(user, 'User not found');

	return json({ user });
};

export default function StatBuilderPage() {
	return (
		<>
			<PageHeader title="Stat Builder" />
			<PageContent>
				Some UI to create custom stats to track, which then appear in{' '}
				<Link to="../stats" className="underline font-bold">
					stats
				</Link>
				.
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
		return <div>Not found</div>;
	}

	return <div>An unexpected error occurred: {error.statusText}</div>;
}
