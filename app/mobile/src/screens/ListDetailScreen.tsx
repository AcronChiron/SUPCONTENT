import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../services/api';

export default function ListDetailScreen({ route, navigation }: any) {
  const { listId, name } = route.params as { listId: string; name: string };
  const [list, setList] = useState<any>(null);

  useEffect(() => {
    navigation.setOptions({ title: name });
    api(`/lists/${listId}`).then(setList).catch(console.error);
  }, [listId]);

  const removeItem = async (externalId: string) => {
    try {
      await api(`/lists/${listId}/items/${externalId}`, { method: 'DELETE' });
      setList((prev: any) => ({ ...prev, items: prev.items.filter((i: any) => i.externalId !== externalId) }));
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  const deleteList = async () => {
    Alert.alert('Supprimer la liste', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await api(`/lists/${listId}`, { method: 'DELETE' });
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Erreur', e.message);
          }
        }
      }
    ]);
  };

  if (!list) return <View style={s.container}><Text style={s.muted}>Chargement...</Text></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={list.items ?? []}
        keyExtractor={item => item.externalId}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={s.muted}>Cette liste est vide.</Text>}
        ListFooterComponent={
          <TouchableOpacity style={s.deleteBtn} onPress={deleteList}>
            <Text style={s.deleteBtnText}>Supprimer la liste</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.title || item.externalId}</Text>
              <Text style={s.sub}>{item.mediaType}</Text>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.externalId)}>
              <Text style={{ color: '#E8325A', fontSize: 20 }}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  card: { backgroundColor: '#1A1F3C', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  title: { color: '#F0F2FF', fontSize: 15, fontWeight: '600' },
  sub: { color: '#8892B0', fontSize: 12, marginTop: 2 },
  muted: { color: '#8892B0', textAlign: 'center', marginTop: 40 },
  deleteBtn: { marginTop: 24, borderWidth: 1, borderColor: '#E8325A', borderRadius: 12, padding: 14, alignItems: 'center' },
  deleteBtnText: { color: '#E8325A', fontWeight: '600' },
});
