import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  NativeModules,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const { GtaSetupModule } = NativeModules;

// ====== غيّر هذي القيم حسب سيرفرك ======
const SERVER_IP = '142.132.203.47';
const SERVER_PORT = '21299';

const GameScreen: React.FC = () => {
  const route = useRoute<any>();
  const username = route.params?.username || 'لاعب';

  const [serverStatus, setServerStatus] = useState({
    serverName: 'Las Venturas RP',
    playersCount: 0,
    maxPlayers: 100,
  });

  const handlePlay = async () => {
    try {
      if (GtaSetupModule) {
        if (typeof GtaSetupModule.launchGame === 'function') {
          GtaSetupModule.launchGame();
        } else if (typeof GtaSetupModule.startGame === 'function') {
          GtaSetupModule.startGame();
        } else {
          const functionsList = Object.keys(GtaSetupModule).join(', ');
          Alert.alert(
            'معلومات الموبيل',
            `متصل بنجاح! الدوال المتاحة داخل هي GtaSetupModule:\n${functionsList}`
          );
        }
      } else {
        Alert.alert(
          'خطأ',
          'لم يتم التعرف على GtaSetupModule. تأكد من إعادة بناء التطبيق (Rebuild) بعد الحفظ.'
        );
      }
    } catch (error) {
      Alert.alert('خطأ', 'تعذر كتابة ملف الإعدادات في مجلد اللعبة.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <Text style={styles.welcomeText}>مرحباً {username}</Text>

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
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'right',
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
