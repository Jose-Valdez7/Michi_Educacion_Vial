import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions, PanResponder, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/utils/colors';
import { ImagesApi } from '../../src/services/images';
import { awardColoringTaskCompletion, maybeAwardColoringSetStar } from '../../src/services/progress2';
import { ProgressApi } from '../../src/services/progress';

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
  const [renderKey, setRenderKey] = useState(0); // ✅ Forzar re-renderizado
  const [isDrawing, setIsDrawing] = useState(false); // ✅ Evitar dibujo automático
  const [completedTasks, setCompletedTasks] = useState<Record<TaskId, boolean>>({ cat: false, patrol: false, semaforo: false }); // ✅ Estado de tareas completadas

  const canvasRef = useRef<View>(null);
  const pathsRef = useRef<Array<{ color: string; size: number; points: Array<{ x: number; y: number }> }>>([]);

  // ✅ Cargar estado de tareas completadas al iniciar
  useEffect(() => {
    (async () => {
      try {
        const p = await ProgressApi.get();
        const set: Record<TaskId, boolean> = { cat: false, patrol: false, semaforo: false };
        const list: string[] = Array.isArray(p.completedGames) ? p.completedGames : [];
        set.cat = list.includes('1_coloring_cat');
        set.patrol = list.includes('1_coloring_patrol');
        set.semaforo = list.includes('1_coloring_semaforo');
        setCompletedTasks(set);
      } catch (e) {
        // Error loading completed tasks
      }
    })();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (isDrawing) return; // ✅ Evitar múltiples trazos simultáneos

      setIsDrawing(true); // ✅ Marcar que estamos dibujando
      const { locationX, locationY } = evt.nativeEvent;

      // ✅ Solo crear trazo si las coordenadas están dentro del canvas
      if (locationX >= 0 && locationY >= 0 && locationX <= width && locationY <= height) {
        const newPath = {
          color: selectedColor,
          size: brushSize,
          points: [{ x: locationX, y: locationY }]
        };
        pathsRef.current = [...pathsRef.current, newPath];
        setRenderKey(prev => prev + 1); // ✅ Forzar re-renderizado
      }
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing) return; // ✅ Solo permitir movimiento si estamos dibujando

      const { locationX, locationY } = evt.nativeEvent;
      const currentPath = pathsRef.current[pathsRef.current.length - 1];
      if (currentPath) {
        currentPath.points.push({ x: locationX, y: locationY });
        setRenderKey(prev => prev + 1); // ✅ Forzar re-renderizado en tiempo real
      }
    },
    onPanResponderRelease: () => {
      setIsDrawing(false); // ✅ Terminar dibujo
    },
    onPanResponderTerminate: () => {
      setIsDrawing(false); // ✅ Terminar dibujo si se interrumpe
    },
  });

  const clearCanvas = () => {
    pathsRef.current = []; // ✅ Limpiar automáticamente sin confirmación
    setRenderKey(prev => prev + 1); // ✅ Forzar re-renderizado
  };

  const undoLast = () => {
    if (pathsRef.current.length > 0) {
      const lastPath = pathsRef.current[pathsRef.current.length - 1];

      // ✅ Si el último trazo tiene el color seleccionado, eliminar el último punto
      if (lastPath.color === selectedColor && lastPath.points.length > 0) {
        lastPath.points.pop();
        setRenderKey(prev => prev + 1); // ✅ Actualizar en tiempo real

        // ✅ Si no quedan puntos en el último trazo, eliminar el trazo completo
        if (lastPath.points.length === 0) {
          pathsRef.current = pathsRef.current.slice(0, -1);
        }
      } else {
        // ✅ Si no es del color seleccionado, eliminar el último trazo completo
        pathsRef.current = pathsRef.current.slice(0, -1);
      }
      setRenderKey(prev => prev + 1); // ✅ Forzar re-renderizado
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);

      if (!pathsRef.current || pathsRef.current.length === 0) {
        Alert.alert('Error', 'No hay dibujo para guardar. Dibuja algo primero.');
        return;
      }

      const data = {
        title: title.trim() || 'Dibujo',
        taskId: taskParam,
        paths: pathsRef.current,
        colors: COLORS,
        baseImage: taskParam,
      };


      try {
        const result = await ImagesApi.create(data);
        

        // ✅ Marcar progreso después de guardar exitosamente
        await awardColoringTaskCompletion(taskParam, 8);
        setCompletedTasks(prev => ({ ...prev, [taskParam]: true }));
        await maybeAwardColoringSetStar();

        Alert.alert('¡Guardado!', 'Tu dibujo se ha guardado y se registró tu progreso.', [
          { text: 'Ir a Galería', onPress: () => router.push('/images/gallery') },
        ]);
      } catch (serverError: any) {
        // Error al guardar el dibujo

        // Show user-friendly error message
        let errorMessage = 'Error interno del servidor';
        if (serverError?.message?.includes('fetch')) {
          errorMessage = 'No se puede conectar al servidor. Verifica que esté ejecutándose.';
        } else if (serverError?.message?.includes('401')) {
          errorMessage = 'Error de autenticación. Intenta reiniciar la aplicación.';
        } else if (serverError?.message?.includes('500')) {
          errorMessage = 'Error interno del servidor. Contacta al administrador.';
        } else if (serverError?.message) {
          errorMessage = serverError.message;
        }

        Alert.alert('Error al Guardar', errorMessage);
      }
    } catch (e: any) {
      
      Alert.alert('Error', `Error inesperado: ${e?.message || 'Error desconocido'}`);
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{taskInfo.emoji} {taskInfo.title}</Text>
        <Text style={styles.subtitle}>¡Colorea y diviértete!</Text>
        {/* Sistema de estrellas */}
        <View style={styles.starsContainer}>
          <StarsRow completed={completedTasks} />
        </View>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasContainer}>
        <View
          ref={canvasRef}
          style={styles.canvas}
          {...panResponder.panHandlers}
        >
          {/* Base Image - ENCIMA de los trazos para que los bordes no se borren */}
          <Image
            source={TASK_IMAGES[taskParam]}
            style={styles.baseImage}
            resizeMode="contain"
          />

          {/* Drawing Paths - DEBAJO de la imagen base */}
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

      {/* Tools Panel - SIEMPRE VISIBLE */}
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

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
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

// ✅ Componente de estrellas para mostrar progreso
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  starsContainer: {
    marginTop: 8,
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
    zIndex: 10, // ✅ Imagen base ENCIMA de los trazos
  },
  pathContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // ✅ Trazos DEBAJO de la imagen base
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
