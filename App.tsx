import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// استيراد الشاشات من مجلد src/screens
import { InitiationScreen } from './src/screens/InitiationScreen';
import ModeScreen from './src/screens/ModeScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// استيراد Redux Store
import { store } from './src/store';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Initiation"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Initiation" component={InitiationScreen} />
          <Stack.Screen name="Mode" component={ModeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
