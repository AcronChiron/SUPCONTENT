import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { api } from '../services/api';

export default function UserProfileScreen({ route, navigation }: any) {
  const { username } = route.params as { username: string };
  const [profile, setProfile] = useState<any>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `@${username}` });
    api(`/users/${username}`)
      .then((data: any) => {
        setProfile(data);
        setFollowing(data.isFollowing ?? false);
      })
      .catch(console.error);
  }, [username, navigation]);

  const toggleFollow = async () => {
    setLoading(true);
    try {
      if (following) {
        await api(`/users/${username}/follow`, { method: 'DELETE' });
        setFollowing(false);
      } else {
        await api(`/users/${username}/follow`, { method: 'POST' });
        setFollowing(true);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
    setLoading(false);
  };

  if (!profile) return <View style={styles.container}><Text style={styles.loading}>Chargement...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile.followersCount ?? 0}</Text>
          <Text style={styles.statLabel}>abonnés</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile.followingCount ?? 0}</Text>
          <Text style={styles.statLabel}>abonnements</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile.reviewsCount ?? 0}</Text>
          <Text style={styles.statLabel}>critiques</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.followBtn, following && styles.followBtnOutline]}
        onPress={toggleFollow}
        disabled={loading}
      >
        <Text style={[styles.followBtnText, following && { color: '#E8325A' }]}>
          {loading ? '...' : following ? 'Ne plus suivre' : 'Suivre'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  loading: { color: '#8892B0', textAlign: 'center', marginTop: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6B3FA0', marginBottom: 12 },
  username: { color: '#F0F2FF', fontSize: 20, fontWeight: '700' },
  bio: { color: '#8892B0', fontSize: 14, marginTop: 8, textAlign: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 32 },
  stat: { alignItems: 'center' },
  statNum: { color: '#F0F2FF', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#8892B0', fontSize: 12 },
  followBtn: { backgroundColor: '#E8325A', borderRadius: 12, padding: 14, alignItems: 'center' },
  followBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E8325A' },
  followBtnText: { color: '#F0F2FF', fontWeight: '600', fontSize: 15 },
});
