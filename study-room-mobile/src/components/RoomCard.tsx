// src/components/RoomCard.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/theme';
import { FONT_BODY, FONT_HEADING, FONT_SIZE_BODY, FONT_SIZE_CAPTION, CARD_PADDING, CARD_BORDER_RADIUS } from '@/constants/typography';
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
      padding: CARD_PADDING,
      margin: 10,
      borderRadius: CARD_BORDER_RADIUS,
      alignItems: 'center',
    },
    text: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_BODY,
    },
    status: {
      color: c.white,
      marginTop: 4,
      fontSize: FONT_SIZE_CAPTION,
      fontFamily: FONT_BODY,
    },
  });
}
