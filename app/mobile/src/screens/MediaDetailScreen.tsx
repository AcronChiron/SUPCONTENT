import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

export default function MediaDetailScreen({ route }: any) {
  const { mediaType, id } = route.params as { mediaType: 'artists' | 'albums' | 'tracks'; id: string };
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api(`/music/${mediaType}/${id}`).then(setData).catch(console.error);
  }, [mediaType, id]);

  const addToLibrary = async (status: string) => {
    try {
      await api('/library', {
        method: 'PUT',
        body: JSON.stringify({ externalId: id, mediaType: mediaType.slice(0, -1).toUpperCase(), status }),
      });
    } catch (e) { console.error(e); }
  };

  if (!data) return <View style={styles.container}><Text style={styles.muted}>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{data.title || data.name}</Text>
      {data.artistName && <Text style={styles.subtitle}>{data.artistName}</Text>}
      {data.imageUrl && <Text style={styles.muted}>{data.imageUrl}</Text>}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={() => addToLibrary('TO_LISTEN')}>
          <Text style={styles.btnText}>To listen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => addToLibrary('DONE')}>
          <Text style={styles.btnText}>Done</Text>
        </TouchableOpacity>
      </View>
      {data.summary && <Text style={styles.body}>{data.summary}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  title: { color: '#F0F2FF', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#E8325A', fontSize: 16, marginTop: 4 },
  body: { color: '#F0F2FF', fontSize: 14, lineHeight: 20, marginTop: 16 },
  muted: { color: '#8892B0', fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  btn: { backgroundColor: '#E8325A', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  btnText: { color: '#F0F2FF', fontWeight: '600' },
});
