
# RepRecord: Offline-First Advanced Fitness Tracker

**RepRecord** is a high-performance, offline-first mobile application architected to solve the connectivity gap in fitness tracking. By implementing a sophisticated synchronization engine, it allows users to experience native speed with local interactions while ensuring data integrity via background cloud syncing.

![License](https://img.shields.io/badge/license-Proprietary-red.svg) ![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey) ![Tech](https://img.shields.io/badge/stack-React%20Native%20%7C%20TypeScript-blue)

> **⚠️ COPYRIGHT NOTICE**: This repository contains proprietary code intended solely for portfolio evaluation purposes. Unauthorized commercial use, modification, or redistribution is strictly prohibited. See `LICENSE` for details.

---

## Why I Built RepRecord

I got tired of paying premium prices for subpar software. Most fitness apps are slow, bloated, or hide basic features behind a paywall. I constructed RepRecord to prove it could be done better: native performance, offline-first reliability, and zero compromises. I didn't find a tracking app worthy of my workouts, so I engineered one.

[ **📲 Download the APK (Try it yourself)**](https://drive.google.com/file/d/1Wg0V1_keDN5-i6STAAa7jOJrkJt81GJX/view)

---

## Key Technical Achievements
*   **Offline-First Architecture**: Engineered a robust local-first data layer using **SQLite**, enabling zero-latency interactions regardless of network status.
*   **Custom Synchronization Engine**: Developed a proprietary two-way sync protocol to merge local SQLite datasets with **Firebase Firestore**, handling conflict resolution and ensuring eventual consistency.
*   **Performance Optimization**: Leveraged **React Native Reanimated 3** to offload complex animations to the UI thread, achieving 60fps performance for staggered list entries and gesture-driven interactions.
*   **Scalable State Management**: Architected global state using **Zustand** with persistent storage middleware to manage complex user sessions and workout data.
*   **Premium UI/UX Design**: Implemented a bespoke design system with custom tokens, utilizing **Expo Linear Gradient** and micro-interactions ("breathing" buttons) to drive user engagement.

---

## Technology Stack

### Core Framework & Language
*   **React Native (Expo SDK 54)**: For cross-platform native rendering.
*   **TypeScript**: Ensuring type safety and maintainability across the codebase.

### Data & State
*   **SQLite (expo-sqlite)**: Embedded relational database for offline persistence.
*   **Firebase (Firestore & Auth)**: Scalable NoSQL cloud backend and secure authentication.
*   **Zustand**: Lightweight, scalable state management with persist middleware.
*   **TanStack Query (Pattern)**: Employed concepts for efficient data fetching and caching.

### UI & Performance
*   **React Native Reanimated 3**: High-performance, declarative animations run on the native UI thread.
*   **Expo Linear Gradient**: Hardware-accelerated gradient rendering.
*   **Lucide React Native**: Consistent, lightweight vector iconography.
*   **NativeWind / TailwindCSS**: Utility-first styling for rapid UI iteration.

### Authentication & Security
*   **Google Sign-In**: Native OAuth integration.
*   **Expo Crypto**: Secure UUID generation for guest user sessions.

---

## Project Architecture

### The "Sync Engine"
The heart of RepRecord is its custom sync service located in `src/services/SyncService.ts`. Unlike standard CRUD apps, RepRecord reads and writes primarily to a local SQLite database. A background service monitors network connectivity (via `expo-network`) and initiates a sync queue when online, pushing `DIRTY` records to Firestore and pulling updates.

### Feature Flagging
Built with continuous delivery in mind, feature flags (`src/config/featureFlags.ts`) control the rollout of complex features like Cloud Sync and V2 Home Screen layouts, allowing for safe testing in production environments.

---

## Getting Started

1.  **Clone the repository**

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run the App**
    ```bash
    npm run android  # or npm run ios
    ```

---

## Future Roadmap

*   **Haptic Feedback**: Integrating `expo-haptics` for tactile confirmation of workout sets.
*   **Wearable Integration**: HealthKit / Google Fit synchronization.
*   **Social & Leaderboards**: Leveraging existing Firestore structure for public profiles.
