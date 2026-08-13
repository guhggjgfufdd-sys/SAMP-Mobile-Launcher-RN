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

// بيانات سيرفرك (تم ضبط الحالة للوضع الحقيقي للسيرفر)
const MY_SERVER = {
  id: '1',
  name: 'Las Venturas RP',
  ip: '142.132.203.47',
  port: 21299,
  isOnline: false, // متوقف حالياً على LemeHost
  playersCount: 0,
  maxPlayers: 100,
};

const PACKAGE_NAME = 'com.touch.mobile.dark';

export const GameScreen = () => {
  const [selectedServer] = useState(MY_SERVER);

  const handlePlay = async () => {
    try {
      // 1. كتابة بيانات السيرفر في ملف settings.ini
      const sampPath = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/samp`;
      const settingsFilePath = `${sampPath}/settings.ini`;

      if (!(await RNFS.exists(sampPath))) {
        await RNFS.mkdir(sampPath);
      }

      const settingsContent = `[client]\nip=${selectedServer.ip}\nport=${selectedServer.port}\n`;
      await RNFS.writeFile(settingsFilePath, settingsContent, 'utf8');

      // 2. تشغيل اللعبة فوراً عبر Native Module
      if (Platform.OS === 'android' && NativeModules.SAMPModule) {
        NativeModules.SAMPModule.launchGame();
      } else {
        Alert.alert(
          'تم حفظ الإعدادات',
          'تم حفظ أيبي السيرفر بنجاح في ملفات اللعبة. يمكنك الآن فتح اللعبة من اللانشر.'
        );
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدثت مشكلة أثناء كتابة ملفات الاتصال.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.sectionTitle}>أخبار المشروع</Text>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>🔥 افتتاح السيرفر الرسمي!</Text>
          <Text style={styles.newsDescription}>
            أهلاً بكم في سيرفرنا الجديد على LemeHost. انضموا إلينا الآن واستمتعوا بتجربة لعب فريدة!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>اختيار السيرفر</Text>
        
        <View style={[styles.serverCard, styles.selectedServerCard]}>
          <View style={styles.serverHeader}>
            <Text style={styles.serverName}>{MY_SERVER.name}</Text>
            {/* إظهار حالة السيرفر الحقيقية */}
            <Text style={MY_SERVER.isOnline ? styles.statusOnline : styles.statusOffline}>
              {MY_SERVER.isOnline ? 'متصل 🟢' : 'غير متصل 🔴'}
            </Text>
          </View>

          <Text style={styles.serverIp}>
            {MY_SERVER.ip}:{MY_SERVER.port}
          </Text>

          <View style={styles.serverFooter}>
            <Text style={styles.playersText}>
              اللاعبين: {MY_SERVER.playersCount} / {MY_SERVER.maxPlayers}
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
  statusOffline: {
    color: '#F44336',
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
