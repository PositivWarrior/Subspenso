import {
	getDefaultSubscriptions,
	loadPersistedSubscriptions,
	persistSubscriptions,
} from '@/lib/subscriptions-persistence';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';

type SubscriptionsContextValue = {
	subscriptions: Subscription[];
	/** False until the first AsyncStorage read finishes. */
	subscriptionsHydrated: boolean;
	addSubscription: (subscription: Subscription) => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
	null,
);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
	const [subscriptions, setSubscriptions] = useState<Subscription[]>(
		() => getDefaultSubscriptions(),
	);
	const [subscriptionsHydrated, setSubscriptionsHydrated] = useState(false);
	const pendingAddsRef = useRef<Subscription[]>([]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const loaded = await loadPersistedSubscriptions();
			if (cancelled) return;

			const queued = [...pendingAddsRef.current];
			pendingAddsRef.current = [];

			const base =
				loaded !== null ? loaded : getDefaultSubscriptions();
			const next =
				queued.length > 0 ? [...[...queued].reverse(), ...base] : base;

			setSubscriptions(next);
			if (queued.length > 0) {
				void persistSubscriptions(next);
			}
			setSubscriptionsHydrated(true);
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const commitSubscriptions = useCallback(
		(updater: (prev: Subscription[]) => Subscription[]) => {
			setSubscriptions((prev) => {
				const next = updater(prev);
				void persistSubscriptions(next);
				return next;
			});
		},
		[],
	);

	const addSubscription = useCallback(
		(subscription: Subscription) => {
			if (!subscriptionsHydrated) {
				pendingAddsRef.current.push(subscription);
				return;
			}
			commitSubscriptions((prev) => [subscription, ...prev]);
		},
		[subscriptionsHydrated, commitSubscriptions],
	);

	const value = useMemo(
		() => ({
			subscriptions,
			subscriptionsHydrated,
			addSubscription,
		}),
		[subscriptions, subscriptionsHydrated, addSubscription],
	);

	return (
		<SubscriptionsContext.Provider value={value}>
			{children}
		</SubscriptionsContext.Provider>
	);
}

export function useSubscriptions() {
	const ctx = useContext(SubscriptionsContext);
	if (!ctx) {
		throw new Error(
			'useSubscriptions must be used within SubscriptionsProvider',
		);
	}
	return ctx;
}
