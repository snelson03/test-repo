// Favorites Screen File
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { useFavorites } from '@/context/FavoritesContext'; // shared favorites context

// added: define simple interface so TypeScript knows what a favorite looks like
interface FavoriteRoom {
  name: string;
  status?: string;
  tstatus?: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites(); // shared list and remove function
  const [editMode, setEditMode] = useState(false); // keeps track of edit mode state

  // toggle edit mode on or off
  const toggleEdit = () => setEditMode(!editMode);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={35} color={colors.primary} />
        </Pressable>

        <Text style={styles.title}>FAVORITES</Text>

        {/* added: edit button (pencil icon turns into checkmark when editing) */}
        <Pressable onPress={toggleEdit} style={styles.backButton}>
          <Ionicons
            name={editMode ? 'checkmark' : 'create-outline'}
            size={30}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {/* Favorite Rooms List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {favorites.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: colors.primary, fontSize: 18 }}>
              No favorites added yet.
            </Text>
          </View>
        ) : (
          favorites.map((item: FavoriteRoom) => (
            <View key={item.name} style={styles.card}>
              <Text style={styles.roomText}>{item.name}</Text>

              <View style={styles.rightSection}>
                <View
                  style={[
                    styles.statusDot, // status dot color coded by available, occupied, offline
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

                {/* added: trash button only shows when in edit mode */}
                {editMode && (
                  <TouchableOpacity
                    onPress={() => removeFavorite(item.name)}
                    style={{ marginLeft: 12 }}
                  >
                    <Ionicons name="trash" size={22} color={colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// applies styles and sets up page
const styles = StyleSheet.create({
  container: {
    // background container
    flex: 1,
    backgroundColor: colors.gray100,
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  header: {
    // header container
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // centers title between two equal sides
    marginBottom: 24,
  },
  backButton: {
    // back button
    width: 40, // keeps both sides equal width
    alignItems: 'center',
  },
  title: {
    // sets up title for each room
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
  card: {
    // room card container
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 0,
    padding: 25,
    marginBottom: 7,
    marginHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomText: {
    // room name text inside each block
    color: colors.white,
    fontSize: 25,
    fontFamily: 'BebasNeue-Regular',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    // status dot placement
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: colors.white,
    fontSize: 16,
  },
});
