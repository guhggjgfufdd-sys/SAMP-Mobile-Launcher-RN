import React from 'react';
import {SafeAreaView, Text, StatusBar} from 'react-native';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <Text style={{fontSize: 24, textAlign: 'center', marginTop: 50}}>
        SAMP Mobile Launcher
      </Text>
    </SafeAreaView>
  );
};

export default App;
