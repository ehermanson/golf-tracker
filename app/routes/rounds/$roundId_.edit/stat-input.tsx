import { useRef, type FormEvent } from 'react';

import { type Hole, type HoleStats } from '@prisma/client';

import { useFetcher, useLoaderData } from '@remix-run/react';

import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { cn } from '~/utils';
import { type Loader } from './_route';

type StatType = keyof Pick<
	HoleStats,
	'score' | 'putts' | 'chipShots' | 'sandShots' | 'note'
>;

export const StatInput = ({
	hole,
	label,
	name,
	intent,
	min = 0,
	max,
	type = 'number',
	className,
	placeholder,
}: {
	label: string;
	hole: Hole;
	name: StatType;
	intent: string;
	min?: number;
	max?: number;
	type?: 'number' | 'text';
	className?: string;
	placeholder?: string;
}) => {
	const { round } = useLoaderData<Loader>();

	const statFetcher = useFetcher();

	const inputRef = useRef<HTMLInputElement>(null);

	const stats = round.holeStats.find(stat => {
		return stat.holeNumber === hole.number;
	});

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		const currentVal = inputRef.current?.value;

		if (currentVal && currentVal !== String(stats?.[name])) {
			statFetcher.submit(event.currentTarget, {
				method: 'POST',
			});
		}
	};

	return (
		<statFetcher.Form
			method="post"
			onSubmit={handleSubmit}
			onBlur={handleSubmit}
			className={cn('shrink-[4] flex flex-col gap-1', className)}
		>
			<Label className="truncate">{label}</Label>
			<Input
				type={type}
				placeholder={placeholder}
				min={min}
				max={max}
				name={name}
				defaultValue={stats?.[name] ?? ''}
				ref={inputRef}
			/>
			<input type="hidden" name="holeNumber" value={hole.number} />
			<input type="hidden" name="_intent" value={intent} />
		</statFetcher.Form>
	);
};
