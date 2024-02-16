import {
	ArrowBigDown,
	ArrowBigLeft,
	ArrowBigRight,
	ArrowBigUp,
	StickyNote,
	Target,
} from 'lucide-react';

import { useLoaderData } from '@remix-run/react';

import { Heading } from '~/components/ui/heading';
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip';

import { Score, ScoreToPar } from '~/components/score-display';
import { cn } from '~/utils';
import { type LoaderType, type RoundWithStats } from './_route';

type RoundWithHoleByHole = NonNullable<RoundWithStats>;

type HolesWithStats = RoundWithHoleByHole['holeByHole'];

const getNineHoleData = (holes: HolesWithStats) => {
	const par = holes.reduce((tot, { par }) => tot + par, 0);
	const score = holes.reduce((tot, { stats }) => {
		return stats?.score ? tot + stats.score : tot;
	}, 0);

	const yardage = holes.reduce((tot, { yardage }) => tot + yardage, 0);

	const expectedHoles = holes.length;
	const holesWithScores = holes.filter(hole => hole.stats?.score).length;

	const completeRound = expectedHoles === holesWithScores;

	return { par, score, yardage, completeRound };
};

export function ScoreCard() {
	const { round } = useLoaderData<LoaderType>();

	const frontNine = [...round.holeByHole].slice(0, 9) as HolesWithStats;
	const backNine = [...round.holeByHole].slice(9, 18) as HolesWithStats;

	return (
		<>
			<Heading is="h3" className="mb-2">
				Front Nine:
			</Heading>
			{/* @ts-ignore - whatever */}
			<NineHoleCard side="front" holes={frontNine} fullRound={round} />
			<Heading is="h3" className="mb-2">
				Back Nine:
			</Heading>
			{/* @ts-ignore - whatever */}
			<NineHoleCard side="back" holes={backNine} fullRound={round} />
		</>
	);
}

const icons = {
	long: <ArrowBigUp />,
	left: <ArrowBigLeft />,
	right: <ArrowBigRight />,
	short: <ArrowBigDown />,
	hit: <Target />,
};

const NineHoleCard = ({
	holes,
	fullRound,
	side,
}: {
	holes: HolesWithStats;
	side: 'front' | 'back';
	includeTotals?: boolean;
	fullRound: RoundWithHoleByHole;
}) => {
	const { par, score, yardage, completeRound } = getNineHoleData(holes);
	const direction = side === 'front' ? 'OUT' : 'IN';
	const includeTotals = side === 'back';

	return (
		<Table className="text-xs mb-4">
			<TableHeader className="text-center">
				<TableRow className="bg-muted font-bold">
					<TableHead>Hole</TableHead>
					{holes.map(hole => {
						return (
							<TableHead key={hole.id} className="text-center relative">
								{hole.number}
								{hole.stats?.note && (
									<Tooltip>
										<TooltipTrigger>
											<StickyNote className="ml-1 h-3 w-3 absolute top-2 right-3" />
										</TooltipTrigger>
										<TooltipContent className="p-3">
											{hole.stats.note}
										</TooltipContent>
									</Tooltip>
								)}
							</TableHead>
						);
					})}
					<TableHead className="text-center">{direction}</TableHead>
					{includeTotals && <TableHead className="text-center">TOT</TableHead>}
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow className="text-muted-foreground">
					<TableCell>Yards</TableCell>
					{holes.map(hole => {
						return (
							<TableCell className="text-center" key={hole.id}>
								{hole.yardage}
							</TableCell>
						);
					})}
					<TableCell className="bg-muted font-bold text-center">
						{yardage}
					</TableCell>
					{includeTotals && (
						<TableCell className="bg-muted/50 font-bold text-center text-primary">
							{fullRound.tees.yardage}
						</TableCell>
					)}
				</TableRow>
				<TableRow className="text-muted-foreground">
					<TableCell>Index</TableCell>
					{holes.map(hole => {
						return (
							<TableCell className="text-center" key={hole.id}>
								{hole.strokeIndex}
							</TableCell>
						);
					})}
					<TableCell className="bg-muted font-bold text-center">--</TableCell>
					{includeTotals && (
						<TableCell className="bg-muted/50 font-bold text-center text-primary">
							--
						</TableCell>
					)}
				</TableRow>
				<TableRow className="text-muted-foreground">
					<TableCell>Par</TableCell>
					{holes.map(hole => {
						return (
							<TableCell className="text-center" key={hole.id}>
								{hole.par}
							</TableCell>
						);
					})}
					<TableCell className="bg-muted font-bold text-center">
						{par}
					</TableCell>
					{includeTotals && (
						<TableCell className="bg-muted/50 font-bold text-center text-primary">
							{fullRound.course.par}
						</TableCell>
					)}
				</TableRow>
				<TableRow>
					<TableCell className="text-muted-foreground">Score</TableCell>
					{holes.map(hole => {
						return (
							<TableCell className="text-center" key={hole.id}>
								{hole.stats?.score ? (
									<div
										className={cn(
											'font-bold inline-flex items-center justify-center w-6 h-6',
											{
												[getScoreFormatting(hole.par, hole.stats.score)]:
													hole.stats.score,
											},
										)}
									>
										{hole.stats.score}
									</div>
								) : (
									<div>--</div>
								)}
							</TableCell>
						);
					})}
					<TableCell className="bg-muted  text-center">
						{completeRound ? (
							<Score par={par} score={score} className="font-black" />
						) : (
							'--'
						)}
					</TableCell>
					{includeTotals && (
						<TableCell className="bg-muted/50 font-bold text-center text-primary">
							{fullRound.totalScore ? (
								<Score
									par={fullRound.course.par}
									score={fullRound.totalScore}
									className="font-black"
								/>
							) : (
								'--'
							)}
						</TableCell>
					)}
				</TableRow>
				<TableRow>
					<TableCell className="text-muted-foreground">Putts</TableCell>
					{holes.map(hole => {
						return (
							<TableCell className="text-center" key={hole.id}>
								{hole.stats?.putts ? (
									<div
										className={cn(
											'font-bold inline-flex items-center justify-center w-6 h-6',
										)}
									>
										{hole.stats.putts}
									</div>
								) : (
									<div>--</div>
								)}
							</TableCell>
						);
					})}
					<TableCell className="bg-muted text-center">
						{holes.reduce((tot, curr) => tot + (curr.stats?.putts ?? 0), 0)}
					</TableCell>
					{includeTotals && (
						<TableCell className="bg-muted/50 font-bold text-center text-primary">
							{fullRound.totalPutts ? fullRound.totalPutts : '--'}
						</TableCell>
					)}
				</TableRow>
				<TableRow>
					<TableCell className="text-muted-foreground">
						Driving Accuracy
					</TableCell>
					{holes.map(hole => {
						return (
							<TableCell className="text-center" key={hole.id}>
								{hole.stats?.drive ? (
									<div
										className={cn(
											'font-bold inline-flex items-center justify-center w-6 h-6',
										)}
									>
										{icons[hole.stats.drive]}
									</div>
								) : (
									<div>--</div>
								)}
							</TableCell>
						);
					})}
					<TableCell className="bg-muted text-center">
						{
							holes.filter(hole => {
								return hole.stats?.drive === 'hit';
							}).length
						}{' '}
						/ 9
					</TableCell>
					{includeTotals && (
						<TableCell className="bg-muted/50 font-bold text-center text-primary">
							{
								fullRound.holeByHole.filter(hole => {
									return hole.stats?.drive === 'hit';
								}).length
							}{' '}
							/ 18
						</TableCell>
					)}
				</TableRow>
				<TableRow>
					<TableCell className="text-muted-foreground">
						Approach Accuracy
					</TableCell>
					{holes.map(hole => {
						return (
							<TableCell className="text-center" key={hole.id}>
								{hole.stats?.approach ? (
									<div
										className={cn(
											'font-bold inline-flex items-center justify-center w-6 h-6',
										)}
									>
										{icons[hole.stats.approach]}
									</div>
								) : (
									<div>--</div>
								)}
							</TableCell>
						);
					})}
					<TableCell className="bg-muted text-center">
						{
							holes.filter(hole => {
								return hole.stats?.approach === 'hit';
							}).length
						}{' '}
						/ 9
					</TableCell>
					{includeTotals && (
						<TableCell className="bg-muted/50 font-bold text-center text-primary">
							{
								fullRound.holeByHole.filter(hole => {
									return hole.stats?.approach === 'hit';
								}).length
							}{' '}
							/ 18
						</TableCell>
					)}
				</TableRow>
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell className="text-muted-foreground">Status</TableCell>
					{holes.map(({ stats, ...hole }) => {
						const holesSoFar = [...fullRound.holeByHole]?.slice(0, hole.number);

						const parSoFar = holesSoFar?.reduce(
							(tot, currHole) => tot + currHole.par,
							0,
						);

						const scoreSoFar = holesSoFar?.reduce((tot, currHole) => {
							if (currHole.stats?.score) {
								return tot + currHole.stats.score;
							} else {
								return tot;
							}
						}, 0);

						return (
							<TableCell className="text-center" key={hole.id}>
								{stats?.score ? (
									<ScoreToPar
										par={parSoFar}
										score={scoreSoFar}
										className="font-black"
									/>
								) : (
									<div>--</div>
								)}
							</TableCell>
						);
					})}
					<TableCell className="text-center">
						{completeRound ? (
							<ScoreToPar par={par} score={score} className="font-black" />
						) : (
							'--'
						)}
					</TableCell>
					{includeTotals && (
						<TableCell className="bg-muted/50 text-center">
							{fullRound.totalScore ? (
								<ScoreToPar
									par={fullRound.course.par}
									score={fullRound.totalScore}
									className="font-black"
								/>
							) : (
								'--'
							)}
						</TableCell>
					)}
				</TableRow>
			</TableFooter>
		</Table>
	);
};

const getScoreFormatting = (par: number, score: number) => {
	const diff = score - par;

	if (diff === 0) {
		return '';
	}

	const base = 'border border-2';
	if (diff > 0) {
		const bogey = `${base} border-primary`;
		if (diff > 1) {
			return `${bogey} ring-2 ring-black dark:ring-white ring-offset-2 ring-offset-background`;
		} else {
			return bogey;
		}
	} else {
		return `${base} rounded-full border-red-600 dark:border-red-500 text-red-600 dark:text-red-500`;
	}
};
