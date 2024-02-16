import { format } from 'date-fns/format';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover';

import { cn } from '~/utils';

export function DatePicker({
	onSelect,
	name,
}: {
	onSelect?: (date: Date) => void;
	name: string;
}) {
	const [date, setDate] = useState<Date>();

	const handleSelect = (newDate: Date) => {
		setDate(newDate);
		onSelect?.(newDate);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						'w-[280px] justify-start text-left font-normal',
						!date && 'text-muted-foreground',
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, 'PPP') : <span>Select Date</span>}
				</Button>
			</PopoverTrigger>
			<input type="hidden" value={String(date)} name={name} />
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					selected={date}
					onSelect={val => {
						if (val instanceof Date) {
							handleSelect(val);
						}
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
