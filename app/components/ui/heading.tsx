import { cn } from '~/utils';

interface Props extends React.HTMLProps<HTMLHeadingElement> {
	is: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	className?: string;
}

const headingClassMap = {
	h1: 'text-4xl font-extrabold tracking-tight',
	h2: 'text-3xl font-extrabold tracking-tight',
	h3: 'text-2xl font-extrabold tracking-tight',
	h4: 'text-xl font-extrabold tracking-tight',
	h5: 'text-lg font-extrabold tracking-tight',
	h6: 'text-lg font-extrabold tracking-tight',
};

export function Heading({ is: El, ...props }: Props) {
	const classes = headingClassMap[El];

	return <El {...props} className={cn(classes, props.className)} />;
}
