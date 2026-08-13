import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
  NativeModules,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';

// بيانات السيرفر الخاص بك من الهوست (LemeHost)
const MY_SERVER = {
  id: '1',
  name: 'Las Venturas RP', // اسم سيرفرك
  ip: '142.132.203.47',     // الأيبي الخاص بك
  port: 21299,             // البورت الخاص بك
  online: 'متصل 🟢',
  players: '12 / 100',      // يمكنك تعديلها أو ربطها بالاستعلام لاحقاً
};

const PACKAGE_NAME = 'com.touch.mobile.dark';

export const GameScreen = () => {
  const [selectedServer, setSelectedServer] = useState(MY_SERVER);

  // دالة حفظ إعدادات السيرفر والاتصال
  const handlePlay = async () => {
    try {
      // مسار ملف settings.ini الخاص بسامب
      const sampPath = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files/samp`;
      const settingsFilePath = `${sampPath}/settings.ini`;

      // إنشاء المجلد إذا لم يكن موجوداً
      if (!(await RNFS.exists(sampPath))) {
        await RNFS.mkdir(sampPath);
      }

      // كتابة بيانات الاتصال بالسيرفر
      const settingsContent = `[client]\nip=${selectedServer.ip}\nport=${selectedServer.port}\n`;
      await RNFS.writeFile(settingsFilePath, settingsContent, 'utf8');

      // تشغيل اللعبة (في حال وجود الناتيف موديول الخاص بالتشغيل)
      if (Platform.OS === 'android' && NativeModules.SAMPModule) {
        NativeModules.SAMPModule.launchGame();
      } else {
        Alert.alert(
          'تم حفظ البيانات!',
          `تم ضبط الاتصال بالسيرفر:\n${selectedServer.ip}:${selectedServer.port}\n\nيمكنك الآن فتح اللعبة.`
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'تعذر حفظ بيانات الاتصال بالسيرفر.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* قسم أخبار المشروع */}
        <Text style={styles.sectionTitle}>أخبار المشروع</Text>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>🔥 افتتاح السيرفر الرسمي!</Text>
          <Text style={styles.newsDescription}>
            أهلاً بكم في سيرفرنا الجديد على LemeHost. انضموا إلينا الآن واستمتعوا بتجربة لعب فريدة!
          </Text>
        </View>

        {/* قسم اختيار السيرفر */}
        <Text style={styles.sectionTitle}>اختيار السيرفر</Text>
        
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.serverCard,
            selectedServer.id === MY_SERVER.id && styles.selectedServerCard,
          ]}
          onPress={() => setSelectedServer(MY_SERVER)}
        >
          <View style={styles.serverHeader}>
            <Text style={styles.serverName}>{MY_SERVER.name}</Text>
            <Text style={styles.serverStatus}>{MY_SERVER.online}</Text>
          </View>

          <Text style={styles.serverIp}>
            {MY_SERVER.ip}:{MY_SERVER.port}
          </Text>

          <View style={styles.serverFooter}>
            <Text style={styles.playersText}>اللاعبين: {MY_SERVER.players}</Text>
            <TouchableOpacity style={styles.btnPlay} onPress={handlePlay}>
              <Text style={styles.btnPlayText}>▶ بدء اللعب</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

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
    marginTop: 5,
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
  serverStatus: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serverIp: {
    color: '#8A8FAD',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
