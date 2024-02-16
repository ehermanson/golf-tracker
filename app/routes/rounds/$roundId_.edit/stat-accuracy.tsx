import { type RadioGroupProps, type RadioProps } from '@react-types/radio';
import {
	ArrowBigDown,
	ArrowBigLeft,
	ArrowBigRight,
	ArrowBigUp,
	BoxSelect,
	Target,
} from 'lucide-react';
import {
	mergeProps,
	useFocusRing,
	useRadio,
	useRadioGroup,
	VisuallyHidden,
} from 'react-aria';
import { useRadioGroupState, type RadioGroupState } from 'react-stately';
import React, { useContext, useState } from 'react';

import { type Hole, type HoleStats } from '@prisma/client';

import { useFetcher, useLoaderData } from '@remix-run/react';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover';

import { cn } from '~/utils';
import { type Loader } from './_route';

const RadioGroupContext = React.createContext<RadioGroupState | null>(null);

export function useRadioGroupContext() {
	const context = useContext(RadioGroupContext);

	if (!context) {
		throw new Error('Must be used within RadioGroupContextProvider');
	}

	return context;
}

type StatType = keyof Pick<HoleStats, 'drive' | 'approach'>;

function RadioGroup(props: RadioGroupProps & { children: React.ReactNode }) {
	const { children } = props;
	const state = useRadioGroupState(props);
	const { radioGroupProps } = useRadioGroup(
		{
			...props,
			orientation: 'horizontal',
		},
		state,
	);

	return (
		<div {...radioGroupProps} className="grid gap-1 grid-cols-3 grid-rows-3">
			<RadioGroupContext.Provider value={state}>
				{children}
			</RadioGroupContext.Provider>
		</div>
	);
}

function Radio(props: RadioProps & { className?: string }) {
	const state = useRadioGroupContext();

	const ref = React.useRef(null);
	const { inputProps } = useRadio(props, state, ref);
	const { focusProps, isFocusVisible } = useFocusRing();

	const selected = state.selectedValue === props.value;

	return (
		<label
			className={cn(
				`w-8 h-8 border border-1 border-input rounded flex items-center justify-center transition-all duration-200`,
				{
					'bg-primary': selected,
					'text-primary-foreground': selected,
					'ring-offset-background ring-ring ring-2 ring-offset-2':
						isFocusVisible,
					'cursor-not-allowed opacity-50': state.isDisabled,
				},
				props.className,
			)}
		>
			{props.children}
			<VisuallyHidden>
				<input {...mergeProps(inputProps, focusProps)} ref={ref} />
			</VisuallyHidden>
		</label>
	);
}

type Option = 'left' | 'right' | 'long' | 'short' | 'hit' | undefined | null;

export const StatAccuracy = ({
	hole,
	label,
	name,
	intent,
	disabled,
}: {
	label: string;
	hole: Hole;
	name: StatType;
	intent: string;
	disabled?: boolean;
}) => {
	const { round } = useLoaderData<Loader>();

	const statFetcher = useFetcher();

	const [open, setOpen] = useState(false);

	const stats = round.holeStats.find(stat => {
		return stat.holeNumber === hole.number;
	});

	const [selected, setSelected] = useState<Option>(stats?.[name] as Option);

	const handleSubmit = () => {
		if (selected && selected !== stats?.[name]) {
			statFetcher.submit(
				{
					[name]: selected,
					holeNumber: hole.number,
					_intent: intent,
				},
				{ method: 'POST' },
			);
		}
	};

	const icons = {
		long: <ArrowBigUp />,
		left: <ArrowBigLeft />,
		right: <ArrowBigRight />,
		short: <ArrowBigDown />,
		hit: <Target />,
	};

	return (
		<div className="flex flex-col gap-3 items-center">
			<div className="text-sm font-medium leading-none">{label}</div>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						disabled={disabled}
						className={cn('text-red-600', {
							'text-green-600': selected === 'hit',
							'text-muted-foreground': !selected,
							'opacity-50': disabled,
						})}
					>
						{!selected ? <BoxSelect /> : icons[selected]}
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-[125px] p-2" align="center" forceMount>
					<statFetcher.Form
						method="post"
						className="flex flex-col gap-1 items-center"
					>
						<RadioGroup
							label={label}
							name={name}
							defaultValue={stats?.[name] ?? ''}
							isDisabled={disabled}
							onChange={val => setSelected(val as Option)}
							onBlur={handleSubmit}
						>
							<Radio
								value="long"
								aria-label="Miss long"
								className="col-start-2"
							>
								<ArrowBigUp />
							</Radio>
							<Radio
								value="left"
								aria-label="Miss left"
								className="col-start-1"
							>
								<ArrowBigLeft />
							</Radio>
							<Radio value="hit" aria-label="Hit">
								<Target />
							</Radio>
							<Radio value="right" aria-label="Miss right">
								<ArrowBigRight />
							</Radio>
							<Radio
								value="short"
								aria-label="Miss short"
								className="col-start-2"
							>
								<ArrowBigDown />
							</Radio>
						</RadioGroup>
					</statFetcher.Form>
				</PopoverContent>
			</Popover>
		</div>
	);
};
