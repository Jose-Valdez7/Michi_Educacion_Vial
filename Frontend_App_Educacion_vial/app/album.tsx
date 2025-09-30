import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ImageBackground, Animated, Dimensions, Easing } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// ancho a full con padding de contenedor

export default function AlbumScreen() {
  const router = useRouter();

  // Configuración igual a welcome: bgBase -> modulo -> loop lineal
  const bgBase = useRef(new Animated.Value(0)).current;
  const bgProgress = Animated.modulo(bgBase, 1);

  useEffect(() => {
    const duration = 50000; // más lento
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

  return (
    <View style={styles.container}>
      <View style={styles.animatedBgContainer} pointerEvents="none">
        <Animated.Image
          source={require('../assets/images/fondo-album.png')}
          style={[styles.bgImage, { transform: [{ translateX: Animated.add(Animated.multiply(bgProgress, width), -width) }] }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={require('../assets/images/fondo-album.png')}
          style={[styles.bgImage, { transform: [{ translateX: Animated.multiply(bgProgress, width) }] }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={require('../assets/images/fondo-album.png')}
          style={[styles.bgImage, { transform: [{ translateX: Animated.add(Animated.multiply(bgProgress, width), width) }] }]}
          resizeMode="cover"
        />
      </View>

      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} style={styles.backBtn}>
        <Image source={require('../assets/images/btn-volver.png')} style={styles.backImg} resizeMode="contain" />
      </TouchableOpacity>
      <View style={styles.cardsRow}>
        <Text style={styles.title}>Álbum</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.card}>
          <ImageBackground source={require('../assets/images/portada-vehiculos.png')} style={styles.cardBg} imageStyle={styles.cardBgImage}>
            <View style={styles.centerContent}>
              <TouchableOpacity activeOpacity={0.85}>
                <Image source={require('../assets/images/btn-vehiculos.png')} style={styles.btnImage} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.89} style={styles.card}>
          <ImageBackground source={require('../assets/images/imagen-personaje.png')} style={styles.cardBg} imageStyle={styles.cardBgImage}>
            <View style={styles.centerContent}>
              <TouchableOpacity activeOpacity={0.85}>
                <Image source={require('../assets/images/btn-personajes.png')} style={styles.btnImage} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 5, paddingTop: 24, backgroundColor: 'transparent' },
  animatedBgContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgImage: { position: 'absolute', width: width, height: '100%', opacity: 0.6 },
  backBtn: { position: 'absolute', top: 12, left: 20, zIndex: 10 },
  backImg: { width: 120, height: 100 },
  cardsRow: { flex: 1, flexDirection: 'column', justifyContent: 'flex-start', gap: 20 },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 55,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: { width: '100%', height: 300, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6, borderWidth: 2, borderColor: '#000' },
  cardBg: { flex: 1, padding: 16, justifyContent: 'flex-end' },
  cardBgImage: { opacity: 0.65 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  cardSub: { marginTop: 6, color: '#222' },
  centerContent: { alignItems: 'center', justifyContent: 'center', height: '100%' },
  btnImage: { width: 220, height: 7000 },
});
