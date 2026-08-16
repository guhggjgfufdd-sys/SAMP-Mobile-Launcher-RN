import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  NativeModules,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { safeGetItem } from '../utils/storage';

interface ServerInfo {
  name: string;
  ip: string;
  port: number;
  players: number;
  maxPlayers: number;
  online: boolean;
}

const DEFAULT_SERVER: ServerInfo = {
  name: 'Las Venturas RP',
  ip: '142.132.203.47',
  port: 21299,
  players: 0,
  maxPlayers: 100,
  online: true,
};

const SERVER_KEY = '@samp_server_info';
const CACHE_KEY = '@samp_cache_downloaded';

const ModeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [server, setServer] = useState<ServerInfo>(DEFAULT_SERVER);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const loadServerInfo = useCallback(async () => {
    setLoading(true);
    try {
      const saved = await safeGetItem<ServerInfo>(SERVER_KEY, DEFAULT_SERVER);
      setServer(saved);
    } catch (e) {
      console.error('Error loading server info:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadServerInfo();
    }, [loadServerInfo])
  );

  const handlePlay = async () => {
    try {
      // تحقق من الكاش أولاً
      const hasCache = await safeGetItem<boolean>(CACHE_KEY, false);
      if (!hasCache) {
        Alert.alert(
          'الكاش ناقص',
          'يجب تحميل ملفات الكاش أولاً قبل الدخول للعبة.',
          [{ text: 'حسناً' }]
        );
        return;
      }

      setConnecting(true);

      // استدعي Native Module للاتصال بالسيرفر
      if (NativeModules.SAMPLauncher && NativeModules.SAMPLauncher.connect) {
        await NativeModules.SAMPLauncher.connect(server.ip, server.port);
      } else {
        // إذا ما موجود Native Module، ننتظر شوي ونطلع رسالة
        setTimeout(() => {
          setConnecting(false);
          Alert.alert('تنبيه', 'Native Module غير متوفر. تأكد من بناء التطبيق بشكل صحيح.');
        }, 1000);
      }
    } catch (error) {
      setConnecting(false);
      console.error('Connection error:', error);
      Alert.alert('خطأ في الاتصال', 'تعذر الاتصال بالسيرفر. تأكد من الكاش.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الرئيسية</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5b8def" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الرئيسية</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>أخبار المشروع</Text>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>السيرفر يعمل الآن! 🔥</Text>
          <Text style={styles.newsDesc}>
            اضغط على "بدء اللعب" للانضمام مباشرة إلى السيرفر الخاص بك.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>اختيار السيرفر</Text>
        <View style={styles.serverCard}>
          <View style={styles.serverHeader}>
            <Text style={styles.serverName}>{server.name}</Text>
            <View style={styles.serverStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>متصل</Text>
            </View>
          </View>

          <Text style={styles.serverIp}>{server.ip}:{server.port}</Text>

          <View style={styles.serverFooter}>
            <Text style={styles.playerCount}>
              اللاعبين: {server.players} / {server.maxPlayers}
            </Text>

            <TouchableOpacity
              style={[styles.playButton, connecting && styles.playButtonDisabled]}
              onPress={handlePlay}
              disabled={connecting}
            >
              <Text style={styles.playButtonText}>
                {connecting ? 'جاري الاتصال...' : 'بدء اللعب'}
              </Text>
              {!connecting && <Text style={styles.playIcon}>▶</Text>}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#ffffff', marginBottom: 12, textAlign: 'right' },
  newsCard: { backgroundColor: '#1a1c23', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2a2d36' },
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
  playButtonDisabled: { opacity: 0.6 },
  playButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
  playIcon: { color: '#ffffff', fontSize: 12 },
});

export default ModeScreen;
