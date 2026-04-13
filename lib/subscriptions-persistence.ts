import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { icons, type IconKey } from '@/constants/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** AsyncStorage key for persisted subscription list (JSON with `iconKey`, not `icon`). */
export const SUBSCRIPTIONS_STORAGE_KEY = '@subspenso/subscriptions/v1';

type StoredSubscription = Omit<Subscription, 'icon'> & { iconKey: IconKey };

function resolveIconKey(sub: Subscription): IconKey {
	for (const key of Object.keys(icons) as IconKey[]) {
		if (sub.icon === icons[key]) {
			return key;
		}
	}
	return 'wallet';
}

function toStored(sub: Subscription): StoredSubscription {
	const { icon: _icon, ...rest } = sub;
	return { ...rest, iconKey: resolveIconKey(sub) };
}

function fromStored(stored: StoredSubscription): Subscription {
	const { iconKey, ...rest } = stored;
	const icon = icons[iconKey] ?? icons.wallet;
	return { ...rest, icon };
}

function parseStored(raw: string | null): Subscription[] | null {
	if (raw == null || raw === '') return null;
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return null;
		const out: Subscription[] = [];
		for (const row of parsed) {
			if (
				row &&
				typeof row === 'object' &&
				'id' in row &&
				'name' in row &&
				typeof (row as { id: unknown }).id === 'string' &&
				typeof (row as { name: unknown }).name === 'string' &&
				'iconKey' in row &&
				typeof (row as { iconKey: unknown }).iconKey === 'string' &&
				(row as { iconKey: string }).iconKey in icons
			) {
				out.push(fromStored(row as StoredSubscription));
			}
		}
		return out.length > 0 ? out : null;
	} catch {
		return null;
	}
}

/**
 * Loads persisted subscriptions, or `null` if nothing valid is stored.
 */
export async function loadPersistedSubscriptions(): Promise<
	Subscription[] | null
> {
	try {
		const raw = await AsyncStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
		return parseStored(raw);
	} catch {
		return null;
	}
}

/**
 * Persists the full list (replaces storage). Call after any mutation.
 */
export async function persistSubscriptions(
	subs: Subscription[],
): Promise<void> {
	try {
		const stored = subs.map(toStored);
		await AsyncStorage.setItem(
			SUBSCRIPTIONS_STORAGE_KEY,
			JSON.stringify(stored),
		);
	} catch {
		// Best-effort; in-memory state remains authoritative until next successful write.
	}
}

export function getDefaultSubscriptions(): Subscription[] {
	return [...HOME_SUBSCRIPTIONS];
}
