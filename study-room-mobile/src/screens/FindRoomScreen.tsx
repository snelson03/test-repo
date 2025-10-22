// Find a Room screen file

import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

export default function FindARoomScreen() {
  const router = useRouter();

  // Example room data for testing
  const rooms = [
    { id: '151', status: 'occupied' },
    { id: '152', status: 'available' },
    { id: '153', status: 'available' },
    { id: '154', status: 'unknown' },
    { id: '155', status: 'available' },
    { id: '156', status: 'occupied' },
    { id: '157', status: 'available' },
    { id: '158', status: 'available' },
  ];

  // color variables for room status
  const getColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return '#C0392B'; // red
      case 'available':
        return '#58A76B'; // green
      default:
        return '#7F8C8D'; // gray
    }
  };

  // setting up object styles
  return (
    <View style={styles.container}>
      {/* Header style stup */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#1C3B2B" />
          </TouchableOpacity>
          <Text style={styles.title}>FIND A ROOM</Text>
        </View>

        {/* Subheader style setup */}
        <View style={styles.subHeader}>
          <Ionicons name="menu" size={22} color="#1C3B2B" />
          <Text style={styles.subHeaderText}>Stocker Center, 1F</Text>
        </View>
      </View>

      {/* Room grid style setup */}
      <View style={styles.gridContainer}>
        <FlatList
          data={rooms}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={[styles.roomBox, { backgroundColor: getColor(item.status) }]}>
              <Text style={styles.roomText}>{item.id}</Text>
            </View>
          )}
          contentContainerStyle={{alignItems: 'center',
          paddingBottom: 32, }}
        />
      </View>
    </View>
  );
}

// implements styles for page layout, spacing, colors, etc
const styles = StyleSheet.create({
  container: { // container and background
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingTop: 60,
  },
  headerWrapper: { 
    width: '100%',
    alignItems: 'center',
  },
  header: { //header spacing
    flexDirection: 'row',
    alignItems: 'center',
    gap: 102,
    width: '90%',
    maxWidth: 400,
  },
  title: { // page title font setup
    fontSize: 35,
    fontFamily: 'BebasNeue-Regular',
    fontWeight: '500',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  subHeader: { // subheader for bulding and floor
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    gap: 15,
    width: '90%',
    maxWidth: 400,
  },
  subHeaderText: { // subheader text color
    fontSize: 18,
    color: colors.primary,
  },
  gridContainer: { // room grid bakckground color and spacing
    backgroundColor: '#1C3B2B',
    borderRadius: 0,
    width: '100%',
    maxWidth: 400,
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  roomBox: {  //indivisual room box spacing and shadow
    flex: 1,
    aspectRatio: 1,
    minWidth: 110,
    borderRadius: 6,
    margin: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  roomText: {  // room text and color
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
});
