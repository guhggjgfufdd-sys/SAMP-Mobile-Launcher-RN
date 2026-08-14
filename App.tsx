import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { NavigationRouter } from './src/routers/navigation-router';

export default function App() {
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return <NavigationRouter />;
}
