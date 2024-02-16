import invariant from 'tiny-invariant';

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
	isRouteErrorResponse,
	useRouteError,
	type MetaFunction,
} from '@remix-run/react';

import { PageContent, PageHeader } from '~/components/page';
import { requireUser } from '~/session.server';

export const meta: MetaFunction = () => [{ title: 'Stats' }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireUser(request);
	invariant(user, 'User not found');

	return json({ user });
};

export default function StatsPage() {
	return (
		<>
			<PageHeader title="Stats" />
			<PageContent>
				Lots of stats with lots of filters and all that.
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
