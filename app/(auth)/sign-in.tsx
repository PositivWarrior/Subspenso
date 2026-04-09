import { AuthBrandHeader } from '@/components/AuthBrandHeader';
import '@/global.css';
import { validateEmail, validatePassword, validateVerificationCode } from '@/lib/auth-validation';
import { createFinalizeNavigate } from '@/lib/clerk-finalize';
import { useAuth, useSignIn } from '@clerk/expo';
import cn from 'clsx';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
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

export default function SignInScreen() {
	const router = useRouter();
	const { isLoaded } = useAuth();
	const { signIn, errors, fetchStatus } = useSignIn();

	const runFinalize = async () => {
		const navigate = createFinalizeNavigate(router);
		if (signIn.status === 'complete') {
			await signIn.finalize({ navigate });
		} else if (__DEV__) {
			console.error('Sign-in attempt not complete:', signIn.status, signIn);
		}
	};

	const [emailAddress, setEmailAddress] = useState('');
	const [password, setPassword] = useState('');
	const [code, setCode] = useState('');
	const [localEmailError, setLocalEmailError] = useState<string | null>(null);
	const [localPasswordError, setLocalPasswordError] = useState<string | null>(
		null,
	);
	const [localCodeError, setLocalCodeError] = useState<string | null>(null);

	const busy = fetchStatus === 'fetching';

	const onSubmitPassword = async () => {
		const eErr = validateEmail(emailAddress);
		const pErr = validatePassword(password);
		setLocalEmailError(eErr);
		setLocalPasswordError(pErr);
		if (eErr || pErr) return;

		const { error } = await signIn.password({
			emailAddress: emailAddress.trim(),
			password,
		});
		if (error) {
			if (__DEV__) console.error('[Clerk sign-in]', error);
			return;
		}

		if (signIn.status === 'complete') {
			await runFinalize();
		} else if (signIn.status === 'needs_second_factor') {
			// MFA with TOTP / backup codes — see Clerk MFA custom flow.
		} else if (signIn.status === 'needs_client_trust') {
			const emailCodeFactor = signIn.supportedSecondFactors?.find(
				(factor) => factor.strategy === 'email_code',
			);
			if (emailCodeFactor) {
				await signIn.mfa.sendEmailCode();
			}
		} else if (__DEV__) {
			console.error('Sign-in attempt not complete:', signIn.status, signIn);
		}
	};

	const onSubmitClientTrustCode = async () => {
		const cErr = validateVerificationCode(code);
		setLocalCodeError(cErr);
		if (cErr) return;

		await signIn.mfa.verifyEmailCode({ code: code.trim() });
		await runFinalize();
	};

	if (!isLoaded) {
		return null;
	}

	if (signIn.status === 'needs_second_factor') {
		return (
			<SafeAreaView className="auth-safe-area">
				<ScrollView
					className="auth-scroll"
					contentContainerClassName="auth-content grow"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<AuthBrandHeader
						title="Extra verification"
						subtitle="This account has two-step verification. Complete it in a supported channel or manage settings in Clerk."
					/>
					<View className="auth-card">
						<Text className="auth-helper text-center">
							If you use an authenticator app or backup codes, continue in the
							Clerk Account Portal or contact your administrator.
						</Text>
						<Pressable
							className="auth-secondary-button mt-5"
							onPress={() => signIn.reset()}
						>
							<Text className="auth-secondary-button-text">Start over</Text>
						</Pressable>
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}

	if (signIn.status === 'needs_client_trust') {
		const clerkCodeError = errors?.fields?.code?.message;

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
							title="Check your email"
							subtitle="We sent a verification code to confirm it is really you."
						/>

						<View className="auth-card">
							<View className="auth-form">
								<View className="auth-field">
									<Text className="auth-label">Verification code</Text>
									<TextInput
										className={cn(
											'auth-input',
											(localCodeError || clerkCodeError) && 'auth-input-error',
										)}
										value={code}
										placeholder="Enter the code"
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
										<Text className="auth-error">{localCodeError}</Text>
									) : null}
									{clerkCodeError ? (
										<Text className="auth-error">{clerkCodeError}</Text>
									) : null}
								</View>

								<Pressable
									className={cn(
										'auth-button',
										(busy || !code.trim()) && 'auth-button-disabled',
									)}
									disabled={busy || !code.trim()}
									onPress={onSubmitClientTrustCode}
								>
									{busy ? (
										<ActivityIndicator color="#081126" />
									) : (
										<Text className="auth-button-text">Verify & continue</Text>
									)}
								</Pressable>

								<Pressable
									className="auth-secondary-button"
									disabled={busy}
									onPress={() => signIn.mfa.sendEmailCode()}
								>
									<Text className="auth-secondary-button-text">
										Resend code
									</Text>
								</Pressable>

								<Pressable
									className="auth-secondary-button"
									disabled={busy}
									onPress={() => signIn.reset()}
								>
									<Text className="auth-secondary-button-text">Start over</Text>
								</Pressable>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		);
	}

	const clerkIdError = errors?.fields?.identifier?.message;
	const clerkPasswordError = errors?.fields?.password?.message;
	const emailInvalid = !!(localEmailError || clerkIdError);
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
						title="Welcome back"
						subtitle="Sign in to keep managing your subscriptions with confidence."
					/>

					<View className="auth-card">
						<View className="auth-form">
							<View className="auth-field">
								<Text className="auth-label">Email</Text>
								<TextInput
									className={cn('auth-input', emailInvalid && 'auth-input-error')}
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
									textContentType="username"
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
									<Text className="auth-error">{localEmailError}</Text>
								) : null}
								{clerkIdError ? (
									<Text className="auth-error">{clerkIdError}</Text>
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
									placeholder="Enter your password"
									placeholderTextColor="rgba(0,0,0,0.45)"
									secureTextEntry
									textContentType="password"
									autoComplete="current-password"
									onChangeText={(t) => {
										setPassword(t);
										setLocalPasswordError(null);
									}}
									editable={!busy}
								/>
								{localPasswordError ? (
									<Text className="auth-error">{localPasswordError}</Text>
								) : null}
								{clerkPasswordError ? (
									<Text className="auth-error">{clerkPasswordError}</Text>
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
								onPress={onSubmitPassword}
							>
								{busy ? (
									<ActivityIndicator color="#081126" />
								) : (
									<Text className="auth-button-text">Sign in</Text>
								)}
							</Pressable>
						</View>
					</View>

					<View className="auth-link-row">
						<Text className="auth-link-copy">New to Subspenso? </Text>
						<Link href="/(auth)/sign-up" asChild>
							<Pressable hitSlop={8}>
								<Text className="auth-link">Create an account</Text>
							</Pressable>
						</Link>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
