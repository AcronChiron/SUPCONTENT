import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EditProfileScreen({ navigation }: any) {
  const { logout } = useAuth();
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/users/me').then((profile: any) => {
      setBio(profile.bio || '');
      setWebsiteUrl(profile.websiteUrl || '');
      setAvatarUrl(profile.avatarUrl || '');
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ bio, websiteUrl: websiteUrl || undefined, avatarUrl: avatarUrl || undefined }),
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer mon compte', 'Cette action est irréversible. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api('/users/me', { method: 'DELETE' });
            await logout();
          } catch (err: any) {
            Alert.alert('Erreur', err.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.label}>Photo de profil (URL)</Text>
      <TextInput style={styles.input} placeholder="https://mon-image.jpg" placeholderTextColor="#8892B0" value={avatarUrl} onChangeText={setAvatarUrl} autoCapitalize="none" />

      <Text style={styles.label}>Biographie</Text>
      <TextInput style={[styles.input, styles.textarea]} placeholder="Parlez-nous de vous..." placeholderTextColor="#8892B0" value={bio} onChangeText={setBio} multiline numberOfLines={4} maxLength={500} />

      <Text style={styles.label}>Site web</Text>
      <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#8892B0" value={websiteUrl} onChangeText={setWebsiteUrl} autoCapitalize="none" />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
      </TouchableOpacity>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Zone de danger</Text>
        <Text style={styles.dangerText}>La suppression est irréversible. Toutes vos données seront effacées.</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F1A' },
  label: { color: '#8892B0', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1A1F3C', color: '#F0F2FF', borderRadius: 12, padding: 14, fontSize: 15 },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#E8325A', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  dangerZone: { marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1A1F3C' },
  dangerTitle: { color: '#E8325A', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  dangerText: { color: '#8892B0', fontSize: 13, marginBottom: 14 },
  deleteBtn: { borderWidth: 1, borderColor: '#E8325A', borderRadius: 12, padding: 14, alignItems: 'center' },
  deleteBtnText: { color: '#E8325A', fontWeight: '600' },
});
