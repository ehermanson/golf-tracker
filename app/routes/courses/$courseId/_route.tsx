import invariant from 'tiny-invariant';
import { Fragment } from 'react';

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
	isRouteErrorResponse,
	NavLink,
	useLoaderData,
	useRouteError,
} from '@remix-run/react';

import { Button } from '~/components/ui/button';
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

import { getCourse } from '~/api/course.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariant(params.courseId, 'courseID not found');
	const course = await getCourse({ id: params.courseId });
	if (!course) {
		throw new Response('Not Found', { status: 404 });
	}
	return json({ course });
};

export default function CourseDetailPage() {
	const { course } = useLoaderData<typeof loader>();

	return (
		<div>
			<div className="flex">
				<div>
					<Heading is="h3">{course.name}</Heading>
					<p className="py-1">
						{course.address}, {course.city} {course.state}
					</p>
					<p className="py-1">{course.country}</p>
					<p className="py-1">Par {course.par}</p>
				</div>
				<div className="ml-auto">
					<Button asChild>
						<NavLink to="edit">Edit Course</NavLink>
					</Button>
				</div>
			</div>
			<hr className="my-4" />
			{course.tees.length > 0 ? (
				<div className="mb-6">
					<Heading is="h4" className="mb-2">
						Tees:
					</Heading>
					<Table>
						<TableHeader className="text-left">
							<TableRow className="bg-muted font-bold">
								<TableHead className="font-bold">Tees</TableHead>
								<TableHead className="font-bold">Rating</TableHead>
								<TableHead className="font-bold">Slope</TableHead>
								<TableHead className="font-bold">Yardage</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{course.tees?.map(tee => {
								return (
									<TableRow key={tee.id}>
										<TableCell>{tee.name}</TableCell>
										<TableCell>
											{tee.rating ? parseFloat(tee.rating).toFixed(1) : '--'}
										</TableCell>
										<TableCell>{tee.slope || '--'}</TableCell>
										<TableCell>{tee.yardage || '--'}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			) : null}

			{course.holes.length > 0 ? (
				<>
					<Heading is="h4" className="mb-2">
						Scorecard:
					</Heading>
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
								{course.tees.map(tee => {
									return (
										<Fragment key={tee.id}>
											<TableHead className="text-muted-foreground font-bold">
												{tee.name}
											</TableHead>
										</Fragment>
									);
								})}
							</TableRow>
						</TableHeader>
						<TableBody>
							{course.holes.map(hole => {
								return (
									<TableRow key={hole.id}>
										<TableCell>{hole.number}</TableCell>
										<TableCell>{hole.par}</TableCell>
										<TableCell>{hole.strokeIndex}</TableCell>
										{hole.teeForHole.map(tee => {
											return (
												<Fragment key={tee.id}>
													<TableCell>{tee.yardage}</TableCell>
												</Fragment>
											);
										})}
									</TableRow>
								);
							})}
						</TableBody>
						<TableFooter>
							<TableRow>
								<TableCell>TOT</TableCell>
								<TableCell>{course.par}</TableCell>
								<TableCell></TableCell>
								{course.tees.map(tee => {
									return (
										<Fragment key={tee.id}>
											<TableCell>{tee.yardage}</TableCell>
										</Fragment>
									);
								})}
							</TableRow>
						</TableFooter>
					</Table>
				</>
			) : null}
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (error instanceof Error) {
		return <div>An unexpected error occurred: {error.message}</div>;
	}

	if (!isRouteErrorResponse(error)) {
		return <h1>Unknown Error</h1>;
	}

	if (error.status === 404) {
		return <div>Note not found</div>;
	}

	return <div>An unexpected error occurred: {error.statusText}</div>;
}
