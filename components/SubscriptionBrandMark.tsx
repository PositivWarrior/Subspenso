import { icons } from '@/constants/icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, View } from 'react-native';

type AntDesignGlyph = ComponentProps<typeof AntDesign>['name'];

/**
 * Maps subscription names to brand marks. Uses @expo/vector-icons (Ant Design glyphs)
 * for common providers, then bundled PNGs, then `fallbackSource`.
 */
const VECTOR_BRANDS: { test: RegExp; glyph: AntDesignGlyph; color: string }[] = [
	{ test: /spotify/i, glyph: 'spotify', color: '#1DB954' },
	{ test: /github/i, glyph: 'github', color: '#181717' },
	{ test: /slack/i, glyph: 'slack', color: '#4A154B' },
	{ test: /dropbox/i, glyph: 'dropbox', color: '#0061FF' },
	{ test: /google/i, glyph: 'google', color: '#4285F4' },
	{ test: /youtube/i, glyph: 'youtube', color: '#FF0000' },
	{ test: /amazon|aws|audible/i, glyph: 'amazon', color: '#FF9900' },
	{ test: /\bapple\b|icloud|macos|iphone/i, glyph: 'apple', color: '#000000' },
	{ test: /reddit/i, glyph: 'reddit', color: '#FF4500' },
	{ test: /twitter|x\.com/i, glyph: 'twitter', color: '#1DA1F2' },
	{ test: /gitlab/i, glyph: 'gitlab', color: '#FC6D26' },
];

const PNG_BRANDS: { test: RegExp; source: ImageSourcePropType }[] = [
	{ test: /notion/i, source: icons.notion },
	{ test: /figma/i, source: icons.figma },
	{ test: /adobe/i, source: icons.adobe },
	{ test: /canva/i, source: icons.canva },
	{ test: /claude|anthropic/i, source: icons.claude },
	{ test: /openai|chatgpt|gpt/i, source: icons.openai },
	{ test: /medium\b/i, source: icons.medium },
];

export type SubscriptionBrandMarkProps = {
	name: string;
	fallbackSource: ImageSourcePropType;
	/** `upcoming` matches the smaller row in upcoming cards (`size-14`). */
	variant?: 'subscription' | 'upcoming';
};

const SubscriptionBrandMark = ({
	name,
	fallbackSource,
	variant = 'subscription',
}: SubscriptionBrandMarkProps) => {
	const boxClass =
		variant === 'upcoming'
			? 'size-14 items-center justify-center overflow-hidden rounded-lg bg-white/50'
			: 'sub-icon items-center justify-center overflow-hidden rounded-lg bg-white/50';
	const pngClass = variant === 'upcoming' ? 'size-14 rounded-lg' : 'sub-icon';
	const glyphSize = variant === 'upcoming' ? 22 : 30;

	for (const row of VECTOR_BRANDS) {
		if (row.test.test(name)) {
			return (
				<View className={boxClass}>
					<AntDesign name={row.glyph} size={glyphSize} color={row.color} />
				</View>
			);
		}
	}
	for (const row of PNG_BRANDS) {
		if (row.test.test(name)) {
			return <Image source={row.source} className={pngClass} />;
		}
	}
	return <Image source={fallbackSource} className={pngClass} />;
};


export default SubscriptionBrandMark;
