import { getToast, jsonWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node';
import {
	Form,
	isRouteErrorResponse,
	Link,
	useLoaderData,
	useRouteError,
} from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';

import { deleteRound, getRoundWithStats, updateStat } from '~/api/round.server';
import { formatDate, formatScoreToPar } from '~/utils';
import { RoundMeta } from '../$roundId/_route';
import { StatAccuracy } from './stat-accuracy';
import { StatInput } from './stat-input';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	invariant(params.roundId, 'Round not found');
	const { toast, headers } = await getToast(request);
	const round = await getRoundWithStats({ id: params.roundId });
	if (!round) {
		throw new Response('Not Found', { status: 404 });
	}
	return json({ round, toast }, { headers });
};

export type Loader = typeof loader;

export const action = async ({ request, params }: ActionFunctionArgs) => {
	invariant(params.roundId, 'Round not found');

	const roundId = params.roundId;
	const formData = await request.formData();
	const intent = formData.get('_intent');

	const holeNumber = Number(formData.get('holeNumber'));
	const holeId = String(formData.get('holeId'));

	switch (intent) {
		case 'updateScore': {
			const score = Number(formData.get('score'));

			await updateStat({
				roundId,
				holeNumber,
				holeId,
				name: 'score',
				value: score,
			});

			return jsonWithSuccess({}, 'Score updated!');
		}

		case 'updateDriveAccuracy': {
			const result = String(formData.get('drive'));

			await updateStat({
				roundId,
				holeNumber,
				holeId,
				name: 'drive',
				value: result,
			});

			return jsonWithSuccess({}, 'Driving accuracy updated!');
		}

		case 'updateApproachAccuracy': {
			const result = String(formData.get('approach'));

			await updateStat({
				roundId,
				holeNumber,
				holeId,
				name: 'approach',
				value: result,
			});

			return jsonWithSuccess({}, 'Driving accuracy updated!');
		}

		case 'updatePutts': {
			const putts = Number(formData.get('putts'));
			await updateStat({
				roundId,
				holeNumber,
				holeId,
				name: 'putts',
				value: putts,
			});

			return jsonWithSuccess({}, 'Putts updated');
		}

		case 'updateChipShots': {
			const chipShots = Number(formData.get('chipShots'));
			await updateStat({
				roundId,
				holeNumber,
				holeId,
				name: 'chipShots',
				value: chipShots,
			});

			return jsonWithSuccess({}, 'Chip shots updated');
		}
		case 'updateSandShots': {
			const sandShots = Number(formData.get('sandShots'));
			await updateStat({
				roundId,
				holeNumber,
				holeId,
				name: 'sandShots',
				value: sandShots,
			});

			return jsonWithSuccess({}, 'Sand shots updated');
		}

		case 'updateNote': {
			const note = String(formData.get('note'));
			await updateStat({
				roundId,
				holeNumber,
				holeId,
				name: 'note',
				value: note,
			});

			return jsonWithSuccess({}, 'Note updated');
		}

		case 'deleteRound': {
			await deleteRound({ id: params.roundId });
			return redirect('/rounds');
		}
	}

	return json({});
};

export default function RoundDetailPage() {
	const { round } = useLoaderData<typeof loader>();

	console.log({ round });

	const toPar = round.totalScore
		? formatScoreToPar({
				par: round.course.par,
				score: round.totalScore,
		  })
		: '--';

	return (
		<div>
			<div className="flex items-start">
				<div>
					<Heading is="h3">
						{formatDate({ date: round.datePlayed })} -{' '}
						{round.totalScore ?? '--'} ({toPar})
					</Heading>

					<div className="mb-1">
						<Link
							to={`../../courses/${round.courseId}`}
							className="italic text-gray-500"
						>
							@{round.course.name}
						</Link>
					</div>
					<RoundMeta />
				</div>
				<div className="flex items-center gap-2 ml-auto">
					<Button asChild variant="outline">
						<Link
							to=".."
							relative="path"
							className="block"
							unstable_viewTransition
						>
							Done
						</Link>
					</Button>
					<Form
						method="post"
						onSubmit={event => {
							if (!confirm('Are you sure you want to delete this round?')) {
								event.preventDefault();
							}
						}}
					>
						<Button
							type="submit"
							name="_intent"
							value="deleteRound"
							variant="destructive"
						>
							Delete Round
						</Button>
					</Form>
				</div>
			</div>

			<hr className="my-4" />
			{round.course.holes.map(hole => {
				const teeForHole = round.tees.teeForHole.find(
					tee => tee.holeId === hole.id,
				);

				return (
					<div
						key={hole.id}
						className="flex gap-4 p-2 border-2 mb-4 rounded-lg items-start"
					>
						<div className="rounded-xl bg-muted px-3 text-center aspect-square flex items-center justify-center flex-col shrink-0">
							<div className="text-xl font-bold leading-none">
								{hole.number}
							</div>
							<div className="text-xs">Par {hole.par}</div>
							<div className="text-xs">{teeForHole?.yardage} yds</div>
						</div>
						<input type="hidden" name="holeId" value={hole.id} />
						<StatInput
							name="score"
							label="Score"
							intent="updateScore"
							hole={hole}
							min={1}
						/>
						<StatAccuracy
							name="drive"
							hole={hole}
							label="Fairway"
							intent="updateDriveAccuracy"
							disabled={hole.par === 3}
						/>
						<StatAccuracy
							name="approach"
							hole={hole}
							label="GIR"
							intent="updateApproachAccuracy"
						/>
						<StatInput
							label="Putts"
							name="putts"
							intent="updatePutts"
							hole={hole}
						/>
						<StatInput
							label="Chips"
							name="chipShots"
							intent="updateChipShots"
							hole={hole}
						/>
						<StatInput
							label="Sand Shots"
							name="sandShots"
							intent="updateSandShots"
							hole={hole}
						/>
						<StatInput
							type="text"
							label="Note"
							name="note"
							intent="updateNote"
							hole={hole}
							className="flex-shrink-0 flex-grow-[2]"
						/>
					</div>
				);
			})}
		</div>
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
		return <div>Round not found</div>;
	}

	return <div>An unexpected error occurred: {error.statusText}</div>;
}
