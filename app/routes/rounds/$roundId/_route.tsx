import { ResponsivePie } from '@nivo/pie';
import invariant from 'tiny-invariant';

import { type Prisma } from '@prisma/client';

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
	isRouteErrorResponse,
	Link,
	useLoaderData,
	useRouteError,
} from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Heading } from '~/components/ui/heading';

import { getRoundWithStats } from '~/api/round.server';
import {
	calculateScoreDifferential,
	cn,
	formatDate,
	formatScoreToPar,
} from '~/utils';
import { ScoreCard } from './scorecard';

export type RoundWithStats = Prisma.PromiseReturnType<typeof getRoundWithStats>;

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariant(params.roundId, 'Round not found');
	const round = await getRoundWithStats({ id: params.roundId });
	if (!round) {
		throw new Response('Not Found', { status: 404 });
	}
	return json({ round });
};

export type LoaderType = typeof loader;

const createScoreDistribution = (round: RoundWithStats) => {
	const scoreDistribution = {
		eagles: 0,
		birdies: 0,
		pars: 0,
		bogeys: 0,
		dblBogeys: 0,
		tripBogeys: 0,
		veryBad: 0,
	};

	if (!round) {
		return scoreDistribution;
	}

	for (const hole of round.holeByHole) {
		if (!hole.stats?.score) {
			continue;
		}

		const scoreDiff = hole.stats.score - hole.par;
		switch (true) {
			case scoreDiff === -2:
				scoreDistribution.eagles++;
				break;
			case scoreDiff === -1:
				scoreDistribution.birdies++;
				break;
			case scoreDiff === 0:
				scoreDistribution.pars++;
				break;
			case scoreDiff === 1:
				scoreDistribution.bogeys++;
				break;
			case scoreDiff === 2:
				scoreDistribution.dblBogeys++;
				break;
			case scoreDiff === 3:
				scoreDistribution.tripBogeys++;
				break;
			case scoreDiff > 3:
				scoreDistribution.veryBad++;
				break;
		}
	}

	return scoreDistribution;
};

const getScoringAverages = (round: NonNullable<RoundWithStats>) => {
	const averages: Record<string, string> = {};

	[3, 4, 5].forEach(par => {
		const holes = round.holeByHole.filter(hole => hole.par === par);
		const total = holes.reduce(
			(tot, curr) => tot + (curr.stats?.score ?? 0),
			0,
		);
		const avg = total / holes.length;
		averages[par] = (Math.round(avg * 10) / 10).toFixed(1);
	});

	return averages;
};

export default function RoundDetailPage() {
	const { round } = useLoaderData<typeof loader>();

	const toPar = round.totalScore
		? formatScoreToPar({
				par: round.course.par,
				score: round.totalScore,
		  })
		: '--';

	let scoreDifferential = '--';
	if (round.totalScore) {
		scoreDifferential = calculateScoreDifferential({
			score: round.totalScore,
			rating: Number(round.tees.rating),
			slope: Number(round.tees.slope),
		});
	}

	const accuracyDirection = ['left', 'hit', 'right', 'long', 'short'] as const;
	type Direction = (typeof accuracyDirection)[number];

	const getAccuracyStats = ({
		stat,
		direction,
		holeCount,
	}: {
		stat: 'approach' | 'drive';
		direction: Direction;
		holeCount: number;
	}) => {
		const filtered = round.holeStats.filter(s => s[stat] === direction);
		const percentage = ((filtered.length / holeCount) * 100).toFixed(1);

		return { count: filtered.length, percentage };
	};

	const approachStats = accuracyDirection.reduce(
		(acc, dir) => {
			acc[dir] = getAccuracyStats({
				stat: 'approach',
				direction: dir,
				holeCount: round.numberOfHoles,
			});
			return acc;
		},
		{} as Record<string, { count: number; percentage: string }>,
	);

	const possibleFairways = round.course.holes.filter(hole => hole.par > 3);
	const drivingStats = accuracyDirection.reduce(
		(acc, dir) => {
			acc[dir] = getAccuracyStats({
				stat: 'drive',
				direction: dir,
				holeCount: possibleFairways.length,
			});
			return acc;
		},
		{} as Record<string, { count: number; percentage: string }>,
	);

	// @ts-ignore - whatever
	const scoreDistribution = createScoreDistribution(round);

	const upAndDowns = round.holeStats.filter(stat => stat.upAndDown);
	const sandSaves = round.holeStats.filter(stat => stat.sandSave);

	const threePutts = round.holeStats.filter(
		stat => stat.putts && stat.putts >= 3,
	);

	// @ts-ignore - whatever
	const scoringAverages = getScoringAverages(round);

	const scoreDistributionChart = Object.entries(scoreDistribution)
		.map(([id, value]) => ({
			id,
			label: id,
			value,
		}))
		.filter(d => d.value > 0);

	const driveChartData = Object.entries(drivingStats)
		.map(([id, value]) => ({
			id,
			label: id,
			value: value.count,
			percent: value.percentage,
		}))
		// long and short kinda dumb for drives
		.filter(d => d.id !== 'short' && d.id !== 'long');

	const approachChartData = Object.entries(approachStats).map(
		([id, value]) => ({
			id,
			label: id,
			value: value.count,
			percent: value.percentage,
		}),
	);

	return (
		<div>
			<div className="flex items-start">
				<div>
					<Heading is="h3">
						{formatDate({ date: round.datePlayed })} -{' '}
						{round.totalScore ?? '--'} ({toPar})
					</Heading>
					<div className="my-2">
						<Link
							to={`../../courses/${round.courseId}`}
							className="italic text-gray-500"
						>
							@{round.course.name}
						</Link>
					</div>

					<div className="my-2 flex gap-2">
						<span className="font-bold">Score Differential:</span>
						{scoreDifferential}
					</div>

					<RoundMeta />
				</div>
				<div className="flex items-center gap-2 ml-auto">
					<Button asChild>
						<Link to="edit" className="block" unstable_viewTransition>
							Edit Round
						</Link>
					</Button>
				</div>
			</div>
			<hr className="my-4" />
			<div className="grid grid-cols-4 gap-2">
				<Card className="col-span-2 row-span-2">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-bold">
							Score Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-96 mb-8 font-bold">
							<ResponsivePie
								data={scoreDistributionChart}
								innerRadius={0.5}
								padAngle={0.7}
								cornerRadius={1}
								activeOuterRadiusOffset={0}
								animate={false}
								colors={{ scheme: 'blues' }}
								borderWidth={1}
								borderColor={{
									from: 'color',
									modifiers: [['darker', 0.5]],
								}}
								arcLabel={e =>
									`${e.id} - ${((e.data.value / 18) * 100).toFixed(1)}%`
								}
								enableArcLinkLabels={false}
								layers={[
									'arcs',
									'arcLabels',
									// @ts-ignore
									CenteredMetric,
								]}
							/>
						</div>
						<CardTitle className="text-sm font-bold mb-2">
							Scoring Averages
						</CardTitle>
						<div className="flex gap-2 justify-between">
							{Object.entries(scoringAverages).map(([key, val]) => {
								return (
									<div className="flex gap-2" key={key}>
										<div className="text-muted-foreground">Par {key}s:</div>
										<div className="font-bold">{val}</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
				{round.totalFairways ? (
					<QuickStat
						className="col-span-2"
						title="Driving Accuracy"
						stat={
							<>
								{round.totalFairways}/{possibleFairways.length}
								<span className="text-lg ml-2">fairways</span>
							</>
						}
						subStat={
							<div className="h-40">
								<ResponsivePie
									data={driveChartData}
									startAngle={-90}
									endAngle={90}
									innerRadius={0.45}
									padAngle={1}
									cornerRadius={1}
									activeOuterRadiusOffset={0}
									animate={false}
									colors={{ scheme: 'blues' }}
									borderWidth={1}
									borderColor={{
										from: 'color',
										modifiers: [['darker', 0.5]],
									}}
									arcLabel={e => `${e.id} - ${e.data.percent}%`}
									enableArcLinkLabels={false}
								/>
							</div>
						}
					/>
				) : null}

				{round.totalGir ? (
					<QuickStat
						className="col-span-2"
						title="Approach Accuracy"
						stat={
							<>
								{approachStats.hit.count}/{round.numberOfHoles}
								<span className="text-lg ml-2">GIR</span>
							</>
						}
						subStat={
							<div className="h-40">
								<ResponsivePie
									data={approachChartData}
									startAngle={-90}
									endAngle={90}
									innerRadius={0.45}
									padAngle={0.7}
									cornerRadius={1}
									activeOuterRadiusOffset={0}
									animate={false}
									colors={{ scheme: 'blues' }}
									borderWidth={1}
									borderColor={{
										from: 'color',
										modifiers: [['darker', 0.5]],
									}}
									arcLabel={e => `${e.id} - ${e.data.percent}%`}
									enableArcLinkLabels={false}
								/>
							</div>
						}
					/>
				) : null}
				{round.totalPutts ? (
					<QuickStat
						title="Putting"
						className="col-span-2"
						stat={
							<>
								{round.totalPutts}
								<span className="text-lg ml-2">total putts</span>
							</>
						}
						subStat={
							<div>
								{round.puttsPerHole} per hole
								<div
									className={cn('text-xs mt-1', {
										'text-red-700': threePutts.length > 1,
										'text-green-700': threePutts.length === 0,
									})}
								>
									{threePutts.length} three-putt
									{threePutts.length === 1 ? null : 's'} or worse
								</div>
							</div>
						}
					/>
				) : null}
				<QuickStat
					title="Up and Downs"
					stat={upAndDowns.length}
					subStat={`${upAndDowns
						.map(({ holeNumber }) => `Hole ${holeNumber}`)
						.join(', ')}`}
				/>
				<QuickStat
					title="Sand Saves"
					stat={sandSaves.length}
					subStat={`${sandSaves
						.map(({ holeNumber }) => `Hole ${holeNumber}`)
						.join(', ')}`}
				/>
			</div>
			<hr className="my-4" />
			<ScoreCard />
		</div>
	);
}

const CenteredMetric = ({
	dataWithArc,
	centerX,
	centerY,
	...props
}: {
	dataWithArc: {
		id: string;
		value: number;
	}[];
	centerX: number;
	centerY: number;
}) => {
	const parsOrBetter = dataWithArc.filter(
		data => data.id === 'pars' || data.id === 'birdies' || data.id === 'eagles',
	);

	const total = parsOrBetter.reduce((tot, curr) => {
		return tot + curr.value;
	}, 0);

	return (
		<text
			x={centerX}
			y={centerY}
			textAnchor="middle"
			dominantBaseline="central"
			style={{
				fontSize: '20px',
				fontWeight: 600,
			}}
		>
			<tspan x={centerX} y={centerY - 20}>
				{total} ({((total / 18) * 100).toFixed(1)}%)
			</tspan>
			<tspan x={centerX} y={centerY}>
				pars or better
			</tspan>
		</text>
	);
};

const QuickStat = ({
	title,
	stat,
	subStat,
	className,
}: {
	title: string;
	stat: React.ReactNode;
	subStat?: React.ReactNode;
	className?: string;
}) => {
	return (
		<Card className={className}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-bold">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-bold">{stat}</div>
				<div className="text-lg text-muted-foreground font-semibold">
					{subStat}
				</div>
			</CardContent>
		</Card>
	);
};

export const RoundMeta = () => {
	const { round } = useLoaderData<typeof loader>();

	return (
		<>
			<div className="flex items-center gap-2 text-sm mb-1">
				<div>
					<span className="font-bold mr-1">Played:</span>
					{formatDate({ date: round.datePlayed })}
				</div>
				<div>
					<span className="font-bold mr-1">Created:</span>
					{formatDate({ date: round.createdAt })}
				</div>
				<div>
					<span className="font-bold mr-1">Updated:</span>
					{formatDate({ date: round.updatedAt })}
				</div>
			</div>
			<div className="flex items-center gap-2 text-sm">
				<div>
					<span className="font-bold mr-1">Tees:</span>
					{round.tees.name}
				</div>
				<div>
					<span className="font-bold mr-1">Yardage:</span>
					{round.tees.yardage}
				</div>
				<div>
					<span className="font-bold mr-1">Slope:</span> {round.tees.slope}
				</div>
				<div>
					<span className="font-bold mr-1">Rating:</span>
					{round.tees.rating ? parseFloat(round.tees.rating).toFixed(1) : '--'}
				</div>
			</div>
		</>
	);
};

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
