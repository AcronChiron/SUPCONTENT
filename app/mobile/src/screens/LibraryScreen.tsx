import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { api } from '../services/api';

export default function LibraryScreen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api('/library').then(res => setItems(res.data)).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.media?.title || item.externalId}</Text>
            <Text style={styles.meta}>{item.mediaType} · {item.status}{item.rating ? ` · ${item.rating}/5` : ''}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Your library is empty.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  card: { backgroundColor: '#1A1F3C', margin: 8, padding: 16, borderRadius: 12 },
  title: { color: '#F0F2FF', fontWeight: '600', fontSize: 15 },
  meta: { color: '#8892B0', fontSize: 12, marginTop: 4 },
  empty: { color: '#8892B0', textAlign: 'center', padding: 32 },
});
