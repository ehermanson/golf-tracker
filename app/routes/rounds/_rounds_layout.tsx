import { Plus } from 'lucide-react';

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, type MetaFunction } from '@remix-run/react';

import { Button } from '~/components/ui/button';

import { getRounds } from '~/api/round.server';
import {
	PageHeader,
	PageSidebar,
	PageSidebarLink,
	PageSideBarLinks,
	PageWrapper,
} from '~/components/page';
import { Score, ScoreToPar } from '~/components/score-display';
import { requireUserId } from '~/session.server';
import { calculateScoreDifferential, formatDate } from '~/utils';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);
	const rounds = await getRounds({ userId });
	return json({ rounds });
};

export const meta: MetaFunction = () => [{ title: 'Rounds' }];

export default function RoundsPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<>
			<PageHeader
				title="Rounds"
				action={
					<Button asChild>
						<Link to="new">
							<Plus className="mr-1" /> New Round
						</Link>
					</Button>
				}
			/>
			<PageWrapper>
				<PageSidebar>
					{data.rounds.length === 0 ? (
						<p className="p-4">No Rounds Added Yet</p>
					) : (
						<PageSideBarLinks>
							{data.rounds.map(round => {
								return (
									<li key={round.id}>
										<PageSidebarLink to={round.id} prefetch="intent">
											<div className="flex justify-between items-center">
												<div>
													<div className="font-bold text-lg">
														{formatDate({ date: round.datePlayed })}
													</div>
													<div className="text-xs italic">
														{round.course.name}
													</div>
												</div>
												<div className="text-right">
													{round.totalScore ? (
														<>
															<div className="font-black flex align-baseline leading-none gap-1 mb-1">
																<Score
																	score={round.totalScore}
																	par={round.course.par}
																/>
																<ScoreToPar
																	score={round.totalScore}
																	par={round.course.par}
																	wrap
																	className="text-sm"
																/>
															</div>
															<div className="text-muted-foreground italic text-xs">
																Diff:{' '}
																{calculateScoreDifferential({
																	score: round.totalScore,
																	rating: Number(round.tees.rating),
																	slope: Number(round.tees.slope),
																})}
															</div>
														</>
													) : (
														'--'
													)}
												</div>
											</div>
										</PageSidebarLink>
									</li>
								);
							})}
						</PageSideBarLinks>
					)}
				</PageSidebar>
			</PageWrapper>
		</>
	);
}
