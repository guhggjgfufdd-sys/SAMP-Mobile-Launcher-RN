import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export const SettingsScreen = () => {
  const [nickname, setNickname] = useState('');
  const [winterMap, setWinterMap] = useState(false);
  const [improvedGraphics, setImprovedGraphics] = useState(false);
  const [showFps, setShowFps] = useState(false);
  const [androidKeyboard, setAndroidKeyboard] = useState(true);
  const [fpsLimit, setFpsLimit] = useState(60);
  const [chatLines, setChatLines] = useState(5);

  // التحكم في الـ FPS
  const increaseFps = () => setFpsLimit(prev => Math.min(prev + 5, 90));
  const decreaseFps = () => setFpsLimit(prev => Math.max(prev - 5, 30));

  // التحكم في أسطر الدردشة
  const increaseLines = () => setChatLines(prev => Math.min(prev + 1, 15));
  const decreaseLines = () => setChatLines(prev => Math.max(prev - 1, 3));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>الإعدادات</Text>

        {/* إدخال اسم اللاعب */}
        <View style={styles.section}>
          <Text style={styles.label}>الاسم في اللعبة (NickName)</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: Don_Corleone"
            placeholderTextColor="#6C728E"
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        {/* المفاتيح والخيارات */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>خريطة الشتاء</Text>
          <Switch
            value={winterMap}
            onValueChange={setWinterMap}
            thumbColor={winterMap ? '#6B8AFD' : '#f4f3f4'}
            trackColor={{ false: '#2A2D43', true: '#3D53A0' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>الجرافيك المحسن</Text>
          <Switch
            value={improvedGraphics}
            onValueChange={setImprovedGraphics}
            thumbColor={improvedGraphics ? '#6B8AFD' : '#f4f3f4'}
            trackColor={{ false: '#2A2D43', true: '#3D53A0' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>عداد الـ FPS</Text>
          <Switch
            value={showFps}
            onValueChange={setShowFps}
            thumbColor={showFps ? '#6B8AFD' : '#f4f3f4'}
            trackColor={{ false: '#2A2D43', true: '#3D53A0' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>لوحة مفاتيح أندرويد</Text>
          <Switch
            value={androidKeyboard}
            onValueChange={setAndroidKeyboard}
            thumbColor={androidKeyboard ? '#6B8AFD' : '#f4f3f4'}
            trackColor={{ false: '#2A2D43', true: '#3D53A0' }}
          />
        </View>

        <View style={styles.divider} />

        {/* أزرار زيادة ونقصان الـ FPS */}
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>معدل الإطارات (FPS): {fpsLimit}</Text>
          <View style={styles.btnGroup}>
            <TouchableOpacity style={styles.btnCounter} onPress={decreaseFps}>
              <Text style={styles.btnCounterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{fpsLimit}</Text>
            <TouchableOpacity style={styles.btnCounter} onPress={increaseFps}>
              <Text style={styles.btnCounterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* أزرار زيادة ونقصان أسطر الدردشة */}
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>عدد أسطر الدردشة: {chatLines}</Text>
          <View style={styles.btnGroup}>
            <TouchableOpacity style={styles.btnCounter} onPress={decreaseLines}>
              <Text style={styles.btnCounterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{chatLines}</Text>
            <TouchableOpacity style={styles.btnCounter} onPress={increaseLines}>
              <Text style={styles.btnCounterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.versionText}>الإصدار 1.0.0</Text>
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: '#A0A5BA',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#1E202F',
    borderRadius: 10,
    padding: 14,
    color: '#FFFFFF',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#2A2D43',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2D43',
    marginVertical: 15,
  },
  controlRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  controlLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E202F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2D43',
  },
  btnCounter: {
    backgroundColor: '#6B8AFD',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnCounterText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterValue: {
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  versionText: {
    color: '#6C728E',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
  },
});

export default SettingsScreen;
