import { Plus, Trash } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';

import {
	Form,
	useFetcher,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Input } from '~/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover';
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table';

import { type loader } from './_route';

const DeleteTee = ({ id }: { id: string }) => {
	const [open, setOpen] = useState(false);
	const deleteTeeFetcher = useFetcher();

	const handleConfirm = (teeId: string) => {
		deleteTeeFetcher.submit(
			{
				_intent: 'deleteTee',
				teeId,
			},
			{ method: 'POST' },
		);
	};
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Trash className="h-4 w-4" />
			</PopoverTrigger>
			<PopoverContent>
				<div className="text-lg font-bold mb-4">Delete Tees</div>
				<p className="mb-4">
					This set of tees will be deleted, along with all rounds associated
					with these tees.
				</p>
				<p className="mb-4">Are you sure you want to delete?</p>
				<div className="flex gap-2">
					<Button variant="destructive" onClick={() => handleConfirm(id)}>
						Yes, delete
					</Button>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export function EditTees() {
	const { course } = useLoaderData<typeof loader>();

	const newTeeNameRef = useRef<HTMLInputElement>(null);

	const [addNewTees, setAddNewTees] = useState(false);
	const [newTeeName, setNewTeeName] = useState('');

	const navigation = useNavigation();

	useEffect(() => {
		if (addNewTees && newTeeNameRef.current) {
			newTeeNameRef.current.focus();
		}
	}, [addNewTees, newTeeNameRef]);

	return (
		<>
			<div className="flex justify-between items-center mb-6">
				<Heading is="h4">Edit Tees</Heading>
				<Button
					type="button"
					onClick={() => setAddNewTees(true)}
					disabled={addNewTees || navigation.state === 'submitting'}
				>
					<Plus className="mr-1" /> Add New Tees
				</Button>
			</div>
			<Form method="POST">
				{addNewTees && (
					<fieldset
						className="flex flex-col gap-4 mb-6"
						disabled={navigation.state === 'submitting'}
					>
						<Input
							ref={newTeeNameRef}
							name="name"
							placeholder="Tee Name (e.g. black, blue)"
							value={newTeeName}
							onChange={e => setNewTeeName(e.target.value)}
							required
						/>
						<Input
							name="rating"
							placeholder="Rating"
							type="number"
							step="0.01"
							required
						/>
						<Input name="slope" placeholder="Slope" type="number" required />
					</fieldset>
				)}
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
							{course.tees?.map(tee => {
								return (
									<Fragment key={tee.id}>
										<TableCell className="text-muted-foreground font-bold">
											<div className="flex gap-2 items-center">
												{tee.name} (yards)
												<DeleteTee id={tee.id} />
											</div>
										</TableCell>
									</Fragment>
								);
							})}
							{addNewTees && (
								<TableHead className="text-muted-foreground font-bold">
									{newTeeName ?? '--'}
								</TableHead>
							)}
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
											<TableCell key={tee.id}>
												<label
													htmlFor={`${tee.id}.hole.${hole.id}.yardage`}
													className="sr-only"
												>
													yardage
												</label>
												<Input
													id={`${tee.id}.hole.${hole.number}.yardage`}
													type="number"
													defaultValue={tee.yardage}
													name={`hole.${hole.number}.yardage`}
													disabled={addNewTees}
												/>
												<input
													type="hidden"
													value={hole.id}
													name={`${tee.id}.hole.${hole.number}.holeId`}
												/>
											</TableCell>
										);
									})}
									{addNewTees && (
										<TableCell>
											<label
												htmlFor={`hole.${hole.number}.yardage`}
												className="sr-only"
											>
												yardage
											</label>
											<Input
												id={`hole.${hole.number}.yardage`}
												type="number"
												placeholder="0"
												name={`hole.${hole.number}.yardage`}
											/>
											<input
												type="hidden"
												value={hole.id}
												name={`hole.${hole.number}.holeId`}
											/>
										</TableCell>
									)}
								</TableRow>
							);
						})}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell>TOT</TableCell>
							<TableCell>{course.par}</TableCell>
							<TableCell>--</TableCell>
							{course.tees.map(tee => {
								return (
									<Fragment key={tee.id}>
										<TableCell>{tee.yardage}</TableCell>
									</Fragment>
								);
							})}
							{addNewTees && <TableCell>--</TableCell>}
						</TableRow>
					</TableFooter>
				</Table>
				<div className="mt-4 text-right">
					<Button name="_intent" value="addTee" type="submit" className="w-28">
						Save Tees
					</Button>
				</div>
			</Form>
		</>
	);
}
