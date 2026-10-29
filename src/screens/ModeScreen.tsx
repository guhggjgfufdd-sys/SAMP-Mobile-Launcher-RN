import React, { useCallback, useEffect, useState } from 'react';
    import {
      ActivityIndicator,
      Alert,
      SafeAreaView,
      ScrollView,
      StatusBar,
      StyleSheet,
      Text,
      TextInput,
      TouchableOpacity,
      View,
    } from 'react-native';
    import LinearGradient from 'react-native-linear-gradient';
    import { NativeStackNavigationProp } from '@react-navigation/native-stack';
    import { useNavigation } from '@react-navigation/native';
    import RNFS from 'react-native-fs';
    import { unzip } from 'react-native-zip-archive';
    import { CACHE_URL, CACHE_VERSION, SERVER_ADDRESS } from '../config/launcher';
    import { RootStackParamList } from '../types/navigation';

    type ModeNavigation = NativeStackNavigationProp<RootStackParamList, 'Mode'>;
    const CACHE_DIR = RNFS.ExternalDirectoryPath + '/SAMP';
    const CACHE_ARCHIVE = RNFS.ExternalDirectoryPath + '/samp-cache-' + CACHE_VERSION + '.zip';
    const CACHE_MARKER = CACHE_DIR + '/.cache-version';

    const ModeScreen = () => {
      const navigation = useNavigation<ModeNavigation>();
      const [name, setName] = useState('');
      const [loading, setLoading] = useState(false);
      const [cacheReady, setCacheReady] = useState(false);
      const [progress, setProgress] = useState(0);
      const [status, setStatus] = useState('');

      const checkCache = useCallback(async () => {
        try {
          if (!(await RNFS.exists(CACHE_MARKER))) return;
          const installedVersion = (await RNFS.readFile(CACHE_MARKER, 'utf8')).trim();
          if (installedVersion === CACHE_VERSION) {
            setCacheReady(true);
            setStatus('كاش اللعبة جاهز');
          }
        } catch {
          setCacheReady(false);
        }
      }, []);

      useEffect(() => {
        void checkCache();
      }, [checkCache]);

      const removePath = async (path: string) => {
        try {
          if (await RNFS.exists(path)) await RNFS.unlink(path);
        } catch {
          // A failed cleanup should not hide the original download or extraction error.
        }
      };

      const handleStart = async () => {
        const playerName = name.trim().replace(/[\r\n=]/g, '').slice(0, 24);
        if (playerName.length < 3) {
          Alert.alert('الاسم مطلوب', 'اكتب اسم لاعب من 3 إلى 24 حرفًا.');
          return;
        }
        setName(playerName);
        if (cacheReady) {
          navigation.navigate('Game', { username: playerName });
          return;
        }

        setLoading(true);
        setStatus('جاري تنزيل الكاش...');
        setProgress(0);
        try {
          await removePath(CACHE_ARCHIVE);
          await removePath(CACHE_DIR);
          await RNFS.mkdir(CACHE_DIR);

          const result = await RNFS.downloadFile({
            fromUrl: CACHE_URL,
            toFile: CACHE_ARCHIVE,
            progressInterval: 700,
            progress: response => {
              if (response.contentLength > 0) {
                const percent = Math.round((response.bytesWritten / response.contentLength) * 92);
                setProgress(Math.max(0, Math.min(92, percent)));
              }
            },
          }).promise;

          if (result.statusCode < 200 || result.statusCode >= 300 || result.bytesWritten < 1000000) {
            throw new Error('تعذر تنزيل ملف الكاش كاملًا. تحقق من الاتصال والمساحة المتاحة.');
          }

          setStatus('جاري فك ضغط ملفات اللعبة...');
          setProgress(95);
          await unzip(CACHE_ARCHIVE, CACHE_DIR);
          const extracted = await RNFS.readDir(CACHE_DIR);
          if (extracted.length === 0) throw new Error('ملف الكاش فارغ أو غير صالح.');
          await RNFS.writeFile(CACHE_MARKER, CACHE_VERSION, 'utf8');
          await removePath(CACHE_ARCHIVE);

          setCacheReady(true);
          setProgress(100);
          setStatus('كاش اللعبة جاهز');
          navigation.navigate('Game', { username: playerName });
        } catch (error) {
          await removePath(CACHE_ARCHIVE);
          await removePath(CACHE_DIR);
          setCacheReady(false);
          setProgress(0);
          const message = error instanceof Error ? error.message : 'حاول مرة ثانية بعد التحقق من مساحة الهاتف.';
          setStatus('تعذر تجهيز الكاش');
          Alert.alert('فشل تجهيز الكاش', message);
        } finally {
          setLoading(false);
        }
      };

      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#080D10" />
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.brandMark}><Text style={styles.brandMarkText}>N</Text></View>
              <View style={styles.brandCopy}>
                <Text style={styles.eyebrow}>SA-MP / MOBILE</Text>
                <Text style={styles.brandName}>NIGHTSHIFT</Text>
              </View>
              <View style={styles.versionPill}><Text style={styles.versionPillText}>2.11</Text></View>
            </View>

            <LinearGradient colors={['#18262B', '#10191D', '#111419']} style={styles.hero}>
              <View style={styles.heroGlow} />
              <Text style={styles.heroEyebrow}>ARMv7 • 32-BIT</Text>
              <Text style={styles.heroTitle}>جلسة اللعب تبدأ من هنا</Text>
              <Text style={styles.heroSubtitle}>نزّل ملفات اللعبة، أدخل اسمك، ثم اتصل بسيرفرك.</Text>
              <View style={styles.serverBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.serverBadgeText}>العنوان محفوظ في اللانشر</Text>
              </View>
            </LinearGradient>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>السيرفر</Text>
              <Text style={styles.sectionMeta}>SA-MP</Text>
            </View>
            <View style={styles.serverCard}>
              <View style={styles.serverIcon}><Text style={styles.serverIconText}>↗</Text></View>
              <View style={styles.serverInfo}>
                <Text style={styles.cardEyebrow}>عنوان السيرفر</Text>
                <Text style={styles.serverAddress} selectable>{SERVER_ADDRESS}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ملفات اللعبة</Text>
              <Text style={styles.sectionMeta}>GTA SA {CACHE_VERSION}</Text>
            </View>
            <View style={styles.cacheCard}>
              <View style={styles.cacheTop}>
                <View style={styles.cacheIcon}><Text style={styles.cacheIconText}>▣</Text></View>
                <View style={styles.cacheInfo}>
                  <Text style={styles.cacheTitle}>كاش GTA San Andreas</Text>
                  <Text style={styles.cacheSubtitle}>ARMv7 • حجم الملف 581 MB</Text>
                </View>
                <View style={[styles.cacheStatus, cacheReady && styles.cacheStatusReady]}>
                  <Text style={[styles.cacheStatusText, cacheReady && styles.cacheStatusTextReady]}>
                    {cacheReady ? 'جاهز' : 'يتطلب تنزيلًا'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cacheDescription}>
                يُحفظ الكاش داخل مساحة التطبيق ثم يُنسخ إلى مجلد اللعبة عند التشغيل. يحتاج مساحة إضافية بعد فك الضغط.
              </Text>

              {loading && (
                <View style={styles.progressBlock}>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressStatus}>{status}</Text>
                    <Text style={styles.progressValue}>{progress}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: String(progress) + '%' }]} />
                  </View>
                </View>
              )}

              <View style={styles.nameField}>
                <Text style={styles.nameLabel}>اسم اللاعب</Text>
                <TextInput
                  value={name}
                  onChangeText={value => setName(value.replace(/[\r\n]/g, '').slice(0, 24))}
                  placeholder="اكتب اسمك"
                  placeholderTextColor="#758087"
                  style={styles.nameInput}
                  autoCapitalize="none"
                  maxLength={24}
                  returnKeyType="go"
                  onSubmitEditing={() => void handleStart()}
                  textAlign="right"
                  writingDirection="rtl"
                  editable={!loading}
                  accessibilityLabel="اسم اللاعب"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={() => void handleStart()}
                activeOpacity={0.86}
                disabled={loading}
                accessibilityRole="button"
              >
                {loading ? <ActivityIndicator color="#131414" /> : <Text style={styles.primaryButtonText}>{cacheReady ? 'متابعة إلى السيرفر' : 'تنزيل الكاش والدخول'}</Text>}
              </TouchableOpacity>
            </View>

            <Text style={styles.compatibilityNote}>
              هذه النسخة 32-بت لأن مكتبات عميل اللعبة المتاحة ARMv7 فقط. تعمل على أجهزة 64-بت التي تدعم تطبيقات 32-بت.
            </Text>
          </ScrollView>
        </SafeAreaView>
      );
    };

    const styles = StyleSheet.create({
      safeArea: { flex: 1, backgroundColor: '#080D10' },
      content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
      header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
      brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#15292C', borderWidth: 1, borderColor: '#285054', alignItems: 'center', justifyContent: 'center' },
      brandMarkText: { color: '#F6B84D', fontSize: 23, fontWeight: '900' },
      brandCopy: { marginLeft: 11, flex: 1 },
      eyebrow: { color: '#87A0A2', fontSize: 9, letterSpacing: 2, textAlign: 'left', fontWeight: '700' },
      brandName: { color: '#F2F5F2', fontSize: 16, fontWeight: '800', letterSpacing: 1.2, marginTop: 2, textAlign: 'left' },
      versionPill: { borderRadius: 20, borderWidth: 1, borderColor: '#314247', paddingHorizontal: 11, paddingVertical: 7 },
      versionPillText: { color: '#C3D0CE', fontSize: 11, fontWeight: '700' },
      hero: { borderRadius: 25, overflow: 'hidden', padding: 22, minHeight: 190, justifyContent: 'center', borderWidth: 1, borderColor: '#27393D', marginBottom: 25 },
      heroGlow: { position: 'absolute', width: 145, height: 145, borderRadius: 80, backgroundColor: '#183B3E', right: -55, top: -55, opacity: 0.8 },
      heroEyebrow: { color: '#F6B84D', fontSize: 10, fontWeight: '800', letterSpacing: 1.6, textAlign: 'right', marginBottom: 12 },
      heroTitle: { color: '#F4F5F2', fontSize: 28, lineHeight: 36, fontWeight: '800', textAlign: 'right' },
      heroSubtitle: { color: '#AAB8B8', fontSize: 13, lineHeight: 21, textAlign: 'right', marginTop: 9 },
      serverBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', backgroundColor: '#12302A', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7, marginTop: 16 },
      statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#73D7A4', marginRight: 7 },
      serverBadgeText: { color: '#A4D8BE', fontSize: 10, fontWeight: '700' },
      sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
      sectionTitle: { color: '#F0F3F0', fontSize: 17, fontWeight: '800', textAlign: 'right' },
      sectionMeta: { color: '#819092', fontSize: 10, fontWeight: '700', textAlign: 'left' },
      serverCard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#11191D', borderRadius: 19, borderWidth: 1, borderColor: '#263338', marginBottom: 23 },
      serverIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: '#172D31', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
      serverIconText: { color: '#F6B84D', fontSize: 23, fontWeight: '700' },
      serverInfo: { flex: 1, alignItems: 'flex-end' },
      cardEyebrow: { color: '#829194', fontSize: 10, textAlign: 'right', marginBottom: 5 },
      serverAddress: { color: '#F1F3F0', fontSize: 15, fontWeight: '800', textAlign: 'left', writingDirection: 'ltr' },
      cacheCard: { backgroundColor: '#11191D', borderRadius: 21, borderWidth: 1, borderColor: '#263338', padding: 16 },
      cacheTop: { flexDirection: 'row', alignItems: 'center' },
      cacheIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: '#332917', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
      cacheIconText: { color: '#F6B84D', fontSize: 20 },
      cacheInfo: { flex: 1 },
      cacheTitle: { color: '#F1F4F0', fontSize: 14, fontWeight: '800', textAlign: 'right' },
      cacheSubtitle: { color: '#879496', fontSize: 10, marginTop: 5, textAlign: 'right' },
      cacheStatus: { backgroundColor: '#332D20', borderRadius: 15, paddingHorizontal: 9, paddingVertical: 6 },
      cacheStatusReady: { backgroundColor: '#173328' },
      cacheStatusText: { color: '#E2BA6C', fontSize: 9, fontWeight: '800' },
      cacheStatusTextReady: { color: '#83D3A7' },
      cacheDescription: { color: '#9AA8A8', fontSize: 11, lineHeight: 18, textAlign: 'right', marginTop: 15 },
      progressBlock: { marginTop: 16 },
      progressLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
      progressStatus: { color: '#B7C3C1', fontSize: 11, textAlign: 'right' },
      progressValue: { color: '#F6B84D', fontSize: 11, fontWeight: '800' },
      progressTrack: { height: 7, borderRadius: 5, backgroundColor: '#263337', overflow: 'hidden' },
      progressFill: { height: '100%', borderRadius: 5, backgroundColor: '#F6B84D' },
      nameField: { marginTop: 17 },
      nameLabel: { color: '#D7E0DE', fontSize: 11, fontWeight: '700', textAlign: 'right', marginBottom: 8 },
      nameInput: { height: 48, borderRadius: 13, borderWidth: 1, borderColor: '#314044', backgroundColor: '#0D1417', paddingHorizontal: 14, color: '#F3F5F1', fontSize: 14 },
      primaryButton: { minHeight: 51, borderRadius: 15, backgroundColor: '#F6B84D', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
      primaryButtonDisabled: { opacity: 0.72 },
      primaryButtonText: { color: '#171615', fontSize: 14, fontWeight: '900' },
      compatibilityNote: { color: '#7F8E90', fontSize: 10, lineHeight: 16, textAlign: 'right', marginTop: 15, paddingHorizontal: 3 },
    });

    export default ModeScreen;
    