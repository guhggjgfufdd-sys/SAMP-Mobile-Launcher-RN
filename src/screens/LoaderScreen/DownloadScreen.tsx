import React, { useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
// تصحيح مسار الـ import المسبب لخطأ الـ Build
import { fetchStartDownload } from '../../thunks/loaderThunks';

export const DownloadScreen = () => {
  const dispatch = useDispatch();

  // جلب بيانات التحميل من الريدكس
  const { currentBytes, needBytes, fileName } = useSelector((state: any) => state.loader.download);

  useEffect(() => {
    const initDownload = async () => {
      // 1. طلب صلاحية الإشعارات للأندرويد 13+ أولاً قبل بدء التحميل
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
        } catch (error) {
          console.log('Permission error:', error);
        }
      }

      // 2. بدء التحميل بعد استقرار الشاشة والصلاحيات
      dispatch(fetchStartDownload() as any);
    };

    initDownload();
  }, [dispatch]);

  // حساب النسبة المئوية
  const progressPercent = needBytes > 0 
    ? Math.min(100, Math.floor((currentBytes / needBytes) * 100)) 
    : 0;

  const currentMB = (currentBytes / (1024 * 1024)).toFixed(2);
  const totalMB = (needBytes / (1024 * 1024)).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>جاري التحميل...</Text>

      <Text style={styles.fileDetails}>
        {fileName} ({currentMB} MB / {totalMB} MB)
      </Text>

      {/* شريط التقدم */}
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
    backgroundColor: '#111',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fileDetails: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '80%',
    height: 12,
    backgroundColor: '#333',
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
