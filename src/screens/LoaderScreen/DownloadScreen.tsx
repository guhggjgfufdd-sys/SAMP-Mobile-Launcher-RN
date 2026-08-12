import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStartDownload } from '../../thunks/loaderThunks';

export const DownloadScreen = () => {
  const dispatch = useDispatch();

  // 🛡️ حماية ضد الشاشة البيضاء: استخدام Optional Chaining وقيم افتراضية
  const downloadState = useSelector((state: any) => state?.loader?.download) || {};
  const currentBytes = Number(downloadState?.currentBytes || 0);
  const needBytes = Number(downloadState?.needBytes || 0);
  const fileName = downloadState?.fileName || '2.11.gtasa.zip';

  // تشغيل دالة التنزيل بأمان عند فتح الشاشة
  useEffect(() => {
    try {
      dispatch(fetchStartDownload() as any);
    } catch (error) {
      console.log('Download start error:', error);
    }
  }, [dispatch]);

  // حساب النسبة المئوية
  const progressPercent = needBytes > 0 
    ? Math.min(100, Math.floor((currentBytes / needBytes) * 100)) 
    : 0;

  const currentMB = (currentBytes / (1024 * 1024)).toFixed(2);
  const totalMB = (needBytes / (1024 * 1024)).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>جاري تحميل اللعبة...</Text>
      
      <Text style={styles.fileDetails}>
        {fileName} - {currentMB} MB / {totalMB} MB
      </Text>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <Text style={styles.percentText}>{progressPercent}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fileDetails: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '80%',
    height: 12,
    backgroundColor: '#333333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  percentText: {
    color: '#2196F3',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
});

export default DownloadScreen;
