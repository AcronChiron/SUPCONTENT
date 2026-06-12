import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

export default function MediaDetailScreen({ route, navigation }: any) {
  const { mediaType, id } = route.params as { mediaType: 'artists' | 'albums' | 'tracks'; id: string };
  const [data, setData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api(`/music/${mediaType}/${id}`),
      api(`/music/${mediaType}/${id}/reviews`),
    ]).then(([d, r]: any[]) => {
      setData(d);
      setReviews((r as any).data ?? []);
    }).catch(console.error);
  }, [mediaType, id]);

  const addToLibrary = async (status: string) => {
    try {
      await api('/library', {
        method: 'PUT',
        body: JSON.stringify({
          externalId: id,
          mediaType: mediaType.slice(0, -1).toUpperCase(),
          status,
          title: data?.name || data?.title,
        }),
      });
    } catch (e) { console.error(e); }
  };

  const toggleLike = async (reviewId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await api(`/reviews/${reviewId}/like`, { method: 'DELETE' });
      } else {
        await api(`/reviews/${reviewId}/like`, { method: 'POST' });
      }
      setReviews(prev => prev.map((r: any) => r.id === reviewId
        ? { ...r, isLiked: !r.isLiked, _count: { ...r._count, likes: (r._count?.likes ?? 0) + (isLiked ? -1 : 1) } }
        : r
      ));
    } catch (e) { console.error(e); }
  };

  if (!data) return <View style={s.container}><Text style={s.muted}>Chargement...</Text></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.title}>{data.title || data.name}</Text>
      {data.artistName && <Text style={s.subtitle}>{data.artistName}</Text>}
      {data.summary && <Text style={s.body}>{data.summary}</Text>}

      <View style={s.actions}>
        {(['TO_LISTEN', 'LISTENING', 'DONE', 'ABANDONED'] as const).map(status => (
          <TouchableOpacity key={status} style={s.btn} onPress={() => addToLibrary(status)}>
            <Text style={s.btnText}>
              {status === 'TO_LISTEN' ? 'À écouter' : status === 'LISTENING' ? 'En écoute' : status === 'DONE' ? 'Terminé' : 'Abandonné'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {reviews.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={s.sectionTitle}>Critiques ({reviews.length})</Text>
          {reviews.map((r: any) => (
            <View key={r.id} style={s.reviewCard}>
              <TouchableOpacity onPress={() => navigation.navigate('ReviewDetail', { reviewId: r.id })}>
                <Text style={s.reviewAuthor}>@{r.user?.username} · {'★'.repeat(r.rating)}</Text>
                <Text style={s.reviewContent} numberOfLines={3}>{r.content}</Text>
              </TouchableOpacity>
              <View style={s.reviewFooter}>
                <TouchableOpacity style={s.likeBtn} onPress={() => toggleLike(r.id, r.isLiked)}>
                  <Text style={[s.likeBtnText, r.isLiked && { color: '#E8325A' }]}>
                    {r.isLiked ? '♥' : '♡'} {r._count?.likes ?? 0}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ReviewDetail', { reviewId: r.id })}>
                  <Text style={s.muted}>💬 {r._count?.comments ?? 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  title: { color: '#F0F2FF', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#E8325A', fontSize: 16, marginTop: 4 },
  body: { color: '#F0F2FF', fontSize: 14, lineHeight: 20, marginTop: 12 },
  muted: { color: '#8892B0', fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  btn: { backgroundColor: '#1A1F3C', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#F0F2FF', fontSize: 13 },
  sectionTitle: { color: '#8892B0', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  reviewCard: { backgroundColor: '#1A1F3C', borderRadius: 12, padding: 14, marginBottom: 10 },
  reviewAuthor: { color: '#E8325A', fontSize: 12, marginBottom: 4 },
  reviewContent: { color: '#F0F2FF', fontSize: 13, lineHeight: 18 },
  reviewFooter: { flexDirection: 'row', gap: 16, marginTop: 10 },
  likeBtn: { flexDirection: 'row', alignItems: 'center' },
  likeBtnText: { color: '#8892B0', fontSize: 14 },
});
