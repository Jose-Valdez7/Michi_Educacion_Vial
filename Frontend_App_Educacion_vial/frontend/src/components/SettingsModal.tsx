import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/colors';
import { StorageService } from '../services/storageService';

const { width, height } = Dimensions.get('window');

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function SettingsModal({ visible, onClose, onLogout }: SettingsModalProps) {
  // ...existing code...
  // (El resto del componente se mantiene igual, adaptando imports y tipado)
}

// ...existing code...
