import { Plus } from 'lucide-react';

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, type MetaFunction } from '@remix-run/react';

import { Button } from '~/components/ui/button';

import { getAllCourses } from '~/api/course.server';
import {
	PageHeader,
	PageSidebar,
	PageSidebarLink,
	PageSideBarLinks,
	PageWrapper,
} from '~/components/page';
import { requireUser } from '~/session.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	await requireUser(request);
	const coursesList = await getAllCourses();
	return json({ coursesList });
};

export const meta: MetaFunction = () => [{ title: 'Courses' }];

export default function CoursesPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<>
			<PageHeader
				title="Courses"
				action={
					<Button asChild>
						<Link to="new">
							<Plus className="mr-1" /> New Course
						</Link>
					</Button>
				}
			/>
			<PageWrapper>
				<PageSidebar>
					{data.coursesList.length === 0 ? (
						<p className="p-4">No courses yet</p>
					) : (
						<PageSideBarLinks>
							{data.coursesList.map(course => (
								<li key={course.id}>
									<PageSidebarLink to={course.id}>
										{course.name}
									</PageSidebarLink>
								</li>
							))}
						</PageSideBarLinks>
					)}
				</PageSidebar>
			</PageWrapper>
		</>
	);
}
