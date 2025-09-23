import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated, Dimensions, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href, useFocusEffect } from 'expo-router';
import { AuthService } from '../../src/services/auth';
import { colors } from '../../src/utils/colors';
import { animations } from '../../src/utils/animations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      animations.fadeIn(fadeAnim, 800),
      animations.scale(scaleAnim, 1, 600),
      animations.pulse(bounceAnim, 2000),
    ]).start();
  }, []);

  const onLogin = async () => {
    if (!userName || !cedula) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    try {
      setLoading(true);
      await AuthService.login(userName.trim(), cedula.trim());
      router.replace('/welcome' as Href);
    } catch (e: any) {
      Alert.alert('Login fallido', e?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = () => {
    router.push('/(auth)/register' as Href);
  };

  const onClearData = async () => {
    try {
      // Cierra sesión (borra access/refresh/child_id en AsyncStorage y notifica al backend)
      await AuthService.logout();
      // Borra datos auxiliares de registro (prefill)
      await AsyncStorage.multiRemove(['last_register_username', 'last_register_cedula']);
      Alert.alert('Listo', 'Se limpiaron las credenciales guardadas.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudieron limpiar los datos');
    }
  };

  const onFillCreds = () => {
    setUserName('eli2017');
    setCedula('1755646732');
  };

  // Prefill si vienen del registro
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const [u, c] = await Promise.all([
          AsyncStorage.getItem('last_register_username'),
          AsyncStorage.getItem('last_register_cedula'),
        ]);
        if (u && c) {
          setUserName(u);
          setCedula(c);
        }
      })();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: bounceAnim }] }]}>
            <Image source={require('../../assets/images/logoPrincipal.png')} style={styles.logoImage} resizeMode="contain" />
          </Animated.View>

          <View style={styles.header}>
            <Text style={styles.title}>Educación Vial</Text>
            <Text style={styles.subtitle}>¡Aprende jugando!</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>👤 Usuario</Text>
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="Ingresa tu usuario"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Contraseña</Text>
              <TextInput
                style={styles.input}
                value={cedula}
                onChangeText={setCedula}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={onLogin} activeOpacity={0.8} disabled={loading}>
              <LinearGradient colors={colors.gradientPrimary} style={styles.buttonGradient}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>🎮 Ingresar al Juego</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={onRegister} activeOpacity={0.8}>
              <LinearGradient colors={colors.gradientSecondary} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>📝 Registrarse</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={onClearData} activeOpacity={0.8}>
              <LinearGradient colors={colors.gradientAccent} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>🗑️ Limpiar Datos</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tempButton} onPress={onFillCreds} activeOpacity={0.8}>
              <LinearGradient colors={colors.gradientWarning} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>⚡Llenar Credenciales (Temporal)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, backgroundColor: colors.primary },
  content: { width: width * 0.95, maxWidth: 400, alignItems: 'center' },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: height < 700 ? 20 : 30 },
  logoImage: { width: width < 400 ? 200 : 250, height: width < 400 ? 140 : 180 },
  header: { alignItems: 'center', marginBottom: height < 700 ? 25 : 40 },
  title: { fontSize: width < 400 ? 26 : 32, fontWeight: 'bold', color: colors.white, textAlign: 'center', marginBottom: 8, textShadowColor: colors.shadowDark as any, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4, lineHeight: width < 400 ? 32 : 38 },
  subtitle: { fontSize: width < 400 ? 16 : 18, color: colors.white, textAlign: 'center', fontWeight: '600' },
  form: { width: '100%' },
  inputContainer: { marginBottom: height < 700 ? 15 : 20 },
  inputLabel: { fontSize: width < 400 ? 14 : 16, color: colors.white, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: colors.white, borderRadius: width < 400 ? 20 : 25, paddingHorizontal: width < 400 ? 15 : 20, paddingVertical: width < 400 ? 12 : 15, fontSize: width < 400 ? 14 : 16, color: colors.textPrimary, shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, minHeight: width < 400 ? 45 : 50 },
  loginButton: { marginTop: height < 700 ? 15 : 20, marginBottom: height < 700 ? 10 : 15, borderRadius: width < 400 ? 20 : 25, shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  registerButton: { marginBottom: height < 700 ? 10 : 15, borderRadius: width < 400 ? 20 : 25, shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  clearButton: { marginBottom: height < 700 ? 10 : 15, borderRadius: width < 400 ? 20 : 25, shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  tempButton: { marginBottom: height < 700 ? 40 : 50, borderRadius: width < 400 ? 20 : 25, shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  buttonGradient: { paddingVertical: width < 400 ? 15 : 18, paddingHorizontal: width < 400 ? 25 : 30, borderRadius: width < 400 ? 20 : 25, alignItems: 'center', minHeight: width < 400 ? 50 : 55, justifyContent: 'center' },
  buttonText: { color: colors.white, fontSize: width < 400 ? 16 : 18, fontWeight: 'bold', textAlign: 'center' },
});
