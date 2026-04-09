import type { Href, Router } from 'expo-router';
import { Platform } from 'react-native';

/** Post-auth route — main app lives under the (tabs) group. */
export const POST_AUTH_HREF = '/(tabs)' as const;

export type FinalizeNavigateArgs = {
	session?: { currentTask?: unknown } | null;
	decorateUrl: (url: string) => string;
};

/**
 * Clerk `finalize({ navigate })` callback for Expo Router.
 * Uses `decorateUrl` then replaces to a local path; web HTTP URLs use `window.location`.
 */
export function createFinalizeNavigate(router: Router) {
	return ({ session, decorateUrl }: FinalizeNavigateArgs) => {
		if (session?.currentTask) {
			if (__DEV__) {
				console.warn('[Clerk] Session task pending:', session.currentTask);
			}
			return;
		}

		const url = decorateUrl(POST_AUTH_HREF);

		if (url.startsWith('http')) {
			if (Platform.OS === 'web' && typeof window !== 'undefined') {
				window.location.href = url;
			} else {
				router.replace(POST_AUTH_HREF as Href);
			}
			return;
		}

		router.replace(url as Href);
	};
}
