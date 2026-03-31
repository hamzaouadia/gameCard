# Branch README - Frontend Game Flow (Create/Join -> Lobby -> Game Room)

## 1) Branch Objective
This branch transforms the initial Expo template into a playable mobile-first frontend prototype for a Truth or Dare game (German Edition), with a complete flow:

- Home: choose Create or Join
- Lobby: wait for players and start the game
- Game Room: play Truth/Dare turns

The backend is intentionally mocked at this stage to move quickly on UX and product logic.

## 2) What Was Implemented

### Home (Create / Join)
Main file: app/(tabs)/index.tsx

- Full redesign of the home screen (no default Expo starter UI).
- Added mode selection: Create or Join.
- Form validation:
  - player name is required
  - room code is required in Join mode (>= 4 characters)
- Loading states and status messages.
- Mock navigation to lobby with query params (roomCode, playerName).
- Recent UX fix: only one action button is shown depending on selected mode:
  - create mode -> Create Game button
  - join mode -> Join Game button

### Lobby
Main file: app/lobby.tsx

- Added a dedicated lobby screen.
- Display room code + copy button.
- Display mock player list with host marker.
- Enforced minimum player rule before game start.
- Start Game action redirects to the Game Room.

### Game Room
Main file: app/game-room.tsx

- Built a full mobile-oriented gameplay screen.
- Turn system:
  - active player
  - turn timer (can be enabled/disabled)
  - end turn / skip turn
- Truth / Dare interaction:
  - exclusive selection per turn
  - opposite card is blocked after selection
  - user feedback banner
- Challenge reveal inside a modal.
- Card draw animation (deck to center area).
- Quick actions menu (top-right): skip, timer on/off, copy code, leave.

### Reusable UI System
Main file: components/ui/game-ui.tsx

- Added a small internal design system:
  - AppButton
  - AppCard
  - AppInput / CodeInput
  - PlayerAvatarChip
  - TurnBadge
  - ChallengeCard
  - EmptyState / LoadingState
- Centralized palette and spacing to keep screens visually consistent.

## 3) App Navigation and Structure

### Layouts
- app/_layout.tsx
  - simplified stack
  - removed obsolete modal route
  - forced light theme for this phase

- app/(tabs)/_layout.tsx
  - simplified to a single Home tab
  - customized tab bar visual style

### Removed Pages
- app/modal.tsx removed
- app/(tabs)/explore.tsx removed

## 4) Comments and Backend Handoff
Handoff comments were added in key files to make future backend integration easier (proposed endpoints, responsibilities, and realtime sync zones).

Files involved (notably):
- app/(tabs)/index.tsx
- app/lobby.tsx
- app/game-room.tsx
- services/supabase.js
- hooks/useGameRoom.js

## 5) Design / UX Decisions
- Mobile-first priority (compact visual hierarchy, thumb-friendly actions).
- Simplified flow for fast testing on web and mobile.
- Focus on core gameplay before wiring realtime persistence.
- Unified light theme to avoid visual inconsistencies during rapid iteration.

## 6) Current Technical Status

### What Works
- npm run web starts the app.
- Full frontend flow is operational in mock mode:
  - Home -> Lobby -> Game Room
- Core gameplay interactions are visually testable.

### Known Issues / Limits
- Some editor type/import errors may appear depending on local environment, even when the app runs on web.
- Realtime multiplayer is still partially mocked in this branch.
- Game logic is not yet server-authoritative (main state still client-side for the prototype).

## 7) Recommended Next Steps
1. Connect Home/Lobby/Game Room to real backend endpoints.
2. Move turn management to a server-authoritative model.
3. Add presence/realtime wiring (join, leave, turn updates).
4. Add tests focused on turn logic and form validation.
5. Continue cleanup of app/game-room.tsx (extract sub-components).

## 8) Useful Commands

Install dependencies:

```bash
npm install
```

Run web app:

```bash
npm run web
```

If Expo cache needs to be cleared:

```bash
npx expo start --web --clear
```

## 9) Quick Summary
This branch delivers a modern, mobile-friendly frontend MVP for Truth or Dare, with a complete user flow and advanced gameplay interactions (exclusive Truth/Dare selection, timer, turn controls, reveal modal, quick actions), plus a clean base for backend integration in phase two.
