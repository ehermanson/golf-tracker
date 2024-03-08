import {
	SettingsIcon,
	TrendingDown,
	Equal as TrendingNeutral,
	TrendingUp,
} from 'lucide-react';
import { ClientOnly } from 'remix-utils/client-only';
import { type ReactNode } from 'react';

import { useLoaderData } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';

import { PageHeader } from '~/components/page';
import { PieChart } from '~/components/pie-chart.client';
import { Score, ScoreToPar } from '~/components/score-display';
import { calculateScoreDifferential, cn, formatDate } from '~/utils';
import { type Loader } from './route';

export function Dashboard() {
	const {
		rounds,
		roundsPlayedTrend,
		fairwaysHitTrend,
		girTrend,
		scoreDistribution,
	} = useLoaderData<Loader>();

	type ChartData = {
		id: string;
		label: string;
		value: number;
	};

	const { chartData, holesWithScores } = Object.entries(
		scoreDistribution,
	).reduce(
		(acc, [id, value]) => {
			// Accumulate total # of holes w/ scores
			acc.holesWithScores += value;
			if (value !== 0) {
				acc.chartData.push({
					id,
					label: id,
					value,
				});
			}

			return acc;
		},
		{ chartData: [] as ChartData[], holesWithScores: 0 },
	);

	return (
		<main>
			<PageHeader
				title="Dashboard"
				action={
					<Button variant="outline">
						<SettingsIcon className="opacity-60 mr-1 h-4 w-4" />
						Customize Dashboard
					</Button>
				}
			/>
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-[2vw] p-10">
				{/* <QuickStat
					title="Handicap"
					stat="5.2"
					trend="-0.8 since last month"
					trendDirection="positive"
				/> */}
				<QuickStat
					title="Rounds Played"
					stat={`${rounds.length}`}
					trend={getRoundsPlayedTrendText(roundsPlayedTrend)}
					trendDirection={getTrendDirection(roundsPlayedTrend)}
				/>
				<QuickStat
					title="Fairways Hit"
					stat={`${formatPercent(fairwaysHitTrend.currentPercent)}`}
					trend={getPercentageDiffText(fairwaysHitTrend.diff)}
					trendDirection={getTrendDirection(fairwaysHitTrend.diff)}
				/>
				<QuickStat
					title="GIR"
					stat={`${formatPercent(girTrend.currentPercent)}`}
					trend={getPercentageDiffText(girTrend.diff)}
					trendDirection={getTrendDirection(girTrend.diff)}
				/>
				<QuickStat
					title="% Par or Better"
					stat="60%"
					trend="+5% since last month"
					trendDirection="positive"
				/>
				<div className="col-span-2">
					<DashboardCard
						title="Recent Rounds"
						description="Your latest 5 rounds"
					>
						{rounds.map(round => {
							return <RoundRow key={round.id} round={round} />;
						})}
					</DashboardCard>
				</div>
				<div className="col-span-2">
					<DashboardCard
						title="Score Distribution"
						description={`Based on ${holesWithScores} holes`}
					>
						<ClientOnly>
							{() => (
								<div className="h-96 mb-8 font-bold">
									<PieChart
										data={chartData}
										arcLabel={e =>
											`${e.id} - ${((e.value / holesWithScores) * 100).toFixed(
												1,
											)}%`
										}
										layers={[
											'arcs',
											'arcLabels',
											// @ts-ignore
											CenteredMetric,
										]}
									/>
								</div>
							)}
						</ClientOnly>
					</DashboardCard>
				</div>
				<div className="col-span-2">
					<DashboardCard
						title="Short Game"
						description="Putts per round, up and downs, sand saves"
					>
						Chart
					</DashboardCard>
				</div>
				<div className="col-span-2">
					<DashboardCard title="Accuracy" description="Driving Accuracy, GIR">
						Chart
					</DashboardCard>
				</div>
				<div className="col-span-2">
					<DashboardCard
						title="Top Courses"
						description="Courses you've played the most i guess?"
					>
						Chart
					</DashboardCard>
				</div>
			</div>
		</main>
	);
}

function getTrendDirection(value: number): QuickStatProps['trendDirection'] {
	if (value > 0) {
		return 'positive';
	}
	if (value < 0) {
		return 'negative';
	}
	return 'neutral';
}

interface QuickStatProps {
	title: string;
	stat: string | number;
	trend: string;
	trendDirection: 'positive' | 'negative' | 'neutral';
}

const QuickStat = ({ title, stat, trend, trendDirection }: QuickStatProps) => {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<div
					className={cn('h-4 w-4 ', {
						'text-green-600': trendDirection === 'positive',
						'text-red-600': trendDirection === 'negative',
						'text-gray-600': trendDirection === 'neutral',
					})}
				>
					{trendDirection === 'positive' && <TrendingUp />}
					{trendDirection === 'negative' && <TrendingDown />}
					{trendDirection === 'neutral' && <TrendingNeutral />}
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{stat}</div>
				<p className="text-xs text-muted-foreground">{trend}</p>
			</CardContent>
		</Card>
	);
};

const formatPercent = (percentage: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'percent',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(percentage);
};

const getPercentageDiffText = (percentage: number) => {
	if (percentage === 0) {
		return 'Same as last month';
	}
	let symbol = '';
	if (percentage > 0) {
		symbol = '+';
	}
	if (percentage < 0) {
		symbol = '';
	}
	return `${symbol}${formatPercent(percentage)} since last month`;
};

const getRoundsPlayedTrendText = (value: number) => {
	if (value === 0) {
		return 'Same as last month';
	}
	let symbol = '';
	if (value > 0) {
		symbol = '+';
	}
	return `${symbol}${value} since last month`;
};

interface DashboardCardProps {
	title: string;
	description: string;
	children: ReactNode;
}

const DashboardCard = ({
	title,
	description,
	children,
}: DashboardCardProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
};

const RoundRow = ({ round }: { round: any }) => {
	const score = {
		score: round.totalScore,
		par: round.course.par,
	};
	return (
		<div className="flex justify-between items-center py-2 [&:not(:first-child)]:border-t-2">
			<div>
				<div className="font-bold mb-1">
					{formatDate({ date: String(round.datePlayed) })}
				</div>
				<div className="text-muted-foreground text-xs">
					@{round.course.name}
				</div>
			</div>
			<div className="text-right">
				<div className="font-black flex align-baseline leading-none gap-1 mb-1">
					<Score {...score} />
					<ScoreToPar {...score} wrap className="text-sm" />
				</div>
				<div className="text-muted-foreground italic text-xs">
					Diff:{' '}
					{calculateScoreDifferential({
						score: round.totalScore,
						rating: round.tees.rating,
						slope: round.tees.slope,
					})}
				</div>
			</div>
		</div>
	);
};
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
	const totalScores = Object.values(dataWithArc).reduce(
		(tot, cur) => tot + cur.value,
		0,
	);

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
				{total} ({((total / totalScores) * 100).toFixed(1)}%)
			</tspan>
			<tspan x={centerX} y={centerY}>
				pars or better
			</tspan>
		</text>
	);
};
