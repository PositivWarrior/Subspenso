import '@/global.css';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { useEffect, useRef } from 'react';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
/** Ingest API host from Project settings (not the app.posthog.com dashboard URL). US: https://us.i.posthog.com — EU: https://eu.i.posthog.com */
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST;

if (!publishableKey) {
	throw new Error(
		'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file.',
	);
}

if (!posthogKey) {
	throw new Error(
		'Missing EXPO_PUBLIC_POSTHOG_KEY. Add it to your .env file (Project API key from PostHog).',
	);
}

function PostHogScreenTracker() {
	const posthog = usePostHog();
	const pathname = usePathname();
	const params = useGlobalSearchParams();
	const previousPathname = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (previousPathname.current !== pathname) {
			posthog.screen(pathname, { previous_screen: previousPathname.current ?? null, ...params });
			previousPathname.current = pathname;
		}
	}, [pathname, params, posthog]);

	return null;
}

function PostHogBootstrap() {
	const posthog = usePostHog();

	useEffect(() => {
		void posthog.ready().then(() => {
			posthog.capture('subspenso_app_opened');
		});
	}, [posthog]);

	return null;
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
		'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
		'sans-semi-bold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
		'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
		'sans-extra-bold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
		'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
	});

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) return null;

	return (
		<PostHogProvider
			apiKey={posthogKey}
			options={{
				...(posthogHost ? { host: posthogHost } : {}),
			}}
			debug={__DEV__}
		>
			<PostHogScreenTracker />
			<PostHogBootstrap />
			<ClerkProvider
				publishableKey={publishableKey as string}
				{...(tokenCache ? { tokenCache } : {})}
			>
				<Stack screenOptions={{ headerShown: false }} />
			</ClerkProvider>
		</PostHogProvider>
	);
}
