import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Dimensions, SafeAreaView, Animated, Image, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { colors } from '../../src/utils/colors';
import { AuthService } from '../../src/services/auth';

const { width, height } = Dimensions.get('window');

const SexOptions = ['MALE', 'FEMALE'] as const;
const SexLabels: Record<typeof SexOptions[number], string> = {
  MALE: '♂️ Hombre',
  FEMALE: '♀️ Mujer',
};

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [cedula, setCedula] = useState('');
  const [birthdate, setBirthdate] = useState(''); // YYYY-MM-DD
  const [sex, setSex] = useState<typeof SexOptions[number]>('MALE');
  const [submitting, setSubmitting] = useState(false);
  const [usernameDirty, setUsernameDirty] = useState(false);

  // Animación fondo
  const bgBase = useRef(new Animated.Value(0)).current;
  const bgProgress = Animated.modulo(bgBase, 1);
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

  const slugFromName = useMemo(() => {
    const s = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 20);
    return s;
  }, [name]);

  const onChangeName = (v: string) => {
    setName(v);
    if (!usernameDirty) {
      const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthdate)?.[3] ?? '';
      setUsername(((slugFromName || '').trim() + day).slice(0, 22));
    }
  };

  const onChangeBirthdate = (v: string) => {
    setBirthdate(v);
    if (!usernameDirty) {
      const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)?.[3] ?? '';
      setUsername(((slugFromName || '').trim() + day).slice(0, 22));
    }
  };

  const validate = (): string | null => {
    if (!name || !username || !cedula || !birthdate || !sex) return 'Completa todos los campos.';
    if (cedula.length !== 10) return 'La cédula debe tener 10 dígitos.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) return 'La fecha debe estar en formato YYYY-MM-DD';
    return null;
  };

  const onSubmit = async () => {
    const error = validate();
    if (error) return Alert.alert('Validación', error);
    try {
      setSubmitting(true);
      await AuthService.register({ name, username, cedula, birthdate, sex, role: 'CHILD' });
      Alert.alert('Registro exitoso', 'Ahora puedes iniciar sesión', [
        { text: 'Ir al login', onPress: () => router.replace('/(auth)/login' as Href) },
      ]);
    } catch (e: any) {
      Alert.alert('Error de registro', e?.message || 'No se pudo registrar');
    } finally {
      setSubmitting(false);
    }
  };

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
        
        {/* Tarjeta contenedora */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CREAR CUENTA</Text>

          <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput style={styles.input} value={name} onChangeText={onChangeName} placeholder="Juan Pérez" placeholderTextColor={colors.gray} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}> Cédula (10 dígitos)</Text>
            <TextInput style={styles.input} value={cedula} onChangeText={setCedula} placeholder="1234567890" keyboardType="number-pad" maxLength={10} placeholderTextColor={colors.gray} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}> Nacimiento (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={birthdate} onChangeText={onChangeBirthdate} placeholder="2015-05-01" keyboardType="number-pad" autoCapitalize="none" placeholderTextColor={colors.gray} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Usuario</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(v) => { setUsername(v); setUsernameDirty(true); }}
              placeholder="juanperez08"
              autoCapitalize="none"
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Género</Text>
            <View style={styles.sexRow}>
              {SexOptions.map((opt) => (
                <TouchableOpacity key={opt} style={[styles.sexPill, sex === opt && styles.sexPillActive]} onPress={() => setSex(opt)}>
                  <Text style={[styles.sexText, sex === opt && styles.sexTextActive]}>{SexLabels[opt]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={onSubmit} style={styles.submitBtn} disabled={submitting}>
            <LinearGradient colors={colors.gradientPrimaryLight} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>{submitting ? 'Registrando...' : 'Crear cuenta'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login' as Href)} style={{ marginTop: 12, alignSelf: 'center' }}>
            <Text style={{ color: '#000000', textDecorationLine: 'underline' }}>Ya tengo cuenta</Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 10, backgroundColor: colors.loginBackground },
  bgContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', backgroundColor: colors.loginBackground },
  bgImage: { position: 'absolute', width: '100%', height: height + 2 },
  card: { width: '100%', maxWidth: 420, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 18, paddingVertical: 18, paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8, marginTop: height * 0.05, marginBottom: height * 0.05 },
  cardTitle: { textAlign: 'center', color: '#000000', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  form: { backgroundColor: 'transparent', width: '100%', maxWidth: 400, alignSelf: 'center' },
  inputContainer: { marginBottom: height < 700 ? 15 : 20 },
  inputLabel: { color: '#000000', fontWeight: '600', marginBottom: 6, fontSize: width < 400 ? 14 : 16 },
  input: { backgroundColor: colors.white, borderRadius: width < 400 ? 20 : 25, paddingHorizontal: width < 400 ? 15 : 20, paddingVertical: width < 400 ? 12 : 15, color: colors.textMuted, shadowColor: colors.shadow as any, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2.5, elevation: 3, minHeight: width < 400 ? 45 : 50, fontSize: width < 400 ? 14 : 16 },
  sexRow: { flexDirection: 'row', gap: 8 },
  sexPill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.1)' },
  sexPillActive: { backgroundColor: 'rgba(0,0,0,0.2)', shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 4 },
  sexText: { color: '#000000' },
  sexTextActive: { color: '#000000', fontWeight: '700' },
  submitBtn: { marginTop: height < 700 ? 10 : 14, borderRadius: width < 400 ? 20 : 25, overflow: 'hidden', shadowColor: colors.shadowDark as any, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  buttonGradient: { paddingVertical: width < 400 ? 15 : 18, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: width < 400 ? 16 : 18 },
});
