import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

function notifText(type: string, payload: any): string {
  const someone = "Quelqu'un";
  switch (type) {
    case 'like': return `${payload.likerUsername || someone} a aimé votre critique`;
    case 'comment': return `${payload.commenterUsername || someone} a commenté votre critique`;
    case 'follow': return `${payload.followerUsername || someone} vous suit désormais`;
    case 'new_release': return payload.message || 'Nouvelle sortie dans vos artistes favoris';
    default: return type;
  }
}

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    api('/notifications').then(res => setNotifs(res.data)).catch(console.error);
  }, []);

  const markAllRead = async () => {
    await api('/notifications/read-all', { method: 'PATCH' }).catch(console.error);
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={markAllRead} style={styles.action}>
        <Text style={styles.actionText}>Tout marquer comme lu</Text>
      </TouchableOpacity>
      <FlatList
        data={notifs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isRead && styles.unread]}>
            <Text style={styles.message}>{notifText(item.type, item.payload ?? {})}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune notification.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  action: { padding: 12, alignItems: 'flex-end' },
  actionText: { color: '#E8325A', fontWeight: '600' },
  card: { backgroundColor: '#1A1F3C', marginHorizontal: 8, marginVertical: 4, padding: 14, borderRadius: 12 },
  unread: { borderLeftWidth: 3, borderLeftColor: '#E8325A' },
  message: { color: '#F0F2FF', fontSize: 14 },
  date: { color: '#8892B0', fontSize: 12, marginTop: 4 },
  empty: { color: '#8892B0', textAlign: 'center', padding: 32 },
});
