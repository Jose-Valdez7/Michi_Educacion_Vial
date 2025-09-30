import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Easing, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/utils/colors';
import { useRouter, type Href } from 'expo-router';
import { ProgressApi } from '@/services/progress';

const { width, height } = Dimensions.get('window');

export default function MinigamesLevel1() {
  const router = useRouter();
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({
    coloring: false,
    quiz: false,
    bicycle: false
  });

  // Fondo animado vertical
  const bgBase = useRef(new Animated.Value(0)).current;
  const bgProgress = Animated.modulo(bgBase, 1);

  useEffect(() => {
    (async () => {
      try {
        const p = await ProgressApi.get();
        const list: string[] = Array.isArray(p.completedGames) ? p.completedGames : [];

        setCompletedActivities({
          coloring: list.includes('1_coloring') || list.includes('1_6'),
          quiz: list.includes('1_quiz_vial') || list.includes('1_1'),
          bicycle: list.includes('1_bicycle') || list.includes('1_2')
        });
      } catch (e) {
        // Error loading completed activities
      }
    })();
  }, []);

  useEffect(() => {
    const duration = 20000; // velocidad cómoda (más lento que welcome si prefieres)
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
      <View style={styles.bgContainer} pointerEvents="none">
        <Animated.Image
          source={require('../../assets/images/fondo_nivel1.png')}
          style={[styles.bgImage, { transform: [{ translateY: Animated.add(Animated.multiply(bgProgress, height), -height) }] }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={require('../../assets/images/fondo_nivel1.png')}
          style={[styles.bgImage, { transform: [{ translateY: Animated.multiply(bgProgress, height) }] }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={require('../../assets/images/fondo_nivel1.png')}
          style={[styles.bgImage, { transform: [{ translateY: Animated.add(Animated.multiply(bgProgress, height), height) }] }]}
          resizeMode="cover"
        />
      </View>

      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} style={styles.backBtn}>
        <Image source={require('../../assets/images/btn-volver.png')} style={styles.backImg} resizeMode="contain" />
      </TouchableOpacity>

      <Image source={require('../../assets/images/nivel-1.png')} style={styles.titleImage} resizeMode="contain" />
      <Text style={styles.subtitle}>Elige una actividad para continuar y diviertete aprendiendo</Text>

      <View style={{ height: 8 }} />

      {/* Card 1: Pintor con imagen como fondo en la parte superior */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/images' as Href)}>
        <View style={styles.cardInnerColumnLarge}>
          <ImageBackground
            source={require('../../assets/images/pintor.png')}
            style={styles.cardTopLarge}
            imageStyle={styles.cardTopImageCover}
            resizeMode="cover"
          />
          <View style={styles.cardBottomLargeGreen}>
            <Text style={styles.cardTitleLarge}>Colorear divertidamente</Text>
            <Text style={styles.cardDescLarge}>Colorea y aprende</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Card 2: Quiz con imagen como fondo en la parte superior */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/quiz/main' as Href)}>
        <View style={styles.cardInnerColumnLarge}>
          <ImageBackground
            source={require('../../assets/images/quizVial.png')}
            style={styles.cardTopLarge}
            imageStyle={styles.cardTopImageCover}
            resizeMode="cover"
          />
          <View style={styles.cardBottomLargeYellow}>
            <Text style={styles.cardTitleLarge}>Quiz Vial</Text>
            <Text style={styles.cardDescLarge}>Pon a prueba tus conocimientos</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Card 3: Bicicleta con imagen como fondo en la parte superior */}
      <TouchableOpacity style={styles.card} onPress={() => router.push('/bicycle-game' as Href)}>
        <View style={styles.cardInnerColumnLarge}>
          <ImageBackground
            source={require('../../assets/images/bici.png')}
            style={styles.cardTopLarge}
            imageStyle={styles.cardTopImageCover}
            resizeMode="cover"
          />
          <View style={styles.cardBottomLargeOrange}>
            <Text style={styles.cardTitleLarge}>Aventura en Bicicleta</Text>
            <Text style={styles.cardDescLarge}>Evita obstáculos y responde preguntas</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 44 },
  bgContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgImage: { position: 'absolute', width: width, height: '100%', opacity: 1 },
  backBtn: { position: 'absolute', top: 20, left: 16, zIndex: 10 },
  backImg: { width: 96, height: 84 },
  titleImage: { width: width * 0.48, height: 64, alignSelf: 'center', marginTop: 30, marginBottom: 6 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.white, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: colors.white, opacity: 0.9, marginTop: 2, fontSize: width < 400 ? 13 : 15 },
  // Cards base
  card: { 
    borderRadius: 14, 
    overflow: 'hidden', 
    marginTop: 11, 
    shadowColor: colors.shadowDark as any, 
    shadowOffset: { width: 0, height: 5 }, 
    shadowOpacity: 0.29, 
    shadowRadius: 5.5, 
    elevation: 9 
  },
  // Column split (normal)
  cardInnerColumn: { flexDirection: 'column', alignItems: 'stretch', minHeight: 135 },
  cardTop: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  cardBottom: { paddingVertical: 12, paddingHorizontal: 12 },
  cardImage: { width: width < 400 ? 100 : 120, height: width < 400 ? 100 : 120 },
  cardTitle: { color: colors.white, fontWeight: 'bold', fontSize: 19, textAlign: 'center' },
  cardDesc: { color: colors.white, opacity: 0.95, marginTop: 5, textAlign: 'center', fontSize: 15 },
  // Slightly larger large-variant
  cardInnerColumnLarge: { flexDirection: 'column', alignItems: 'stretch', minHeight: 180 },
  cardTopLarge: { alignItems: 'center', justifyContent: 'center', minHeight: 125 },
  cardTopImageCover: { opacity: 1 },
  cardBottomLarge: { paddingVertical: 13, paddingHorizontal: 13 },
  cardTitleLarge: { color: colors.white, fontWeight: 'bold', fontSize: 19, textAlign: 'center' },
  cardDescLarge: { color: colors.white, opacity: 0.95, marginTop: 5, textAlign: 'center', fontSize: 15 },
  // Color helpers for bottoms
  cardBottomLargeGreen: { backgroundColor: colors.gradientVialGreen[0], paddingVertical: 13, paddingHorizontal: 13 },
  cardBottomLargeYellow: { backgroundColor: colors.gradientVialYellow[0], paddingVertical: 13, paddingHorizontal: 13 },
  cardBottomLargeOrange: { backgroundColor: colors.gradientVialOrange[0], paddingVertical: 13, paddingHorizontal: 13 },
});
