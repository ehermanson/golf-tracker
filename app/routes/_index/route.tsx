import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { type MetaFunction } from '@remix-run/react';

import { getCompletedRounds } from '~/api/round.server';
import { requireUserId } from '~/session.server';
import { Dashboard } from './dashboard';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);
	const rounds = await getCompletedRounds({ userId, take: 5 });
	return json({ rounds });
};

export type Loader = typeof loader;

export const meta: MetaFunction = () => [{ title: 'Dashboard' }];

export default function Index() {
	return <Dashboard />;
}
