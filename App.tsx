import React from 'react';
    import { Provider } from 'react-redux';
    import { NavigationContainer } from '@react-navigation/native';
    import { createNativeStackNavigator } from '@react-navigation/native-stack';
    import ModeScreen from './src/screens/ModeScreen';
    import GameScreen from './src/screens/GameScreen';
    import SettingsScreen from './src/screens/SettingsScreen';
    import { store } from './src/store';
    import { RootStackParamList } from './src/types/navigation';

    const Stack = createNativeStackNavigator<RootStackParamList>();

    export default function App() {
      return (
        <Provider store={store}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Mode" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Mode" component={ModeScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
      );
    }
    