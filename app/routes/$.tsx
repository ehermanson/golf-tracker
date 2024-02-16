import { Link, useLocation } from '@remix-run/react';

export default function NotFound() {
	return <ErrorBoundary />;
}

export function ErrorBoundary() {
	const location = useLocation();
	return (
		<div className="flex place-items-center p-20 text-center">
			<div className="flex-1 ">
				<h1>Page not found:</h1>
				<pre className="whitespace-pre-wrap break-all text-body-lg mt-4 mb-10">
					{location.pathname}
				</pre>
				<Link to="/" className="text-body-md underline">
					Back to homepage
				</Link>
			</div>
		</div>
	);
}
