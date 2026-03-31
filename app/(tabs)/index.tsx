/**
 * File Responsibility
 * Owner: Frontend
 * Scope: Home screen with hero, player setup, and create/join room actions (mock flow).
 */

import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import {
  AppButton,
  AppCard,
  AppInput,
  CodeInput,
  Palette,
  Space,
} from '@/components/ui/game-ui';

type ActionMode = 'create' | 'join';

const generateRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// Feature map:
// 1) Player identity + create/join room entry.
// 2) Client-side form validation and loading states.
// 3) Mock navigation to lobby while backend is not connected.

export default function HomeScreen() {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<ActionMode>('create');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<{ name?: string; code?: string }>({});
  const [loading, setLoading] = useState<ActionMode | null>(null);

  const helperText = useMemo(() => {
    return mode === 'create'
      ? 'Create a room and share the code with friends.'
      : 'Join an existing room using the code from the host.';
  }, [mode]);

  const goToLobby = (nextRoomCode: string) => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams({
        roomCode: nextRoomCode,
        playerName,
      }).toString();
      window.location.href = `/lobby?${search}`;
    }
  };

  const validate = (targetMode: ActionMode) => {
    const nextError: { name?: string; code?: string } = {};
    if (!playerName.trim()) {
      nextError.name = 'Please enter your player name.';
    }
    if (targetMode === 'join' && roomCode.trim().length < 4) {
      nextError.code = 'Room code must be at least 4 characters.';
    }

    setError(nextError);
    return Object.keys(nextError).length === 0;
  };

  const handleCreate = async () => {
    setMode('create');
    if (!validate('create')) return;

    // Backend integration: replace mock delay/code generation with POST /rooms.
    // Expected response shape: { roomCode: string, hostPlayerId: string }.
    setLoading('create');
    setStatus('Creating your room...');
    await new Promise((resolve) => setTimeout(resolve, 380));
    const code = generateRoomCode();
    setRoomCode(code);
    setStatus(`Room ready: ${code}`);
    setLoading(null);
    goToLobby(code);
  };

  const handleJoin = async () => {
    setStatus('');
    setMode('join');
    if (!validate('join')) return;

    // Backend integration: replace mock delay with POST /rooms/:roomCode/join.
    // Validate room capacity and return player/session token for realtime sync.
    const normalizedCode = roomCode.trim().toUpperCase();
    setLoading('join');
    setStatus('Joining room...');
    await new Promise((resolve) => setTimeout(resolve, 320));
    setStatus(`Joined room: ${normalizedCode}`);
    setLoading(null);
    goToLobby(normalizedCode);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.heroShapeA} pointerEvents="none" />
      <View style={styles.heroShapeB} pointerEvents="none" />
      <View style={styles.heroShapeC} pointerEvents="none" />

      <View style={styles.container}>
        <AppCard>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconCircle}>
              <IconSymbol size={22} name="gamecontroller.fill" color={Palette.primary} />
            </View>
            <Text style={styles.gameTitle}>Truth or Dare</Text>
            <Text style={styles.gameSubtitle}>German Edition</Text>
            <Text style={styles.description}>
              Play with friends, practice German, and complete fun truth or dare challenges.
            </Text>
            <Text style={styles.caption}>Mobile multiplayer, made for quick party sessions.</Text>
          </View>

          <View style={styles.modeRow}>
            <Pressable
              onPress={() => setMode('create')}
              style={({ pressed }) => [
                styles.modeChip,
                mode === 'create' && styles.modeChipActive,
                pressed && styles.modeChipPressed,
              ]}>
              <IconSymbol size={16} name="checkmark.circle.fill" color={mode === 'create' ? '#2D3B88' : '#7A859F'} />
              <Text style={[styles.modeText, mode === 'create' && styles.modeTextActive]}>Create</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('join')}
              style={({ pressed }) => [
                styles.modeChip,
                mode === 'join' && styles.modeChipActive,
                pressed && styles.modeChipPressed,
              ]}>
              <IconSymbol size={16} name="person.2.fill" color={mode === 'join' ? '#2D3B88' : '#7A859F'} />
              <Text style={[styles.modeText, mode === 'join' && styles.modeTextActive]}>Join</Text>
            </Pressable>
          </View>

          <AppInput
            label="Player Name"
            value={playerName}
            onChangeText={(value) => {
              setPlayerName(value);
              setError((prev) => ({ ...prev, name: undefined }));
            }}
            error={error.name}
            placeholder="Your nickname"
          />

          {mode === 'join' && (
            <CodeInput
              label="Room Code"
              value={roomCode}
              onChangeText={(value) => {
                setRoomCode(value.toUpperCase());
                setError((prev) => ({ ...prev, code: undefined }));
              }}
              error={error.code}
              placeholder="ABCD12"
            />
          )}

          <Text style={styles.helperText}>{helperText}</Text>

          <View style={styles.actionsWrap}>
            {mode === 'create' ? (
              <AppButton
                label="Create Game"
                onPress={handleCreate}
                loading={loading === 'create'}
                disabled={loading !== null}
              />
            ) : (
              <AppButton
                label="Join Game"
                onPress={handleJoin}
                loading={loading === 'join'}
                disabled={loading !== null}
              />
            )}
          </View>

          {!!status && <Text style={styles.status}>{status}</Text>}
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
  heroShapeA: {
    position: 'absolute',
    top: -40,
    right: -34,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E7EDFF',
  },
  heroShapeB: {
    position: 'absolute',
    bottom: -50,
    left: -36,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFEFEA',
  },
  heroShapeC: {
    position: 'absolute',
    top: 140,
    right: 44,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C8D7FF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Space.lg,
    paddingVertical: Space.xl,
  },
  heroHeader: {
    gap: Space.xs,
    marginBottom: Space.xs,
  },
  heroIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EDF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xs,
  },
  gameTitle: {
    color: Palette.text,
    fontSize: 31,
    lineHeight: 35,
    fontWeight: '800',
    fontFamily: 'system',
  },
  gameSubtitle: {
    color: '#2D3A8C',
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'system',
  },
  description: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
  },
  caption: {
    color: '#7B86A3',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sans,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Space.xs,
    marginTop: Space.xs,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E5EAF6',
  },
  modeChipActive: {
    backgroundColor: '#E9EEFF',
    borderColor: '#B8C8FF',
  },
  modeChipPressed: {
    opacity: 0.9,
  },
  modeText: {
    color: '#7A859F',
    fontSize: 12,
    fontFamily: Fonts.mono,
  },
  modeTextActive: {
    color: '#2D3B88',
  },
  helperText: {
    color: '#6A7696',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  actionsWrap: {
    gap: Space.xs,
  },
  status: {
    color: '#3D4A66',
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
});
