import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../src/utils/colors';
import { AlbumApi } from '../src/services/album';
import { useRouter, type Href } from 'expo-router';

export default function AlbumScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState<{ characters: any[]; vehicles: any[] }>({ characters: [], vehicles: [] });

  const load = async () => {
    setLoading(true);
    const a = await AlbumApi.get();
    setAlbum(a || { characters: [], vehicles: [] });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addCharacter = async () => {
    const next = { ...album };
    next.characters = [...(next.characters || []), { id: Date.now().toString(), name: 'Nuevo', type: 'character' }];
    await AlbumApi.update({ characters: next.characters });
    setAlbum(next);
  };

  const addVehicle = async () => {
    const next = { ...album };
    next.vehicles = [...(next.vehicles || []), { id: Date.now().toString(), name: 'Vehículo', type: 'vehicle' }];
    await AlbumApi.update({ vehicles: next.vehicles });
    setAlbum(next);
  };

  const removeCharacter = async (id: string) => {
    const next = { ...album };
    next.characters = (next.characters || []).filter((c) => c.id !== id);
    await AlbumApi.update({ characters: next.characters });
    setAlbum(next);
  };

  const removeVehicle = async (id: string) => {
    const next = { ...album };
    next.vehicles = (next.vehicles || []).filter((v) => v.id !== id);
    await AlbumApi.update({ vehicles: next.vehicles });
    setAlbum(next);
  };

  return (
    <LinearGradient colors={colors.gradientPrimary} style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/welcome' as Href)} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Álbum</Text>
      {loading ? (
        <Text style={{ color: colors.white }}>Cargando...</Text>
      ) : (
        <View style={{ gap: 16, flex: 1 }}>
          <SectionHeader title={`Personajes (${album.characters?.length || 0})`} onAdd={addCharacter} />
          <ItemsGrid
            items={album.characters || []}
            onRemove={removeCharacter}
          />

          <SectionHeader title={`Vehículos (${album.vehicles?.length || 0})`} onAdd={addVehicle} />
          <ItemsGrid
            items={album.vehicles || []}
            onRemove={removeVehicle}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onAdd} style={s.addBtn}>
        <LinearGradient colors={colors.gradientSecondary} style={s.addBtnGrad}>
          <Text style={s.addBtnText}>Añadir</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function ItemsGrid({ items, onRemove }: { items: any[]; onRemove: (id: string) => void }) {
  const CARD_SIZE = (width - 20 - 10) / 2; // padding 20, gap 10
  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={{ paddingBottom: 8 }}
      ListEmptyComponent={<Text style={{ color: colors.white, opacity: 0.9 }}>Vacío por ahora.</Text>}
      renderItem={({ item }) => (
        <View style={[s.card, { width: CARD_SIZE, height: CARD_SIZE }]}> 
          <LinearGradient colors={colors.gradientBackground} style={s.cardInner}>
            <View>
              <Text style={s.cardTitle}>{item.name || 'Elemento'}</Text>
              <Text style={s.cardSub}>{item.type || '—'}</Text>
            </View>
            <TouchableOpacity onPress={() =>
              Alert.alert('Eliminar', '¿Eliminar este elemento?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => onRemove(item.id) },
              ])
            } style={s.removeBtn}>
              <Text style={s.removeText}>Eliminar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48 },
  back: { marginBottom: 12 },
  backText: { color: colors.white, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: colors.white },
});

const s = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.white, fontWeight: '700', fontSize: 16 },
  addBtn: { borderRadius: 12, overflow: 'hidden' },
  addBtnGrad: { paddingHorizontal: 12, paddingVertical: 8 },
  addBtnText: { color: colors.white, fontWeight: '700' },
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 10 },
  cardInner: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { color: colors.textPrimary, fontWeight: '700' },
  cardSub: { color: colors.gray, marginTop: 2 },
  removeBtn: { alignSelf: 'flex-end', backgroundColor: colors.buttonWarning, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  removeText: { color: colors.white, fontWeight: '700' },
});
