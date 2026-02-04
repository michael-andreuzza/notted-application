# Notted - Project Progress

## App Features (Complete)

- Note creation with List and Text modes
- Checklist items with auto-sink for checked items
- Shake to clear checked items (configurable)
- Haptic feedback (configurable)
- Light/Dark/System theme modes
- Onboarding modal for first launch
- Settings modal (theme, haptics, shake to clear, delete all data)
- Paywall modal with Polar.sh integration
- Premium unlock via web checkout
- Deep linking for purchase confirmation (notted://)

## UI/UX (Complete)

- Minimal design with plain backgrounds (#FAFAFA / #010101)
- Custom SVG icons (back arrow, close X, settings dots, plus, etc.)
- X close button on all modals
- Segmented control for List/Text tabs with dot indicator
- Premium banner fixed at bottom of home screen
- Compact modals (settings, paywall, onboarding)
- Lighter text colors for body content

## Assets & Docs (Complete)

- App icon and splash screen
- Privacy policy (PRIVACY.md)
- Terms of service (TERMS.md)
- App Store listing content (APPSTORE_LISTING.md)
- Screenshots folder (appstore/screenshots/)

## Landing Page (Complete)

- Live at notted.app
- Success page (/success) - redirects to app after purchase
- Support page (/support) - contact michael@notted.app
- 404 page

## Android Build (Complete)

- EAS configured (eas.json)
- Latest APK: https://expo.dev/artifacts/eas/trXshmudvpuzcErjfhZRE8.apk
- Tested and working on device

## Google Play (In Progress)

- Developer account created ($25 paid)
- Identity verification: PENDING (documents submitted)
- Phone verification: BLOCKED (waiting for identity approval)
- Console: https://play.google.com/console/u/0/developers/6267792806523391248/app-list

### Once Google Verifies Identity:

1. Create new app in Google Play Console
2. Fill store listing (copy from APPSTORE_LISTING.md):
   - Title: Notted
   - Short description
   - Full description
   - Screenshots (upload from appstore/screenshots/)
   - App icon
   - Feature graphic (if needed)
3. Set up content rating questionnaire
4. Upload APK/AAB file
5. Set pricing: $4.99 (or use Polar for payments)
6. Submit for review (takes 1-3 days typically)

## iOS (Future)

- Requires Apple Developer account ($99/year)
- Build command: `eas build --platform ios --profile production`
- Same codebase works for iOS
- 30 builds/month shared between Android and iOS on Expo free tier

## Costs Summary

| Item | Cost | Status |
|------|------|--------|
| Expo | $0 | Free tier (30 builds/month) |
| Google Play | $25 | Paid (one-time) |
| Apple Developer | $99/year | Not purchased yet |
| Polar.sh | % of sales | Only when you make money |

## Commands Reference

```bash
# Run development server
npx expo start

# Build Android APK
eas build --platform android --profile production

# Build iOS (when ready)
eas build --platform ios --profile production
```
