import { mergeRefs } from 'react-merge-refs';
import * as React from 'react';

import { cn } from '~/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type = 'text', ...props }, ref) => {
		const inputRef = React.useRef<HTMLInputElement>();

		// Disable wheel event from triggering step change on input
		React.useEffect(() => {
			if (type !== 'number') {
				return;
			}
			const { current: input } = inputRef;

			const handleWheel = (ev: Event) => {
				if ((ev as WheelEvent).deltaY && document.activeElement === input) {
					ev.preventDefault();
				}
			};

			input?.addEventListener('wheel', handleWheel);

			return () => input?.removeEventListener('wheel', handleWheel);
		}, [type]);

		return (
			<input
				type={type}
				className={cn(
					'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid]:border-red-600',
					className,
				)}
				ref={mergeRefs([ref, inputRef])}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
