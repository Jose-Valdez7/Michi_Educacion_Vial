import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  TextInput,
  BackHandler
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  primary: '#007AFF',
  white: '#FFFFFF',
  gradientPrimary: ['#1E90FF', '#00BFFF'] as const,
  gradientSecondary: ['#FF6B6B', '#FF8E53'] as const
};

const SERVER_URL = 'http://192.168.68.110:3002';
const MAX_PLAYERS = 4;

interface Player {
  id: string;
  socketId: string;
  name: string;
  score: number;
  time: number;
  isReady: boolean;
  isHost: boolean;
}

export default function CompetitionScreen() {
  const router = useRouter();
  const { roomCode: initialRoomCode } = useLocalSearchParams<{ roomCode?: string }>();

  const socketRef = useRef<Socket | null>(null);
  const playerIdRef = useRef<string>(uuidv4());
  const roomCode = useRef<string>(initialRoomCode || '');
  const playerName = useRef<string>('Jugador ' + Math.floor(Math.random() * 1000));

  const [players, setPlayers] = useState<Player[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState<'waiting' | 'starting' | 'in_progress' | 'finished'>('waiting');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [isConnected, setIsConnected] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');

  useEffect(() => {
    const initSocket = async () => {
      try {
        socketRef.current = io(SERVER_URL, {
          transports: ['websocket'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
          console.log('Conectado al servidor');
          setConnectionStatus('connected');
          setIsConnected(true);

          if (!initialRoomCode) {
            const newRoomCode = generateRoomCode();
            roomCode.current = newRoomCode;
            socket.emit('createRoom', {
              roomCode: newRoomCode,
              maxPlayers: MAX_PLAYERS,
              playerId: playerIdRef.current,
              playerName: playerName.current
            });
            setIsHost(true);
          } else {
            roomCode.current = initialRoomCode;
            socket.emit('joinRoom', {
              roomCode: initialRoomCode,
              playerId: playerIdRef.current,
              playerName: playerName.current
            });
          }
        });

        socket.on('roomCreated', (data: { roomCode: string }) => {
          console.log('Sala creada:', data.roomCode);
          roomCode.current = data.roomCode;
          router.setParams({ roomCode: data.roomCode });
        });

        socket.on('roomJoined', (data: { players: Player[] }) => {
          console.log('Unido a la sala:', data.players);
          setPlayers(data.players);
        });

        socket.on('playerJoined', (player: Player) => {
          console.log('Nuevo jugador:', player);
          setPlayers(prev => [...prev, player]);
          Alert.alert(`${player.name} se ha unido a la sala`);
        });

        socket.on('disconnect', () => {
          console.log('Desconectado del servidor');
          setConnectionStatus('disconnected');
          setIsConnected(false);
        });

        socket.on('error', (error: string) => {
          console.error('Error en el socket:', error);
          Alert.alert('Error', error);
          setConnectionStatus('error');
        });

        return () => {
          if (socket.connected) {
            socket.disconnect();
          }
        };
      } catch (error) {
        console.error('Error al inicializar el socket:', error);
        setConnectionStatus('error');
        Alert.alert('Error', 'No se pudo conectar al servidor. Intenta de nuevo más tarde.');
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', {
        roomCode: roomCode.current,
        playerId: playerIdRef.current
      });
    }
    router.replace('/quiz/main');
  };

  const copyRoomCode = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(roomCode.current);
      } else {
        await SecureStore.setItemAsync('roomCode', roomCode.current);
      }
      Alert.alert('Código copiado', `Código de sala: ${roomCode.current}`);
    } catch (error) {
      console.error('Error al copiar el código:', error);
      Alert.alert('Error', 'No se pudo copiar el código al portapapeles');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (gameState !== 'waiting') {
          Alert.alert(
            'Salir de la partida',
            '¿Estás seguro de que quieres salir de la partida? Perderás tu progreso.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Salir',
                style: 'destructive',
                onPress: () => router.back()
              }
            ]
          );
          return true;
        }
        return false;
      };

      if (Platform.OS === 'android') {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandler.remove();
      }
      return undefined;
    }, [gameState])
  );

  if (connectionStatus === 'connecting') {
    return (
      <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Conectando al servidor...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
    return (
      <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {connectionStatus === 'error' ? 'Error de conexión' : 'Desconectado del servidor'}
          </Text>
          <Text style={styles.errorDescription}>
            No se pudo conectar al servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace('/quiz/main')}
          >
            <Text style={styles.retryButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (gameState === 'waiting' || gameState === 'starting') {
    return (
      <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={leaveRoom} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sala de Competencia</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.lobbyContainer}>
          <View style={styles.roomCodeContainer}>
            <Text style={styles.roomCodeTitle}>Código de Sala:</Text>
            <TouchableOpacity style={styles.roomCodeButton} onPress={copyRoomCode}>
              <Text style={styles.roomCodeText}>{roomCode.current}</Text>
              <Text style={styles.copyIcon}>📋</Text>
            </TouchableOpacity>
            <Text style={styles.roomCodeHint}>(Toca para copiar)</Text>
          </View>

          <View style={styles.playersSection}>
            <Text style={styles.playersTitle}>Jugadores ({players.length}/4):</Text>
            <View style={styles.playersList}>
              {players.length > 0 ? (
                players.map((player, index) => (
                  <View key={player.id} style={[styles.playerItem, player.id === playerIdRef.current && styles.currentPlayerItem]}>
                    <Text style={styles.playerName}>{player.name} {player.isHost && '👑'}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noPlayers}>Esperando jugadores...</Text>
              )}
              {Array(MAX_PLAYERS - players.length).fill(0).map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptyPlayerSlot}>
                  <Text style={styles.emptyPlayerText}>Esperando jugador...</Text>
                </View>
              ))}
            </View>
          </View>

          {isHost && (
            <View style={styles.hostControls}>
              <Text style={styles.hostInstructions}>
                {players.length < 2 ? `Invita a ${2 - players.length} jugador(es) más para comenzar` : '¡Todos están listos!'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1E90FF', '#00BFFF']} style={styles.container}>
      {!isConnected ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Conectando al servidor...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {!roomCode.current ? (
            <View style={styles.centered}>
              <TouchableOpacity style={styles.button} onPress={() => {
                const socket = socketRef.current;
                if (socket) {
                  const newRoomCode = generateRoomCode();
                  roomCode.current = newRoomCode;
                  socket.emit('createRoom', {
                    roomCode: newRoomCode,
                    maxPlayers: MAX_PLAYERS,
                    playerId: playerIdRef.current,
                    playerName: playerName.current
                  });
                  setIsHost(true);
                }
              }}>
                <Text style={styles.buttonText}>Crear Sala</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>O únete a una sala</Text>
              <TextInput
                style={styles.input}
                placeholder="Código de sala"
                value={roomCodeInput}
                onChangeText={setRoomCodeInput}
              />
              <TouchableOpacity
                style={[styles.button, !roomCodeInput && styles.buttonDisabled]}
                onPress={() => {
                  const socket = socketRef.current;
                  if (socket && roomCodeInput) {
                    roomCode.current = roomCodeInput;
                    socket.emit('joinRoom', {
                      roomCode: roomCodeInput,
                      playerId: playerIdRef.current,
                      playerName: playerName.current
                    });
                  }
                }}
                disabled={!roomCodeInput}
              >
                <Text style={styles.buttonText}>Unirse a Sala</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gameContainer}>
              <View style={styles.roomCodeContainer}>
                <Text style={styles.roomCodeTitle}>Código de la sala:</Text>
                <Text style={styles.roomCodeStyle}>{roomCode.current}</Text>
              </View>
              <View style={styles.playersList}>
                <Text style={styles.playersTitle}>Jugadores ({players.length}):</Text>
                {players.map((player, index) => (
                  <Text key={index} style={styles.playerName}>{player.name}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'ios' ? 70 : 30, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', flex: 1 },
  smallButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, minWidth: 40, alignItems: 'center', justifyContent: 'center' },
  smallButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFFFFF', marginTop: 16, fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  errorDescription: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  retryButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  lobbyContainer: { flex: 1, padding: 16 },
  roomCodeContainer: { alignItems: 'center', marginBottom: 24, backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: 16, borderRadius: 12 },
  roomCodeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  roomCodeText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: 'rgba(0, 0, 0, 0.3)', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, letterSpacing: 2, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  copyIcon: { color: '#FFFFFF', fontSize: 24, marginLeft: 8 },
  roomCodeHint: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginTop: 4 },
  roomCodeTitle: { fontSize: 18, color: '#FFFFFF', marginBottom: 8 },
  roomCodeStyle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 5, backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: 10, borderRadius: 8, marginTop: 5, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', textAlign: 'center' },
  playersSection: { marginBottom: 24 },
  playersTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  playersList: { width: '80%', marginBottom: 30 },
  playerItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 15, borderRadius: 8, marginBottom: 10 },
  currentPlayerItem: { borderWidth: 1, borderColor: '#007AFF', backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  playerName: { color: '#FFFFFF', fontSize: 16 },
  noPlayers: { color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', fontStyle: 'italic' },
  emptyPlayerSlot: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 10, padding: 12, marginBottom: 12, opacity: 0.7 },
  emptyPlayerText: { color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' },
  hostControls: { marginTop: 'auto', alignItems: 'center' },
  hostInstructions: { color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', marginBottom: 16, fontSize: 15, lineHeight: 22 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 25, width: '80%', alignItems: 'center', marginVertical: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)', width: '80%', marginVertical: 15 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, marginBottom: 15 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', borderRadius: 8, padding: 15, width: '80%', marginBottom: 15, fontSize: 16 },
  gameContainer: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }
});
