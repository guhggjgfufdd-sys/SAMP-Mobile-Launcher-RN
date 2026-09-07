import React, { useEffect, useRef, useState } from 'react';
    import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
    import RNFS from 'react-native-fs';
    import { unzip } from 'react-native-zip-archive';

    const SERVER_NAME = 'Las Venturas RP';
    const SERVERS_SCREEN = 'Mode';
    const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';
    const EXPECTED_BYTES = 580871052;
    const TARGET_PATH = RNFS.ExternalDirectoryPath || RNFS.DocumentDirectoryPath;
    const ZIP_FILE_PATH = `${TARGET_PATH}/gtasa_cache.zip`;
    const READY_FLAG = `${TARGET_PATH}/.lv-cache-2.11.ready`;

    export const DownloadScreen = ({ navigation }: any) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('جاري التهيئة...');
    const [mbText, setMbText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const isInitialized = useRef(false);

    useEffect(() => {
      if (isInitialized.current) return;
      isInitialized.current = true;
      void initApp();
    }, []);

    const navigateToServers = () => {
      navigation.reset({ index: 0, routes: [{ name: SERVERS_SCREEN }] });
    };

    const checkCacheExists = async () => {
      try {
        return await RNFS.exists(READY_FLAG) || await RNFS.exists(`${TARGET_PATH}/texdb`);
      } catch {
        return false;
      }
    };

    const initApp = async () => {
      setIsError(false);
      setIsLoading(true);
      setStatusText('جاري فحص ملفات Las Venturas RP...');
      if (await checkCacheExists()) {
        setStatusText('الملفات جاهزة، جاري فتح السيرفرات...');
        setProgress(1);
        setTimeout(navigateToServers, 500);
        return;
      }
      await startDownload();
    };

    const startDownload = async () => {
      try {
        if (!(await RNFS.exists(TARGET_PATH))) await RNFS.mkdir(TARGET_PATH);
        if (await RNFS.exists(READY_FLAG)) await RNFS.unlink(READY_FLAG);
        if (await RNFS.exists(ZIP_FILE_PATH)) await RNFS.unlink(ZIP_FILE_PATH);
        setStatusText('جاري تنزيل ملفات اللعبة داخل التطبيق...');
        setProgress(0);
        const downloadTask = RNFS.downloadFile({
          fromUrl: DOWNLOAD_URL,
          toFile: ZIP_FILE_PATH,
          connectionTimeout: 30000,
          readTimeout: 60000,
          progressDivider: 1,
          progress: (res) => {
            const expected = res.contentLength > 0 ? res.contentLength : EXPECTED_BYTES;
            const ratio = Math.min(1, res.bytesWritten / expected);
            setProgress(ratio * 0.72);
            setMbText(`${(res.bytesWritten / 1024 / 1024).toFixed(1)} MB / ${(expected / 1024 / 1024).toFixed(1)} MB`);
          },
        });
        const result = await downloadTask.promise;
        if (result.statusCode < 200 || result.statusCode >= 300) throw new Error(`HTTP ${result.statusCode}`);
        setStatusText('جاري فك ضغط ملفات اللعبة...');
        setProgress(0.8);
        await unzip(ZIP_FILE_PATH, TARGET_PATH);
        await RNFS.writeFile(READY_FLAG, JSON.stringify({ version: '2.11', server: SERVER_NAME, installedAt: new Date().toISOString() }), 'utf8');
        await RNFS.unlink(ZIP_FILE_PATH);
        setStatusText('اكتمل تثبيت ملفات اللعبة بنجاح');
        setProgress(1);
        setIsLoading(false);
        setTimeout(navigateToServers, 700);
      } catch (error: any) {
        setIsLoading(false);
        setIsError(true);
        setStatusText('فشل التنزيل أو فك الضغط');
        Alert.alert('تعذر تثبيت اللعبة', error?.message || 'تحقق من الإنترنت ومساحة التخزين ثم أعد المحاولة.');
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.serverTitle}>{SERVER_NAME}</Text>
        <Text style={styles.status}>{statusText}</Text>
        {isLoading && <ActivityIndicator size="large" color="#62d9f1" />}
        <View style={styles.barContainer}><View style={[styles.barFill, { width: `${progress * 100}%` }]} /></View>
        <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
        {mbText !== '' && <Text style={styles.mbText}>{mbText}</Text>}
        {isError && <TouchableOpacity style={styles.btnRetry} onPress={() => void initApp()}><Text style={styles.btnText}>إعادة المحاولة</Text></TouchableOpacity>}
      </View>
    );
    };

    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#071018', justifyContent: 'center', alignItems: 'center', padding: 20 },
    serverTitle: { color: '#62d9f1', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
    status: { color: '#E8F2F5', marginBottom: 14, textAlign: 'center' },
    barContainer: { width: '90%', height: 10, backgroundColor: '#263744', borderRadius: 5, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: '#62d9f1', borderRadius: 5 },
    percent: { color: '#62d9f1', marginTop: 10, fontWeight: 'bold' },
    mbText: { color: '#9BAFB8', fontSize: 12, marginTop: 6 },
    btnRetry: { marginTop: 20, backgroundColor: '#D95555', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 8 },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    });

    export default DownloadScreen;
    