import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated, Dimensions, Image, SafeAreaView, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href, useFocusEffect } from 'expo-router';
import { AuthService } from '@/services/auth';
import { colors } from '@/utils/colors';
import { animations } from '@/utils/animations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const bgBase = useRef(new Animated.Value(0)).current;
  const bgProgress = Animated.modulo(bgBase, 1);

  useEffect(() => {
    Animated.parallel([
      animations.fadeIn(fadeAnim, 800),
      animations.scale(scaleAnim, 1, 600),
      animations.pulse(bounceAnim, 2000),
    ]).start();
  }, []);

  useEffect(() => {
    const duration = 12000;
    bgBase.setValue(0);
    const loop = Animated.loop(
      Animated.timing(bgBase, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );
    loop.start();
    return () => {
      bgBase.stopAnimation();
      loop.stop();
    };
  }, [bgBase]);

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
        <View style={styles.bgContainer} pointerEvents="none">
          <Animated.Image
            source={require('../../assets/images/fondo_login.png')}
            style={[styles.bgImage, { transform: [{ translateY: Animated.add(Animated.multiply(bgProgress, height), -height) }] }]}
            resizeMode="cover"
          />
          <Animated.Image
            source={require('../../assets/images/fondo_login.png')}
            style={[styles.bgImage, { transform: [{ translateY: Animated.multiply(bgProgress, height) }] }]}
            resizeMode="cover"
          />
          <Animated.Image
            source={require('../../assets/images/fondo_login.png')}
            style={[styles.bgImage, { transform: [{ translateY: Animated.add(Animated.multiply(bgProgress, height), height) }] }]}
            resizeMode="cover"
          />
         </View>
         {/* Barra de estado superior eliminada */}

         <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
           {/* Logo */}
           <Animated.View style={[styles.logoContainer, { transform: [{ scale: bounceAnim }] }]}>
             <Image source={require('../../assets/images/logoPrincipal.png')} style={styles.logoImage} resizeMode="contain" />
           </Animated.View>

           {/* Tarjeta contenedora */}
           <View style={styles.card}>
             <Text style={styles.cardTitle}>INICIAR SESION</Text>

             <View style={styles.form}>
               {/* Username */}
               <View style={styles.fieldBlock}>
                 <Text style={styles.fieldLabel}>Username</Text>
                 <View style={styles.fieldRow}>
                  <Ionicons name="person-outline" size={20} color="#FFFFFF" style={styles.fieldIcon} />
                   <TextInput
                     style={styles.fieldInput}
                     value={userName}
                     onChangeText={setUserName}
                     placeholder="example16"
                     placeholderTextColor="#ffffffcc"
                     autoCapitalize="none"
                   />
                 </View>
                 <View style={styles.underline} />
               </View>

               {/* Password */}
               <View style={styles.fieldBlock}>
                 <Text style={styles.fieldLabel}>Password</Text>
                 <View style={styles.fieldRow}>
                  <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" style={styles.fieldIcon} />
                   <TextInput
                     style={styles.fieldInput}
                     value={cedula}
                     onChangeText={setCedula}
                     placeholder="••••••••"
                     placeholderTextColor="#ffffffcc"
                     secureTextEntry={!showPassword}
                     keyboardType="number-pad"
                   />
                   <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                     <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#FFFFFF" />
                   </TouchableOpacity>
                 </View>
                 <View style={styles.underline} />
                 <TouchableOpacity onPress={() => Alert.alert('Recuperación', 'Funcionalidad en construcción')} style={styles.forgotWrapper}>
                   <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                 </TouchableOpacity>
               </View>

               {/* Botón LOGIN */}
               <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={onLogin} disabled={loading}>
                 {loading ? (
                   <ActivityIndicator color="#fff" />
                 ) : (
                   <Text style={styles.primaryButtonText}>INGRESAR</Text>
                 )}
               </TouchableOpacity>

               {/* Sign up link */}
               <TouchableOpacity onPress={onRegister} style={styles.signupWrapper}>
                 <Text style={styles.signupText}>¿No tienes cuenta? <Text style={styles.signupEmphasis}>Regístrate</Text></Text>
               </TouchableOpacity>
             </View>
           </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, backgroundColor: colors.loginBackground },
  bgContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', backgroundColor: colors.loginBackground },
  bgImage: { position: 'absolute', width: '100%', height: height + 2 },
  content: { width: width * 0.95, maxWidth: 420, alignItems: 'center' },
  statusBar: { position: 'absolute', top: 10, left: 16, right: 16, height: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusTime: { color: '#F3F4F6', fontSize: 12, fontWeight: '600' },
  statusIcons: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  statusDot: { height: 10, width: 12, borderRadius: 3, backgroundColor: '#E5E7EB' },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: height < 700 ? 5 : 8 },
  logoImage: { width: width < 400 ? 280 : 320, height: width < 400 ? 200 : 240 },
  header: { alignItems: 'center', marginBottom: height < 700 ? 8 : 12 },
  title: { fontSize: width < 400 ? 26 : 32, fontWeight: 'bold', color: colors.white, textAlign: 'center', marginBottom: 8, textShadowColor: colors.shadowDark as any, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4, lineHeight: width < 400 ? 32 : 38 },
  subtitle: { fontSize: width < 400 ? 16 : 18, color: colors.white, textAlign: 'center', fontWeight: '600' },
  card: { alignSelf: 'stretch', maxWidth: 420, backgroundColor: 'rgba(128, 128, 128, 0.9)', borderRadius: 18, paddingVertical: 20, paddingHorizontal: 26, marginHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8, marginTop: height * 0.02, marginBottom: height * 0.1 },
  cardTitle: { textAlign: 'center', color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  form: { width: '100%', marginTop: 6 },
  fieldBlock: { marginTop: 8, marginBottom: 10 },
  fieldLabel: { color: '#FFFFFF', fontSize: 14, marginBottom: 6, fontWeight: '600' },
  fieldRow: { flexDirection: 'row', alignItems: 'center' },
  fieldIcon: { marginRight: 8 },
  fieldInput: { flex: 1, fontSize: 16, color: '#FFFFFF', paddingVertical: 8 },
  underline: { height: 1, backgroundColor: '#E5E7EB' },
  forgotWrapper: { marginTop: 8, alignSelf: 'flex-end' },
  forgotText: { color: '#FFFFFF', fontSize: 12, textDecorationLine: 'underline' },
  primaryButton: { marginTop: 14, backgroundColor: '#32CD32', borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, shadowColor: '#32CD32', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  signupWrapper: { marginTop: 12, alignItems: 'center' },
  signupText: { color: '#FFFFFF', fontSize: 12 },
  signupEmphasis: { textDecorationLine: 'underline', fontWeight: '700' },
});
