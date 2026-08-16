import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
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
  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0c10" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Mode" component={ModeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationRouter;
