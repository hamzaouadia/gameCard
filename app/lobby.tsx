/**
 * File Responsibility
 * Owner: Frontend
 * Scope: Lobby screen with mock realtime social state and host start action.
 */

import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  AppCard,
  EmptyState,
  Palette,
  PlayerAvatarChip,
  Space,
  TurnBadge,
} from '@/components/ui/game-ui';

// Feature map:
// 1) Room code sharing and quick copy feedback.
// 2) Player roster preview with host marker.
// 3) Host start gate with minimum-player rule.

export default function LobbyScreen() {
  const roomCode =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('roomCode') ?? 'ROOM42'
      : 'ROOM42';

  const playerName =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('playerName') ?? 'Player'
      : 'Player';

  const [copied, setCopied] = useState(false);

  const players = useMemo(
    // Backend integration: replace static array with realtime room-presence subscription.
    // Suggested source: WebSocket/Supabase channel keyed by roomCode.
    () => [
      { name: playerName, host: true },
      { name: 'Anna', host: false },
      { name: 'Lukas', host: false },
    ],
    [playerName]
  );

  const minPlayers = 2;
  const canStart = players.length >= minPlayers;

  const handleCopyCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      Alert.alert('Copy failed', 'Please copy the room code manually.');
    }
  };

  const handleStartGame = () => {
    if (!canStart) return;
    // Backend integration: call POST /rooms/:roomCode/start (host-only) before navigation.
    // Server should atomically lock lobby and emit match_started event.
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams({
        roomCode,
        playerName,
      }).toString();
      window.location.href = `/game-room?${search}`;
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.ambientOne} />
      <View style={styles.ambientTwo} />
      <View style={styles.layout}>
        <AppCard>
          <Text style={styles.heading}>Lobby</Text>
          <Text style={styles.subheading}>Waiting for friends to join...</Text>

          <View style={styles.codeRow}>
            <View>
              <Text style={styles.codeLabel}>Room Code</Text>
              <Text style={styles.codeValue}>{roomCode}</Text>
            </View>
            <AppButton
              label={copied ? 'Copied' : 'Copy'}
              variant="secondary"
              onPress={handleCopyCode}
            />
          </View>

          <TurnBadge text="Host: You" />
          <Text style={styles.liveStatus}>Live sync active</Text>
        </AppCard>

        <AppCard>
          <View style={styles.playersHeader}>
            <Text style={styles.playersTitle}>Players</Text>
            <Text style={styles.playersCount}>{players.length} / 8</Text>
          </View>

          {players.length === 0 ? (
            <EmptyState
              title="No players yet"
              subtitle="Share your room code to invite friends."
            />
          ) : (
            players.map((player, index) => (
              <PlayerAvatarChip
                key={`${player.name}-${index}`}
                name={player.name}
                isHost={player.host}
              />
            ))
          )}

          <Text style={styles.hint}>
            Minimum {minPlayers} players required to start.
          </Text>
        </AppCard>

        <AppCard>
          <AppButton
            label="Start Game"
            onPress={handleStartGame}
            disabled={!canStart}
          />
          {!canStart && (
            <Text style={styles.disabledHint}>Add more players to enable the start button.</Text>
          )}
        </AppCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  ambientOne: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8EDFF',
    top: -30,
    left: -28,
  },
  ambientTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF1EE',
    bottom: -24,
    right: -20,
  },
  layout: {
    flex: 1,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    gap: Space.sm,
  },
  heading: {
    color: Palette.text,
    fontSize: 30,
    fontWeight: '800',
    fontFamily: 'system',
  },
  subheading: {
    color: Palette.muted,
    fontSize: 14,
  },
  liveStatus: {
    color: '#2D4BAA',
    fontSize: 12,
    fontWeight: '600',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  codeLabel: {
    color: '#6B7694',
    fontSize: 12,
    fontFamily: 'system',
  },
  codeValue: {
    color: '#16244F',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: 'system',
  },
  playersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playersTitle: {
    color: Palette.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'system',
  },
  playersCount: {
    color: Palette.muted,
    fontSize: 12,
    fontFamily: 'system',
  },
  hint: {
    color: Palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  disabledHint: {
    color: '#9AA3B8',
    fontSize: 12,
  },
});
