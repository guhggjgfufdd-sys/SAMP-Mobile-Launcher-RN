import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { RootStackParamList } from '../navigation/navigation-router';

type GameScreenRoute = RouteProp<RootStackParamList, 'Game'>;

const SERVERS = [
  { id: 'lv-rp', name: 'Las Venturas RP', ip: '142.132.203.47:21299', players: 'تحقق عند الاتصال' },
];

const GameScreen = () => {
  const route = useRoute<GameScreenRoute>();
  const reduxUsername = useSelector((state: RootState) => state.user.username);
  const username = route.params?.username || reduxUsername || 'Player';

  const renderServer = ({ item }: { item: typeof SERVERS[0] }) => (
    <TouchableOpacity style={styles.serverCard} activeOpacity={0.8}>
      <View style={styles.serverInfo}>
        <Text style={styles.serverName}>{item.name}</Text>
        <Text style={styles.serverIp}>{item.ip}</Text>
      </View>
      <View style={styles.playersBadge}>
        <Text style={styles.playersText}>{item.players}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>قائمة السيرفرات</Text>
      <Text style={styles.welcome}>مرحباً، {username} 👋</Text>

      <FlatList
        data={SERVERS}
        keyExtractor={(item) => item.id}
        renderItem={renderServer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 14,
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 24,
  },
  list: {
    paddingBottom: 30,
  },
  serverCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  serverInfo: {
    flex: 1,
  },
  serverName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serverIp: {
    color: '#888',
    fontSize: 13,
  },
  playersBadge: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  playersText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default GameScreen;
