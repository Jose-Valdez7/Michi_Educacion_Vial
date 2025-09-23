import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/utils/colors';
import { ImagesApi } from '../../src/services/images';
import { awardColoringTaskCompletion, maybeAwardColoringSetStar } from '../../src/services/progress2';

const { width, height } = Dimensions.get('window');

export default function ImagesDraw() {
  const router = useRouter();
  const params = useLocalSearchParams<{ task?: string }>();
  const taskParam = (params.task as 'cat' | 'patrol' | 'semaforo' | undefined) || 'cat';
  // Placeholder: permitimos escribir un título y guardamos un objeto simple como "dibujo"
  const [title, setTitle] = useState('Mi dibujo');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    try {
      setSaving(true);
      const data = {
        title: title.trim() || 'Dibujo',
        notes: notes.trim(),
        // Estructura mínima que puede evolucionar cuando integremos el lienzo real
        shapes: [],
        palette: ['#000000', '#FFFFFF'],
      };
      await ImagesApi.create(data);
      try {
        // Marcar la tarea específica como completada para sumar 1/3 estrellas del nivel 1
        await awardColoringTaskCompletion(taskParam, 8);
        // Si ya están las 3 tareas, añade la clave resumen sin sumar puntos extra
        try { await maybeAwardColoringSetStar(); } catch {}
      } catch (e: any) {
        // No bloquear navegación por error de progreso
        console.warn('awardColoringLevel1Completion failed:', e?.message || e);
      }
      Alert.alert('Guardado', 'Tu dibujo se ha guardado y se registró tu progreso.', [
        { text: 'Ir a Galería', onPress: () => router.replace('/images/gallery') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.container}>
        <Text style={styles.title}>🎨 Nuevo Dibujo</Text>
        <View style={styles.card}>
          <LinearGradient colors={colors.gradientBackground} style={styles.cardInner}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ej: Semáforo feliz"
              placeholderTextColor={colors.gray}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Notas</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Apunta ideas para tu dibujo..."
              placeholderTextColor={colors.gray}
              multiline
            />

            <View style={{ height: 20 }} />
            <Text style={{ color: colors.textPrimary }}>Este es un lienzo de ejemplo. Más adelante integraremos el componente de dibujo real.</Text>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
          <LinearGradient colors={colors.gradientSuccess} style={styles.saveGradient}>
            <Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar dibujo'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
          <LinearGradient colors={colors.gradientSecondary} style={styles.secondaryGradient}>
            <Text style={styles.secondaryText}>Volver</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.primary },
  title: { fontSize: width < 400 ? 22 : 26, fontWeight: 'bold', color: colors.white, textAlign: 'center', marginBottom: 12 },
  card: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  cardInner: { flex: 1, padding: 16 },
  label: { color: colors.textPrimary, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.textPrimary },
  saveBtn: { borderRadius: 16, overflow: 'hidden', marginTop: height < 700 ? 10 : 14 },
  saveGradient: { paddingVertical: 14, alignItems: 'center' },
  saveText: { color: colors.white, fontWeight: 'bold', fontSize: width < 400 ? 16 : 18 },
  secondaryBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  secondaryGradient: { paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: colors.white, fontWeight: '600' },
});
