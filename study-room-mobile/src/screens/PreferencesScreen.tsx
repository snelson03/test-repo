import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

export default function PreferencesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Preferences</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.offWhite },
  text: { fontSize: 24 },
});
