import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Switch, TouchableOpacity,
  StyleSheet, ScrollView, Alert, SafeAreaView,
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
  const [compatMode, setCompatMode] = useState(false);
  const [reduceGfx, setReduceGfx] = useState(false);
  const [gpuRenderer, setGpuRenderer] = useState('default');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const n = await AsyncStorage.getItem('@samp_nickname');
      const r = await AsyncStorage.getItem('@samp_gpu_renderer');
      const c = await AsyncStorage.getItem('@samp_compat_mode');
      const g = await AsyncStorage.getItem('@samp_reduce_graphics');
      const f = await AsyncStorage.getItem('@samp_fps_limit');
      const l = await AsyncStorage.getItem('@samp_chat_lines');
      const w = await AsyncStorage.getItem('@samp_winter_map');
      const e = await AsyncStorage.getItem('@samp_enhanced_graphics');
      const p = await AsyncStorage.getItem('@samp_fps_counter');
      const k = await AsyncStorage.getItem('@samp_android_keyboard');

      if (n !== null) setNickname(n);
      if (r !== null) setGpuRenderer(r);
      if (c !== null) setCompatMode(c === 'true');
      if (g !== null) setReduceGfx(g === 'true');
      if (f !== null) setFpsLimit(parseInt(f) || 60);
      if (l !== null) setChatLines(parseInt(l) || 5);
      if (w !== null) setWinterMap(w === 'true');
      if (e !== null) setEnhancedGraphics(e === 'true');
      if (p !== null) setFpsCounter(p === 'true');
      if (k !== null) setAndroidKeyboard(k === 'true');
    } catch (e) { console.error(e); }
    finally { setReady(true); }
  };

  const save = async (key, value) => {
    try { await AsyncStorage.setItem(key, String(value)); } catch (e) {}
  };

  const onNickChange = (t) => { setNickname(t); save('@samp_nickname', t); };
  const onEnhanced = (v) => {
    setEnhancedGraphics(v); save('@samp_enhanced_graphics', v);
    if (v) Alert.alert('تنبيه', 'الجرافيك المحسن ممكن يسبب طرد.', [{ text: 'فهمت' }]);
  };
  const applyFixes = () => {
    setFpsLimit(30); setChatLines(3); setEnhancedGraphics(false); setWinterMap(false);
    save('@samp_fps_limit', 30); save('@samp_chat_lines', 3);
    save('@samp_enhanced_graphics', false); save('@samp_winter_map', false);
    Alert.alert('تم', 'تم تطبيق إعدادات الحماية');
  };

  if (!ready) {
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>الإعدادات</Text>

        <Text style={styles.label}>الاسم في اللعبة (NickName)</Text>
        <TextInput style={styles.input} placeholder="مثال: Don_Corleone" placeholderTextColor="#666"
          value={nickname} onChangeText={onNickChange} autoCapitalize="none" />

        <Row label="خريطة الشتاء" val={winterMap} set={(v) => { setWinterMap(v); save('@samp_winter_map', v); }} />
        <Row label="الجرافيك المحسن" val={enhancedGraphics} set={onEnhanced} />
        <Row label="عداد الـ FPS" val={fpsCounter} set={(v) => { setFpsCounter(v); save('@samp_fps_counter', v); }} />
        <Row label="لوحة مفاتيح أندرويد" val={androidKeyboard} set={(v) => { setAndroidKeyboard(v); save('@samp_android_keyboard', v); }} />

        <View style={styles.divider} />

        <Counter label="معدل الإطارات (FPS)" val={fpsLimit}
          inc={() => { const v = Math.min(fpsLimit + 5, 120); setFpsLimit(v); save('@samp_fps_limit', v); }}
          dec={() => { const v = Math.max(fpsLimit - 5, 20); setFpsLimit(v); save('@samp_fps_limit', v); }} />

        <Counter label="عدد أسطر الدردشة" val={chatLines}
          inc={() => { const v = Math.min(chatLines + 1, 10); setChatLines(v); save('@samp_chat_lines', v); }}
          dec={() => { const v = Math.max(chatLines - 1, 1); setChatLines(v); save('@samp_chat_lines', v); }} />

        <View style={styles.divider} />

        <Text style={styles.section}>⚡ حلول الشاشة السوداء والطرد</Text>

        <Row label="وضع التوافق (منع الطرد)" val={compatMode} set={(v) => { setCompatMode(v); save('@samp_compat_mode', v); }} />
        <Row label="تقليل الجرافيكس تلقائياً" val={reduceGfx} set={(v) => { setReduceGfx(v); save('@samp_reduce_graphics', v); if (v) applyFixes(); }} />

        <Text style={styles.label}>محرك الرسوميات (GPU):</Text>
        <View style={styles.gpuBox}>
          {['default', 'opengl', 'vulkan'].map((r) => (
            <TouchableOpacity key={r} style={[styles.gpuBtn, gpuRenderer === r && styles.gpuBtnOn]}
              onPress={() => { setGpuRenderer(r); save('@samp_gpu_renderer', r); }}>
              <Text style={gpuRenderer === r ? styles.gpuTxtOn : styles.gpuTxt}>
                {r === 'default' ? 'تلقائي' : r === 'opengl' ? 'OpenGL ES' : 'Vulkan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 نصائح لمنع الطرد:</Text>
          <Text style={styles.tip}>• اطفئ "الجرافيك المحسن"</Text>
          <Text style={styles.tip}>• خفف FPS لـ 30</Text>
          <Text style={styles.tip}>• شغّل "وضع التوافق"</Text>
          <Text style={styles.tip}>• اختر GPU "OpenGL ES"</Text>
          <Text style={styles.tip}>• تأكد من ملف OBB موجود</Text>
        </View>

        <Text style={styles.version}>الإصدار 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, val, set }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Switch value={val} onValueChange={set} trackColor={{ false: '#333', true: '#4A90D9' }} thumbColor={val ? '#fff' : '#f4f3f4'} />
  </View>
);

const Counter = ({ label, val, inc, dec }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}: {val}</Text>
    <View style={styles.counter}>
      <TouchableOpacity style={styles.btn} onPress={inc}><Text style={styles.btnText}>+</Text></TouchableOpacity>
      <Text style={styles.btnVal}>{val}</Text>
      <TouchableOpacity style={styles.btn} onPress={dec}><Text style={styles.btnText}>-</Text></TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { padding: 20, paddingBottom: 50 },
  header: { fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  section: { fontSize: 18, color: '#4A90D9', marginVertical: 10, fontWeight: 'bold' },
  label: { color: '#fff', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: '#16213e', color: '#fff', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20, textAlign: 'right' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 15 },
  counter: { flexDirection: 'row', alignItems: 'center' },
  btn: { backgroundColor: '#4A90D9', width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  btnVal: { color: '#fff', fontSize: 18, width: 40, textAlign: 'center' },
  gpuBox: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  gpuBtn: { backgroundColor: '#16213e', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  gpuBtnOn: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  gpuTxt: { color: '#aaa' },
  gpuTxtOn: { color: '#fff', fontWeight: 'bold' },
  tipBox: { backgroundColor: '#16213e', borderRadius: 12, padding: 15, marginTop: 15, borderWidth: 1, borderColor: '#333' },
  tipTitle: { color: '#4A90D9', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  tip: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  version: { color: '#555', textAlign: 'center', marginTop: 30, marginBottom: 20 },
});

export default SettingsScreen;
