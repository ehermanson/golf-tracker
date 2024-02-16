import { useForm } from '@conform-to/react';
import { getZodConstraint } from '@conform-to/zod';
import { z } from 'zod';

import { Form, useActionData, useLoaderData } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Label } from '~/components/ui/label';

import { InputField } from '~/components/form-fields';
import { StatePicker } from '~/components/state-picker';
import { type action, type loader } from './_route';

export const CourseInfoSchema = z.object({
	courseName: z.string({ required_error: 'name is required' }),
	courseAddress: z.string({ required_error: 'address is required' }),
	courseCity: z.string({ required_error: 'city is required' }),
	courseState: z.string({ required_error: 'state is required' }),
});

export function EditCourseInfo() {
	const { course } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	const [form, fields] = useForm({
		id: 'edit-course-info',
		lastResult: actionData,
		constraint: getZodConstraint(CourseInfoSchema),
		defaultValue: {
			courseName: course.name,
			courseAddress: course.address,
			courseCity: course.city,
			courseState: course.state,
		},
	});

	return (
		<>
			<Heading is="h4" className="mb-4">
				Course Info
			</Heading>
			<Form
				method="POST"
				className="flex flex-col gap-4 mb-4"
				id={form.id}
				onSubmit={form.onSubmit}
			>
				<div>
					<InputField
						label="Name"
						inputProps={{ defaultValue: fields.courseName.value }}
						name={fields.courseName.name}
						errors={fields.courseName.errors}
					/>
				</div>
				<div>
					<InputField
						label="Address"
						inputProps={{ defaultValue: fields.courseAddress.value }}
						name={fields.courseAddress.name}
						errors={fields.courseAddress.errors}
					/>
				</div>
				<div>
					<InputField
						label="City"
						name={fields.courseCity.name}
						inputProps={{ defaultValue: fields.courseCity.value }}
						errors={fields.courseCity.errors}
					/>
				</div>
				<div>
					<Label>State</Label>
					<StatePicker
						name={fields.courseState.name}
						defaultValue={fields.courseState.value}
						errors={fields.courseState.errors}
					/>
				</div>
				<Button name="_intent" value="editCourseInfo" type="submit">
					Save Course Info
				</Button>
			</Form>
		</>
	);
}
