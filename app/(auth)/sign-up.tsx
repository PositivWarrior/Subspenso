import { AuthBrandHeader } from '@/components/AuthBrandHeader';
import '@/global.css';
import {
	validateEmail,
	validatePassword,
	validateVerificationCode,
} from '@/lib/auth-validation';
import { createFinalizeNavigate } from '@/lib/clerk-finalize';
import { useAuth, useSignUp } from '@clerk/expo';
import cn from 'clsx';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUpScreen() {
	const router = useRouter();
	const { isSignedIn, isLoaded } = useAuth();
	const { signUp, errors, fetchStatus } = useSignUp();
	const posthog = usePostHog();
	const finalizeNavigate = createFinalizeNavigate(router);

	const [emailAddress, setEmailAddress] = useState('');
	const [password, setPassword] = useState('');
	const [code, setCode] = useState('');
	const [localEmailError, setLocalEmailError] = useState<string | null>(null);
	const [localPasswordError, setLocalPasswordError] = useState<string | null>(
		null,
	);
	const [localCodeError, setLocalCodeError] = useState<string | null>(null);

	const busy = fetchStatus === 'fetching';

	const onSubmitSignUp = async () => {
		const eErr = validateEmail(emailAddress);
		const pErr = validatePassword(password);
		setLocalEmailError(eErr);
		setLocalPasswordError(pErr);
		if (eErr || pErr) return;

		const { error } = await signUp.password({
			emailAddress: emailAddress.trim(),
			password,
		});
		if (error) {
			if (__DEV__) console.error('[Clerk sign-up]', error);
			posthog.capture('user_sign_up_failed', {
				step: 'password',
				error_code: error.code ?? null,
			});
			return;
		}
		await signUp.verifications.sendEmailCode();
	};

	const onVerify = async () => {
		const cErr = validateVerificationCode(code);
		setLocalCodeError(cErr);
		if (cErr) return;
		const { error } = await signUp.verifications.verifyEmailCode({
			code: code.trim(),
		});
		if (error) {
			if (__DEV__) console.error('[Clerk sign-up verify]', error);
			posthog.capture('user_sign_up_failed', {
				step: 'email_verification',
				error_code: error.code ?? null,
			});
			return;
		}
		if (signUp.status === 'complete') {
			const userId = signUp.createdUserId ?? emailAddress.trim();
			posthog.identify(userId, {
				email: emailAddress.trim(),
				$set_once: { first_sign_up_date: new Date().toISOString() },
			});
			posthog.capture('user_signed_up', { method: 'password' });
			await signUp.finalize({ navigate: finalizeNavigate });
		} else if (__DEV__) {
			console.error(
				'Sign-up attempt not complete:',
				signUp.status,
				signUp,
			);
		}
	};

	if (!isLoaded) {
		return null;
	}

	if (signUp.status === 'complete' || isSignedIn) {
		return null;
	}

	const needsEmailCode =
		signUp.status === 'missing_requirements' &&
		signUp.unverifiedFields?.includes('email_address') &&
		(signUp.missingFields?.length ?? 0) === 0;

	const clerkEmailError = errors?.fields?.emailAddress?.message;
	const clerkPasswordError = errors?.fields?.password?.message;
	const clerkCodeError = errors?.fields?.code?.message;

	if (needsEmailCode) {
		return (
			<SafeAreaView className="auth-safe-area">
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					className="auth-screen"
				>
					<ScrollView
						keyboardShouldPersistTaps="handled"
						className="auth-scroll"
						contentContainerClassName="auth-content grow"
						showsVerticalScrollIndicator={false}
					>
						<AuthBrandHeader
							title="Verify your email"
							subtitle="We sent a code to your inbox. Enter it below to finish creating your account."
						/>

						<View className="auth-card">
							<View className="auth-form">
								<View className="auth-field">
									<Text className="auth-label">
										Verification code
									</Text>
									<TextInput
										className={cn(
											'auth-input',
											(localCodeError ||
												clerkCodeError) &&
												'auth-input-error',
										)}
										value={code}
										placeholder="Enter the 6-digit code"
										placeholderTextColor="rgba(0,0,0,0.45)"
										onChangeText={(t) => {
											setCode(t);
											setLocalCodeError(null);
										}}
										keyboardType="number-pad"
										textContentType="oneTimeCode"
										autoComplete="one-time-code"
										editable={!busy}
									/>
									{localCodeError ? (
										<Text className="auth-error">
											{localCodeError}
										</Text>
									) : null}
									{clerkCodeError ? (
										<Text className="auth-error">
											{clerkCodeError}
										</Text>
									) : null}
								</View>

								<Pressable
									className={cn(
										'auth-button',
										(busy || !code.trim()) &&
											'auth-button-disabled',
									)}
									disabled={busy || !code.trim()}
									onPress={onVerify}
								>
									{busy ? (
										<ActivityIndicator color="#081126" />
									) : (
										<Text className="auth-button-text">
											Verify & continue
										</Text>
									)}
								</Pressable>

								<Pressable
									className="auth-secondary-button"
									disabled={busy}
									onPress={() =>
										signUp.verifications.sendEmailCode()
									}
								>
									<Text className="auth-secondary-button-text">
										I need a new code
									</Text>
								</Pressable>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		);
	}

	const emailInvalid = !!(localEmailError || clerkEmailError);
	const passwordInvalid = !!(localPasswordError || clerkPasswordError);

	return (
		<SafeAreaView className="auth-safe-area">
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				className="auth-screen"
			>
				<ScrollView
					keyboardShouldPersistTaps="handled"
					className="auth-scroll"
					contentContainerClassName="auth-content grow"
					showsVerticalScrollIndicator={false}
				>
					<AuthBrandHeader
						title="Create your account"
						subtitle="Track renewals, spending, and reminders in one calm place."
					/>

					<View className="auth-card">
						<View className="auth-form">
							<View className="auth-field">
								<Text className="auth-label">Email</Text>
								<TextInput
									className={cn(
										'auth-input',
										emailInvalid && 'auth-input-error',
									)}
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
									textContentType="emailAddress"
									value={emailAddress}
									placeholder="Enter your email"
									placeholderTextColor="rgba(0,0,0,0.45)"
									onChangeText={(t) => {
										setEmailAddress(t);
										setLocalEmailError(null);
									}}
									editable={!busy}
								/>
								{localEmailError ? (
									<Text className="auth-error">
										{localEmailError}
									</Text>
								) : null}
								{clerkEmailError ? (
									<Text className="auth-error">
										{clerkEmailError}
									</Text>
								) : null}
							</View>

							<View className="auth-field">
								<Text className="auth-label">Password</Text>
								<TextInput
									className={cn(
										'auth-input',
										passwordInvalid && 'auth-input-error',
									)}
									value={password}
									placeholder="Create a password"
									placeholderTextColor="rgba(0,0,0,0.45)"
									secureTextEntry
									textContentType="newPassword"
									autoComplete="password-new"
									onChangeText={(t) => {
										setPassword(t);
										setLocalPasswordError(null);
									}}
									editable={!busy}
								/>
								<Text className="auth-helper">
									At least 8 characters. Avoid common words.
								</Text>
								{localPasswordError ? (
									<Text className="auth-error">
										{localPasswordError}
									</Text>
								) : null}
								{clerkPasswordError ? (
									<Text className="auth-error">
										{clerkPasswordError}
									</Text>
								) : null}
							</View>

							<Pressable
								className={cn(
									'auth-button',
									(busy ||
										!emailAddress.trim() ||
										!password ||
										!!localEmailError ||
										!!localPasswordError) &&
										'auth-button-disabled',
								)}
								disabled={
									busy ||
									!emailAddress.trim() ||
									!password ||
									!!localEmailError ||
									!!localPasswordError
								}
								onPress={onSubmitSignUp}
							>
								{busy ? (
									<ActivityIndicator color="#081126" />
								) : (
									<Text className="auth-button-text">
										Continue
									</Text>
								)}
							</Pressable>

							<View nativeID="clerk-captcha" />
						</View>
					</View>

					<View className="auth-link-row">
						<Text className="auth-link-copy">
							Already have an account?{' '}
						</Text>
						<Link href="/(auth)/sign-in" asChild>
							<Pressable hitSlop={8}>
								<Text className="auth-link">Sign in</Text>
							</Pressable>
						</Link>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
