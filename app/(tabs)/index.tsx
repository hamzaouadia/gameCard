import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { createRoom, joinRoom } from '../../services/supabase';

export default function HomeScreen() {
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleTestCreateRoom = async () => {
    setLoading(true);
    try {
      const result = await createRoom('TestHostPlayer');
      setRoomInfo(result);
      Alert.alert("Supabase Success! 🎉", `Room created with code: ${result.room.room_code}`);
    } catch (error) {
      Alert.alert("Supabase Error ❌", error.message);
      console.error("Supabase Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestJoinRoom = async () => {
    if (!roomCodeInput) {
      Alert.alert("Wait!", "Please enter a 5-character room code first.");
      return;
    }

    setLoading(true);
    try {
      // Testing with a mock guest player
      const result = await joinRoom(roomCodeInput.toUpperCase(), 'TestGuestPlayer');
      setRoomInfo(result);
      Alert.alert("Supabase Success! 🎉", `Successfully joined room: ${result.room.room_code}`);
      setRoomCodeInput(''); // Clear the input after success
    } catch (error) {
      Alert.alert("Supabase Error ❌", "Room not found or couldn't insert player. Did you type the exact code?");
      console.error("Supabase Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>

      <Button
        title={loading ? "Loading..." : "1. Test Create Room"}
        onPress={handleTestCreateRoom}
        disabled={loading}
      />

      <View style={styles.divider} />

      <TextInput
        style={styles.input}
        placeholder="Enter Room Code (e.g. ABCDE)"
        value={roomCodeInput}
        onChangeText={setRoomCodeInput}
        autoCapitalize="characters"
        maxLength={5}
      />

      <Button
        title={loading ? "Loading..." : "2. Test Join Room"}
        onPress={handleTestJoinRoom}
        disabled={loading || !roomCodeInput}
        color="#2196F3"
      />

      {roomInfo && (
        <View style={styles.result}>
          <Text style={styles.bold}>Latest Database Result:</Text>
          <Text>Room ID: {roomInfo.room.id.substring(0, 8)}...</Text>
          <Text>Room Code: {roomInfo.room.room_code}</Text>
          <Text>Player Inserted: {roomInfo.player.player_name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#ccc',
    marginVertical: 30
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16
  },
  result: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    width: '100%'
  },
  bold: {
    fontWeight: 'bold',
    marginBottom: 10
  }
});
