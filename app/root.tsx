import {
	AreaChart,
	ChevronDown,
	ChevronLeftIcon,
	ChevronRightIcon,
	Compass,
	Hammer,
	Hash,
	LayoutDashboard,
	Moon,
	Sun,
} from 'lucide-react';
import {
	PreventFlashOnWrongTheme,
	Theme,
	ThemeProvider,
	useTheme,
} from 'remix-themes';
import { getToast } from 'remix-toast';
import { toast as popToast } from 'sonner';
import { useEffect, useState, type ReactNode } from 'react';

import { type User } from '@prisma/client';

import {
	json,
	type LinksFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node';
import {
	Form,
	Link,
	Links,
	Meta,
	NavLink,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Toaster } from '~/components/ui/sonner';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip';

import { Logo } from '~/components/logo';
import { getUser } from '~/session.server';
import { cn } from '~/utils';

import '~/tailwind.css';

import { themeSessionResolver } from '~/theme.server';

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUser(request);
	const { getTheme } = await themeSessionResolver(request);
	const { toast, headers } = await getToast(request);

	return json({ user, toast, theme: getTheme() }, {
		headers,
	} as const);
};

export default function AppWithProviders() {
	const { theme } = useLoaderData<typeof loader>();

	return (
		<ThemeProvider specifiedTheme={theme} themeAction="/action/set-theme">
			<App />
		</ThemeProvider>
	);
}

export function App() {
	const { toast, theme, user } = useLoaderData<typeof loader>();

	const [isCollapsed, setIsCollapsed] = useState(false);

	const [darkOrLightTheme] = useTheme();

	useEffect(() => {
		if (toast?.type === 'success') {
			popToast.success(toast.message);
		}
		if (toast?.type === 'error') {
			popToast.error(toast.message);
		}
		if (toast?.type === 'warning') {
			popToast.warning(toast.message);
		}
	}, [toast]);

	const toggleSidebar = () => {
		setIsCollapsed(c => !c);
	};

	return (
		<html lang="en" className={`h-full ${darkOrLightTheme}`}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(theme)} />
				<Links />
			</head>
			<body className="h-full flex absolute inset-0 overflow-hidden">
				<TooltipProvider>
					{user ? (
						<div
							className={cn(
								'flex relative transition-[width] duration-300 ease-in-out w-[275px]',
								{
									'w-[70px]': isCollapsed,
								},
							)}
						>
							<MainNav isCollapsed={isCollapsed} />
							<div className="relative flex w-px justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1">
								<button
									className="absolute top-[16px] rounded-lg w-7 h-7 flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground z-50"
									onClick={toggleSidebar}
								>
									{isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
								</button>
							</div>
						</div>
					) : null}
					<main className="h-full w-full bg-muted overflow-auto">
						<Outlet />
					</main>
				</TooltipProvider>
				<Toaster />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

const MainNav = ({ isCollapsed }: { isCollapsed: boolean }) => {
	const { user } = useLoaderData<typeof loader>();

	return (
		<div
			className="h-full w-full group border-r flex flex-col bg-background text-foreground"
			data-collapsed={isCollapsed}
		>
			<header className="flex items-center justify-between px-5 py-4 border-b-2 border-muted">
				<NavLink to="/" unstable_viewTransition>
					<Logo isCollapsed={isCollapsed} />
				</NavLink>
			</header>
			<div className="p-2 flex flex-col gap-1">
				<PrimaryNavLink
					to="."
					label="Dashboard"
					isCollapsed={isCollapsed}
					icon={<LayoutDashboard />}
				/>
				<PrimaryNavLink
					to="courses"
					label="Courses"
					isCollapsed={isCollapsed}
					icon={<Compass />}
				/>
				<PrimaryNavLink
					to="rounds"
					label="Rounds"
					isCollapsed={isCollapsed}
					icon={<Hash />}
				/>
				<PrimaryNavLink
					to="stats"
					label="Stats"
					isCollapsed={isCollapsed}
					icon={<AreaChart />}
				/>
				<PrimaryNavLink
					to="stat-builder"
					label="Stat Builder"
					isCollapsed={isCollapsed}
					icon={<Hammer />}
				/>
			</div>
			<div className="mt-auto">
				<hr className="border-muted border-t-2" />
				<div className="p-2">
					{user ? (
						<UserNav user={user} isCollapsed={isCollapsed} />
					) : (
						<Link to="/login">Log In</Link>
					)}
				</div>
			</div>
		</div>
	);
};

const PrimaryNavLink = (
	props: React.ComponentProps<typeof NavLink> & {
		label: string;
		isCollapsed: boolean;
		icon: ReactNode;
	},
) => {
	const navProps = {
		prefetch: 'intent',
		unstable_viewTransition: true,
		to: props.to,
	} as const;

	return (
		<>
			{props.isCollapsed ? (
				<Tooltip delayDuration={0}>
					<TooltipTrigger>
						<NavLink
							{...navProps}
							className={({ isActive }) =>
								cn(
									'transition rounded-lg p-4 text-muted-foreground flex items-center justify-center',
									{
										'hover:bg-accent': !isActive,
										'bg-muted': isActive,
										'text-foreground': isActive,
									},
								)
							}
						>
							<span className="opacity-60">{props.icon}</span>
						</NavLink>
					</TooltipTrigger>
					<TooltipContent side="right">{props.label}</TooltipContent>
				</Tooltip>
			) : (
				<NavLink
					{...navProps}
					className={({ isActive }) =>
						cn(
							'transition rounded-lg p-4 text-muted-foreground flex gap-2 items-center',
							{
								'hover:bg-accent': !isActive,
								'bg-muted': isActive,
								'text-foreground': isActive,
							},
						)
					}
				>
					<span className="opacity-60">{props.icon}</span>
					{props.label}
				</NavLink>
			)}
		</>
	);
};

function UserNav({
	user,
	isCollapsed,
}: {
	user: Pick<User, 'email' | 'displayName' | 'id'>;
	isCollapsed: boolean;
}) {
	const initial = user?.displayName?.split('')[0] ?? user?.email.split('')[0];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="relative h-8 w-full flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8 bg-muted p-1">
							<AvatarImage
								src="/img/user.png"
								className="rounded-full object-cover"
							/>
							<AvatarFallback className="text-foreground">
								{initial ?? '🫠'}
							</AvatarFallback>
						</Avatar>
						{!isCollapsed && (
							<div className="font-bold">{user.displayName ?? user.email}</div>
						)}
					</div>
					<ChevronDown />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start" forceMount>
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to="/profile">
							Profile
						</Link>
					</DropdownMenuItem>
					<Mode />
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<Form action="/logout" method="post">
					<DropdownMenuItem>
						<button type="submit" className="block w-full text-left">
							Log out
						</button>
					</DropdownMenuItem>
				</Form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const Mode = () => {
	const [theme, setTheme] = useTheme();

	const opp = (current: Theme) =>
		current === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;

	return (
		<DropdownMenuItem
			onSelect={e => {
				e.preventDefault();
				if (theme) {
					setTheme(opp(theme));
				}
			}}
		>
			<div className="flex items-center gap-2 relative">
				<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				{theme === Theme.DARK ? 'Dark' : 'Light'} Mode
			</div>
		</DropdownMenuItem>
	);
};
