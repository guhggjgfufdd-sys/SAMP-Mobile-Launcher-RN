import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [nickname, setNickname] = useState('');
  const [winterMap, setWinterMap] = useState(false);
  const [enhancedGraphics, setEnhancedGraphics] = useState(false);
  const [fpsCounter, setFpsCounter] = useState(false);
  const [androidKeyboard, setAndroidKeyboard] = useState(true);
  const [fpsLimit, setFpsLimit] = useState(60);
  const [chatLines, setChatLines] = useState(5);
  const [compatibilityMode, setCompatibilityMode] = useState(false);
  const [reduceGraphics, setReduceGraphics] = useState(false);
  const [gpuRenderer, setGpuRenderer] = useState('default');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNick = await AsyncStorage.getItem('@samp_nickname');
      const savedRenderer = await AsyncStorage.getItem('@samp_gpu_renderer');
      const savedCompat = await AsyncStorage.getItem('@samp_compat_mode');
      const savedReduce = await AsyncStorage.getItem('@samp_reduce_graphics');
      const savedFps = await AsyncStorage.getItem('@samp_fps_limit');
      const savedChat = await AsyncStorage.getItem('@samp_chat_lines');
      const savedWinter = await AsyncStorage.getItem('@samp_winter_map');
      const savedEnhanced = await AsyncStorage.getItem('@samp_enhanced_graphics');
      const savedFpsCounter = await AsyncStorage.getItem('@samp_fps_counter');
      const savedKeyboard = await AsyncStorage.getItem('@samp_android_keyboard');

      if (savedNick !== null) setNickname(savedNick);
      if (savedRenderer !== null) setGpuRenderer(savedRenderer);
      if (savedCompat !== null) setCompatibilityMode(savedCompat === 'true');
      if (savedReduce !== null) setReduceGraphics(savedReduce === 'true');
      if (savedFps !== null) setFpsLimit(parseInt(savedFps) || 60);
      if (savedChat !== null) setChatLines(parseInt(savedChat) || 5);
      if (savedWinter !== null) setWinterMap(savedWinter === 'true');
      if (savedEnhanced !== null) setEnhancedGraphics(savedEnhanced === 'true');
      if (savedFpsCounter !== null) setFpsCounter(savedFpsCounter === 'true');
      if (savedKeyboard !== null) setAndroidKeyboard(savedKeyboard === 'true');
    } catch (e) {
      console.error('Load settings error:', e);
    } finally {
      setLoaded(true);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  const handleNicknameChange = (text) => {
    setNickname(text);
    saveSetting('@samp_nickname', text);
  };

  const toggleEnhancedGraphics = (value) => {
    setEnhancedGraphics(value);
    saveSetting('@samp_enhanced_graphics', value);
    if (value) {
      Alert.alert(
        'تنبيه',
        'تفعيل الجرافيك المحسن ممكن يسبب طرد من السيرفر في بعض الأجهزة.',
        [{ text: 'فهمت' }]
      );
    }
  };

  const applyFixes = () => {
    setFpsLimit(30);
    setChatLines(3);
    setEnhancedGraphics(false);
    setWinterMap(false);
    saveSetting('@samp_fps_limit', '30');
    saveSetting('@samp_chat_lines', '3');
    saveSetting('@samp_enhanced_graphics', 'false');
    saveSetting('@samp_winter_map', 'false');
    Alert.alert('تم', 'تم تطبيق إعدادات الحماية من الشاشة السوداء والطرد');
  };

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>الإعدادات</Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888' }}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.header}>الإعدادات</Text>

        {/* الاسم */}
        <Text style={styles.label}>الاسم في اللعبة (NickName)</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: Don_Corleone"
          placeholderTextColor="#666"
          value={nickname}
          onChangeText={handleNicknameChange}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* الخيارات الأساسية */}
        <SettingRow label="خريطة الشتاء" value={winterMap} onToggle={(v) => { setWinterMap(v); saveSetting('@samp_winter_map', v); }} />
        <SettingRow label="الجرافيك المحسن" value={enhancedGraphics} onToggle={toggleEnhancedGraphics} />
        <SettingRow label="عداد الـ FPS" value={fpsCounter} onToggle={(v) => { setFpsCounter(v); saveSetting('@samp_fps_counter', v); }} />
        <SettingRow label="لوحة مفاتيح أندرويد" value={androidKeyboard} onToggle={(v) => { setAndroidKeyboard(v); saveSetting('@samp_android_keyboard', v); }} />

        <View style={styles.divider} />

        {/* FPS Limit */}
        <View style={styles.row}>
          <Text style={styles.label}>معدل الإطارات (FPS): {fpsLimit}</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => { const v = Math.min(fpsLimit + 5, 120); setFpsLimit(v); saveSetting('@samp_fps_limit', v); }}
            >
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.counterText}>{fpsLimit}</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => { const v = Math.max(fpsLimit - 5, 20); setFpsLimit(v); saveSetting('@samp_fps_limit', v); }}
            >
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Lines */}
        <View style={styles.row}>
          <Text style={styles.label}>عدد أسطر الدردشة: {chatLines}</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => { const v = Math.min(chatLines + 1, 10); setChatLines(v); saveSetting('@samp_chat_lines', v); }}
            >
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.counterText}>{chatLines}</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => { const v = Math.max(chatLines - 1, 1); setChatLines(v); saveSetting('@samp_chat_lines', v); }}
            >
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* حلول الشاشة السوداء */}
        <Text style={styles.sectionTitle}>⚡ حلول الشاشة السوداء والطرد</Text>

        <SettingRow
          label="وضع التوافق (منع الطرد)"
          value={compatibilityMode}
          onToggle={(v) => { setCompatibilityMode(v); saveSetting('@samp_compat_mode', v); }}
        />

        <SettingRow
          label="تقليل الجرافيكس تلقائياً"
          value={reduceGraphics}
          onToggle={(v) => {
            setReduceGraphics(v);
            saveSetting('@samp_reduce_graphics', v);
            if (v) applyFixes();
          }}
        />

        {/* GPU Renderer */}
        <Text style={styles.label}>محرك الرسوميات (GPU):</Text>
        <View style={styles.rendererContainer}>
          {['default', 'opengl', 'vulkan'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.rendererBtn,
                gpuRenderer === r && styles.rendererBtnActive
              ]}
              onPress={() => { setGpuRenderer(r); saveSetting('@samp_gpu_renderer', r); }}
            >
              <Text style={gpuRenderer === r ? styles.rendererTextActive : styles.rendererText}>
                {r === 'default' ? 'تلقائي' : r === 'opengl' ? 'OpenGL ES' : 'Vulkan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* نصائح */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 نصائح لمنع الطرد:</Text>
          <Text style={styles.tipText}>• اطفئ "الجرافيك المحسن"</Text>
          <Text style={styles.tipText}>• خفّف FPS لـ 30</Text>
          <Text style={styles.tipText}>• شغّل "وضع التوافق"</Text>
          <Text style={styles.tipText}>• اختر GPU "OpenGL ES"</Text>
          <Text style={styles.tipText}>• امسح كاش اللعبة من إعدادات الجهاز</Text>
        </View>

        <Text style={styles.version}>الإصدار 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingRow = ({ label, value, onToggle }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#333', true: '#4A90D9' }}
      thumbColor={value ? '#fff' : '#f4f3f4'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#4A90D9',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#4A90D9',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterText: {
    color: '#fff',
    fontSize: 18,
    width: 40,
    textAlign: 'center',
  },
  rendererContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  rendererBtn: {
    backgroundColor: '#16213e',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  rendererBtnActive: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
  },
  rendererText: {
    color: '#aaa',
  },
  rendererTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tipBox: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipTitle: {
    color: '#4A90D9',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
  },
  version: {
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
});

export default SettingsScreen;
