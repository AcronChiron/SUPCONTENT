import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    api('/feed').then(res => setReviews(res.data)).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.username}>{item.user.username}</Text>
            <Text style={styles.rating}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
            <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
            <Text style={styles.meta}>{item._count?.likes || 0} likes · {item._count?.comments || 0} comments</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Follow users to see their activity.</Text>}
      />

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Search')}><Text style={styles.tabText}>Search</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Profile')}><Text style={styles.tabText}>Profile</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  card: { backgroundColor: '#1A1F3C', margin: 8, padding: 16, borderRadius: 12 },
  username: { color: '#F0F2FF', fontWeight: '600', marginBottom: 4 },
  rating: { color: '#E8325A', marginBottom: 8 },
  content: { color: '#F0F2FF', fontSize: 14, lineHeight: 20 },
  meta: { color: '#8892B0', fontSize: 12, marginTop: 8 },
  empty: { color: '#8892B0', textAlign: 'center', padding: 32 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  tabText: { color: '#8892B0', fontSize: 13, fontWeight: '500' },
});
