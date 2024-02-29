import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { type MetaFunction } from '@remix-run/react';

import {
	getCompletedRounds,
	getFairwaysHitTrend,
	getGirTrend,
	getRoundsPlayedMonthTrend,
} from '~/api/round.server';
import { requireUserId } from '~/session.server';
import { Dashboard } from './dashboard';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);
	const date = new Date();
	const month = date.getMonth();
	const year = date.getFullYear();

	const [rounds, roundsPlayedTrend, fairwaysHitTrend, girTrend] =
		await Promise.all([
			getCompletedRounds({ userId, take: 5 }),
			getRoundsPlayedMonthTrend({ userId, month, year }),
			getFairwaysHitTrend({ userId, month, year }),
			getGirTrend({ userId, month, year }),
		]);

	return json({ rounds, roundsPlayedTrend, fairwaysHitTrend, girTrend });
};

export type Loader = typeof loader;

export const meta: MetaFunction = () => [{ title: 'Dashboard' }];

export default function Index() {
	return <Dashboard />;
}
