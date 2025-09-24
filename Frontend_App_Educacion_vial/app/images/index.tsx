import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { colors } from '@/utils/colors';
import { ProgressApi } from '@/services/progress';
import { maybeAwardColoringSetStar } from '@/services/progress2';

const { width, height } = Dimensions.get('window');

type TaskId = 'cat' | 'patrol' | 'semaforo';

const TASKS: Array<{ id: TaskId; title: string; desc: string; tag: string; difficulty: 'fácil' | 'medio'; emoji: string }> = [
  { id: 'cat', title: 'Gato Policía', desc: 'Colorea al gato policía siguiendo los números', tag: 'personajes', difficulty: 'fácil', emoji: '🐱' },
  { id: 'patrol', title: 'Patrulla', desc: 'Colorea la patrulla policial', tag: 'transporte', difficulty: 'fácil', emoji: '🚓' },
  { id: 'semaforo', title: 'Semáforo', desc: 'Colorea el semáforo y aprende las señales', tag: 'señales', difficulty: 'medio', emoji: '🚦' },
];

export default function ImagesMenu() {
  const router = useRouter();
  const [completed, setCompleted] = useState<Record<TaskId, boolean>>({ cat: false, patrol: false, semaforo: false });

  useEffect(() => {
    (async () => {
      try {
        const p = await ProgressApi.get();
        const set: Record<TaskId, boolean> = { cat: false, patrol: false, semaforo: false };
        const list: string[] = Array.isArray(p.completedGames) ? p.completedGames : [];
        // Usamos claves compatibles con el cómputo de estrellas en welcome: `${level}_...`
        set.cat = list.includes('1_coloring_cat');
        set.patrol = list.includes('1_coloring_patrol');
        set.semaforo = list.includes('1_coloring_semaforo');
        setCompleted(set);
        // Si ya completó las 3, asegura que exista la clave resumen del set
        if (set.cat && set.patrol && set.semaforo) {
          try { await maybeAwardColoringSetStar(); } catch {}
        }
      } catch {}
    })();
  }, []);

  return (
    <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/minigames/level1' as Href)} style={styles.backBtn} activeOpacity={0.85}>
        <LinearGradient colors={colors.gradientSecondary} style={styles.backGradient}>
          <Text style={styles.backText}>← Volver</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.title}>🎨 Colorear Divertidamente</Text>
      <Text style={styles.subtitle}>Elige una imagen para colorear y crear tu obra de arte</Text>

      <View style={styles.mascotWrap}>
        <Image source={require('../../assets/images/pintor.png')} style={styles.painterImage} resizeMode="contain" />
      </View>

      {/* Estrellas de progreso del set (3 tareas) */}
      <StarsRow completed={completed} />

      <Text style={styles.sectionTitle}>🎯 Opciones de Colorear</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {TASKS.map((t) => (
          <TouchableOpacity key={t.id} style={styles.card} onPress={() => router.push(`/images/draw?task=${t.id}` as Href)}>
            <View style={styles.cardLeftEmoji}><Text style={{ fontSize: 36 }}>{t.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t.title}</Text>
              <Text style={styles.cardDesc}>{t.desc}</Text>
              <View style={styles.badgesRow}>
                <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.badgeText}>#{t.tag}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: 'rgba(16,185,129,0.9)' }]}>
                  <Text style={[styles.badgeText, { color: '#fff' }]}>⭐ {t.difficulty}</Text>
                </View>
                {completed[t.id] && (
                  <View style={[styles.badge, { backgroundColor: 'rgba(251,191,36,0.95)' }]}>
                    <Text style={[styles.badgeText, { color: '#000', fontWeight: '700' }]}>Completado</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.galleryBtn} onPress={() => router.push('/images/gallery' as Href)}>
          <LinearGradient colors={colors.gradientSecondary} style={styles.galleryGradient}>
            <Text style={styles.galleryText}>🖼️ Ver Galería</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48 },
  backBtn: { marginBottom: 12, borderRadius: 16, overflow: 'hidden', alignSelf: 'flex-start' },
  backGradient: { paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: colors.white, fontWeight: '700' },
  title: { fontSize: width < 400 ? 24 : 28, fontWeight: 'bold', color: colors.white, textAlign: 'left' },
  subtitle: { fontSize: width < 400 ? 14 : 16, color: colors.white, opacity: 0.9, marginTop: 4 },
  mascotWrap: { alignItems: 'center', marginVertical: 12 },
  painterImage: { width: width < 450 ? 200 : 260, height: width < 450 ? 180 : 220 },
  sectionTitle: { color: colors.white, fontWeight: '800', marginBottom: 8, marginTop: 8 },
  card: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 12, alignItems: 'center', marginBottom: 10 },
  cardLeftEmoji: { width: 56, height: 56, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardTitle: { color: colors.white, fontWeight: '700', fontSize: 16 },
  cardDesc: { color: colors.white, opacity: 0.95, marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: colors.white, fontWeight: '600' },
  galleryBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  galleryGradient: { paddingVertical: 12, alignItems: 'center' },
  galleryText: { color: colors.white, fontWeight: '700' },
});

// Componente de estrellas para 3 tareas
function StarsRow({ completed }: { completed: Record<'cat' | 'patrol' | 'semaforo', boolean> }) {
  const count = (completed.cat ? 1 : 0) + (completed.patrol ? 1 : 0) + (completed.semaforo ? 1 : 0);
  return (
    <View style={{ flexDirection: 'row', alignSelf: 'center', gap: 6, marginVertical: 6 }}>
      {[1, 2, 3].map((i) => (
        <Text key={i} style={{ fontSize: 20 }}>{i <= count ? '⭐' : '☆'}</Text>
      ))}
    </View>
  );
}

