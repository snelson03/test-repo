// Favorite Screen starter file

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Favorite Rooms</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.offWhite },
  text: { fontSize: 24 },
});
