import SubscriptionBrandMark from '@/components/SubscriptionBrandMark';
import { formatCurrency } from '@/lib/utils';
import { Text, View } from 'react-native';

const UpcomingSubscriptionCard = ({
	name,
	price,
	daysLeft,
	icon,
	currency,
}: UpcomingSubscriptionCardProps) => {
	return (
		<View className="upcoming-card">
			<View className="upcoming-row">
				<View className="upcoming-icon">
					<SubscriptionBrandMark
						name={name}
						fallbackSource={icon}
						variant="upcoming"
					/>
				</View>
				<View>
					<Text className="upcoming-price">
						{formatCurrency(price, currency)}
					</Text>
					<Text className="upcoming-meta" numberOfLines={1}>
						{daysLeft > 1 ? `${daysLeft} days left` : 'Last Day'}
					</Text>
				</View>
			</View>

			<Text className="upcoming-name" numberOfLines={1}>
				{name}
			</Text>
		</View>
	);
};
export default UpcomingSubscriptionCard;
