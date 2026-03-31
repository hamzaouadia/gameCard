# Truth or Dare (German Edition) - Backend Architecture Guide

This document provides a comprehensive blueprint for implementing the backend of the Truth or Dare mobile application (built with Expo/React Native). The application features real-time, turn-based synchronization across multiple devices in the same "Room".

## 1. Tech Stack Overview
*   **Database & Real-time**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime Subscriptions).
*   **Data Storage**: Static bundled `cards.json` in the app for fast, offline-friendly access to the prompts.

> [!NOTE] 
> Supabase is highly recommended because it offers out-of-the-box WebSocket connections (Realtime) attached directly to database changes. This allows the frontend to simply subscribe to a room's state, and any updates (like drawing a card or changing turns) instantly propagate to all players.

---

## 2. Database Schema

You will need two primary tables in Supabase: `rooms` and `players`.

### `rooms` Table
This table tracks the overarching state of a game session.
*   `id` (uuid, primary key)
*   `room_code` (text, unique) - The 4-6 character string players use to join (e.g., "GER420").
*   `status` (text) - Current state of the room: `'waiting'` (in lobby) or `'playing'`.
*   `current_turn_index` (integer) - Tracks whose turn it is. Defaults to `0`.
*   `active_card` (jsonb, nullable) - Stores the card currently drawn. Null if waiting for the active player to draw.
*   `created_at` (timestamp)

### `players` Table
This table tracks the individuals inside a game session.
*   `id` (uuid, primary key)
*   `room_id` (uuid, foreign key to `rooms.id`) - Which room they belong to.
*   `player_name` (text) - Their display name.
*   `joined_at` (timestamp) - **Crucial for turn order.** Players are sorted by when they joined.

---

## 3. The `cards.json` Structure
Instead of hosting the cards on a database (which requires unnecessary API calls), bundle this directly in the React Native/Expo app.

```json
[
  {
    "id": 1,
    "type": "truth",
    "text": "Translate this sentence to German: 'I am extremely hungry right now.' If you fail, eat a slice of lemon."
  },
  {
    "id": 2,
    "type": "dare",
    "text": "Speak only in a heavy German accent until your next turn."
  },
  {
    "id": 3,
    "type": "dare",
    "text": "Name 5 German foods in 10 seconds. If you fail, you take a hit."
  }
]
```

---

## 4. Game Logic & Flow

### Step 1: Initializing a Room (Host)
1.  Host enters their name and taps "Create Game".
2.  Backend generates a random 4-6 character `room_code`.
3.  Insert new record into `rooms` table.
4.  Insert Host into `players` table with the newly created `room_id`.

### Step 2: Joining a Room (Guest)
1.  Guest enters their name and the `room_code`.
2.  Backend queries `rooms` where `room_code` matches.
3.  If found, insert Guest into `players` table with that `room_id`.

### Step 3: Frontend Realtime Subscription
Once a player is in a room, the Expo app should subscribe to Supabase Realtime for **both** tables:
```javascript
// Pseudo-code for Coworker
const roomSubscription = supabase
  .channel('public:rooms:id=eq.' + roomId)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, payload => {
    // Update local React state with new room data (active card, turn index)
    setRoomState(payload.new);
  })
  .subscribe();

const playerSubscription = supabase
  .channel('public:players:room_id=eq.' + roomId)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
    // Update local React state to show new players joining
  })
  .subscribe();
```

### Step 4: Determining "Whose Turn Is It?"
Turn order is strictly "Clock-order" based on arrival time. 
1.  Frontend fetches all `players` for the room, ordered by `joined_at` ascending.
2.  Store this in an array: `const orderedPlayers = [PlayerA, PlayerB, PlayerC]`.
3.  Calculate the active player index: `const activeIndex = roomState.current_turn_index % orderedPlayers.length`.
4.  If `orderedPlayers[activeIndex].id === localPlayer.id`, the local device successfully unlocks the "Draw Card" button.

### Step 5: Drawing a Card
1.  Only the active player can interact.
2.  They tap "Draw Truth" or "Draw Dare".
3.  The frontend randomly selects a card of that type from `cards.json`.
4.  The frontend issues an `UPDATE` to the `rooms` table:
    *   `active_card = { selected_card_object }`
5.  Supabase Realtime instantly pushes this update to everyone else. The card pops up on all screens simultaneously!

### Step 6: Completing a Turn
1.  Once the player completes the Truth/Dare, they press "Next Turn".
2.  The frontend issues an `UPDATE` to the `rooms` table:
    *   `current_turn_index = current_turn_index + 1`
    *   `active_card = null`
3.  The Next player in the array becomes the active player, and all screens go back to the "waiting for active player to draw" state.

---

## 5. Security & Row Level Security (RLS)
Since this is a casual party game:
*   You can set Supabase table policies to allow **Public Insert, Select, and Update**.
*   Optionally, you can restrict updates so that a client can only update a room's state if their `player_id` matches the current active player's ID. This prevents bugs if two people tap a button simultaneously, but is not strictly necessary for an MVP among friends.
