import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const SETTINGS_KEY = '@samp_launcher_settings';
const CACHE_CLEARED_KEY = '@samp_cache_cleared';

interface Settings {
  lowGraphics: boolean;
  hideHeadshot: boolean;
  darkMode: boolean;
  soundEnabled: boolean;
  playerName: string;
  language: string;
}

const DEFAULT_SETTINGS: Settings = {
  lowGraphics: false,
  hideHeadshot: false,
  darkMode: true,
  soundEnabled: true,
  playerName: '',
  language: 'ar',
};

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // تحميل الإعدادات من AsyncStorage مع حماية كاملة
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      
      if (stored !== null && stored !== '') {
        try {
          const parsed = JSON.parse(stored);
          // نتأكد أن كل القيم موجودة
          setSettings({
            lowGraphics: parsed.lowGraphics ?? DEFAULT_SETTINGS.lowGraphics,
            hideHeadshot: parsed.hideHeadshot ?? DEFAULT_SETTINGS.hideHeadshot,
            darkMode: parsed.darkMode ?? DEFAULT_SETTINGS.darkMode,
            soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
            playerName: parsed.playerName ?? DEFAULT_SETTINGS.playerName,
            language: parsed.language ?? DEFAULT_SETTINGS.language,
          });
        } catch (parseError) {
          console.error('Error parsing settings:', parseError);
          // إذا كان الملف تالف نرجع للافتراضي
          setSettings(DEFAULT_SETTINGS);
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        }
      } else {
        // أول مرة يفتح التطبيق
        setSettings(DEFAULT_SETTINGS);
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  // حفظ الإعدادات
  const saveSettings = async (newSettings: Settings) => {
    try {
      setSaving(true);
      setSettings(newSettings);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('خطأ', 'فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof Settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    saveSettings(updated);
  };

  const clearCache = async () => {
    Alert.alert(
      'مسح الكاش',
      'هل أنت متأكد أنك تريد مسح ذاكرة التخزين المؤقت؟ ستحتاج لإعادة التحميل.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          style: 'destructive',
          onPress: async () => {
            try {
              // نمسح كل الكاش ما عدا الإعدادات
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter(k => k !== SETTINGS_KEY);
              if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
              }
              
              await AsyncStorage.setItem(CACHE_CLEARED_KEY, 'true');
              
              if (Platform.OS === 'android') {
                ToastAndroid.show('تم مسح الكاش بنجاح', ToastAndroid.SHORT);
              }
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('خطأ', 'فشل في مسح الكاش');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الإعدادات</Text>
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
        <Text style={styles.headerTitle}>الإعدادات</Text>
        {saving && <ActivityIndicator size="small" color="#5b8def" style={styles.savingIndicator} />}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* إعدادات الرسوميات */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الرسوميات والأداء</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>تقليل الجرافيكس</Text>
              <Text style={styles.settingDesc}>يقلل الجودة لتحسين الأداء</Text>
            </View>
            <Switch
              value={settings.lowGraphics}
              onValueChange={() => toggleSetting('lowGraphics')}
              trackColor={{ false: '#374151', true: '#5b8def' }}
              thumbColor={settings.lowGraphics ? '#ffffff' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>إخفاء الهيد شوت</Text>
              <Text style={styles.settingDesc}>إخفاء تأثيرات الرأس</Text>
            </View>
            <Switch
              value={settings.hideHeadshot}
              onValueChange={() => toggleSetting('hideHeadshot')}
              trackColor={{ false: '#374151', true: '#5b8def' }}
              thumbColor={settings.hideHeadshot ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* إعدادات الصوت والوضع */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الصوت والعرض</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>الوضع الليلي</Text>
              <Text style={styles.settingDesc}>تفعيل الثيم الداكن</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={() => toggleSetting('darkMode')}
              trackColor={{ false: '#374151', true: '#5b8def' }}
              thumbColor={settings.darkMode ? '#ffffff' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>تفعيل الصوت</Text>
              <Text style={styles.settingDesc}>تشغيل المؤثرات الصوتية</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={() => toggleSetting('soundEnabled')}
              trackColor={{ false: '#374151', true: '#5b8def' }}
              thumbColor={settings.soundEnabled ? '#ffffff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* إعدادات متقدمة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>متقدم</Text>
          
          <TouchableOpacity style={styles.buttonItem} onPress={clearCache}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>مسح ذاكرة التخزين المؤقت</Text>
              <Text style={styles.settingDesc}>سيتم حذف ملفات الكاش وإعادة التحميل</Text>
            </View>
            <Text style={styles.buttonText}>مسح</Text>
          </TouchableOpacity>
        </View>

        {/* معلومات */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SAMP Mobile Launcher v1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#0b0c10',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1c23',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'right',
  },
  savingIndicator: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1c23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2d36',
  },
  settingInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'right',
  },
  settingDesc: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  buttonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1c23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2d36',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5b8def',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default SettingsScreen;
