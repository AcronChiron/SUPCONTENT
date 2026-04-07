import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

export default function ConversationsScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    api('/messages/conversations').then(res => setConversations(res.data || res)).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item, i) => item.user?.username || String(i)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Chat', { username: item.user.username })}
          >
            <Text style={styles.username}>{item.user.username}</Text>
            <Text style={styles.preview} numberOfLines={1}>{item.lastMessage?.content || '...'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No conversations yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  card: { backgroundColor: '#1A1F3C', marginHorizontal: 8, marginVertical: 4, padding: 14, borderRadius: 12 },
  username: { color: '#F0F2FF', fontWeight: '600' },
  preview: { color: '#8892B0', fontSize: 13, marginTop: 4 },
  empty: { color: '#8892B0', textAlign: 'center', padding: 32 },
});
