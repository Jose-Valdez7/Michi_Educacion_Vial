import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

// ancho a full con padding de contenedor

export default function AlbumScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} style={styles.backBtn}>
        <Image source={require('../assets/images/btn-volver.png')} style={styles.backImg} resizeMode="contain" />
      </TouchableOpacity>
      <View style={styles.cardsRow}>
        <Text style={styles.title}>Álbum</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.card}>
          <ImageBackground source={require('../assets/images/fondo_card.png')} style={styles.cardBg} imageStyle={styles.cardBgImage}>
            <Text style={styles.cardTitle}>Card 1</Text>
            <Text style={styles.cardSub}>Contenido</Text>
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} style={styles.card}>
          <ImageBackground source={require('../assets/images/fondo_card.png')} style={styles.cardBg} imageStyle={styles.cardBgImage}>
            <Text style={styles.cardTitle}>Card 2</Text>
            <Text style={styles.cardSub}>Contenido</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 5, paddingTop: 90 },
  backBtn: { position: 'absolute', top: 8, left: 20, zIndex: 10 },
  backImg: { width: 100, height: 100 },
  cardsRow: { flex: 1, flexDirection: 'column', justifyContent: 'flex-start', gap: 24 },
  title: { fontSize: 26, fontWeight: '900', color: '#000', textAlign: 'center', marginBottom: 0 },
  card: { width: '100%', height: 300, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6, borderWidth: 2, borderColor: '#000' },
  cardBg: { flex: 1, padding: 16, justifyContent: 'flex-end' },
  cardBgImage: { opacity: 0.7 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  cardSub: { marginTop: 6, color: '#222' },
});
