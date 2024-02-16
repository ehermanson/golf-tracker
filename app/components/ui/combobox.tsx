import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '~/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover';

import { cn } from '~/utils';

export interface Option {
	value: string;
	label: string;
}

interface ComboBoxProps {
	options: Option[];
	label: string;
	onSearch?: (val: string) => void;
	name: string;
	defaultValue?: string;
}

export function ComboBox({
	options,
	label,
	onSearch,
	name,
	defaultValue,
}: ComboBoxProps) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState(
		() => options.find(opt => opt.value === defaultValue)?.value,
	);

	const getSelectedOption = (matcher: string) => {
		return options.find(
			opt => opt.value?.toLowerCase() === matcher.toLowerCase(),
		);
	};

	const handleSelect = (newVal: string) => {
		const selectedOption = getSelectedOption(newVal);

		if (selectedOption) {
			setValue(selectedOption.value);
		}

		setOpen(false);
	};

	const selectedOption = getSelectedOption(value ?? '');

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<input type="hidden" name={name} value={value} id={name} />
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{value ? selectedOption?.label : label}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[400px] p-0" align="start">
				<Command>
					<CommandInput placeholder="Search..." onValueChange={onSearch} />
					<CommandEmpty>No results.</CommandEmpty>
					<CommandGroup>
						{options.map(option => (
							<CommandItem
								key={option.value}
								value={option.value}
								onSelect={handleSelect}
							>
								<Check
									className={cn(
										'mr-2 h-4 w-4',
										value === option.value ? 'opacity-100' : 'opacity-0',
									)}
								/>
								{option.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
