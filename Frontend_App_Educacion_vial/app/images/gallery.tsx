import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '../../src/utils/colors';
import { ImagesApi, type ColoredImage } from '../../src/services/images';

const { width, height } = Dimensions.get('window');

export default function ImagesGallery() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ColoredImage[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📱 Cargando galería...');
      const data = await ImagesApi.list();
      console.log('📱 Galería cargada:', {
        itemsCount: data.length,
        items: data.map(item => ({
          id: item.id,
          title: item.data?.title,
          taskId: item.data?.taskId,
          dateCreated: item.dateCreated
        }))
      });
      setItems(data);
    } catch (e: any) {
      console.error('❌ Error cargando galería:', e);
      Alert.alert('Error', e?.message || 'No se pudo cargar la galería');
    } finally {
      setLoading(false);
    }
  }, []);

  // Use useFocusEffect to reload when screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Galería enfocada - recargando...');
      load();
    }, [load])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await ImagesApi.list();
      setItems(data);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo refrescar');
    } finally {
      setRefreshing(false);
    }
  };

  const onDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Deseas eliminar este dibujo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await ImagesApi.remove(id);
            setItems((prev) => prev.filter((x) => x.id !== id));
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'No se pudo eliminar');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.white} />
        <Text style={{ color: colors.white, marginTop: 8 }}>Cargando galería...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖼️ Tu Galería</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <LinearGradient colors={colors.gradientBackground} style={styles.cardInner}>
              <Text numberOfLines={2} style={styles.cardTitle}>{item.data?.title || 'Dibujo'}</Text>
              <Text style={styles.cardDate}>{new Date(item.dateCreated).toLocaleDateString()}</Text>

              {/* Display the drawing as a small preview */}
              {item.data?.paths && item.data.paths.length > 0 && (
                <View style={styles.drawingPreview}>
                  <View style={styles.drawingContainer}>
                    {item.data.paths.slice(0, 3).map((path: any, pathIndex: number) => (
                      <View key={pathIndex} style={styles.pathContainer}>
                        {path.points?.slice(0, 5).map((point: any, pointIndex: number) => (
                          <View
                            key={pointIndex}
                            style={[
                              styles.pathPoint,
                              {
                                backgroundColor: path.color || '#000',
                                width: 3,
                                height: 3,
                                left: point.x * 0.1,
                                top: point.y * 0.1,
                              }
                            ]}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.cardButtons}>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.buttonWarning }]} onPress={() => onDelete(item.id)}>
                  <Text style={styles.smallBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tienes dibujos aún.</Text>
            <TouchableOpacity style={styles.cta} onPress={() => router.push('/images/draw')}>
              <LinearGradient colors={colors.gradientPrimary} style={styles.ctaGradient}>
                <Text style={styles.ctaText}>Crear uno ahora</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const CARD_SIZE = (width - 20 - 10) / 2; // padding 20, gap 10

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: colors.primary },
  title: { fontSize: width < 400 ? 22 : 26, fontWeight: 'bold', color: colors.white, marginBottom: 12, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  card: { width: CARD_SIZE, height: CARD_SIZE + 20, borderRadius: 16, overflow: 'hidden', marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.15)' },
  cardInner: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { color: colors.textPrimary, fontWeight: '700' },
  cardDate: { color: colors.gray, fontSize: 12 },
  drawingPreview: { flex: 1, marginVertical: 8 },
  drawingContainer: { width: '100%', height: 60, backgroundColor: 'white', borderRadius: 8, position: 'relative' },
  pathContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  pathPoint: { position: 'absolute', borderRadius: 50 },
  cardButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
  smallBtnText: { color: colors.white, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: colors.white, marginBottom: 12 },
  cta: { borderRadius: 16, overflow: 'hidden' },
  ctaGradient: { paddingVertical: 10, paddingHorizontal: 14 },
  ctaText: { color: colors.white, fontWeight: 'bold' },
});
