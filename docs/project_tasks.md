# Truth or Dare (German Edition) - Task Checklist

This document divides the entire application build process into actionable tasks for the **Frontend Developer** (Expo/React Native UI) and the **Backend Developer** (Supabase Logic & Real-time).

---

## 🛠️ Phase 1: Initial Setup

### Frontend Developer
- [ ] Initialize the Expo app (`npx create-expo-app truth-or-dare`).
- [ ] Install required packages (`@react-navigation/native`, `@supabase/supabase-js`, etc.).
- [ ] Set up basic folder structure (`/screens`, `/components`, `/services`, `/data`).
- [ ] Set up React Navigation with three main screens: `Home`, `Lobby`, and `GameRoom`.

### Backend Developer
- [ ] Create a new project on [Supabase](https://supabase.com/).
- [ ] Create the `rooms` table (columns: `id`, `room_code`, `status`, `current_turn_index`, `active_card`).
- [ ] Create the `players` table (columns: `id`, `room_id`, `player_name`, `joined_at`).
- [ ] Disable Row Level Security (RLS) for MVP, or set up policies allowing public Select, Insert, and Update.
- [ ] Provide the Supabase `URL` and `Anon Key` to the Frontend Developer.

---

## 🧠 Phase 2: Logic & Services (Backend Developer)

The backend developer should write these helper functions/hooks inside the Expo project (e.g., in `/services/supabase.js`) so the frontend developer can simply import and call them.

- [ ] **DB Actions**: Write a helper function to create a new room and generate a random 4-6 character `room_code`.
- [ ] **DB Actions**: Write a helper function for joining a room (inserting a user into the `players` table).
- [ ] **Game Actions**: Write a function to update the `active_card` JSON in a specific room.
- [ ] **Game Actions**: Write a function to increment the `current_turn_index` and clear the `active_card` when a turn ends.
- [ ] **Real-time Hooks**: Write a custom React hook `useGameState(roomId)` that subscribes to Supabase Realtime and returns the live `rooms` row data.
- [ ] **Real-time Hooks**: Write a custom React hook `usePlayersList(roomId)` that subscribes to Supabase Realtime and returns the live array of players ordered by `joined_at`.

---

## 🎨 Phase 3: UI & Interface Building (Frontend Developer)

The frontend developer will build the visual screens and import the backend developer's hooks. 

- [ ] **Home Screen**: 
  - Input field for "Player Name".
  - "Create Game" button.
  - Input field for "Room Code" and "Join Game" button.
- [ ] **Lobby Screen**: 
  - Large display of the `room_code`.
  - Live-updating list of players currently in the room (using `usePlayersList`).
  - "Start Game" button (visible only to the host / first player).
- [ ] **Game Room Screen**:
  - **Turn Indicator**: Text showing whose turn it currently is (calculated via `current_turn_index % players.length`).
  - **Card Buttons**: "Draw Truth" and "Draw Dare" buttons. *These must be disabled if the local player is not the active player.*
  - **Active Card Display**: A modal or large card UI that appears when `active_card` is not null. It should display the German prompt clearly.
  - **Next Turn Button**: A button on the card to end the turn, passing it to the next player.

---

## 🇩🇪 Phase 4: Content & Data (Shared)

- [ ] Create the static `cards.json` file inside the frontend project (`/data/cards.json`).
- [ ] Populate it with 30-50 Truth prompts focused on German learning/translation.
- [ ] Populate it with 30-50 Dare prompts focused on speaking German or group activities.

---

## 🚀 Phase 5: Integration & Testing

- [ ] Connect the UI buttons to the backend functions (e.g., wiring the "Next Turn" UI button to the backend `incrementTurn` function).
- [ ] Run the app via Expo Go on at least **two physical phones** simultaneously.
- [ ] Test the real-time card drawing sync (Player A draws, Player B sees it instantly).
- [ ] Test the turn progression logic.
