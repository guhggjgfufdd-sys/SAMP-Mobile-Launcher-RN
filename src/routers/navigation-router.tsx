import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ModeScreen from '../screens/ModeScreen';
import GameScreen from '../screens/GameScreen';

export type RootStackParamList = {
  Mode: undefined;
  Game: { username: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const NavigationRouter = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Mode"
        screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationRouter;
