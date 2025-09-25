import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/colors';
import { animations } from '../utils/animations';

const { width, height } = Dimensions.get('window');

interface RoadMapComponentProps {
  navigation: any;
  route: any;
}

export default function RoadMapComponent({ navigation, route }: RoadMapComponentProps) {
  // ...existing code...
  // (El resto del componente se mantiene igual, adaptando imports y tipado)
}

// ...existing code...
