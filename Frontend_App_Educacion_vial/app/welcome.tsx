import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image, Modal, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/utils/colors';
import { ProgressApi } from '@/services/progress';
import { AuthService } from '@/services/auth';
import { useRouter, type Href } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const bgBase = useRef(new Animated.Value(0)).current;
  const bgProgress = Animated.modulo(bgBase, 1);
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const duration = 15000;
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any | null>(null);
  const [userName, setUserName] = useState<string>('Amigo');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await AuthService.getSession();
      if (!session.accessToken || !session.childId) {
        router.replace('/(auth)/login' as Href);
        return;
      }
      try {
        const p = await ProgressApi.get();
        setProgress(p);

        // ✅ Verificar si se completaron las 3 estrellas del nivel 1
        const level1Stars = completedStars(p.completedGames, 1);
        if (level1Stars === 3) {
          // Verificar si ya se dieron los 25 puntos (evitar duplicados)
          const hasReceivedPoints = p.completedGames.includes('1_level_completed_bonus');

          if (!hasReceivedPoints) {
            // ✅ Dar 25 puntos de licencia digital por completar las 3 estrellas
            const newPoints = (p.points || 0) + 25;
            const newCompletedGames = [...p.completedGames, '1_level_completed_bonus'];

            await ProgressApi.update({
              points: newPoints,
              completedGames: newCompletedGames
            });

            // Actualizar el progreso local para reflejar los cambios
            setProgress({
              ...p,
              points: newPoints,
              completedGames: newCompletedGames
            });
          }
        }

        // Obtener el primer nombre del usuario desde la tabla
        let firstName = 'Amigo';
        // Intentar obtener el nombre real del usuario
        if (session.childName) {
          firstName = session.childName.split(' ')[0];
        } else if (session.childId) {
          firstName = session.childId.split('-')[0];
        }

        setUserName(firstName);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onLogout = async () => {
    await AuthService.logout();
    router.replace('/(auth)/login' as Href);
  };

  if (loading || !progress) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.bgContainer} pointerEvents="none">
          <Animated.Image
            source={require('../assets/images/background-welcome.png')}
            style={[styles.bgImage, { transform: [{ translateX: Animated.add(Animated.multiply(bgProgress, width), -width) }] }]}
            resizeMode="cover"
          />
          <Animated.Image
            source={require('../assets/images/background-welcome.png')}
            style={[styles.bgImage, { transform: [{ translateX: Animated.multiply(bgProgress, width) }] }]}
            resizeMode="cover"
          />
          <Animated.Image
            source={require('../assets/images/background-welcome.png')}
            style={[styles.bgImage, { transform: [{ translateX: Animated.add(Animated.multiply(bgProgress, width), width) }] }]}
            resizeMode="cover"
          />
        </View>
        {/* Header con botón de ajustes */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.welcomeRow}>
              <View style={styles.welcomeCard}>
                <Image source={require('../assets/images/gatoLogo.png')} style={styles.welcomeCatImage} resizeMode="contain" />
                <Text style={styles.welcomeText}>¡Bienvenido, {userName}!</Text>
              </View>
            </View>
            <View style={[styles.statPill, { marginRight: 8 }]}>
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={styles.statText}>{progress.coins ?? 0}</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettingsModal(true)}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.licenseBox}>
            <View style={styles.licenseHeader}>
              <Text style={styles.licenseTitle}>🏆 Licencia Digital</Text>
              <Text style={styles.licenseSubtitle}>{progress.points || 0} / 75 puntos</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(((progress.points || 0) / 75) * 100, 100)}%` }]} />
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.islandsContainer}>
          {([1, 2, 3, 4, 5] as const).map((lvl) => {
            const isUnlocked = progress.unlockedLevels?.includes(lvl) ?? (lvl === 1);
            const isLocked = !isUnlocked;

            // ✅ Verificar si el nivel 2 debe desbloquearse (3 estrellas en nivel 1)
            const level1Stars = completedStars(progress.completedGames, 1);
            const shouldUnlockLevel2 = lvl === 2 && level1Stars === 3 && !isUnlocked;

            return (
              <View key={lvl} style={[styles.islandCard, isLocked && styles.lockedIslandCard]}>
                <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.islandGradient}>
                  <View style={styles.islandHeaderArea}>
                    <View style={styles.starsBackground}>
                      <View style={styles.starsContainer}>
                        {[1, 2, 3].map((n) => (
                          <Text key={n} style={styles.starText}>
                            {completedStars(progress.completedGames, lvl) >= n ? '⭐' : '☆'}
                          </Text>
                        ))}
                      </View>
                    </View>
                    <Image
                      source={require('../assets/images/isla12.png')}
                      style={[styles.islandImage, isLocked && styles.lockedIslandImage]}
                      resizeMode="contain"
                    />
                    <Image
                      source={require('../assets/images/nivel-1.png')}
                      style={styles.titleImage}
                      resizeMode="contain"
                    />

                  </View>

                  <View style={styles.islandButtonContainer}>
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                      <TouchableOpacity
                        style={[styles.islandButton, isLocked && styles.lockedIslandButton]}
                        onPress={() => {
                          if (isUnlocked || shouldUnlockLevel2) {
                            Animated.sequence([
                              Animated.timing(buttonScale, {
                                toValue: 0.9,
                                duration: 100,
                                useNativeDriver: true,
                              }),
                              Animated.timing(buttonScale, {
                                toValue: 1,
                                duration: 100,
                                useNativeDriver: true,
                              }),
                            ]).start();

                            setTimeout(() => {
                              router.push('/minigames/level1' as Href);
                            }, 150);
                          }
                        }}
                        disabled={isLocked && !shouldUnlockLevel2}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={require('../assets/images/boton-jugar.png')}
                          style={[styles.playImage, isLocked && { opacity: 0.6 }]}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>

                  {isLocked && (
                    <View style={styles.lockOverlay}>
                      <Text style={styles.lockIcon}>🔒</Text>
                      <Text style={styles.lockMessage}>Nivel Bloqueado</Text>
                      <Text style={styles.lockRequirement}>
                        {lvl === 2 ? (shouldUnlockLevel2 ? '¡Desbloqueado!' : 'Completa las 3 estrellas del Nivel 1') :
                          lvl === 3 ? 'Completa el Nivel 2' :
                            lvl === 4 ? 'Completa el Nivel 3' :
                              'Completa el Nivel 4'}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footerButtons}>
          <TouchableOpacity style={[styles.footerBtn, { marginTop: 8 }]} onPress={() => router.push('/album' as Href)} activeOpacity={0.85}>
            <Image
              source={require('../assets/images/boton-album.png')}
              style={styles.albumImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerBtn} onPress={() => router.push('/achievements' as Href)} activeOpacity={0.85}>
            <Image
              source={require('../assets/images/boton-logros.png')}
              style={styles.achievementsImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Ajustes */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.settingsIcon}>⚙️</Text>
              <Text style={styles.modalTitle}>Ajustes</Text>
            </View>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalLogoutOption]}
              onPress={async () => {
                setShowSettingsModal(false);
                await onLogout();
              }}
            >
              <Text style={[styles.modalOptionText, styles.modalLogoutText]}>🚪 Cerrar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelOption]}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.modalCancelText}>❌ Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: 1, paddingTop: 55, paddingBottom: 30 },
  bgContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgImage: { position: 'absolute', width: width, height: '100%', opacity: 0.6 },
  header: { marginBottom: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 4 },
  welcomeText: { fontSize: width < 400 ? 22 : 28, fontWeight: 'bold', color: '#000000', marginRight: 8 },
  welcomeCatImage: { width: width < 400 ? 35 : 40, height: width < 400 ? 35 : 40 },
  settingsButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 10, borderRadius: 20, minWidth: 40, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  settingsIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statIcon: { fontSize: 18, marginRight: 6 },
  statText: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  licenseBox: { marginBottom: 10, backgroundColor: 'rgba(255, 215, 0, 0.3)', borderRadius: 12, padding: 16, marginTop: 20, width: '96%', marginHorizontal: 8 },
  licenseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  licenseTitle: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  licenseSubtitle: { fontSize: 16, color: '#000000', backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  progressBarBg: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.accent },
  islandsContainer: { paddingHorizontal: 10 },
  islandCard: { width: width * 0.8, height: height * 0.56, marginRight: 16, borderRadius: 30, overflow: 'hidden', shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10, borderWidth: 3, borderColor: '#000000' },
  islandGradient: { flex: 1, padding: 20, borderRadius: 10, position: 'relative' },
  islandHeaderArea: { alignItems: 'center', flex: 1, justifyContent: 'flex-start', zIndex: 1 },
  islandImage: { width: width * 0.55, height: width * 0.55, marginBottom: 1, marginTop: 0.25, },
  titleImage: { width: width * 0.4, height: 60, alignSelf: 'center', marginBottom: 5 },
  starsBackground: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 7 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  starText: { fontSize: 20, marginHorizontal: 3 },
  islandButtonContainer: { zIndex: 1, marginTop: 20 },
  islandButton: { borderRadius: 16 },
  playImage: { width: width * 1, height: 70, alignSelf: 'center' },
  lockedIslandCard: { opacity: 0.7 },
  lockedIslandImage: { opacity: 0.6 },
  lockedIslandTitle: { color: '#cccccc' },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', borderRadius: 25, zIndex: 10, padding: 30 },
  lockIcon: { fontSize: 60, color: '#fff', marginBottom: 20 },
  lockMessage: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 15 },
  lockRequirement: { fontSize: 18, color: '#ddd', textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
  lockedIslandButton: { opacity: 0.6 },
  lockedIslandButtonText: { color: '#999999' },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 8 },
  footerBtn: { flex: 1, marginHorizontal: 6, borderRadius: 16, overflow: 'hidden' },
  footerBtnGradient: { paddingVertical: 12, alignItems: 'center' },
  footerBtnText: { color: colors.white, fontWeight: 'bold' },
  albumImage: { width: '100%', height: 120 },
  achievementsImage: { width: '100%', height: 120 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '80%', maxWidth: 400 },
  modalTitleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#333', marginLeft: 10 },
  modalOption: { padding: 15, borderRadius: 10, marginVertical: 5, alignItems: 'center' },
  modalOptionText: { fontSize: 18, color: '#333', fontWeight: '500' },
  modalLogoutOption: { backgroundColor: '#ff4444' },
  modalLogoutText: { color: '#FFFFFF' },
  modalCancelOption: { backgroundColor: '#f0f0f0' },
  modalCancelText: { fontSize: 18, color: '#666', fontWeight: '500' },
  welcomeCard: { backgroundColor: 'rgba(255, 215, 0, 0.3)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 0, flexDirection: 'row', alignItems: 'center', shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 6 },
});

function completedStars(completedGames: string[] = [], level: number): number {
  if (level === 1) {
    // ✅ Juegos específicos del nivel 1 para las 3 estrellas
    const requiredGames = [
      '1_quiz_vial',              // ⭐ 1ª estrella: Quiz vial difícil
      '1_colorear_divertidamente', // ⭐ 2ª estrella: Colorear divertidamente
      '1_paseo_bici'              // ⭐ 3ª estrella: Paseo en bici
    ];

    // Contar cuántos de estos juegos están completados
    const completedCount = requiredGames.filter(gameKey =>
      completedGames.includes(gameKey)
    ).length;

    return Math.max(0, Math.min(3, completedCount));
  }

  // Para otros niveles, usar lógica anterior
  const count = completedGames.filter((key) => key.startsWith(`${level}_`)).length;
  return Math.max(0, Math.min(3, count));
}
