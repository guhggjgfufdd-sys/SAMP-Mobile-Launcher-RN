import React, { useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import ModeScreen from '../screens/ModeScreen';

const Stack = createNativeStackNavigator();

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // انتظر شوي
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        try {
          await RNBootSplash.hide({ fade: true });
        } catch (e) {
          console.warn(e);
        }
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#5b8def" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0c10" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Mode" component={ModeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b0c10',
  },
});

export default NavigationRouter;
