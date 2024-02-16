import { useState } from 'react';

import { json, redirect, type ActionFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, type MetaFunction } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { DatePicker } from '~/components/ui/datepicker';
import { Label } from '~/components/ui/label';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';

import { getPlayableCourses } from '~/api/course.server';
import { createRound } from '~/api/round.server';
import { requireUserId } from '~/session.server';

export const loader = async () => {
	const coursesList = await getPlayableCourses();
	return json({ coursesList });
};

export const meta: MetaFunction = () => [{ title: 'Add New Round' }];

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();

	const datePlayedStr = String(formData.get('datePlayed'));
	const courseId = String(formData.get('courseId'));
	const numberOfHoles = Number(formData.get('numberOfHoles'));
	const teeId = String(formData.get('teeId'));
	const datePlayed = datePlayedStr ? new Date(datePlayedStr) : new Date();

	const round = await createRound({
		userId,
		datePlayed,
		courseId,
		numberOfHoles,
		teeId,
	});

	return redirect(`/rounds/${round.id}/edit`);
};

export default function NewRoundPage() {
	const data = useLoaderData<typeof loader>();

	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

	const selectedCourse = data.coursesList.find(c => c.id === selectedCourseId);

	return (
		<Form method="post" className="flex flex-col gap-4 w-full">
			<div className="flex flex-col gap-4">
				<DatePicker name="datePlayed" />
				<Select name="courseId" onValueChange={setSelectedCourseId}>
					<SelectTrigger>
						<SelectValue placeholder="Select a course" />
					</SelectTrigger>
					<SelectContent>
						{data.coursesList.map(course => {
							return (
								<SelectItem key={course.id} value={course.id}>
									{course.name}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>

				{selectedCourse && selectedCourse.tees?.length ? (
					<>
						<Select name="teeId">
							<SelectTrigger>
								<SelectValue placeholder="Select tees" />
							</SelectTrigger>
							<SelectContent>
								{selectedCourse.tees.map(
									({ rating, slope, yardage, id, name }) => {
										const teeRating = rating
											? parseFloat(rating).toFixed(1)
											: '--';
										return (
											<SelectItem key={id} value={id}>
												{`${name} / ${yardage}yds / ${teeRating} / ${slope}`}
											</SelectItem>
										);
									},
								)}
							</SelectContent>
						</Select>
					</>
				) : null}
				<RadioGroup defaultValue="18" name="numberOfHoles">
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="18" id="option-one" />
						<Label htmlFor="option-one">Eighteen</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="9" id="option-two" />
						<Label htmlFor="option-two">Nine</Label>
					</div>
				</RadioGroup>
			</div>
			<div className="text-right">
				<Button type="submit">Save</Button>
			</div>
		</Form>
	);
}
