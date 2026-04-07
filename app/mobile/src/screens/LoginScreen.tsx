import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SUP<Text style={styles.accent}>CONTENT</Text></Text>
      <Text style={styles.subtitle}>L'Instagram de la Musique</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8892B0" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8892B0" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? <Text style={{ color: '#E8325A' }}>Sign up</Text></Text>
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
  link: { color: '#8892B0', textAlign: 'center', fontSize: 13 },
});
