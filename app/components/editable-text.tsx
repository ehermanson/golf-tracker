import { Edit } from 'lucide-react';
import { flushSync } from 'react-dom';
import { useRef, useState } from 'react';

import { useFetcher } from '@remix-run/react';

export function EditableText({
	children,
	fieldName,
	value,
	_intent,
	inputClassName,
	inputLabel,
}: {
	children?: React.ReactNode;
	fieldName: string;
	value: string;
	inputClassName?: string;
	inputLabel: string;
	_intent: string;
}) {
	let fetcher = useFetcher();
	let [edit, setEdit] = useState(false);
	let inputRef = useRef<HTMLInputElement>(null);
	let buttonRef = useRef<HTMLButtonElement>(null);

	// optimistic update
	if (fetcher.formData?.has(fieldName)) {
		value = String(fetcher.formData.get(fieldName));
	}

	return edit ? (
		<fetcher.Form
			method="post"
			onSubmit={() => {
				flushSync(() => {
					setEdit(false);
				});
				buttonRef.current?.focus();
			}}
		>
			{children}
			<input
				required
				ref={inputRef}
				type="text"
				aria-label={inputLabel}
				name={fieldName}
				defaultValue={value}
				className={inputClassName}
				onKeyDown={event => {
					if (event.key === 'Escape') {
						flushSync(() => {
							setEdit(false);
						});
						buttonRef.current?.focus();
					}
				}}
				onBlur={event => {
					if (inputRef.current?.value !== value) {
						fetcher.submit(event.currentTarget);
					}
					setEdit(false);
				}}
			/>
			<input type="hidden" name="_intent" value={_intent} />
		</fetcher.Form>
	) : (
		<button
			aria-label={`Edit ${fieldName}`}
			type="button"
			ref={buttonRef}
			onClick={() => {
				flushSync(() => {
					setEdit(true);
				});
				inputRef.current?.select();
			}}
			className="flex items-center gap-2"
		>
			{value}
			<span className="text-muted-foreground text-base">
				<Edit className="h-5 w-5" />
			</span>
		</button>
	);
}
