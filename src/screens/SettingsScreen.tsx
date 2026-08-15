import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Switch, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
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

  useEffect(() => {
    (async () => {
      try {
        const n = await AsyncStorage.getItem('@samp_nickname');
        if (n !== null) setNickname(n);
      } catch (e) {}
    })();
  }, []);

  const save = async (key, value) => {
    try { await AsyncStorage.setItem(key, String(value)); } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.header}>الإعدادات</Text>

        <Text style={styles.label}>الاسم في اللعبة</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: Don_Corleone"
          placeholderTextColor="#666"
          value={nickname}
          onChangeText={(t) => { setNickname(t); save('@samp_nickname', t); }}
          autoCapitalize="none"
        />

        <Row label="خريطة الشتاء" val={winterMap} set={(v) => { setWinterMap(v); save('@samp_winter_map', v); }} />
        <Row label="الجرافيك المحسن" val={enhancedGraphics} set={(v) => { setEnhancedGraphics(v); save('@samp_enhanced_graphics', v); }} />
        <Row label="عداد الـ FPS" val={fpsCounter} set={(v) => { setFpsCounter(v); save('@samp_fps_counter', v); }} />
        <Row label="لوحة مفاتيح أندرويد" val={androidKeyboard} set={(v) => { setAndroidKeyboard(v); save('@samp_android_keyboard', v); }} />

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>FPS: {fpsLimit}</Text>
          <View style={styles.counter}>
            <TouchableOpacity style={styles.btn} onPress={() => { const v = Math.min(fpsLimit + 5, 120); setFpsLimit(v); save('@samp_fps_limit', v); }}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.val}>{fpsLimit}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => { const v = Math.max(fpsLimit - 5, 20); setFpsLimit(v); save('@samp_fps_limit', v); }}>
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>أسطر الدردشة: {chatLines}</Text>
          <View style={styles.counter}>
            <TouchableOpacity style={styles.btn} onPress={() => { const v = Math.min(chatLines + 1, 10); setChatLines(v); save('@samp_chat_lines', v); }}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.val}>{chatLines}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => { const v = Math.max(chatLines - 1, 1); setChatLines(v); save('@samp_chat_lines', v); }}>
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.section}>⚡ حلول الشاشة السوداء</Text>

        <Row label="وضع التوافق" val={compatMode} set={(v) => { setCompatMode(v); save('@samp_compat_mode', v); }} />
        <Row label="تقليل الجرافيكس" val={reduceGfx} set={(v) => { setReduceGfx(v); save('@samp_reduce_graphics', v); }} />

        <Text style={styles.label}>محرك الرسوميات:</Text>
        <View style={styles.gpuBox}>
          {['default', 'opengl', 'vulkan'].map((r) => (
            <TouchableOpacity key={r} style={[styles.gpuBtn, gpuRenderer === r && styles.gpuOn]}
              onPress={() => { setGpuRenderer(r); save('@samp_gpu_renderer', r); }}>
              <Text style={gpuRenderer === r ? styles.gpuTxtOn : styles.gpuTxt}>
                {r === 'default' ? 'تلقائي' : r === 'opengl' ? 'OpenGL' : 'Vulkan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tip}>
          <Text style={{ color: '#4A90D9', fontWeight: 'bold' }}>💡 نصائح:</Text>
          <Text style={styles.tipTxt}>• اطفئ الجرافيك المحسن</Text>
          <Text style={styles.tipTxt}>• خفف FPS لـ 30</Text>
          <Text style={styles.tipTxt}>• شغل وضع التوافق</Text>
          <Text style={styles.tipTxt}>• اختر OpenGL</Text>
        </View>

        <Text style={styles.ver}>v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const Row = ({ label, val, set }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Switch value={val} onValueChange={set} trackColor={{ false: '#333', true: '#4A90D9' }} thumbColor={val ? '#fff' : '#f4f3f4'} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { flex: 1, padding: 20 },
  header: { fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  section: { fontSize: 18, color: '#4A90D9', marginVertical: 10, fontWeight: 'bold' },
  label: { color: '#fff', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: '#16213e', color: '#fff', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20, textAlign: 'right' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 15 },
  counter: { flexDirection: 'row', alignItems: 'center' },
  btn: { backgroundColor: '#4A90D9', width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  val: { color: '#fff', fontSize: 18, width: 40, textAlign: 'center' },
  gpuBox: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  gpuBtn: { backgroundColor: '#16213e', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  gpuOn: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  gpuTxt: { color: '#aaa' },
  gpuTxtOn: { color: '#fff', fontWeight: 'bold' },
  tip: { backgroundColor: '#16213e', borderRadius: 12, padding: 15, marginTop: 15 },
  tipTxt: { color: '#aaa', fontSize: 13, marginTop: 4 },
  ver: { color: '#555', textAlign: 'center', marginTop: 30, marginBottom: 20 },
});

export default SettingsScreen;
