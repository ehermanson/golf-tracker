import {
	getFieldsetProps,
	getFormProps,
	getInputProps,
	useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { redirectWithSuccess } from 'remix-toast';
import { z } from 'zod';

import { json, type ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData, type MetaFunction } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Input } from '~/components/ui/input';

import { createCourse } from '~/api/course.server';
import { InputField } from '~/components/form-fields';
import { StatePicker } from '~/components/state-picker';

const HoleInfoSchema = z.object({
	number: z.number().min(1).max(18),
	par: z
		.number()
		.min(3, { message: 'Par cannot be less than 3.' })
		.max(5, { message: 'Par cannot be more than 5' }),
	strokeIndex: z
		.number()
		.min(1, { message: 'Stroke index cannot be less than 1.' })
		.max(18, { message: 'Stroke index cannot be more than 18.' }),
});

const CourseInfoSchema = z
	.object({
		name: z.string({ required_error: 'name is required' }),
		address: z.string({ required_error: 'address is required' }),
		city: z.string({ required_error: 'city is required' }),
		state: z.string({ required_error: 'state is required' }),
		country: z.string({ required_error: 'country is required' }),
		holes: z.array(HoleInfoSchema, {
			required_error: 'must fill out all holes',
		}),
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

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();

	const submission = parseWithZod(formData, { schema: CourseInfoSchema });

	if (submission.status !== 'success') {
		return json(submission.reply());
	}

	const { name, address, city, state, country, holes } = submission.value;

	const course = await createCourse({
		name,
		address,
		city,
		state,
		country,
		holes,
	});

	return redirectWithSuccess(
		`/courses/${course.id}`,
		`Created new course - "${name}"`,
	);
};

export const meta: MetaFunction = () => [{ title: 'Add New Course' }];

export default function NewCoursePage() {
	const actionData = useActionData<typeof action>();

	const [form, fields] = useForm({
		id: 'new-course',
		lastResult: actionData,
		constraint: getZodConstraint(CourseInfoSchema),
		shouldValidate: 'onBlur',
		defaultValue: {
			name: 'some course',
			address: '123 road',
			city: 'boston',
			state: 'MA',
			country: 'United States',
			holes: Array.from(Array(18)).map((_, index) => {
				const holeNumber = index + 1;
				return {
					par: 4,
					strokeIndex: 1,
					number: holeNumber,
				};
			}),
		},
	});

	return (
		<>
			{Object.keys(form.allErrors).length > 0 && (
				<div className="text-red-600 mb-4">
					There are {Object.keys(form.allErrors).length} errors that need to be
					addressed.
				</div>
			)}
			{form.allErrors &&
				Object.entries(form.allErrors).map(([key, err]) => {
					return (
						<div className="text-red-600 mb-4" key={key}>
							{err[0]}
						</div>
					);
				})}
			<Form
				method="post"
				className="flex flex-col gap-2 w-full"
				{...getFormProps(form)}
			>
				<div className="flex flex-col gap-4">
					<Heading is="h3">New Course Info</Heading>
					<InputField
						label="Name"
						name={fields.name.name}
						inputProps={{
							...getInputProps(fields.name, {
								type: 'text',
							}),
						}}
						errors={fields.name.errors}
					/>
					<InputField
						label="Street Address"
						name={fields.address.name}
						inputProps={{
							defaultValue: fields.address.initialValue,
							placeholder: 'e.g 1 Country Club Lane',
						}}
						errors={fields.address.errors}
					/>
					<InputField
						label="City"
						inputProps={{
							defaultValue: fields.city.initialValue,
							placeholder: 'e.g Some Town',
						}}
						name={fields.city.name}
						errors={fields.city.errors}
					/>
					<StatePicker
						errors={fields.state.errors}
						name={fields.state.name}
						defaultValue={fields.state.value}
					/>
					<InputField
						label="Country"
						name={fields.country.name}
						inputProps={{
							defaultValue: fields.country.initialValue,
							placeholder: 'e.g United States',
						}}
						errors={fields.country.errors}
					/>
					<Heading is="h3">Holes</Heading>
					<div className="columns-2 gap-8">
						{fields.holes.getFieldList().map(hole => {
							const { number, par, strokeIndex } = hole.getFieldset();
							return (
								<fieldset
									key={hole.key}
									className="flex items-center gap-2 mb-2"
									{...getFieldsetProps(hole)}
								>
									<div className="p-2 min-w-[3em] text-center rounded-md border border-input bg-muted px-3 py-2 text-sm ">
										{number.value}
									</div>
									<input
										type="hidden"
										name={number.name}
										value={number.value}
									/>
									<Input
										name={par.name}
										placeholder="Par"
										className="flex-shrink"
										min={par.min}
										max={par.max}
										defaultValue={par.initialValue}
										aria-invalid={par.errors ? true : undefined}
									/>
									<Input
										name={strokeIndex.name}
										placeholder="Stroke Index"
										min={strokeIndex.min}
										max={strokeIndex.max}
										defaultValue={strokeIndex.initialValue}
										aria-invalid={strokeIndex.errors ? true : undefined}
									/>
								</fieldset>
							);
						})}
					</div>
				</div>
				<div className="text-right">
					<Button type="submit">Save</Button>
				</div>
			</Form>
		</>
	);
}
