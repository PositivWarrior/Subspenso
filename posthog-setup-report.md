<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Subspenso, an Expo Router React Native app. The SDK (`posthog-react-native`) was already installed and the full integration was verified and confirmed in place. One new event was added and environment variable values were updated with the correct project credentials.

- **Provider & screen tracking**: `PostHogProvider` wraps the root in `app/_layout.tsx`; a `PostHogScreenTracker` component calls `posthog.screen()` on every Expo Router pathname change, tracking the previous screen as a property.
- **App open event**: `PostHogBootstrap` in `app/_layout.tsx` fires `subspenso_app_opened` once PostHog is ready, enabling DAU/MAU measurement.
- **User identification**: `posthog.identify()` is called with the Clerk user ID on successful sign-in and sign-up, linking PostHog sessions to authenticated users. `posthog.reset()` is called on sign-out to clear identity.
- **Auth event tracking**: Sign-in and sign-up success/failure events are captured with relevant error codes.
- **Subscription engagement tracking**: Card expand/collapse and detail-view events are captured with the subscription ID.
- **Onboarding tracking**: `onboarding_viewed` added to `app/onboarding.tsx` — marks the top of the new-user activation funnel.
- **Environment variables**: `EXPO_PUBLIC_POSTHOG_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` written to `.env` with the correct project values.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `subspenso_app_opened` | Fired when PostHog is ready after app launch; measures DAU/MAU. | `app/_layout.tsx` |
| `user_signed_in` | User completes password sign-in; triggers `identify()`. Props: `method`. | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Clerk returns an error during sign-in. Props: `error_code`. | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User verifies email and completes registration; triggers `identify()`. Props: `method`. | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | Sign-up or email verification fails. Props: `step`, `error_code`. | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User taps Sign out in Settings; triggers `reset()`. | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User expands a subscription card on the home screen. Props: `subscription_id`. | `app/(tabs)/index.tsx` |
| `subscription_collapsed` | User collapses an already-expanded subscription card. Props: `subscription_id`. | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User opens a subscription detail screen. Props: `subscription_id`. | `app/[id].tsx` |
| `onboarding_viewed` | User reaches the onboarding screen; top of the new-user activation funnel. | `app/onboarding.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/156752/dashboard/614241
- **Sign-up Conversion Funnel** (onboarding → signed up): https://eu.posthog.com/project/156752/insights/QgC3Ag2x
- **Daily Sign-ins vs Sign-ups** (growth vs retention): https://eu.posthog.com/project/156752/insights/gfox41qK
- **Sign-up Failures vs Successes** (registration friction): https://eu.posthog.com/project/156752/insights/ZiOn8zRx
- **Subscription Engagement** (card expanded & details viewed): https://eu.posthog.com/project/156752/insights/9bLCiRX0
- **Weekly Sign-outs** (churn signal): https://eu.posthog.com/project/156752/insights/yU7Qy5yl

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
