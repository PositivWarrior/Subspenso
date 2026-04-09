import dayjs from 'dayjs';

/** Clerk `useUser().user` fields used for display (keeps typing loose vs `@clerk/types`). */
export type ClerkUserLike = {
	fullName?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	primaryEmailAddress?: { emailAddress?: string } | null;
	username?: string | null;
	imageUrl?: string | null;
	createdAt?: Date | null;
} | null | undefined;

export function clerkDisplayName(user: ClerkUserLike): string {
	if (!user) return '';
	const full = user.fullName?.trim();
	if (full) return full;
	const combined = [user.firstName, user.lastName]
		.filter(Boolean)
		.join(' ')
		.trim();
	if (combined) return combined;
	return (
		user.primaryEmailAddress?.emailAddress ??
		user.username ??
		'Account'
	);
}

export function formatClerkMemberSince(user: ClerkUserLike): string {
	if (!user?.createdAt) return '—';
	return dayjs(user.createdAt).format('MMMM D, YYYY');
}
