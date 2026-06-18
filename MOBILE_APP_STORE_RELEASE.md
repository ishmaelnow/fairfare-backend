# FairFare Mobile App Store Release

This repo contains Capacitor mobile wrappers for:

- Rider: `app.fairfaretransportation.rider`
- Driver: `app.fairfaretransportation.driver`

## Local Build Prep

From each app folder:

```bash
npm install --legacy-peer-deps
npm run build:mobile
npm run sync:android
npm run sync:ios
```

Open native projects:

```bash
npm run open:android
npm run open:ios
```

## Required Environment Variables

Set these in local `.env.mobile` files or in Codemagic environment group `fairfare-production`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_BASE_URL=https://rider.fairfaretransportation.app
VITE_STRIPE_PUBLISHABLE_KEY=...
```

For Driver builds, `VITE_API_BASE_URL` should be:

```bash
VITE_API_BASE_URL=https://driver.fairfaretransportation.app
```

## Codemagic Workflows

The root `codemagic.yaml` defines:

- `rider-android`
- `driver-android`
- `rider-ios`
- `driver-ios`

Android workflows produce `.aab` artifacts for Google Play.

iOS workflows produce `.ipa` artifacts once App Store Connect signing is configured in Codemagic.

## Store Setup Checklist

Google Play:

- Create app records for Rider and Driver.
- Use package names `app.fairfaretransportation.rider` and `app.fairfaretransportation.driver`.
- Configure app signing/upload key in Play Console and Codemagic.
- Upload `.aab` artifacts from Codemagic.

Apple App Store:

- Create bundle IDs for Rider and Driver in Apple Developer.
- Create matching apps in App Store Connect.
- Configure certificates/profiles in Codemagic App Store Connect integration.
- Upload `.ipa` artifacts from Codemagic/TestFlight.

## Permissions

Both native apps request foreground location access:

- Android: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`
- iOS: `NSLocationWhenInUseUsageDescription`

Driver location is used for live ride progress. Rider location is used for pickup and ride progress.
