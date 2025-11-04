// Favorites Screen File
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

// static favorites list for now
const favorites = [
  { name: 'Stocker Center, 1F', status: 'available', number: 155 },
  { name: 'Stocker Center, 2F', status: 'offline', number: 212 },
  { name: 'Stocker Center, 3F', status: 'occupied', number: 315 },
  { name: 'ARC, 1F', status: 'available', number: 103 },
  { name: 'ARC, 2F', status: 'occupied', number: 207 },
  { name: 'Alden Library, 1F', status: 'available', number: 121 },
  { name: 'Alden Library, 2F', status: 'available', number: 157 },
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
              <Text style={styles.numberText}>{item.number}</Text>
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
    marginHorizontal: 40,
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
  numberText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '400',
  },
});
