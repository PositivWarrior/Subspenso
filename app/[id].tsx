import { useAuth } from '@clerk/expo';
import { Link, Redirect, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

const SubscriptionDetails = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { isSignedIn, isLoaded } = useAuth();

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
