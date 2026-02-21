# Finite - Life Countdown

A reflective life countdown app that helps you visualize the time you have left and live more intentionally.

## Features

- **Life Countdown** — Enter your birth date and see a real-time countdown of your remaining time, with a progress bar showing how much of your expected lifespan you've lived.
- **Custom Event Countdowns** — Add countdowns to any future date: birthdays, anniversaries, vacations, retirement, and more.
- **Motivational Splash** — Each time you open the app, a typewriter-style motivational quote greets you.
- **Onboarding Flow** — A gentle introduction for first-time users.
- **Ambient Audio** — Optional looping meditation track with adjustable volume.
- **Countdown Tick Sounds** — Optional ticking sounds when a countdown is expanded.
- **Local Notifications** — Scheduled reminders (daily/monthly/yearly) with your custom motto.
- **Dark Mode** — Toggle between light and dark themes.
- **9 Languages** — English, Spanish, French, German, Chinese, Japanese, Korean, Portuguese, and Italian.

## Tech Stack

- **React 18** + **TypeScript** + **Vite** (SWC)
- **Capacitor 8** for Android native features (notifications, splash screen, status bar)
- **Tailwind CSS** + **Radix UI** (shadcn/ui) for the component library
- **Framer Motion** for animations
- **react-router-dom** (HashRouter) for routing

## Getting Started

```bash
npm install
npm run dev
```

### Android Build

```bash
npm run android:build   # Build web + sync to Android
npx cap open android    # Open in Android Studio
```

## Project Structure

```
src/
├── components/       # UI components (CountdownTimer, ExpandableBlock, etc.)
├── contexts/         # React contexts (Translation, Audio)
├── pages/            # Route pages (Home, Settings, About)
├── services/         # NotificationService (Capacitor local notifications)
├── translations/     # i18n JSON files (9 languages)
├── types/            # Shared TypeScript interfaces
└── utils/            # Time calculation utilities
```
