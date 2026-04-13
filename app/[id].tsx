import { useAuth } from '@clerk/expo';
import { Link, Redirect, useLocalSearchParams } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

const SubscriptionDetails = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { isSignedIn, isLoaded } = useAuth();
	const posthog = usePostHog();

	useEffect(() => {
		if (isSignedIn && id) {
			posthog.capture('subscription_details_viewed', { subscription_id: id });
		}
	}, [isSignedIn, id, posthog]);

	if (!isLoaded) {
		return null;
	}

	if (!isSignedIn) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	return (
		<View>
			<Text>Subscription Details for {id}</Text>
			<Link href="/">Go back</Link>
		</View>
	);
};
export default SubscriptionDetails;
