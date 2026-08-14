import {AppRegistry, Text, View} from 'react-native';
import {name as appName} from './app.json';

// اختبار بسيط — إذا ظهر "TEST WORKS" يعني الـ Bundle يشتغل
const TestApp = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black'}}>
    <Text style={{color: 'red', fontSize: 30}}>TEST WORKS!</Text>
  </View>
);

AppRegistry.registerComponent(appName, () => TestApp);
