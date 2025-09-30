import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Player {
  id: string;
  socketId: string;
  name: string;
  score: number;
  time: number;
  isReady: boolean;
  isHost: boolean;
}

interface FinalRankingsProps {
  rankings: Player[];
  currentPlayerId: string;
  onPlayAgain: () => void;
}

export default function FinalRankings({ rankings, currentPlayerId, onPlayAgain }: FinalRankingsProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>🏆 ¡Juego Terminado!</Text>
        <Text style={styles.subtitle}>Puntuaciones Finales</Text>
        
        {rankings.map((player, index) => {
          const position = index + 1;
          const isCurrentPlayer = player.id === currentPlayerId;
          
          return (
            <View
              key={player.id}
              style={[
                styles.rankingItem,
                isCurrentPlayer && styles.currentPlayerRanking,
                position === 1 && styles.firstPlace,
                position === 2 && styles.secondPlace,
                position === 3 && styles.thirdPlace
              ]}
            >
              <View style={styles.positionContainer}>
                <Text style={styles.positionText}>#{position}</Text>
              </View>
              <View style={styles.playerInfo}>
                <Text style={[
                  styles.playerName,
                  isCurrentPlayer && styles.currentPlayerName
                ]}>
                  {player.name}
                  {isCurrentPlayer && ' (Tú)'}
                </Text>
                <Text style={styles.playerScore}>{player.score} puntos</Text>
                <Text style={styles.playerTime}>Tiempo: {player.time}s</Text>
              </View>
              {position <= 3 && (
                <Text style={styles.medal}>
                  {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
                </Text>
              )}
            </View>
          );
        })}
        
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={onPlayAgain}
        >
          <LinearGradient
            colors={['#007AFF', '#0056CC']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>🎮 Jugar de Nuevo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    borderLeftWidth: 4
  },
  firstPlace: {
    borderLeftColor: '#FFD700',
    backgroundColor: '#FFF8DC'
  },
  secondPlace: {
    borderLeftColor: '#C0C0C0',
    backgroundColor: '#F5F5F5'
  },
  thirdPlace: {
    borderLeftColor: '#CD7F32',
    backgroundColor: '#FDF5E6'
  },
  currentPlayerRanking: {
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  positionContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  positionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  playerInfo: {
    flex: 1
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  currentPlayerName: {
    color: '#007AFF'
  },
  playerScore: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2
  },
  playerTime: {
    fontSize: 14,
    color: '#999'
  },
  medal: {
    fontSize: 24,
    marginLeft: 10
  },
  playAgainButton: {
    marginTop: 20,
    width: '80%'
  },
  buttonGradient: {
    padding: 15,
    borderRadius: 25,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});