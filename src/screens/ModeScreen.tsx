import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const ModeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الرئيسية</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>أخبار المشروع</Text>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>السيرفر يعمل الآن! 🔥</Text>
          <Text style={styles.newsDesc}>اضغط على "بدء اللعب" للانضمام إلى السيرفر الخاص بك.</Text>
        </View>

        <Text style={styles.sectionTitle}>اختيار السيرفر</Text>
        <View style={styles.serverCard}>
          <View style={styles.serverHeader}>
            <Text style={styles.serverName}>Las Venturas RP</Text>
            <View style={styles.serverStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>متصل</Text>
            </View>
          </View>
          <Text style={styles.serverIp}>142.132.203.47:21299</Text>
          <View style={styles.serverFooter}>
            <Text style={styles.playerCount}>اللاعبين: 0 / 100</Text>
            <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
              <Text style={styles.playButtonText}>بدء اللعب</Text>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0c10' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#0b0c10' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#ffffff', textAlign: 'right' },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#ffffff', marginBottom: 12, textAlign: 'right' },
  newsCard: { backgroundColor: '#1a1c23', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2a2d35' },
  newsTitle: { fontSize: 16, fontWeight: '500', color: '#5b8def', marginBottom: 8, textAlign: 'right' },
  newsDesc: { fontSize: 14, color: '#9ca3af', lineHeight: 20, textAlign: 'right' },
  serverCard: { backgroundColor: '#1a1c23', borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: '#5b8def' },
  serverHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serverName: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  serverStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 10, height: 10, backgroundColor: '#4ade80', borderRadius: 5 },
  statusText: { fontSize: 14, color: '#4ade80', fontWeight: '500' },
  serverIp: { fontSize: 14, color: '#9ca3af', marginBottom: 16, fontVariant: ['tabular-nums'] },
  serverFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerCount: { fontSize: 14, color: '#9ca3af' },
  playButton: { backgroundColor: '#5b8def', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  playButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
  playIcon: { color: '#ffffff', fontSize: 12 },
});

export default ModeScreen;
