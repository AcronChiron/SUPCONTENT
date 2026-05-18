import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { api } from '../services/api';

export default function ListsScreen({ navigation }: any) {
  const [lists, setLists] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const load = () => {
    api('/lists').then((res: any) => setLists(res.data ?? [])).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const createList = async () => {
    if (!newName.trim()) return;
    try {
      await api('/lists', { method: 'POST', body: JSON.stringify({ name: newName.trim(), isPublic }) });
      setNewName('');
      setShowModal(false);
      load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View style={s.container}>
      <FlatList
        data={lists}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={s.muted}>Aucune liste. Créez-en une !</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('ListDetail', { listId: item.id, name: item.name })}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.sub}>{item.isPublic ? 'Publique' : 'Privée'} · {item._count?.items ?? 0} items</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={s.fab} onPress={() => setShowModal(true)}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Nouvelle liste</Text>
            <TextInput style={s.input} placeholder="Nom de la liste" placeholderTextColor="#8892B0" value={newName} onChangeText={setNewName} />
            <TouchableOpacity style={s.toggle} onPress={() => setIsPublic(p => !p)}>
              <Text style={s.sub}>{isPublic ? '🌐 Publique' : '🔒 Privée'} (appuyer pour changer)</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={createList}><Text style={s.btnText}>Créer</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={() => setShowModal(false)}><Text style={{ color: '#F0F2FF' }}>Annuler</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  card: { backgroundColor: '#1A1F3C', borderRadius: 12, padding: 16, marginBottom: 10 },
  name: { color: '#F0F2FF', fontSize: 16, fontWeight: '600' },
  sub: { color: '#8892B0', fontSize: 13, marginTop: 4 },
  muted: { color: '#8892B0', textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#E8325A', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1A1F3C', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 },
  modalTitle: { color: '#F0F2FF', fontSize: 18, fontWeight: '700' },
  input: { backgroundColor: '#0D0F1A', color: '#F0F2FF', borderRadius: 12, padding: 14, fontSize: 15 },
  toggle: { padding: 4 },
  btn: { backgroundColor: '#E8325A', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#0D0F1A', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
