import { useForm } from '@conform-to/react';
import { getZodConstraint } from '@conform-to/zod';
import { z } from 'zod';

import { Form, useActionData, useLoaderData } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Input } from '~/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table';

import { type action, type loader } from './_route';

const HoleSchema = z.object({
	id: z.string(),
	number: z.number(),
	par: z
		.number()
		.min(3, { message: 'Par cannot be less than 3.' })
		.max(5, { message: 'Par cannot be more than 5' }),
	strokeIndex: z
		.number()
		.min(1, { message: 'Stroke index cannot be less than 1.' })
		.max(18, { message: 'Stroke index cannot be more than 18.' }),
});

export const HolesSchema = z
	.object({
		holes: z.array(HoleSchema).length(18),
	})
	.superRefine(({ holes }, ctx) => {
		const strokeIndexMap = new Map<number, number>(); // Maps strokeIndex to hole number
		holes.forEach((hole, i) => {
			if (strokeIndexMap.has(hole.strokeIndex)) {
				const conflictingHoleNumber = strokeIndexMap.get(hole.strokeIndex);
				ctx.addIssue({
					path: ['holes', i, 'strokeIndex'],
					code: z.ZodIssueCode.custom,
					message: `Hole ${hole.number} has the same stroke index as hole ${conflictingHoleNumber}. This is invalid.`,
				});
			} else {
				strokeIndexMap.set(hole.strokeIndex, hole.number);
			}
		});
	});

export function EditHoles() {
	const { course } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	const [form, fields] = useForm({
		id: 'edit-course-holes',
		lastResult: actionData,
		constraint: getZodConstraint(HolesSchema),
		shouldValidate: 'onBlur',
		defaultValue: {
			holes: course.holes.map(({ number, id, par, strokeIndex }) => {
				return {
					number,
					id,
					par,
					strokeIndex,
				};
			}),
		},
	});

	return (
		<>
			<Heading is="h4" className="mb-4">
				Hole Data
			</Heading>
			{form.allErrors &&
				Object.entries(form.allErrors).map(([key, err]) => {
					return (
						<div className="text-red-600 mb-4" key={key}>
							{err[0]}
						</div>
					);
				})}
			<Form
				method="POST"
				className="flex flex-col gap-4"
				id={form.id}
				onSubmit={form.onSubmit}
			>
				<Table>
					<TableHeader>
						<TableRow className="bg-muted font-bold">
							<TableHead className="text-muted-foreground font-bold">
								Hole
							</TableHead>
							<TableHead className="text-muted-foreground font-bold">
								Par
							</TableHead>
							<TableHead className="text-muted-foreground font-bold">
								Stroke Index
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{fields.holes.getFieldList().map(hole => {
							const { id, number, par, strokeIndex } = hole.getFieldset();
							return (
								<TableRow key={id.value}>
									<TableCell>
										{number.value}
										<input type="hidden" value={id.value} name={id.name} />
										<input
											type="hidden"
											value={number.value}
											name={number.name}
										/>
									</TableCell>
									<TableCell>
										<Input
											type="number"
											min={par.min}
											max={par.max}
											name={par.name}
											defaultValue={par.value}
											aria-invalid={par.errors ? true : undefined}
										/>
									</TableCell>
									<TableCell>
										<Input
											type="number"
											min={strokeIndex.min}
											max={strokeIndex.max}
											name={strokeIndex.name}
											defaultValue={strokeIndex.value}
											aria-invalid={strokeIndex.errors ? true : undefined}
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell />
							<TableCell>{course.par}</TableCell>
							<TableCell />
						</TableRow>
					</TableFooter>
				</Table>
				<Button name="_intent" value="editHoles" type="submit">
					Save
				</Button>
			</Form>
		</>
	);
}
