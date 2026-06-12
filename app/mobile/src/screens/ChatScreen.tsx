import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { api } from '../services/api';

export default function ChatScreen({ route }: any) {
  const username: string = route.params.username;
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');

  const load = () => {
    api(`/messages/conversations/${username}`)
      .then(res => setMessages(res.data || res))
      .catch(console.error);
  };
  useEffect(load, [username]);

  const send = async () => {
    if (!draft.trim()) return;
    try {
      await api(`/messages/conversations/${username}`, {
        method: 'POST',
        body: JSON.stringify({ content: draft }),
      });
      setDraft('');
      load();
    } catch (e) { console.error(e); }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={messages}
        inverted
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.bubble}>
            <Text style={styles.content}>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message..."
          placeholderTextColor="#8892B0"
        />
        <TouchableOpacity onPress={send} style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  bubble: { backgroundColor: '#1A1F3C', margin: 6, padding: 12, borderRadius: 12, maxWidth: '80%' },
  content: { color: '#F0F2FF' },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  input: { flex: 1, backgroundColor: '#1A1F3C', color: '#F0F2FF', borderRadius: 12, paddingHorizontal: 14 },
  sendBtn: { backgroundColor: '#E8325A', borderRadius: 12, paddingHorizontal: 18, marginLeft: 8, justifyContent: 'center' },
  sendText: { color: '#F0F2FF', fontWeight: '600' },
});
