import { ResponsivePie } from '@nivo/pie';
import { ClientOnly } from 'remix-utils/client-only';

export function PieChart(props: React.ComponentProps<typeof ResponsivePie>) {
	return (
		<ClientOnly fallback={<></>}>
			{() => <ResponsivePie {...props} />}
		</ClientOnly>
	);
}
