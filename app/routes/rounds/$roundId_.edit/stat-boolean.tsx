import { useRef, type FormEvent } from 'react';

import { type Hole, type HoleStats } from '@prisma/client';

import { useFetcher, useLoaderData } from '@remix-run/react';

import { Checkbox } from '~/components/ui/checkbox';

import { type Loader } from './_route';

type StatType = keyof HoleStats;

export const StatBoolean = ({
	hole,
	label,
	name,
	intent,
	checkboxProps,
}: {
	label: string;
	hole: Hole;
	name: StatType;
	intent: string;
	checkboxProps?: Record<string, unknown>;
}) => {
	const { round } = useLoaderData<Loader>();

	const statFetcher = useFetcher();

	const checkboxRef = useRef<HTMLButtonElement>(null);

	const stats = round.holeStats.find(stat => {
		return stat.holeNumber === hole.number;
	});

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		if (checkboxRef.current?.value !== stats?.score) {
			statFetcher.submit(event.currentTarget, {
				method: 'POST',
			});
		}
	};

	return (
		<statFetcher.Form
			method="post"
			onSubmit={handleSubmit}
			onChange={handleSubmit}
			className="flex flex-col gap-1 items-center"
		>
			<label
				htmlFor={name}
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{label}
			</label>
			<Checkbox
				id={name}
				name={name}
				defaultChecked={Boolean(stats?.[name])}
				ref={checkboxRef}
				className="h-10 w-10"
				{...checkboxProps}
			/>
			<input type="hidden" name="_intent" value={intent} />
			<input type="hidden" name="holeNumber" value={hole.number} />
		</statFetcher.Form>
	);
};
