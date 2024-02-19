import { type ReactNode } from 'react';

import { NavLink, Outlet } from '@remix-run/react';

import { cn } from '~/utils';
import { Heading } from './ui/heading';

interface PageHeader {
	title: string;
	action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeader) {
	return (
		<div className="bg-background drop-shadow-md px-6 py-3 flex align-center justify-between">
			<Heading is="h2">{title}</Heading>
			{action}
		</div>
	);
}

interface PageSideBar {
	children: ReactNode;
}

export function PageSidebar({ children }: PageSideBar) {
	return <div className="bg-background p-2">{children}</div>;
}

export function PageSideBarLinks({ children }: { children: ReactNode }) {
	return <ol className="flex flex-col gap-1">{children}</ol>;
}

export function PageSidebarLink({
	...props
}: React.ComponentProps<typeof NavLink>) {
	return (
		<NavLink
			unstable_viewTransition
			className={({ isActive }) =>
				cn('block transition px-4 py-2 text-accent-foreground/75 rounded-lg', {
					'hover:bg-secondary': !isActive,
					'hover:text-accent-foreground': !isActive,
					'bg-accent': isActive,
					'text-accent-foreground': isActive,
					'cursor-default': isActive,
				})
			}
			{...props}
		>
			{props.children}
		</NavLink>
	);
}

export function PageContent({ children }: { children: ReactNode }) {
	return (
		<div className="flex-1 p-6 ">
			<div className="bg-background p-6 rounded-xl">{children}</div>
		</div>
	);
}

interface PageWrapper {
	children: ReactNode;
}

export function PageWrapper({ children }: PageWrapper) {
	return (
		<div className="grid grid-cols-[300px_1fr] h-full">
			{children}
			<PageContent>
				<Outlet />
			</PageContent>
		</div>
	);
}
