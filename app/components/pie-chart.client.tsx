import { ResponsivePie } from '@nivo/pie';
import { ClientOnly } from 'remix-utils/client-only';

export function PieChart(props: React.ComponentProps<typeof ResponsivePie>) {
	return (
		<ClientOnly>
			{() => (
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
			)}
		</ClientOnly>
	);
}
