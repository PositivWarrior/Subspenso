import { icons } from '@/constants/icons';
import { subscriptionSurfaceColor } from '@/constants/subscription-colors';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
	'Entertainment',
	'AI Tools',
	'Developer Tools',
	'Design',
	'Productivity',
	'Cloud',
	'Music',
	'Other',
] as const;

type Category = (typeof CATEGORIES)[number];

type Billing = 'Monthly' | 'Yearly';

export type CreateSubscriptionModalProps = {
	visible: boolean;
	onClose: () => void;
	onCreated: (subscription: Subscription) => void;
};

function parsePositivePrice(raw: string): number | null {
	const trimmed = raw.trim().replace(',', '.');
	if (!trimmed) return null;
	const n = Number(trimmed);
	if (!Number.isFinite(n) || n <= 0) return null;
	return n;
}

const CreateSubscriptionModal = ({
	visible,
	onClose,
	onCreated,
}: CreateSubscriptionModalProps) => {
	const posthog = usePostHog();
	const insets = useSafeAreaInsets();
	const [name, setName] = useState('');
	const [price, setPrice] = useState('');
	const [billing, setBilling] = useState<Billing>('Monthly');
	const [category, setCategory] = useState<Category | null>(null);
	const [nameTouched, setNameTouched] = useState(false);
	const [priceTouched, setPriceTouched] = useState(false);
	const [submitAttempted, setSubmitAttempted] = useState(false);

	const reset = useCallback(() => {
		setName('');
		setPrice('');
		setBilling('Monthly');
		setCategory(null);
		setNameTouched(false);
		setPriceTouched(false);
		setSubmitAttempted(false);
	}, []);

	useEffect(() => {
		if (!visible) {
			reset();
		}
	}, [visible, reset]);

	const nameError = useMemo(() => {
		if (!name.trim() && (nameTouched || submitAttempted)) {
			return 'Name is required';
		}
		return null;
	}, [name, nameTouched, submitAttempted]);

	const priceError = useMemo(() => {
		if (!price.trim() && (priceTouched || submitAttempted)) {
			return 'Price is required';
		}
		if (
			price.trim() &&
			(priceTouched || submitAttempted) &&
			parsePositivePrice(price) === null
		) {
			return 'Enter a positive number';
		}
		return null;
	}, [price, priceTouched, submitAttempted]);

	const categoryError = useMemo(
		() =>
			submitAttempted && !category
				? 'Select a category'
				: null,
		[submitAttempted, category],
	);

	const parsedPrice = parsePositivePrice(price);
	const canSubmit =
		name.trim().length > 0 &&
		parsedPrice !== null &&
		category !== null;

	const handleSubmit = () => {
		setSubmitAttempted(true);
		if (!canSubmit || !parsedPrice || !category) return;

		const start = dayjs();
		const renewal = start.add(1, billing === 'Monthly' ? 'month' : 'year');

		const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		const subscription: Subscription = {
			id,
			name: name.trim(),
			price: parsedPrice,
			currency: 'USD',
			billing,
			frequency: billing,
			category,
			status: 'active',
			startDate: start.toISOString(),
			renewalDate: renewal.toISOString(),
			icon: icons.wallet,
			color: subscriptionSurfaceColor(`${id}-${name.trim()}`),
		};

		onCreated(subscription);

		posthog?.capture('subscription_created', {
			subscription_name: name.trim(),
			subscription_price: parsedPrice,
			subscription_frequency: billing,
			subscription_category: category,
		});

		onClose();
	};

	const handleRequestClose = () => {
		onClose();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={handleRequestClose}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				className="flex-1"
			>
				<View className="modal-overlay flex-col justify-end">
					<View
						className="modal-container"
						style={{ paddingBottom: Math.max(insets.bottom, 8) }}
					>
						<View className="modal-header">
							<Text className="modal-title">New Subscription</Text>
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Close"
								className="modal-close"
								onPress={handleRequestClose}
							>
								<Text className="modal-close-text">×</Text>
							</Pressable>
						</View>

						<ScrollView
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}
							contentContainerClassName="modal-body flex-col pb-4"
						>
							<View className="auth-field">
								<Text className="auth-label">Name</Text>
								<TextInput
									className={clsx(
										'auth-input',
										nameError && 'auth-input-error',
									)}
									value={name}
									onChangeText={(t) => {
										setName(t);
										if (!nameTouched) setNameTouched(true);
									}}
									placeholder="Subscription name"
									placeholderTextColor="rgba(0,0,0,0.45)"
								/>
								{nameError ? (
									<Text className="auth-error">{nameError}</Text>
								) : null}
							</View>

							<View className="auth-field">
								<Text className="auth-label">Price</Text>
								<TextInput
									className={clsx(
										'auth-input',
										priceError && 'auth-input-error',
									)}
									value={price}
									onChangeText={(t) => {
										setPrice(t);
										if (!priceTouched) setPriceTouched(true);
									}}
									placeholder="0.00"
									placeholderTextColor="rgba(0,0,0,0.45)"
									keyboardType="decimal-pad"
								/>
								{priceError ? (
									<Text className="auth-error">{priceError}</Text>
								) : null}
							</View>

							<View className="auth-field">
								<Text className="auth-label">Frequency</Text>
								<View className="picker-row">
									<Pressable
										className={clsx(
											'picker-option',
											billing === 'Monthly' &&
												'picker-option-active',
										)}
										onPress={() => setBilling('Monthly')}
									>
										<Text
											className={clsx(
												'picker-option-text',
												billing === 'Monthly' &&
													'picker-option-text-active',
											)}
										>
											Monthly
										</Text>
									</Pressable>
									<Pressable
										className={clsx(
											'picker-option',
											billing === 'Yearly' &&
												'picker-option-active',
										)}
										onPress={() => setBilling('Yearly')}
									>
										<Text
											className={clsx(
												'picker-option-text',
												billing === 'Yearly' &&
													'picker-option-text-active',
											)}
										>
											Yearly
										</Text>
									</Pressable>
								</View>
							</View>

							<View className="auth-field">
								<Text className="auth-label">Category</Text>
								<View className="category-scroll">
									{CATEGORIES.map((c) => {
										const active = category === c;
										return (
											<Pressable
												key={c}
												className={clsx(
													'category-chip',
													active && 'category-chip-active',
												)}
												onPress={() => setCategory(c)}
											>
												<Text
													className={clsx(
														'category-chip-text',
														active &&
															'category-chip-text-active',
													)}
												>
													{c}
												</Text>
											</Pressable>
										);
									})}
								</View>
								{categoryError ? (
									<Text className="auth-error">{categoryError}</Text>
								) : null}
							</View>

							<Pressable
								className={clsx(
									'auth-button',
									!canSubmit && 'auth-button-disabled',
								)}
								disabled={!canSubmit}
								onPress={handleSubmit}
							>
								<Text className="auth-button-text">Add subscription</Text>
							</Pressable>
						</ScrollView>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
};

export default CreateSubscriptionModal;
