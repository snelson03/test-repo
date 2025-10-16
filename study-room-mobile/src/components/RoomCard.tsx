// src/components/RoomCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function RoomCard({ roomName, status }: { roomName: string; status: 'available' | 'busy' | 'offline' }) {
  return (
    <View style={[styles.card, { backgroundColor: colors[status] }]}>
      <Text style={styles.text}>{roomName}</Text>
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
  },
});
