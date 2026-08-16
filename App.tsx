import React, { useEffect } from 'react';
import { BackHandler, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNBootSplash from 'react-native-bootsplash';
import { NavigationRouter } from './src/routers/navigation-router';

export default function App() {
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    // نخفي البوت سبلاش بعد ثانيتين بشكل مضمون
    const timer = setTimeout(() => {
      RNBootSplash.hide({ fade: true });
    }, 2000);
    
    return () => {
      backHandler.remove();
      clearTimeout(timer);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <NavigationRouter />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
