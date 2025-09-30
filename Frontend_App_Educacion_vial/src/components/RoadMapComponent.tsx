import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { animations } from '../utils/animations';

const { width, height } = Dimensions.get('window');

interface RoadMapComponentProps {
  navigation: any;
  route: any;
}

export default function RoadMapComponent({ navigation, route }: RoadMapComponentProps) {
  // Componente funcional básico
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Mapa de Ruta Educativo</Text>
          <Text style={styles.subtitle}>Componente de mapa de ruta funcionando</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
});
