import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface NotifPrefs {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  new_release: boolean;
}

const PREF_LABELS: [keyof NotifPrefs, string][] = [
  ['likes', "J'aime sur mes critiques"],
  ['comments', 'Commentaires sur mes critiques'],
  ['follows', 'Nouveaux abonnés'],
  ['new_release', 'Nouvelles sorties'],
];

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [prefs, setPrefs] = useState<NotifPrefs>({ likes: true, comments: true, follows: true, new_release: true });

  useEffect(() => {
    api<NotifPrefs>('/notifications/preferences').then(setPrefs).catch(() => {});
  }, []);

  const togglePref = async (key: keyof NotifPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      await api('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(next) });
    } catch {
      setPrefs(prefs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Préférences de notification</Text>
      {PREF_LABELS.map(([key, label]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Switch
            value={prefs[key]}
            onValueChange={() => togglePref(key)}
            trackColor={{ false: '#1A1F3C', true: '#E8325A' }}
            thumbColor="#F0F2FF"
          />
        </View>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A', padding: 24 },
  sectionTitle: { color: '#F0F2FF', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1F3C', borderRadius: 12, padding: 14, marginBottom: 8 },
  rowLabel: { color: '#F0F2FF', fontSize: 14, flex: 1, marginRight: 12 },
  logoutBtn: { backgroundColor: '#1A1F3C', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 24 },
  logoutText: { color: '#E8325A', fontWeight: '600' },
});
