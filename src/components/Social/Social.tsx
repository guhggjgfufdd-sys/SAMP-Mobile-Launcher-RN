import React, { useCallback } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './SocialStyle';

// روابط وسائل التواصل الاجتماعي المباشرة لتجاوز حزمة @env
const LINK_DISCORD = 'https://discord.gg';
const LINK_SITE = 'https://google.com';
const LINK_TIKTOK = 'https://tiktok.com';
const LINK_VK = 'https://vk.com';

export const Social = () => {
  const openUrl = useCallback(async (url: string) => {
    if (url) {
      await Linking.openURL(url);
    }
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => openUrl(LINK_DISCORD)}>
        <Text style={styles.text}>Discord</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openUrl(LINK_SITE)}>
        <Text style={styles.text}>Site</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openUrl(LINK_TIKTOK)}>
        <Text style={styles.text}>TikTok</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openUrl(LINK_VK)}>
        <Text style={styles.text}>VK</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Social;
