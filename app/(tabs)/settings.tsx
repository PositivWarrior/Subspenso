import images from '@/constants/images';
import '@/global.css';
import { clerkDisplayName, formatClerkMemberSince } from '@/lib/clerk-user';
import { useClerk, useUser } from '@clerk/expo';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
	const { signOut } = useClerk();
	const { user, isLoaded } = useUser();
	const posthog = usePostHog();

	const displayName = clerkDisplayName(user);
	const email = user?.primaryEmailAddress?.emailAddress ?? '';
	const memberSince = formatClerkMemberSince(user);

	const avatarSource =
		user?.imageUrl && user.imageUrl.length > 0
			? { uri: user.imageUrl }
			: images.avatar;

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				className="flex-1 px-5"
				contentContainerClassName="pb-30 pt-2"
				showsVerticalScrollIndicator={false}
			>
				<Text className="list-title">Settings</Text>
				<Text className="mt-1 text-base font-sans-medium text-muted-foreground">
					Your Subspenso profile and account
				</Text>

				<Text className="mt-8 text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
					Profile
				</Text>
				<View className="sub-card mt-2">
					<View className="flex-row items-center gap-4">
						<Image
							source={avatarSource}
							className="size-16 rounded-full border border-border bg-muted"
						/>
						<View className="min-w-0 flex-1">
							<Text className="text-xl font-sans-bold text-primary">
								{isLoaded ? displayName || 'Account' : '…'}
							</Text>
							{email ? (
								<Text
									className="mt-1 text-base font-sans-medium text-muted-foreground"
									numberOfLines={2}
								>
									{email}
								</Text>
							) : isLoaded ? (
								<Text className="mt-1 text-base font-sans-medium text-muted-foreground">
									No email on file
								</Text>
							) : null}
						</View>
					</View>
				</View>

				<Text className="mt-8 text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
					Account
				</Text>
				<View className="sub-card mt-2 gap-5">
					<View className="gap-1">
						<Text className="text-sm font-sans-medium text-muted-foreground">
							Account ID
						</Text>
						<Text
							className="text-sm font-sans-medium text-primary"
							selectable
						>
							{isLoaded && user?.id ? user.id : '…'}
						</Text>
					</View>
					<View className="h-px bg-border" />
					<View className="gap-1">
						<Text className="text-sm font-sans-medium text-muted-foreground">
							Member since
						</Text>
						<Text className="text-base font-sans-semibold text-primary">
							{isLoaded ? memberSince : '…'}
						</Text>
					</View>
				</View>

				<View className="mt-10">
					<Pressable
						className="items-center rounded-2xl border border-destructive/35 bg-background py-4 active:opacity-80"
						onPress={() => {
							posthog.capture('user_signed_out');
							posthog.reset();
							void signOut();
						}}
					>
						<Text className="text-base font-sans-bold text-destructive">
							Sign out
						</Text>
					</Pressable>
					<Text className="mt-3 text-center text-sm font-sans-medium text-muted-foreground">
						You will need to sign in again to use Subspenso.
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};
export default Settings;
