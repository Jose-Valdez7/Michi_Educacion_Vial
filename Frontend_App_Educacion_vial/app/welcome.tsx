import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/utils/colors';
import { ProgressApi } from '@/services/progress';
import { AuthService } from '@/services/auth';
import { useRouter, type Href } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
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
      <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
        {/* Header con botón de ajustes */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.welcomeRow}>
              <Text style={styles.welcomeText}>¡Bienvenido, {userName}!</Text>
              <Image source={require('../assets/images/gatoLogo.png')} style={styles.welcomeCatImage} resizeMode="contain" />
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettingsModal(true)}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={styles.statText}>{progress.coins ?? 0}</Text>
            </View>
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
          {([1,2,3,4,5] as const).map((lvl) => {
            const isUnlocked = progress.unlockedLevels?.includes(lvl) ?? (lvl === 1);
            const isLocked = !isUnlocked;

            // ✅ Verificar si el nivel 2 debe desbloquearse (3 estrellas en nivel 1)
            const level1Stars = completedStars(progress.completedGames, 1);
            const shouldUnlockLevel2 = lvl === 2 && level1Stars === 3 && !isUnlocked;

            return (
              <View key={lvl} style={[styles.islandCard, isLocked && styles.lockedIslandCard]}>
                <LinearGradient colors={isLocked ? ['#666666', '#888888'] : colors.gradientSecondary} style={styles.islandGradient}>
                  <View style={styles.islandHeaderArea}>
                    <Image
                      source={require('../assets/images/isla12.png')}
                      style={[styles.islandImage, isLocked && styles.lockedIslandImage]}
                      resizeMode="contain"
                    />
                    <Text style={[styles.islandTitle, isLocked && styles.lockedIslandTitle]}>Nivel {lvl}</Text>

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

                    <View style={styles.starsBackground}>
                      <View style={styles.starsContainer}>
                        {[1,2,3].map((n) => (
                          <Text key={n} style={styles.starText}>
                            {completedStars(progress.completedGames, lvl) >= n ? '⭐' : '☆'}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.islandButton, isLocked && styles.lockedIslandButton]}
                    onPress={() => {
                      if (isUnlocked || shouldUnlockLevel2) {
                        router.push('/minigames/level1' as Href);
                      }
                    }}
                    disabled={isLocked && !shouldUnlockLevel2}
                  >
                    <LinearGradient
                      colors={isLocked && !shouldUnlockLevel2 ? ['#999999', '#bbbbbb'] : (lvl === 1 ? colors.gradientPrimary : colors.gradientSecondary)}
                      style={styles.islandButtonGradient}
                    >
                      <Text style={[styles.islandButtonText, isLocked && styles.lockedIslandButtonText]}>
                        {isLocked && !shouldUnlockLevel2 ? '🔒 Bloqueado' : '🎮 Jugar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.footerBtn} onPress={() => router.push('/album' as Href)}>
            <LinearGradient colors={colors.gradientSecondary} style={styles.footerBtnGradient}>
              <Text style={styles.footerBtnText}>📚 Álbum</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerBtn} onPress={() => router.push('/achievements' as Href)}>
            <LinearGradient colors={colors.gradientSuccess} style={styles.footerBtnGradient}>
              <Text style={styles.footerBtnText}>🏆 Logros</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16 },
  header: { marginBottom: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 },
  welcomeText: { fontSize: width < 400 ? 22 : 28, fontWeight: 'bold', color: colors.white, marginRight: 8, textShadowColor: colors.shadowDark as any, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  welcomeCatImage: { width: width < 400 ? 35 : 40, height: width < 400 ? 35 : 40 },
  settingsButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 10, borderRadius: 20, minWidth: 40, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statIcon: { fontSize: 18, marginRight: 6 },
  statText: { fontSize: 16, fontWeight: 'bold', color: colors.white },
  licenseBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 16, marginTop: 16, width: '85%', alignSelf: 'center' },
  licenseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  licenseTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  licenseSubtitle: { fontSize: 16, color: colors.white, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  progressBarBg: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.accent },
  islandsContainer: { paddingHorizontal: 10 },
  islandCard: { width: width * 0.8, height: height * 0.5, marginRight: 16, borderRadius: 30, overflow: 'hidden', shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  islandGradient: { flex: 1, padding: 20 },
  islandHeaderArea: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  islandImage: { width: width * 0.55, height: width * 0.55, marginBottom: 15 },
  islandTitle: { fontSize: width < 400 ? 28 : 32, fontWeight: 'bold', color: colors.white, textAlign: 'center', textShadowColor: colors.shadowDark as any, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4, marginBottom: 10 },
  starsBackground: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  starText: { fontSize: 20, marginHorizontal: 3 },
  islandButton: { borderRadius: 16, marginTop: 10 },
  islandButtonGradient: { paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  islandButtonText: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  lockedIslandCard: { opacity: 0.7 },
  lockedIslandImage: { opacity: 0.6 },
  lockedIslandTitle: { color: '#cccccc' },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', borderRadius: 30 },
  lockIcon: { fontSize: 40, color: '#fff', marginBottom: 10 },
  lockMessage: { fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 5 },
  lockRequirement: { fontSize: 14, color: '#ddd', textAlign: 'center', paddingHorizontal: 10 },
  lockedIslandButton: { opacity: 0.6 },
  lockedIslandButtonText: { color: '#999999' },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  footerBtn: { flex: 1, marginHorizontal: 4, borderRadius: 16, overflow: 'hidden' },
  footerBtnGradient: { paddingVertical: 12, alignItems: 'center' },
  footerBtnText: { color: colors.white, fontWeight: 'bold' },
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
