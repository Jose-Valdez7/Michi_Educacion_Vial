import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { colors } from '@/utils/colors';

export default function BicycleScreen() {
  const router = useRouter();
  return (
    <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
      <Text style={styles.title}>🚴 Recorrer en Bicicleta</Text>
      <Text style={styles.subtitle}>Pantalla temporal. Aquí irá el minijuego 1:1.</Text>

      <TouchableOpacity onPress={() => router.replace('/minigames/level1' as Href)} style={styles.back}>
        <Text style={styles.backText}>← Volver a Minijuegos</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.white, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: colors.white, marginTop: 8 },
  back: { marginTop: 20, alignSelf: 'center' },
  backText: { color: colors.white, textDecorationLine: 'underline' },
});
