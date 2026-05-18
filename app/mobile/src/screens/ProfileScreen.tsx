import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api('/users/me').then(setProfile).catch(console.error);
  }, []);

  if (!profile) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statNum}>{profile.followersCount}</Text><Text style={styles.statLabel}>followers</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{profile.followingCount}</Text><Text style={styles.statLabel}>following</Text></View>
      </View>

      <TouchableOpacity style={styles.listBtn} onPress={() => navigation.navigate('Lists')}>
        <Text style={styles.listBtnText}>Mes listes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A', padding: 24 },
  loading: { color: '#8892B0', textAlign: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6B3FA0', marginBottom: 12 },
  username: { color: '#F0F2FF', fontSize: 20, fontWeight: '700' },
  email: { color: '#8892B0', fontSize: 13 },
  bio: { color: '#F0F2FF', fontSize: 14, marginTop: 8, textAlign: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 32 },
  stat: { alignItems: 'center' },
  statNum: { color: '#F0F2FF', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#8892B0', fontSize: 12 },
  listBtn: { backgroundColor: '#1A1F3C', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 8 },
  listBtnText: { color: '#F0F2FF', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#1A1F3C', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutText: { color: '#E8325A', fontWeight: '600' },
});
