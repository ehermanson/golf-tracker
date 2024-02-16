import React, { useId } from 'react';

import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';

export type ListOfErrors = string[] | null;

export function ErrorList({
	id,
	errors,
}: {
	errors?: ListOfErrors;
	id?: string;
}) {
	const errorsToRender = errors?.filter(Boolean);
	if (!errorsToRender?.length) return null;
	return (
		<ul id={id} className="flex flex-col gap-1">
			{errorsToRender.map(e => (
				<li key={e} className="text-[10px] text-red-600">
					{e}
				</li>
			))}
		</ul>
	);
}

export function InputField({
	labelProps,
	inputProps,
	errors,
	className,
	label,
	name,
	defaultValue,
}: {
	label: string;
	name: string;
	defaultValue?: string;
	labelProps?: React.ComponentProps<typeof Label>;
	inputProps?: React.ComponentProps<typeof Input>;
	errors?: ListOfErrors;
	className?: string;
}) {
	const fallbackId = useId();
	const id = inputProps?.id ?? fallbackId;
	const errorId = errors?.length ? `${id}-error` : undefined;
	const isRequired = !!inputProps?.required;

	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps}>
				{label}{' '}
				{isRequired ? (
					<span className="text-red-600 text-[10px]">*</span>
				) : null}
			</Label>
			<Input
				id={id}
				name={name}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				defaultValue={defaultValue}
				{...inputProps}
			/>
			{errorId ? (
				<div className="mt-2">
					<ErrorList id={errorId} errors={errors} />
				</div>
			) : null}
		</div>
	);
}
