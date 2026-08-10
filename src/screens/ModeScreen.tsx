import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchModeSetting } from '../thunks/settingsThunks';
import * as Images from './../assets/images';

type InitiationScreenType = NativeStackScreenProps;

export const ModeScreen = React.memo(({ navigation }: InitiationScreenType) => {
  const dispatch = useAppDispatch();

  const onPressPlay = useCallback(() => {
    // id = 1 يعني الخريطة العادية (تقدر تغيره لـ 2 إذا تبي ثلجية دائماً)
    dispatch(fetchModeSetting(1));
    return navigation.replace('Initiation');
  }, []);

  return (
    <View style={styles.container}>
      {/* شعار سيرفرك */}
      <Image 
        source={Images.logo} 
        style={styles.logo} 
        resizeMode="contain"
      />
      
      {/* اسم سيرفرك */}
      <Text style={styles.title}>Las Venturas RP</Text>
      <Text style={styles.subtitle}>اضغط للعب</Text>

      {/* زر Play */}
      <TouchableOpacity style={styles.playButton} onPress={onPressPlay}>
        <Text style={styles.playText}>▶  العب الآن</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 40,
  },
  playButton: {
    backgroundColor: '#e94560',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  playText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
