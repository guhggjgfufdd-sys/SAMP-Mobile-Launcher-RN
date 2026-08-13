import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  NativeModules,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';

const SERVER_IP = '142.132.203.47';
const SERVER_PORT = 21299;
const PACKAGE_NAME = 'com.touch.mobile.dark';

export const GameScreen = () => {
  const [serverStatus] = useState({
    isOnline: true,
    playersCount: 0,
    maxPlayers: 100,
    serverName: 'Las Venturas RP',
  });

  const handlePlay = async () => {
    try {
      // 1. تجهيز مجلد samp وملف settings.ini
      const sampPath = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/samp`;
      const settingsFilePath = `${sampPath}/settings.ini`;

      const exists = await RNFS.exists(sampPath);
      if (!exists) {
        await RNFS.mkdir(sampPath);
      }

      const settingsContent = `[client]\nhost=${SERVER_IP}\nport=${SERVER_PORT}\nname=Player_Guest\nfpsfix=1\nmultiprocess=0\n`;
      await RNFS.writeFile(settingsFilePath, settingsContent, 'utf8');

      // 2. استدعاء GtaSetupModule المكتشف في سورس كود مشروعك
      if (Platform.OS === 'android') {
        const { GtaSetupModule } = NativeModules;

        if (GtaSetupModule) {
          if (typeof GtaSetupModule.launchGame === 'function') {
            GtaSetupModule.launchGame();
          } else if (typeof GtaSetupModule.startGame === 'function') {
            GtaSetupModule.startGame();
          } else {
            // في حال كانت دالة التشغيل باسم آخر داخل الملف
            const functionsList = Object.keys(GtaSetupModule).join(', ');
            Alert.alert(
              'معلومات الموديل',
              `الموديل GtaSetupModule متصل بنجاح! الدوال المتاحة داخله هي:\n${functionsList}`
            );
          }
        } else {
          Alert.alert(
            'خطأ',
            'لم يتم التعرف على GtaSetupModule. تأكد من إعادة بناء التطبيق (Rebuild) بعد الحفظ.'
          );
        }
      }
    } catch (error) {
      Alert.alert('خطأ', 'تعذر كتابة ملف الإعدادات في مجلد اللعبة.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.sectionTitle}>أخبار المشروع</Text>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>🔥 السيرفر يعمل الآن!</Text>
          <Text style={styles.newsDescription}>
            اضغط على "بدء اللعب" للانضمام مباشرة إلى السيرفر الخاص بك.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>اختيار السيرفر</Text>
        
        <View style={[styles.serverCard, styles.selectedServerCard]}>
          <View style={styles.serverHeader}>
            <Text style={styles.serverName}>{serverStatus.serverName}</Text>
            <Text style={styles.statusOnline}>متصل 🟢</Text>
          </View>

          <Text style={styles.serverIp}>
            {SERVER_IP}:{SERVER_PORT}
          </Text>

          <View style={styles.serverFooter}>
            <Text style={styles.playersText}>
              اللاعبين: {serverStatus.playersCount} / {serverStatus.maxPlayers}
            </Text>
            <TouchableOpacity style={styles.btnPlay} onPress={handlePlay}>
              <Text style={styles.btnPlayText}>▶ بدء اللعب</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12131C',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'right',
  },
  newsCard: {
    backgroundColor: '#1E202F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2D43',
  },
  newsTitle: {
    color: '#6B8AFD',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'right',
  },
  newsDescription: {
    color: '#A0A5BA',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  serverCard: {
    backgroundColor: '#1E202F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#2A2D43',
  },
  selectedServerCard: {
    borderColor: '#6B8AFD',
    backgroundColor: '#23263B',
  },
  serverHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serverName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusOnline: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serverIp: {
    color: '#8A8FAD',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'right',
  },
  serverFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  playersText: {
    color: '#A0A5BA',
    fontSize: 13,
  },
  btnPlay: {
    backgroundColor: '#6B8AFD',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnPlayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default GameScreen;
