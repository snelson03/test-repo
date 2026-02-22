// src/components/RoomCard.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type RoomCardProps = {
  roomName: string;
  status: 'available' | 'occupied' | 'offline' | 'almost_filled';
};

const statusKey = (s: string) =>
  s === 'almost_filled' ? 'almost_filled' : (s as 'available' | 'occupied' | 'offline');

export default function RoomCard({ roomName, status }: RoomCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const bgColor = colors[statusKey(status)];
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{roomName}</Text>
      <Text style={styles.status}>{status.toUpperCase()}</Text>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      padding: 20,
      margin: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    text: {
      color: c.white,
      fontWeight: 'bold',
      fontSize: 16,
    },
    status: {
      color: c.white,
      marginTop: 4,
      fontSize: 14,
    },
  });
}
