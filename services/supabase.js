/**
 * File Responsibility
 * Owner: Backend
 * Scope: Supabase client bootstrap and database action helpers for rooms/players/game state.
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Creates a room and inserts the host as the first player.
 * @param {string} hostName - Display name of the host player.
 * @returns {Promise<{room: object, player: object}>}
 */
export const createRoom = async (hostName) => {
  // Generate 5-character room code for quick sharing.
  const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  const { data: roomData, error: roomError } = await supabase
    .from('rooms')
    .insert([{ room_code: roomCode, status: 'waiting', current_turn_index: 0 }])
    .select()
    .single();
    
  if (roomError) throw roomError;

  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{ room_id: roomData.id, player_name: hostName }])
    .select()
    .single();

  if (playerError) throw playerError;

  return { room: roomData, player: playerData };
};

/**
 * Joins an existing room by room code.
 * @param {string} roomCode - Room code used by players to join.
 * @param {string} playerName - Display name of the joining player.
 * @returns {Promise<{room: object, player: object}>}
 */
export const joinRoom = async (roomCode, playerName) => {
  // 1. Find Room
  const { data: roomData, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode)
    .single();

  if (roomError || !roomData) throw new Error('Room not found');

  // 2. Insert Player
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert([{ room_id: roomData.id, player_name: playerName }])
    .select()
    .single();

  if (playerError) throw playerError;

  return { room: roomData, player: playerData };
};

/**
 * Sets the active card payload for a room.
 * @param {string|number} roomId - Target room ID.
 * @param {object|null} cardObject - Card payload stored in rooms.active_card.
 */
export const updateActiveCard = async (roomId, cardObject) => {
  const { error } = await supabase
    .from('rooms')
    .update({ active_card: cardObject })
    .eq('id', roomId);
    
  if (error) throw error;
};

/**
 * Moves the game to the next turn and clears the active card.
 * @param {string|number} roomId - Target room ID.
 * @param {number} currentTurnIndex - Current turn index before increment.
 */
export const advanceTurn = async (roomId, currentTurnIndex) => {
  const { error } = await supabase
    .from('rooms')
    .update({ 
       current_turn_index: currentTurnIndex + 1,
       active_card: null 
    })
    .eq('id', roomId);

  if (error) throw error;
};
