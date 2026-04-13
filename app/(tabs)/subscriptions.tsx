import SubscriptionCard from '@/components/SubscriptionCard';
import '@/global.css';
import { useSubscriptions } from '@/lib/subscriptions-context';
import { formatStatusLabel } from '@/lib/utils';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { useMemo, useState } from 'react';
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	View,
} from 'react-native';
import {
	SafeAreaView as RNSafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

function subscriptionMatchesQuery(sub: Subscription, q: string): boolean {
	const haystack = [
		sub.name,
		sub.plan,
		sub.category,
		sub.billing,
		sub.paymentMethod,
		sub.status,
		sub.status ? formatStatusLabel(sub.status) : '',
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
	return haystack.includes(q);
}

const Subscriptions = () => {
	const { subscriptions } = useSubscriptions();
	const [query, setQuery] = useState('');
	const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
		string | null
	>(null);
	const posthog = usePostHog();
	const insets = useSafeAreaInsets();

	const filteredSubscriptions = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return subscriptions;
		return subscriptions.filter((sub) =>
			subscriptionMatchesQuery(sub, trimmed),
		);
	}, [query, subscriptions]);

	return (
		<SafeAreaView className="flex-1 bg-background p-5">
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
			>
				<FlatList
					style={{ flex: 1 }}
					data={filteredSubscriptions}
					keyExtractor={(item) => item.id}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="on-drag"
					ListHeaderComponent={
						<View className="mb-4">
							<Text className="mb-4 text-2xl font-sans-bold text-primary">
								Subscriptions
							</Text>
							<TextInput
								value={query}
								onChangeText={setQuery}
								placeholder="Search by name, category, plan…"
								placeholderTextColor="rgba(0,0,0,0.45)"
								autoCapitalize="none"
								autoCorrect={false}
								clearButtonMode="while-editing"
								className="rounded-2xl border border-border bg-card px-4 py-3.5 font-sans-medium text-base text-primary"
							/>
						</View>
					}
					renderItem={({ item }) => (
						<SubscriptionCard
							{...item}
							expanded={expandedSubscriptionId === item.id}
							onPress={() => {
								const isExpanding =
									expandedSubscriptionId !== item.id;
								posthog.capture(
									isExpanding
										? 'subscription_expanded'
										: 'subscription_collapsed',
									{ subscription_id: item.id },
								);
								setExpandedSubscriptionId(
									isExpanding ? item.id : null,
								);
							}}
						/>
					)}
					extraData={expandedSubscriptionId}
					ItemSeparatorComponent={() => <View className="h-4" />}
					showsVerticalScrollIndicator={false}
					contentContainerClassName="pb-30"
					ListEmptyComponent={
						<Text className="home-empty-state">
							{query.trim()
								? 'No subscriptions match your search'
								: 'No subscriptions yet'}
						</Text>
					}
				/>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};
export default Subscriptions;
