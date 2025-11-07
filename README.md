# Human Interest x Berry Clean Planner

This repository contains a single-page React Native web experience (powered by Expo) that helps Berry Clean team leads adjust their 401(k) contribution strategy. It highlights contribution types, peer benchmarks, and projected long-term growth using Human Interest program assumptions.

## Features

- Clean, minimal layout tailored to Berry Clean and Human Interest branding.
- Toggle between percentage-based and fixed-dollar contribution styles with guided copy.
- Slider and direct input controls to fine-tune contributions with benchmark insights.
- Mock YTD contribution table based on Berry Clean’s pay schedule and match policy.
- Educational tabs and a retirement impact projection to reinforce long-term value.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

If you prefer `yarn` or `pnpm`, you can adapt the commands below, but npm is the default.

### Install Dependencies

```bash
npm install
```

### Run the App Locally (Web)

```bash
npm start
```

When the Expo CLI opens, press `w` (or select “Run in web browser”) to launch the page. The app lives at `http://localhost:19006/` by default.

### Alternative Commands

- `npm run web` – start Expo in web mode directly.
- `npm run ios` / `npm run android` – run the same experience on native simulators (requires local platform tooling).

## Project Structure

- `App.js` – core UI and business logic for the contribution planner.
- `app.json` – Expo configuration.
- `package.json` – dependency list and scripts.
- `babel.config.js` – Babel setup for Expo.

## Mock Data Assumptions

- Role: Cleaning Team Lead at Berry Clean
- Annual salary: $44,000 (bi-weekly pay periods)
- Current election: 4% with a 50% employer match up to 4%
- Paychecks year-to-date: 16
- All company context and contribution history values are hard-coded for demo purposes.

## Troubleshooting

- If the browser renders a blank screen, ensure you pressed `w` in the Expo CLI.
- After modifying dependencies, restart the Expo server.
- For help with Expo CLI commands, run `npx expo --help`.