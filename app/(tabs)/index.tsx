import CreateSubscriptionModal from '@/components/CreateSubscriptionModal';
import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard';
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from '@/constants/data';
import { icons } from '@/constants/icons';
import images from '@/constants/images';
import '@/global.css';
import { clerkDisplayName } from '@/lib/clerk-user';
import { useSubscriptions } from '@/lib/subscriptions-context';
import { formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/expo';
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
	const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
		string | null
	>(null);
	const { subscriptions, addSubscription } = useSubscriptions();
	const [createModalVisible, setCreateModalVisible] = useState(false);
	const { user, isLoaded } = useUser();
	const posthog = usePostHog();

	const displayName = useMemo(
		() => (isLoaded ? clerkDisplayName(user) : ''),
		[isLoaded, user],
	);

	const avatarSource =
		user?.imageUrl && user.imageUrl.length > 0
			? { uri: user.imageUrl }
			: images.avatar;

	return (
		<SafeAreaView className="flex-1 p-5 bg-background">
			<FlatList
				ListHeaderComponent={() => (
					<>
						<View className="home-header">
							<View className="home-user">
								<Image
									source={avatarSource}
									className="home-avatar"
								/>
								<Text className="home-user-name">
									{isLoaded ? displayName || 'Account' : '…'}
								</Text>
							</View>

							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Add subscription"
								onPress={() => setCreateModalVisible(true)}
								hitSlop={8}
							>
								<Image
									source={icons.add}
									className="home-add-icon"
								/>
							</Pressable>
						</View>

						<View className="home-balance-card">
							<Text className="home-balance-label">Balance</Text>

							<View className="home-balance-row">
								<Text className="home-balance-amount">
									{formatCurrency(HOME_BALANCE.amount)}
								</Text>
								<Text className="home-balance-date">
									{dayjs(HOME_BALANCE.nextRenewalDate).format(
										'MM / DD',
									)}
								</Text>
							</View>
						</View>

						<View className="mb-5">
							<ListHeading title="Upcoming" />
							<FlatList
								data={UPCOMING_SUBSCRIPTIONS}
								renderItem={({ item }) => (
									<UpcomingSubscriptionCard {...item} />
								)}
								keyExtractor={(item) => item.id}
								horizontal
								showsHorizontalScrollIndicator={false}
								ListEmptyComponent={
									<Text className="home-empty-state">
										No upcoming subscriptions yet
									</Text>
								}
							/>
						</View>

						<ListHeading title="All Subscriptions" />
					</>
				)}
				data={subscriptions}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<SubscriptionCard
						{...item}
						expanded={expandedSubscriptionId === item.id}
						onPress={() => {
							setExpandedSubscriptionId((currentId) => {
								const isExpanding = currentId !== item.id;
								posthog.capture(isExpanding ? 'subscription_expanded' : 'subscription_collapsed', {
									subscription_id: item.id,
								});
								return isExpanding ? item.id : null;
							});
						}}
					/>
				)}
				extraData={expandedSubscriptionId}
				ItemSeparatorComponent={() => <View className="h-4" />}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<Text className="home-empty-state">
						No subscriptions yet
					</Text>
				}
				contentContainerClassName="pb-30"
			/>

			<CreateSubscriptionModal
				visible={createModalVisible}
				onClose={() => setCreateModalVisible(false)}
				onCreated={addSubscription}
			/>
		</SafeAreaView>
	);
}
