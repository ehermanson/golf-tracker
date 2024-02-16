import { parseWithZod } from '@conform-to/zod';
import { jsonWithSuccess, redirectWithSuccess } from 'remix-toast';
import invariant from 'tiny-invariant';

import { Prisma } from '@prisma/client';

import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node';
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

import {
	addTee,
	deleteCourse,
	deleteTee,
	getCourse,
	updateCourse,
	updateCourseHoles,
} from '~/api/course.server';
import { CourseInfoSchema, EditCourseInfo } from './edit-course-info';
import { EditHoles, HolesSchema } from './edit-holes';
import { EditTees } from './edit-tees';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariant(params.courseId, 'Course not found');

	const course = await getCourse({ id: params.courseId });
	if (!course) {
		throw new Response('Not Found', { status: 404 });
	}
	return json({ course });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
	invariant(params.courseId, 'Course not found');
	const formData = await request.formData();

	const intent = formData.get('_intent');

	switch (intent) {
		case 'deleteCourse': {
			await deleteCourse({ id: params.courseId });
			return redirectWithSuccess('/courses', 'Course successfully deleted.');
		}

		case 'deleteTee': {
			const teeId = String(formData.get('teeId'));
			await deleteTee({ id: teeId });
			return redirectWithSuccess(
				`/courses/${params.courseId}/edit`,
				'Tee deleted',
			);
		}

		case 'editCourseInfo': {
			const submission = parseWithZod(formData, {
				schema: CourseInfoSchema,
			});

			if (submission.status !== 'success') {
				return json(submission.reply());
			}

			const { courseName, courseAddress, courseCity, courseState } =
				submission.value;

			await updateCourse({
				id: params.courseId,
				name: courseName,
				address: courseAddress,
				city: courseCity,
				state: courseState,
			});

			return jsonWithSuccess(
				submission.reply({ resetForm: false }),
				'Course updated',
			);
		}

		case 'editHoles': {
			const submission = parseWithZod(formData, {
				schema: HolesSchema,
			});

			if (submission.status !== 'success') {
				return json(submission.reply());
			}

			const { holes } = submission.value;

			await updateCourseHoles({
				holes,
				courseId: params.courseId,
			});

			return jsonWithSuccess(
				submission.reply({ resetForm: false }),
				'Holes updated',
			);
		}

		case 'addTee': {
			const errors: Record<string, string> = {};

			const name = String(formData.get('name'));
			const rating = String(formData.get('rating'));
			const slope = Number(formData.get('slope'));

			if (!name) {
				errors.name = 'Name is required';
			}

			if (!rating) {
				errors.rating = 'Rating is required';
			}

			if (!slope) {
				errors.slope = 'Slope is required';
			}

			const holeData: {
				holeId: string;
				yardage: number;
			}[] = [];

			for (let i = 1; i <= 18; i++) {
				holeData.push({
					holeId: String(formData.get(`hole.${i}.holeId`)),
					yardage: Number(formData.get(`hole.${i}.yardage`)),
				});
			}

			if (holeData.length !== 18) {
				errors.holes = 'must fill out all holes.';
			}

			// if (Object.keys(errors).length > 0) {
			// 	return json({ errors });
			// }

			await addTee({
				rating: rating ? new Prisma.Decimal(rating) : null,
				slope,
				name,
				courseId: params.courseId,
				holes: holeData,
			});

			return redirectWithSuccess(`/courses/${params.courseId}`, 'Tees Added');
		}

		default: {
			return redirect(`/courses/${params.courseId}/edit`);
		}
	}
};

export default function CourseEditPage() {
	const { course } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();
	const currentView = searchParams.get('view');

	return (
		<div>
			<div className="flex">
				<Heading is="h3" className="mb-4">
					Edit Course: {course.name}
				</Heading>
				<div className="flex items-center gap-2 ml-auto">
					<Button asChild variant="outline">
						<Link
							relative="path"
							to=".."
							className="block"
							unstable_viewTransition
						>
							Done
						</Link>
					</Button>
					<Form
						method="post"
						onSubmit={event => {
							if (!confirm('Are you sure you want to delete this course?')) {
								event.preventDefault();
							}
						}}
					>
						<Button
							type="submit"
							variant="destructive"
							name="_intent"
							value="deleteCourse"
						>
							Delete
						</Button>
					</Form>
				</div>
			</div>
			<Tabs defaultValue={currentView ?? 'courseInfo'}>
				<TabsList>
					<TabsTrigger
						value="courseInfo"
						onClick={() =>
							setSearchParams(prev => {
								prev.set('view', 'courseInfo');
								return prev;
							})
						}
					>
						Course Info
					</TabsTrigger>
					<TabsTrigger
						value="holes"
						onClick={() =>
							setSearchParams(prev => {
								prev.set('view', 'holes');
								return prev;
							})
						}
					>
						Holes
					</TabsTrigger>
					<TabsTrigger
						value="tees"
						onClick={() =>
							setSearchParams(prev => {
								prev.set('view', 'tees');
								return prev;
							})
						}
					>
						Tees
					</TabsTrigger>
				</TabsList>
				<TabsContent className="pt-2" value="courseInfo">
					<EditCourseInfo />
				</TabsContent>
				<TabsContent className="pt-2" value="holes">
					<EditHoles />
				</TabsContent>
				<TabsContent className="pt-2" value="tees">
					<EditTees />
				</TabsContent>
			</Tabs>
		</div>
	);
}
