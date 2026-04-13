import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

const Onboarding = () => {
	const posthog = usePostHog();

	useEffect(() => {
		posthog.capture('onboarding_viewed');
	}, [posthog]);

	return (
		<View>
			<Text>Onboarding</Text>
		</View>
	);
};
export default Onboarding;
