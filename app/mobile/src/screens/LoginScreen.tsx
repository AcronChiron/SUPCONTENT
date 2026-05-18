import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';

const BACKEND = 'http://localhost:3000/api/v1';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${BACKEND}/auth/oauth/${provider}`,
        'supcontent://auth/callback'
      );
      if (result.type === 'success' && result.url) {
        Alert.alert('OAuth', `Connecté via ${provider} (redirect reçu)`);
      }
    } catch (e: any) {
      Alert.alert('Erreur OAuth', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SUP<Text style={styles.accent}>CONTENT</Text></Text>
      <Text style={styles.subtitle}>L'Instagram de la Musique</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8892B0" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor="#8892B0" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Se connecter</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>OU</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.oauthBtn} onPress={() => handleOAuth('google')}>
        <Text style={styles.oauthBtnText}>Continuer avec Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.oauthBtn} onPress={() => handleOAuth('github')}>
        <Text style={styles.oauthBtnText}>Continuer avec GitHub</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Pas encore de compte ? <Text style={{ color: '#E8325A' }}>S'inscrire</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0D0F1A' },
  title: { fontSize: 32, fontWeight: '800', color: '#F0F2FF', textAlign: 'center' },
  accent: { color: '#E8325A' },
  subtitle: { color: '#8892B0', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#1A1F3C', color: '#F0F2FF', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 15 },
  btn: { backgroundColor: '#E8325A', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: '#1A1F3C' },
  orText: { color: '#8892B0', fontSize: 12 },
  oauthBtn: { backgroundColor: '#1A1F3C', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  oauthBtnText: { color: '#F0F2FF', fontWeight: '600', fontSize: 15 },
  link: { color: '#8892B0', textAlign: 'center', fontSize: 13, marginTop: 16 },
});
