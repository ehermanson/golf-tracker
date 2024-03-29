import { ResponsivePie } from '@nivo/pie';

export function PieChart(props: React.ComponentProps<typeof ResponsivePie>) {
	return (
		<ResponsivePie
			innerRadius={0.5}
			padAngle={0.7}
			cornerRadius={1}
			activeOuterRadiusOffset={0}
			animate={false}
			colors={{ scheme: 'blues' }}
			borderWidth={1}
			enableArcLinkLabels={false}
			borderColor={{
				from: 'color',
				modifiers: [['darker', 0.5]],
			}}
			{...props}
		/>
	);
}
