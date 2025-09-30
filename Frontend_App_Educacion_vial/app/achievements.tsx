import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AchievementsScreen() {
  const router = useRouter();

  // Fondo animado igual al de welcome
  const bgBase = useRef(new Animated.Value(0)).current;
  const bgProgress = Animated.modulo(bgBase, 1);

  useEffect(() => {
    const duration = 15000; // misma velocidad que welcome
    bgBase.setValue(0);
    const loop = Animated.loop(
      Animated.timing(bgBase, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );
    loop.start();
    return () => {
      bgBase.stopAnimation();
      loop.stop();
    };
  }, [bgBase]);

  const achievements = [
    { id: 'a1', title: 'Primera Estrella', desc: 'Completa tu primer minijuego', icon: require('../assets/images/gano.png') },
    { id: 'a2', title: 'Explorador', desc: 'Visita todas las pantallas principales', icon: require('../assets/images/logoVial.png') },
    { id: 'a3', title: 'Cinturón Seguro', desc: 'Aprende sobre seguridad vial', icon: require('../assets/images/quiz/cinturon-seguridad.png') },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bgContainer} pointerEvents="none">
        <Animated.Image
          source={require('../assets/images/bg-logros.png')}
          style={[styles.bgImage, { transform: [{ translateX: Animated.add(Animated.multiply(bgProgress, width), -width) }] }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={require('../assets/images/bg-logros.png')}
          style={[styles.bgImage, { transform: [{ translateX: Animated.multiply(bgProgress, width) }] }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={require('../assets/images/bg-logros.png')}
          style={[styles.bgImage, { transform: [{ translateX: Animated.add(Animated.multiply(bgProgress, width), width) }] }]}
          resizeMode="cover"
        />
      </View>

      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} style={styles.backBtn}>
        <Image source={require('../assets/images/btn-volver.png')} style={styles.backImg} resizeMode="contain" />
      </TouchableOpacity>

      <Text style={styles.title}>Logros</Text>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {achievements.map((ach) => (
          <View key={ach.id} style={styles.card}>
            <Image source={ach.icon} style={styles.cardIcon} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{ach.title}</Text>
              <Text style={styles.cardDesc}>{ach.desc}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+5</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 18 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 1, paddingTop: 55, paddingBottom: 30 },
  bgContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgImage: { position: 'absolute', width: width, height: '100%', opacity: 0.6 },
  backBtn: { position: 'absolute', top: 12, left: 16, zIndex: 10 },
  backImg: { width: 110, height: 90 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginTop: 55,
    marginBottom: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  listContainer: { paddingHorizontal: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardIcon: { width: 64, height: 64, marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  cardDesc: { color: '#333', marginTop: 4 },
  badge: { backgroundColor: '#FFD700', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#000' },
  badgeText: { fontWeight: 'bold', color: '#000' },
});
