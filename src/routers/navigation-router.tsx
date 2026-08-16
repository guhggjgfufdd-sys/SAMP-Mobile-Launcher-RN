import React, { useEffect, useState } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View, StyleSheet } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppDispatch } from '../hooks';
import { setModeType } from '../actions';

// استورد شاشاتك هنا حسب مشروعك
// import ModeScreen from '../screens/ModeScreen';
// import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0b0c10',
    card: '#1a1c23',
    text: '#ffffff',
    border: '#2a2d35',
    primary: '#5b8def',
  },
};

const NavigationRouter = () => {
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // إخفاء Splash Screen بعد ما يجهز النظام
    const init = async () => {
      try {
        // أي تهيئة تبيها (Redox persist مثلاً)
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        setIsReady(true);
        await RNBootSplash.hide({ fade: true });
      }
    };

    init();
  }, [dispatch]);

  if (!isReady) {
    return null; // أو شاشة loading
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer theme={MyTheme}>
            <StatusBar barStyle="light-content" backgroundColor="#0b0c10" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Mode" component={ModeScreen} />
              {/* أضف باقي الشاشات هنا */}
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default NavigationRouter;
