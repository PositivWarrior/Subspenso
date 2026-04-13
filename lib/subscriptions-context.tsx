import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

type SubscriptionsContextValue = {
	subscriptions: Subscription[];
	addSubscription: (subscription: Subscription) => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
	null,
);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
	const [subscriptions, setSubscriptions] = useState<Subscription[]>(
		() => [...HOME_SUBSCRIPTIONS],
	);

	const addSubscription = useCallback((subscription: Subscription) => {
		setSubscriptions((prev) => [subscription, ...prev]);
	}, []);

	const value = useMemo(
		() => ({ subscriptions, addSubscription }),
		[subscriptions, addSubscription],
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
