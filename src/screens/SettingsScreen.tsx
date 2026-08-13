import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';

export const SettingsScreen = () => {
  const [nickname, setNickname] = useState('');
  const [winterMap, setWinterMap] = useState(false);
  const [improvedGraphics, setImprovedGraphics] = useState(false);
  const [showFps, setShowFps] = useState(false);
  const [androidKeyboard, setAndroidKeyboard] = useState(true);
  const [fpsLimit, setFpsLimit] = useState(60);
  const [chatLines, setChatLines] = useState(5);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>الإعدادات</Text>

        {/* أدخل الاسم */}
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

        {/* الخيارات والتفعيلات */}
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

        {/* شريط الـ FPS */}
        <View style={styles.sliderSection}>
          <Text style={styles.label}>معدل الإطارات (FPS في اللعبة): {fpsLimit}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={30}
            maximumValue={90}
            step={1}
            value={fpsLimit}
            onValueChange={setFpsLimit}
            minimumTrackTintColor="#6B8AFD"
            maximumTrackTintColor="#2A2D43"
            thumbTintColor="#6B8AFD"
          />
        </View>

        {/* شريط عدد أسطر الشات */}
        <View style={styles.sliderSection}>
          <Text style={styles.label}>عدد أسطر الدردشة: {chatLines}</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={4}
            maximumValue={15}
            step={1}
            value={chatLines}
            onValueChange={setChatLines}
            minimumTrackTintColor="#6B8AFD"
            maximumTrackTintColor="#2A2D43"
            thumbTintColor="#6B8AFD"
          />
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
  sliderSection: {
    marginVertical: 10,
  },
  versionText: {
    color: '#6C728E',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
  },
});

export default SettingsScreen;
