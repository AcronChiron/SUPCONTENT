import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../services/api';

export default function ReviewDetailScreen({ route }: any) {
  const { reviewId } = route.params as { reviewId: string };
  const [review, setReview] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api(`/reviews/${reviewId}`),
      api(`/reviews/${reviewId}/comments`),
    ]).then(([r, c]: any[]) => {
      setReview(r);
      setComments((c as any).data ?? []);
    }).catch(console.error);
  }, [reviewId]);

  const sendComment = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const comment: any = await api(`/reviews/${reviewId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim() }),
      });
      setComments(prev => [...prev, comment]);
      setText('');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
    setSending(false);
  };

  if (!review) return <View style={s.container}><Text style={s.muted}>Chargement...</Text></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <View style={s.card}>
        <Text style={s.author}>@{review.user?.username}</Text>
        <Text style={s.stars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
        <Text style={s.content}>{review.content}</Text>
      </View>
      <Text style={s.sectionTitle}>Commentaires ({comments.length})</Text>
      {comments.map((c: any) => (
        <View key={c.id} style={s.comment}>
          <Text style={s.commentAuthor}>@{c.user?.username}</Text>
          <Text style={s.commentText}>{c.content}</Text>
        </View>
      ))}
      <View style={s.inputRow}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          placeholder="Votre commentaire..."
          placeholderTextColor="#8892B0"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={s.sendBtn} onPress={sendComment} disabled={sending}>
          <Text style={s.sendBtnText}>{sending ? '...' : '→'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  card: { backgroundColor: '#1A1F3C', borderRadius: 12, padding: 16, marginBottom: 16 },
  author: { color: '#E8325A', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  stars: { color: '#E8325A', fontSize: 16, marginBottom: 8 },
  content: { color: '#F0F2FF', fontSize: 14, lineHeight: 20 },
  sectionTitle: { color: '#8892B0', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  comment: { backgroundColor: '#1A1F3C', borderRadius: 8, padding: 12, marginBottom: 8 },
  commentAuthor: { color: '#E8325A', fontSize: 12, marginBottom: 2 },
  commentText: { color: '#F0F2FF', fontSize: 13 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  input: { backgroundColor: '#1A1F3C', color: '#F0F2FF', borderRadius: 12, padding: 12, fontSize: 14 },
  sendBtn: { backgroundColor: '#E8325A', borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', width: 48 },
  sendBtnText: { color: '#fff', fontSize: 18 },
  muted: { color: '#8892B0', textAlign: 'center', marginTop: 40 },
});
