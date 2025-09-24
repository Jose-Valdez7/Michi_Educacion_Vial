import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions, PanResponder, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/utils/colors';
import { ImagesApi } from '../../src/services/images';
import { awardColoringTaskCompletion, maybeAwardColoringSetStar } from '../../src/services/progress2';

const { width, height } = Dimensions.get('window');

type TaskId = 'cat' | 'patrol' | 'semaforo';

const TASK_IMAGES: Record<TaskId, any> = {
  cat: require('../../assets/images/gato-policia-bordes.png'), // ✅ Gato policía con bordes
  patrol: require('../../assets/images/patrulla-bordes.png'),   // ✅ Patrulla con bordes
  semaforo: require('../../assets/images/semaforo-bordes.png'), // ✅ Semáforo con bordes
};

const COLORS = [
  '#FF6B6B', // Rojo
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul
  '#96CEB4', // Verde
  '#FFEAA7', // Amarillo
  '#DDA0DD', // Morado
  '#FF8B94', // Rosa
  '#A8E6CF', // Verde menta
  '#FFB347', // Naranja
  '#000000', // Negro
];

export default function ImagesDraw() {
  const router = useRouter();
  const params = useLocalSearchParams<{ task?: string }>();
  const taskParam = (params.task as TaskId) || 'cat';

  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(8);
  const [title, setTitle] = useState('Mi dibujo');
  const [saving, setSaving] = useState(false);
  const [showTools, setShowTools] = useState(true);
  const [renderKey, setRenderKey] = useState(0); // ✅ Forzar re-renderizado

  const canvasRef = useRef<View>(null);
  const pathsRef = useRef<Array<{ color: string; size: number; points: Array<{ x: number; y: number }> }>>([]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath = {
        color: selectedColor,
        size: brushSize,
        points: [{ x: locationX, y: locationY }]
      };
      pathsRef.current = [...pathsRef.current, newPath];
      setRenderKey(prev => prev + 1); // ✅ Forzar re-renderizado
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const currentPath = pathsRef.current[pathsRef.current.length - 1];
      if (currentPath) {
        currentPath.points.push({ x: locationX, y: locationY });
        setRenderKey(prev => prev + 1); // ✅ Forzar re-renderizado en tiempo real
      }
    },
    onPanResponderRelease: () => {
      // Drawing completed
    },
  });

  const clearCanvas = () => {
    Alert.alert(
      'Limpiar Dibujo',
      '¿Estás seguro de que quieres borrar todo el dibujo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', style: 'destructive', onPress: () => pathsRef.current = [] }
      ]
    );
  };

  const undoLast = () => {
    if (pathsRef.current.length > 0) {
      pathsRef.current = pathsRef.current.slice(0, -1);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const data = {
        title: title.trim() || 'Dibujo',
        taskId: taskParam,
        paths: pathsRef.current,
        colors: COLORS,
        baseImage: taskParam,
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
      Alert.alert('¡Guardado!', 'Tu dibujo se ha guardado y se registró tu progreso.', [
        { text: 'Ir a Galería', onPress: () => router.replace('/images/gallery') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const getTaskInfo = (taskId: TaskId) => {
    const taskMap: Record<TaskId, { title: string; emoji: string }> = {
      cat: { title: 'Gato Policía', emoji: '🐱' },
      patrol: { title: 'Patrulla', emoji: '🚓' },
      semaforo: { title: 'Semáforo', emoji: '🚦' },
    };
    return taskMap[taskId] || taskMap.cat;
  };

  const taskInfo = getTaskInfo(taskParam);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{taskInfo.emoji} {taskInfo.title}</Text>
        <Text style={styles.subtitle}>¡Colorea y diviértete!</Text>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasContainer}>
        <View
          ref={canvasRef}
          style={styles.canvas}
          {...panResponder.panHandlers}
        >
          {/* Base Image */}
          <Image
            source={TASK_IMAGES[taskParam]}
            style={styles.baseImage}
            resizeMode="contain"
          />

          {/* Drawing Paths */}
          {pathsRef.current.map((path, index) => (
            <View key={`${index}-${renderKey}`} style={styles.pathContainer}>
              {path.points.map((point, pointIndex) => (
                <View
                  key={`${pointIndex}-${renderKey}`}
                  style={[
                    styles.pathPoint,
                    {
                      backgroundColor: path.color,
                      width: path.size,
                      height: path.size,
                      left: point.x - path.size / 2,
                      top: point.y - path.size / 2,
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Tools Panel */}
      {showTools && (
        <ScrollView style={styles.toolsContainer} showsVerticalScrollIndicator={false}>
          {/* Color Palette */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 Colores</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorsContainer}>
              {COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Brush Size */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✏️ Tamaño del Pincel</Text>
            <View style={styles.brushSizes}>
              {[4, 8, 12, 16, 20].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.brushSize,
                    { width: size * 2, height: size * 2 },
                    brushSize === size && styles.selectedBrushSize
                  ]}
                  onPress={() => setBrushSize(size)}
                />
              ))}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Título</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Mi dibujo genial"
              placeholderTextColor={colors.gray}
            />
          </View>
        </ScrollView>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.toolButton} onPress={() => setShowTools(!showTools)}>
          <Text style={styles.toolButtonText}>{showTools ? '🔧' : '🎨'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButton} onPress={undoLast}>
          <Text style={styles.toolButtonText}>↶</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButton} onPress={clearCanvas}>
          <Text style={styles.toolButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
        <LinearGradient colors={colors.gradientSuccess} style={styles.saveGradient}>
          <Text style={styles.saveText}>{saving ? 'Guardando...' : '💾 Guardar Dibujo'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: width < 400 ? 24 : 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: width < 400 ? 14 : 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  canvasContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  canvas: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  baseImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  pathContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pathPoint: {
    position: 'absolute',
    borderRadius: 50,
  },
  toolsContainer: {
    maxHeight: height * 0.3,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  colorsContainer: {
    flexDirection: 'row',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: colors.white,
    borderWidth: 3,
  },
  brushSizes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brushSize: {
    backgroundColor: colors.white,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBrushSize: {
    borderColor: colors.accent,
    borderWidth: 3,
  },
  titleInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  toolButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  toolButtonText: {
    fontSize: 20,
    color: colors.white,
  },
  saveBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: width < 400 ? 16 : 18,
  },
});
