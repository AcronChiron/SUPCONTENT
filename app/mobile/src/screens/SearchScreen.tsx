import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const search = async () => {
    if (!query.trim()) return;
    try {
      const res = await api(`/music/search?q=${encodeURIComponent(query)}&type=artist&limit=20`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput style={styles.input} placeholder="Search music..." placeholderTextColor="#8892B0" value={query} onChangeText={setQuery} onSubmitEditing={search} returnKeyType="search" />
      </View>

      <FlatList
        data={results}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.listeners && <Text style={styles.itemSub}>{Number(item.listeners).toLocaleString()} listeners</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  searchBar: { padding: 12 },
  input: { backgroundColor: '#1A1F3C', color: '#F0F2FF', borderRadius: 12, padding: 12, fontSize: 15 },
  item: { padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemName: { color: '#F0F2FF', fontSize: 15, fontWeight: '500' },
  itemSub: { color: '#8892B0', fontSize: 12, marginTop: 2 },
});
