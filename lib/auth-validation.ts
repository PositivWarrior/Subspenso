const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
	const trimmed = email.trim();
	if (!trimmed) return 'Email is required';
	if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address';
	return null;
}

export function validatePassword(password: string): string | null {
	if (!password) return 'Password is required';
	if (password.length < 8) return 'Password must be at least 8 characters';
	return null;
}

export function validateVerificationCode(code: string): string | null {
	const trimmed = code.trim();
	if (!trimmed) return 'Verification code is required';
	if (trimmed.length < 6) return 'Enter the full code from your email';
	return null;
}
