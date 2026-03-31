/**
 * File Responsibility
 * Owner: Frontend
 * Scope: Reusable UI system for party-game screens (buttons, cards, inputs, chips, states).
 */

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { Fonts } from '@/constants/theme';

export const Palette = {
  bg: '#F3F5FF',
  surface: '#FFFFFF',
  text: '#12182C',
  muted: '#5E6883',
  primary: '#4C46F2',
  primaryBorder: '#5E59F5',
  coral: '#FF7365',
  teal: '#1CBFA1',
  border: '#DFE5F4',
  shadow: '#1E293B',
};

export const Space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : Palette.text} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.buttonTextPrimary,
            variant === 'secondary' && styles.buttonTextSecondary,
            variant === 'ghost' && styles.buttonTextGhost,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

type AppCardProps = {
  children: React.ReactNode;
};

export function AppCard({ children }: AppCardProps) {
  return <View style={styles.card}>{children}</View>;
}

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AppInput({ label, error, style, ...props }: AppInputProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, !!error && styles.inputError, style]}
        placeholderTextColor="#98A2B3"
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function CodeInput({ label, error, ...props }: AppInputProps) {
  return (
    <AppInput
      label={label}
      error={error}
      autoCapitalize="characters"
      maxLength={6}
      style={styles.codeInput}
      {...props}
    />
  );
}

type PlayerAvatarChipProps = {
  name: string;
  active?: boolean;
  isHost?: boolean;
};

export function PlayerAvatarChip({ name, active = false, isHost = false }: PlayerAvatarChipProps) {
  const initial = (name.trim().charAt(0) || 'P').toUpperCase();

  return (
    <View style={[styles.playerChip, active && styles.playerChipActive]}>
      <View style={[styles.avatar, active && styles.avatarActive]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.playerMeta}>
        <Text style={styles.playerName}>{name}</Text>
        <Text style={styles.playerRole}>{isHost ? 'Host' : 'Player'}</Text>
      </View>
      {active ? <View style={styles.dotActive} /> : <View style={styles.dotIdle} />}
    </View>
  );
}

type TurnBadgeProps = {
  text: string;
};

export function TurnBadge({ text }: TurnBadgeProps) {
  return (
    <View style={styles.turnBadge}>
      <Text style={styles.turnBadgeText}>{text}</Text>
    </View>
  );
}

type ChallengeCardProps = {
  mode: 'truth' | 'dare';
  text: string;
};

export function ChallengeCard({ mode, text }: ChallengeCardProps) {
  return (
    <View style={[styles.challengeCard, mode === 'truth' ? styles.truth : styles.dare]}>
      <Text style={styles.challengeLabel}>{mode === 'truth' ? 'Truth' : 'Dare'}</Text>
      <Text style={styles.challengeText}>{text}</Text>
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator color={Palette.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: Space.lg,
    gap: Space.sm,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.11,
    shadowRadius: 18,
    elevation: 6,
  },
  button: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.md,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primaryBorder,
  },
  buttonSecondary: {
    backgroundColor: '#F8F9FF',
    borderColor: '#D8DEF3',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  buttonText: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: Palette.text,
  },
  buttonTextGhost: {
    color: Palette.primary,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  fieldWrap: {
    gap: Space.xs,
  },
  label: {
    color: '#4A566F',
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: Palette.text,
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
  codeInput: {
    letterSpacing: 2,
    fontFamily: Fonts.mono,
  },
  inputError: {
    borderColor: '#E35D5D',
  },
  error: {
    color: '#C73434',
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingHorizontal: Space.sm,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
  },
  playerChipActive: {
    borderColor: '#9CA9FF',
    backgroundColor: '#EEF1FF',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8ECF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: {
    backgroundColor: '#CAD6FF',
  },
  avatarText: {
    color: '#1D2A54',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  playerMeta: {
    flex: 1,
  },
  playerName: {
    color: Palette.text,
    fontSize: 14,
    fontFamily: Fonts.sans,
    fontWeight: '600',
  },
  playerRole: {
    color: Palette.muted,
    fontSize: 11,
    fontFamily: Fonts.mono,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.teal,
  },
  dotIdle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CDD5E3',
  },
  turnBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EAEFFF',
    borderColor: '#C9D4FF',
    borderWidth: 1,
  },
  turnBadgeText: {
    color: '#273A8F',
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  challengeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Space.lg,
    gap: Space.sm,
  },
  truth: {
    backgroundColor: '#E8FAF5',
    borderColor: '#A9E6D8',
  },
  dare: {
    backgroundColor: '#FFF0ED',
    borderColor: '#F7C4B7',
  },
  challengeLabel: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: '#41536B',
  },
  challengeText: {
    color: Palette.text,
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  emptyWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FBFCFF',
    padding: Space.md,
    gap: Space.xs,
  },
  emptyTitle: {
    color: Palette.text,
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  emptySubtitle: {
    color: Palette.muted,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
  },
  loadingText: {
    color: Palette.muted,
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
});
