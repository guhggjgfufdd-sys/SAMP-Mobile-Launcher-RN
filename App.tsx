import React, { useEffect } from 'react';
import { BackHandler, Text, View } from 'react-native';

export const App = () => {
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'blue'}}>
      <Text style={{color: 'white', fontSize: 24}}>APP LOADED!</Text>
    </View>
  );
};
