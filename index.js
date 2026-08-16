import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';

enableScreens();  // ← لازم تكون قبل أي import ثاني

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
