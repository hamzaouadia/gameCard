/**
 * File Responsibility
 * Owner: Backend
 * Scope: Realtime subscription hooks for room state and players list.
 */

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

/**
 * Returns live room state for a given room ID.
 * @param {string|number|null|undefined} roomId - Room identifier.
 * @returns {object|null}
 */
export const useRoomState = (roomId) => {
    const [room, setRoom] = useState(null);

    useEffect(() => {
        if (!roomId) return;

        // Fetch initial state
        const fetchRoom = async () => {
            const { data } = await supabase.from('rooms').select('*').eq('id', roomId).single();
            if (data) setRoom(data);
        };
        fetchRoom();

        // Subscribe to realtime changes
        const subscription = supabase
            .channel(`room_${roomId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
                setRoom(payload.new);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [roomId]);

    return room;
};

/**
 * Returns a live, ordered list of players in a room.
 * @param {string|number|null|undefined} roomId - Room identifier.
 * @returns {Array<object>}
 */
export const usePlayersList = (roomId) => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if (!roomId) return;

        const fetchPlayers = async () => {
            const { data } = await supabase
                .from('players')
                .select('*')
                .eq('room_id', roomId)
                .order('joined_at', { ascending: true });
            if (data) setPlayers(data);
        };
        fetchPlayers();

        // Subscribe to realtime changes when players join or leave
        const subscription = supabase
            .channel(`players_${roomId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
                // Easiest approach for MVP is to re-fetch the ordered list on any change
                fetchPlayers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [roomId]);

    return players;
};
