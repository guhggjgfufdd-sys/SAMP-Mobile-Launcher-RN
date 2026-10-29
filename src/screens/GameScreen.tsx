import React, { useState } from 'react';
    import { Alert, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
    import LinearGradient from 'react-native-linear-gradient';
    import { NativeStackNavigationProp } from '@react-navigation/native-stack';
    import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
    import { RootStackParamList } from '../types/navigation';
    import { CACHE_VERSION, SERVER_ADDRESS } from '../config/launcher';
    import GtaSetupModule from '../modules/GtaSetupModule';

    type GameRoute = RouteProp<RootStackParamList, 'Game'>;
    type GameNavigation = NativeStackNavigationProp<RootStackParamList, 'Game'>;

    const GameScreen = () => {
      const route = useRoute<GameRoute>();
      const navigation = useNavigation<GameNavigation>();
      const [joining, setJoining] = useState(false);
      const playerName = route.params.username;

      const joinServer = async () => {
        if (joining) return;
        setJoining(true);
        try {
          await GtaSetupModule.launchGame({ address: SERVER_ADDRESS, playerName });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'تأكد من تثبيت ملفات اللعبة وحاول مرة ثانية.';
          Alert.alert('تعذر تشغيل اللعبة', message);
          setJoining(false);
        }
      };

      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#080D10" />
          <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button">
              <Text style={styles.backText}>رجوع</Text>
            </TouchableOpacity>
            <LinearGradient colors={['#17272B', '#10191D']} style={styles.hero}>
              <Text style={styles.eyebrow}>NIGHTSHIFT • SA-MP</Text>
              <Text style={styles.title}>جاهز للدخول، {playerName}</Text>
              <Text style={styles.subtitle}>تم تجهيز ملفات GTA San Andreas {CACHE_VERSION}.</Text>
            </LinearGradient>

            <Text style={styles.sectionTitle}>السيرفر المحدد</Text>
            <View style={styles.serverCard}>
              <View style={styles.statusDot} />
              <View style={styles.serverInfo}>
                <Text style={styles.serverName}>SA-MP</Text>
                <Text style={styles.serverAddress} selectable>{SERVER_ADDRESS}</Text>
                <Text style={styles.serverHint}>العنوان محفوظ في إعدادات اللعبة</Text>
              </View>
            </View>

            <View style={styles.spacer} />
            <TouchableOpacity style={[styles.joinButton, joining && styles.joinButtonDisabled]} onPress={() => void joinServer()} disabled={joining} activeOpacity={0.86} accessibilityRole="button">
              <Text style={styles.joinButtonText}>{joining ? 'جاري فتح اللعبة...' : 'تشغيل اللعبة والدخول'}</Text>
            </TouchableOpacity>
            <Text style={styles.footer}>سيتم نسخ الكاش إلى مجلد اللعبة وكتابة عنوان السيرفر قبل التشغيل.</Text>
          </View>
        </SafeAreaView>
      );
    };

    const styles = StyleSheet.create({
      safeArea: { flex: 1, backgroundColor: '#080D10' },
      container: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
      backButton: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#151F22', marginBottom: 18 },
      backText: { color: '#C4D0CD', fontSize: 12, fontWeight: '700' },
      hero: { borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#29393D', marginBottom: 28 },
      eyebrow: { color: '#F6B84D', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textAlign: 'right' },
      title: { color: '#F3F5F2', fontSize: 25, lineHeight: 34, fontWeight: '800', textAlign: 'right', marginTop: 13 },
      subtitle: { color: '#A7B4B3', fontSize: 12, lineHeight: 19, textAlign: 'right', marginTop: 7 },
      sectionTitle: { color: '#EDF1EE', fontSize: 17, fontWeight: '800', textAlign: 'right', marginBottom: 11 },
      serverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#11191D', borderWidth: 1, borderColor: '#28363A', borderRadius: 19, padding: 17 },
      statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#73D7A4', marginRight: 13 },
      serverInfo: { flex: 1, alignItems: 'flex-end' },
      serverName: { color: '#F1F3F0', fontSize: 14, fontWeight: '800', textAlign: 'right' },
      serverAddress: { color: '#D5DFDB', fontSize: 15, fontWeight: '800', textAlign: 'left', writingDirection: 'ltr', marginTop: 5 },
      serverHint: { color: '#839294', fontSize: 10, textAlign: 'right', marginTop: 6 },
      spacer: { flex: 1 },
      joinButton: { minHeight: 54, borderRadius: 16, backgroundColor: '#F6B84D', alignItems: 'center', justifyContent: 'center' },
      joinButtonDisabled: { opacity: 0.72 },
      joinButtonText: { color: '#171615', fontSize: 14, fontWeight: '900' },
      footer: { color: '#819092', fontSize: 10, lineHeight: 16, textAlign: 'right', marginTop: 12 },
    });

    export default GameScreen;
    