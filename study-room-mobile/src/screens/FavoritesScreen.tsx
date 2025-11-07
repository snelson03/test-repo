// Favorites Screen File
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

// static favorites list for now
const favorites = [
  { name: 'Stocker Center  155', status: 'available', tstatus: 'Available' },
  { name: 'Stocker Center  212', status: 'offline',tstatus: 'Offline'},
  { name: 'Stocker Center  315', status: 'occupied', tstatus: 'Occupied'},
  { name: 'ARC  103', status: 'available', tstatus: 'Available'},
  { name: 'ARC  207', status: 'occupied', tstatus: 'Occupied' },
  { name: 'Alden  Library 121', status: 'available', tstatus: 'Available' },
  { name: 'Alden  Library 157', status: 'available',tstatus: 'Available' },
];

export default function FavoritesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={35} color={colors.primary} />
        </Pressable>

        <Text style={styles.title}>FAVORITES</Text>

        {/* Invisible spacer to balance header layout */}
        <View style={styles.backButton} />
      </View>

      {/* Favorite Rooms List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {favorites.map((item) => (
          <View key={item.name} style={styles.card}>
            <Text style={styles.roomText}>{item.name}</Text>

            <View style={styles.rightSection}>
              <View
                style={[
                  styles.statusDot, // status dot color coded by available,occuped, offline
                  {
                    backgroundColor:
                      item.status === 'available'
                        ? colors.available
                        : item.status === 'occupied'
                        ? colors.occupied
                        : colors.offline,
                  },
                ]}
              />
              <Text style={styles.statusText}>{item.tstatus}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
 // applies styles and sets up page
const styles = StyleSheet.create({
  container: { // background container
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: { // header container
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // centers title between two equal sides
    marginBottom: 24,
  },
  backButton: { // back button
    width: 40, // keeps both sides equal width
    alignItems: 'center',
  },
  title: {  // sets up title for each room
    flex: 1,
    textAlign: 'center',
    fontSize: 38,
    fontFamily: 'BebasNeue-Regular',
    fontWeight: '500',
    color: colors.primary,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: { // room card container
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 0,
    padding: 25,
    marginBottom: 7,
    marginHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomText: { // room name text inside each block
    color: colors.white,
    fontSize: 25,
    fontFamily: 'BebasNeue-Regular',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: { // status dot placement
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Poppins',
  },
});
