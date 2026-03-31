/**
 * File Responsibility
 * Owner: Frontend
 * Scope: Main gameplay screen in mock mode (turns, truth/dare draw, challenge card).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppButton, AppCard, ChallengeCard, Space } from '@/components/ui/game-ui';

type Mode = 'truth' | 'dare';

type Player = {
  name: string;
  isHost: boolean;
  online: boolean;
};

const TURN_SECONDS = 30;

const TRUTH_PROMPTS = [
  'Say a German sentence about your favorite food.',
  'Translate: I need water right now.',
  'Name 3 German words you learned this week.',
];

const DARE_PROMPTS = [
  'Speak only German for the next 60 seconds.',
  'Pronounce “Entschuldigung” three times quickly.',
  'Do a mini intro in German with your name and city.',
];

// Feature map:
// 1) Turn lifecycle (active player, timer, end/skip).
// 2) Truth/Dare exclusive choice with client-side lock.
// 3) Draw card micro-animation and challenge reveal modal.
// 4) Quick actions menu (timer toggle, copy room code, leave).

export default function GameRoomScreen() {
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 380;
  const isTablet = width >= 768;

  const roomCode =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('roomCode') ?? 'ROOM42'
      : 'ROOM42';

  const localPlayer =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('playerName') ?? 'Player'
      : 'Player';

  const players = useMemo<Player[]>(
    // Backend integration: hydrate players from room state endpoint or realtime room channel.
    () => [
      { name: localPlayer, isHost: true, online: true },
      { name: 'Anna', isHost: false, online: true },
      { name: 'Lukas', isHost: false, online: true },
    ],
    [localPlayer]
  );

  const [turnIndex, setTurnIndex] = useState(0);
  const [activeCard, setActiveCard] = useState<{ mode: Mode; text: string } | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [drawFxMode, setDrawFxMode] = useState<Mode | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [controlsMenuVisible, setControlsMenuVisible] = useState(false);

  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const revealTranslate = useRef(new Animated.Value(12)).current;
  const arenaPulse = useRef(new Animated.Value(0)).current;
  const drawProgress = useRef(new Animated.Value(0)).current;
  const feedbackY = useRef(new Animated.Value(-24)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const activePlayer = players[turnIndex % players.length];
  const isMyTurn = activePlayer.name === localPlayer;
  const onlineCount = players.filter((player) => player.online).length;
  const actionLocked = !isMyTurn || !!activeCard;
  const truthBlocked = !isMyTurn || (selectedMode !== null && selectedMode !== 'truth');
  const dareBlocked = !isMyTurn || (selectedMode !== null && selectedMode !== 'dare');
  const drawFxTranslateX = drawProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -104],
  });
  const drawFxTranslateY = drawProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 112],
  });
  const drawFxRotate = drawProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-10deg'],
  });
  const drawFxScale = drawProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1.06],
  });
  const drawFxOpacity = drawProgress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.96, 0],
  });

  const triggerDrawEffect = (mode: Mode) => {
    setDrawFxMode(mode);
    drawProgress.setValue(0);
    Animated.timing(drawProgress, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setDrawFxMode(null);
      drawProgress.setValue(0);
    });
  };

  const showFeedback = (message: string) => {
    setFeedback(message);
    feedbackY.setValue(-24);
    feedbackOpacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(feedbackY, {
          toValue: 0,
          duration: 170,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 170,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(feedbackY, {
          toValue: -24,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(feedbackOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setFeedback(null));
  };

  useEffect(() => {
    arenaPulse.setValue(0);
    Animated.timing(arenaPulse, {
      toValue: 1,
      duration: 340,
      useNativeDriver: true,
    }).start();
  }, [turnIndex, arenaPulse]);

  useEffect(() => {
    // Backend integration: timer should be server-authoritative in multiplayer mode.
    // Client should only render countdown from synced turn deadline.
    if (!timerEnabled || !isMyTurn || !!activeCard) {
      return;
    }

    if (timeLeft <= 0) {
      const nextPlayer = players[(turnIndex + 1) % players.length];
      setSelectedMode(null);
      setTurnIndex((prev) => prev + 1);
      setTimeLeft(TURN_SECONDS);
      showFeedback(`Time up. ${nextPlayer.name} is now playing.`);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timerEnabled, isMyTurn, activeCard, timeLeft, turnIndex, players]);

  useEffect(() => {
    setTimeLeft(TURN_SECONDS);
  }, [turnIndex]);

  const advanceTurn = (message: string) => {
    setActiveCard(null);
    setSelectedMode(null);
    setTurnIndex((prev) => prev + 1);
    cardScale.setValue(0.92);
    cardOpacity.setValue(0);
    revealTranslate.setValue(12);
    showFeedback(message);
  };

  const drawCard = (mode: Mode) => {
    if (actionLocked) {
      return;
    }

    // Backend integration: request challenge from server to prevent client-side cheating.
    // Suggested endpoint: POST /rooms/:roomCode/turns/:turnId/draw with { mode }.
    triggerDrawEffect(mode);
    const source = mode === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS;
    const randomPrompt = source[Math.floor(Math.random() * source.length)];
    setSelectedMode(mode);
    setActiveCard({ mode, text: randomPrompt });
    showFeedback(mode === 'truth' ? 'Truth card revealed.' : 'Dare card revealed.');

    revealTranslate.setValue(12);
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(revealTranslate, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCardSelect = (mode: Mode) => {
    if (!isMyTurn) {
      showFeedback('Wait for your turn.');
      return;
    }

    if (selectedMode && selectedMode !== mode) {
      showFeedback(
        `You already selected ${selectedMode.toUpperCase()}. End turn before choosing ${mode.toUpperCase()}.`
      );
      return;
    }

    if (activeCard && selectedMode === mode) {
      showFeedback('Challenge already revealed. End turn to continue.');
      return;
    }

    drawCard(mode);
  };

  const endTurn = () => {
    if (!isMyTurn) {
      showFeedback('Wait for your turn.');
      return;
    }

    // Backend integration: persist turn completion and rotate active player server-side.
    const nextPlayer = players[(turnIndex + 1) % players.length];
    advanceTurn(`Turn ended. ${nextPlayer.name} is now active.`);
  };

  const skipTurn = () => {
    if (!isMyTurn) {
      showFeedback('Only active player can skip turn.');
      return;
    }

    const nextPlayer = players[(turnIndex + 1) % players.length];
    advanceTurn(`Turn skipped. ${nextPlayer.name} takes the seat.`);
  };

  const closeCard = () => {
    setActiveCard(null);
    cardScale.setValue(0.92);
    cardOpacity.setValue(0);
    revealTranslate.setValue(12);
  };

  const copyRoomCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomCode);
        showFeedback('Room code copied.');
      } else {
        showFeedback('Clipboard not available on this device.');
      }
    } catch {
      showFeedback('Unable to copy room code.');
    }
  };

  const leaveRoom = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
      return;
    }
    showFeedback('Leave action available on web navigation.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.lightTop} pointerEvents="none" />
      <View style={styles.lightBottom} pointerEvents="none" />

      {feedback && (
        <Animated.View
          style={[
            styles.feedback,
            {
              opacity: feedbackOpacity,
              transform: [{ translateY: feedbackY }],
            },
          ]}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.layout}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Party Room</Text>
            <View style={styles.roomCodePill}>
              <Text style={styles.roomCodeLabel}>Room</Text>
              <Text style={styles.roomCodeValue}>{roomCode}</Text>
            </View>
          </View>
          <View style={styles.headerBadges}>
            <View style={styles.roundPill}>
              <Text style={styles.roundPillText}>Round {turnIndex + 1}</Text>
            </View>
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlinePillText}>{onlineCount} online</Text>
            </View>
            <Pressable
              onPress={() => setControlsMenuVisible(true)}
              style={({ pressed }) => [styles.headerMenuBtn, pressed && styles.fixedActionPressed]}>
              <Text style={styles.headerMenuText}>...</Text>
            </Pressable>
          </View>
        </View>

        <AppCard>
          <View style={styles.statusStrip}>
            <Text style={styles.statusStripMain}>{activePlayer.name}</Text>
            <Text style={styles.statusStripMeta}>{timerEnabled ? `${timeLeft}s` : 'Timer off'}</Text>
            <Text style={styles.statusStripMeta}>{activeCard ? 'Open' : 'Pick'}</Text>
          </View>
        </AppCard>

        <View style={styles.tableWrap}>
          <Animated.View
            style={[
              styles.tableOuter,
              isTablet && styles.tableOuterTablet,
              {
                transform: [
                  {
                    scale: arenaPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.deckStack}>
              <View style={[styles.deckCard, styles.deckCardBack]} />
              <View style={[styles.deckCard, styles.deckCardMid]} />
              <View style={styles.deckCard} />
            </View>

            {drawFxMode && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.drawFxCard,
                  drawFxMode === 'truth' ? styles.drawFxTruth : styles.drawFxDare,
                  {
                    opacity: drawFxOpacity,
                    transform: [
                      { translateX: drawFxTranslateX },
                      { translateY: drawFxTranslateY },
                      { rotate: drawFxRotate },
                      { scale: drawFxScale },
                    ],
                  },
                ]}>
                <Text style={styles.drawFxGlyph}>{drawFxMode === 'truth' ? 'T' : 'D'}</Text>
              </Animated.View>
            )}

            <View style={styles.tableInner}>
              <View style={styles.arenaHeaderRow}>
                <View style={styles.arenaHeadingBlock}>
                  <Text style={styles.arenaEyebrow}>Your Turn</Text>
                  <Text style={styles.arenaTitle}>Pick Truth or Dare</Text>
                  <Text style={styles.arenaSubtitle}>Reveal a challenge for this round</Text>
                </View>
                <View style={styles.activePlayerChip}>
                  <View style={styles.activePlayerChipTop}>
                    <View style={styles.onlineIndicator} />
                    <Text style={styles.activePlayerChipState}>Active</Text>
                  </View>
                  <Text style={styles.activePlayerChipName}>{activePlayer.name}</Text>
                  {activePlayer.isHost && <Text style={styles.activePlayerChipHost}>HOST</Text>}
                </View>
              </View>
              <View style={[styles.communityRow, isSmallPhone && styles.communityRowStack]}>
                <Pressable
                  onPress={() => handleCardSelect('truth')}
                  style={({ pressed }) => [
                    styles.communityCard,
                    styles.communityCardTruth,
                    selectedMode === null && styles.communityCardIdle,
                    selectedMode === 'truth' && styles.communityCardTruthActive,
                    truthBlocked && styles.communityCardDisabled,
                    pressed && styles.communityCardPressed,
                  ]}>
                  <View style={styles.communityGlyphWrap}>
                    <Text
                      style={[
                        styles.communityRank,
                        selectedMode === 'truth' && styles.communityRankTruthActive,
                      ]}>
                      T
                    </Text>
                  </View>
                  <Text style={styles.communityLabel}>Truth</Text>
                  <Text style={styles.communityDescription}>Calm, precise challenge</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCardSelect('dare')}
                  style={({ pressed }) => [
                    styles.communityCard,
                    styles.communityCardDare,
                    selectedMode === null && styles.communityCardIdle,
                    selectedMode === 'dare' && styles.communityCardDareActive,
                    dareBlocked && styles.communityCardDisabled,
                    pressed && styles.communityCardPressed,
                  ]}>
                  <View style={styles.communityGlyphWrap}>
                    <Text
                      style={[
                        styles.communityRank,
                        selectedMode === 'dare' && styles.communityRankDareActive,
                      ]}>
                      D
                    </Text>
                  </View>
                  <Text style={styles.communityLabel}>Dare</Text>
                  <Text style={styles.communityDescription}>Bold, energetic challenge</Text>
                </Pressable>
              </View>
              <View style={styles.selectionStatusPill}>
                <Text style={styles.selectionStatusText}>
                  {selectedMode
                    ? `${selectedMode.toUpperCase()} selected. Challenge shared with all players.`
                    : 'Choose a card to reveal your challenge.'}
                </Text>
              </View>
              {!!activeCard && (
                <View style={styles.inlineChallengeCard}>
                  <View style={styles.inlineChallengeHeader}>
                    <View style={styles.inlineChallengeDot} />
                    <Text style={styles.inlineChallengeMode}>{activeCard.mode.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.inlineChallengeText}>{activeCard.text}</Text>
                </View>
              )}
              <View style={styles.arenaFooter}>
                {isMyTurn ? (
                  <Text style={styles.tableHint}>Your move. Pick a card to reveal a challenge.</Text>
                ) : (
                  <View style={styles.waitingBadge}>
                    <Text style={styles.waitingText}>Waiting for {activePlayer.name}</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        </View>

        <AppCard>
          <View style={styles.turnHeaderRow}>
            <Text style={styles.sectionTitle}>Turn Controls</Text>
            <View style={[styles.turnStatePill, !isMyTurn && styles.turnStatePillMuted]}>
              <Text style={[styles.turnStateText, !isMyTurn && styles.turnStateTextMuted]}>
                {isMyTurn ? 'Your Turn' : 'Waiting'}
              </Text>
            </View>
          </View>
          <View style={styles.turnCompactRow}>
            <View style={styles.turnCompactInfo}>
              <Text style={styles.turnCompactTitle}>{activePlayer.name} is playing</Text>
              <Text style={styles.turnCompactMeta}>
                {players.length} players • {timerEnabled ? `${timeLeft}s left` : 'Timer off'}
              </Text>
            </View>
          </View>

          {!isMyTurn && <Text style={styles.hintCompact}>Wait for your turn to play.</Text>}

          <View style={styles.primaryActionWrap}>
            <AppButton label="End Turn" onPress={endTurn} disabled={!isMyTurn} />
          </View>

          <Text style={styles.controlsHelperCompact}>More actions: open the top-right menu.</Text>
        </AppCard>
      </ScrollView>

      <Modal
        visible={controlsMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setControlsMenuVisible(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setControlsMenuVisible(false)}>
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>Quick Actions</Text>
            <View style={styles.menuGrid}>
              <Pressable
                onPress={() => {
                  setControlsMenuVisible(false);
                  skipTurn();
                }}
                disabled={!isMyTurn}
                style={({ pressed }) => [
                  styles.fixedActionBtn,
                  !isMyTurn && styles.fixedActionDisabled,
                  pressed && styles.fixedActionPressed,
                ]}>
                <Text style={styles.fixedActionText}>Skip Turn</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setControlsMenuVisible(false);
                  setTimerEnabled((prev) => !prev);
                }}
                style={({ pressed }) => [styles.fixedActionBtn, pressed && styles.fixedActionPressed]}>
                <Text style={styles.fixedActionText}>{timerEnabled ? 'Timer On' : 'Timer Off'}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setControlsMenuVisible(false);
                  copyRoomCode();
                }}
                style={({ pressed }) => [styles.fixedActionBtn, pressed && styles.fixedActionPressed]}>
                <Text style={styles.fixedActionText}>Code</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setControlsMenuVisible(false);
                  leaveRoom();
                }}
                style={({ pressed }) => [
                  styles.fixedActionBtn,
                  styles.fixedActionDanger,
                  pressed && styles.fixedActionPressed,
                ]}>
                <Text style={styles.fixedActionDangerText}>Leave</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={!!activeCard} transparent animationType="fade" onRequestClose={() => setActiveCard(null)}>
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: cardOpacity,
                transform: [{ scale: cardScale }, { translateY: revealTranslate }],
              },
            ]}>
            <Text style={styles.modalTitle}>Challenge Reveal</Text>
            {activeCard && <ChallengeCard mode={activeCard.mode} text={activeCard.text} />}
            <View style={styles.modalActions}>
              <AppButton label="End Turn" onPress={endTurn} />
              <AppButton label="Close" variant="ghost" onPress={closeCard} />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  feedback: {
    position: 'absolute',
    top: 14,
    left: Space.lg,
    right: Space.lg,
    zIndex: 20,
    backgroundColor: '#1E2E57',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#182545',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  feedbackText: {
    color: '#F8FAFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  lightTop: {
    position: 'absolute',
    top: -120,
    right: -10,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: '#E9EDFF',
  },
  lightBottom: {
    position: 'absolute',
    bottom: -110,
    left: -30,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFEFE6',
  },
  layout: {
    paddingHorizontal: 12,
    paddingTop: Space.md,
    paddingBottom: 88,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  headerLeft: {
    gap: 6,
    flexShrink: 1,
  },
  roomCodePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF3FF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D7E1FB',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roomCodeLabel: {
    color: '#68779D',
    fontSize: 11,
    fontWeight: '700',
  },
  roomCodeValue: {
    color: '#1F3058',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#1D2742',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'system',
  },
  meta: {
    color: '#6E7898',
    fontSize: 12,
    fontWeight: '600',
  },
  headerBadges: {
    alignItems: 'flex-end',
    gap: 5,
  },
  roundPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E7F8',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#212D4A',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFFF4',
    borderWidth: 1,
    borderColor: '#CAEFD8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: '#21B56A',
  },
  onlinePillText: {
    color: '#2D6B4B',
    fontSize: 11,
    fontWeight: '700',
  },
  roundPillText: {
    color: '#2C3A5D',
    fontSize: 12,
    fontWeight: '700',
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#EEF3FF',
    borderWidth: 1,
    borderColor: '#D7E1FB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusStripMain: {
    color: '#22345B',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  statusStripMeta: {
    color: '#586A94',
    fontSize: 12,
    fontWeight: '700',
  },
  tableWrap: {
    paddingVertical: 2,
  },
  tableOuter: {
    minHeight: 320,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE5F5',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A2742',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.11,
    shadowRadius: 26,
    elevation: 6,
  },
  tableOuterTablet: {
    minHeight: 390,
  },
  tableInner: {
    width: '100%',
    minHeight: 236,
    borderRadius: 20,
    backgroundColor: '#F9FBFF',
    borderWidth: 1,
    borderColor: '#DCE5FA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  deckStack: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 58,
    height: 78,
  },
  deckCard: {
    position: 'absolute',
    width: 54,
    height: 74,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCD8F5',
    backgroundColor: '#EEF3FF',
  },
  deckCardBack: {
    top: -4,
    left: -6,
    opacity: 0.5,
  },
  deckCardMid: {
    top: -2,
    left: -3,
    opacity: 0.75,
  },
  drawFxCard: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 54,
    height: 74,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    shadowColor: '#1E2D4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  drawFxTruth: {
    backgroundColor: '#ECFFF7',
    borderColor: '#94DFC2',
  },
  drawFxDare: {
    backgroundColor: '#FFF1E8',
    borderColor: '#F0B59A',
  },
  drawFxGlyph: {
    color: '#2B3C67',
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 30,
  },
  arenaHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  arenaHeadingBlock: {
    flex: 1,
    gap: 2,
  },
  arenaEyebrow: {
    color: '#5B71A8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  arenaTitle: {
    color: '#1E2D52',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  arenaSubtitle: {
    color: '#65739A',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  activePlayerChip: {
    minWidth: 98,
    maxWidth: 122,
    borderRadius: 14,
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#D7E2FD',
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 3,
  },
  activePlayerChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activePlayerChipState: {
    color: '#4E6497',
    fontSize: 10,
    fontWeight: '700',
  },
  activePlayerChipName: {
    color: '#253A6A',
    fontSize: 13,
    fontWeight: '800',
  },
  activePlayerChipHost: {
    color: '#3E5FA8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  communityRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  communityRowStack: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  communityCard: {
    flex: 1,
    minHeight: 150,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E0F4',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#212D4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  communityCardTruth: {
    backgroundColor: '#F3FFFC',
    borderColor: '#BDEADF',
  },
  communityCardDare: {
    backgroundColor: '#FFF5EF',
    borderColor: '#F1CFBB',
  },
  communityCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  communityCardDisabled: {
    opacity: 0.5,
  },
  communityCardIdle: {
    backgroundColor: '#FCFDFF',
  },
  communityGlyphWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE5F8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityRank: {
    color: '#243459',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 32,
  },
  communityLabel: {
    color: '#24345A',
    fontSize: 17,
    fontWeight: '800',
  },
  communityDescription: {
    color: '#5F6F95',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  communityCardTruthActive: {
    backgroundColor: '#EFFFF5',
    borderColor: '#98D8B8',
  },
  communityCardDareActive: {
    backgroundColor: '#FFF3EA',
    borderColor: '#E7B08A',
  },
  communityRankTruthActive: {
    color: '#176B49',
  },
  communityRankDareActive: {
    color: '#A74A21',
  },
  selectionStatusPill: {
    width: '100%',
    backgroundColor: '#F1F5FF',
    borderWidth: 1,
    borderColor: '#DDE6FB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectionStatusText: {
    color: '#4F5F89',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  inlineChallengeCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5FA',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  inlineChallengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineChallengeDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#3E64D8',
  },
  inlineChallengeMode: {
    color: '#4660AA',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inlineChallengeText: {
    color: '#2D3F69',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  tableHint: {
    color: '#7B88A8',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  arenaFooter: {
    width: '100%',
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingBadge: {
    backgroundColor: '#F1F4FE',
    borderWidth: 1,
    borderColor: '#D9E1F7',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  waitingText: {
    color: '#5C6B90',
    fontSize: 12,
    fontWeight: '700',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#26C474',
  },
  playersRail: {
    gap: 8,
    paddingRight: 8,
  },
  playerChip: {
    minWidth: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE5F8',
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  playerChipActive: {
    borderColor: '#9EB5EC',
    backgroundColor: '#EFF4FF',
  },
  playerChipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  playerChipName: {
    color: '#26375E',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#1D2742',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'system',
  },
  turnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  turnStatePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BEE5CF',
    backgroundColor: '#ECFFF4',
  },
  turnStatePillMuted: {
    borderColor: '#DCE4F8',
    backgroundColor: '#F4F7FF',
  },
  turnStateText: {
    color: '#2D6F4D',
    fontSize: 11,
    fontWeight: '800',
  },
  turnStateTextMuted: {
    color: '#5F7097',
  },
  turnCompactRow: {
    marginBottom: 8,
  },
  turnCompactInfo: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE5FA',
    backgroundColor: '#F7F9FF',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 2,
  },
  turnCompactTitle: {
    color: '#263A66',
    fontSize: 13,
    fontWeight: '800',
  },
  turnCompactMeta: {
    color: '#63739A',
    fontSize: 11,
    fontWeight: '600',
  },
  hintCompact: {
    color: '#7A86A6',
    fontSize: 12,
    marginBottom: 6,
  },
  controlsHelperCompact: {
    color: '#5F6F95',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  primaryActionWrap: {
    marginTop: 8,
  },
  headerMenuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F2F6FF',
    borderWidth: 1,
    borderColor: '#D8E2FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A2746',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerMenuText: {
    color: '#304674',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 18,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 28, 52, 0.28)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  menuSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE4F8',
    padding: 12,
    gap: 10,
    shadowColor: '#1C2A4D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  menuTitle: {
    color: '#22345E',
    fontSize: 14,
    fontWeight: '800',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fixedActionBtn: {
    width: '48%',
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE5FA',
    backgroundColor: '#F4F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedActionDanger: {
    borderColor: '#F1C7BD',
    backgroundColor: '#FFF2EF',
  },
  fixedActionText: {
    color: '#2A3E6C',
    fontSize: 12,
    fontWeight: '700',
  },
  fixedActionDangerText: {
    color: '#A04732',
    fontSize: 12,
    fontWeight: '700',
  },
  fixedActionDisabled: {
    opacity: 0.45,
  },
  fixedActionPressed: {
    opacity: 0.86,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 30, 55, 0.38)',
    justifyContent: 'center',
    paddingHorizontal: Space.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E6EBF6',
    padding: Space.md,
    gap: Space.sm,
    shadowColor: '#1D2435',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    color: '#2A3B63',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  modalActions: {
    gap: Space.xs,
  },
});
