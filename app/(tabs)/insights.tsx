import { styled } from 'nativewind';
import { Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
	return (
		<SafeAreaView className="flex-1 p-5 bg-background">
			<Text>Insights</Text>
		</SafeAreaView>
	);
};
export default Insights;
