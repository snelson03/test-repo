// src/components/RoomCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

type RoomCardProps = {
  roomName: string;
  status: 'available' | 'occupied' | 'offline' | 'almost_filled';
};

export default function RoomCard({ roomName, status }: RoomCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors[status] }]}>
      <Text style={styles.text}>{roomName}</Text>
      <Text style={styles.status}>{status.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: {
    color: '#fff',
    marginTop: 4,
    fontSize: 14,
  },
});
