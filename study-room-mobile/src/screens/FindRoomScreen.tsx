// Find a Room screen file

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons"; // used for icons in header
import { LinearGradient } from "expo-linear-gradient"; // for gradient background
import colors from "@/constants/colors";
import { useFavorites } from "@/context/FavoritesContext"; // shared favorites context
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { buildingsAPI } from "@/utils/api";
import type { Building, Room } from "@/utils/api";

// strict type for rooms
interface RoomItem {
  id: string;
  status: "occupied" | "available" | "offline";
  roomId: number; // API room ID for favorites
  buildingId: number;
}

// shared type for favorites (matches what's saved in AsyncStorage)
interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
  roomId?: number;
}

// Convert API room status to UI status
const getRoomStatus = (
  isAvailable: boolean
): "available" | "occupied" | "offline" => {
  return isAvailable ? "available" : "occupied";
};

export default function FindARoomScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { favorites, addFavorite, removeFavorite } = useFavorites() as {
    favorites: FavoriteItem[];
    addFavorite: (item: FavoriteItem) => void;
    removeFavorite: (name: string) => void;
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // controls whether user is editing favorites (shows all hearts)
  const [editMode, setEditMode] = useState(false);

  // Load buildings and rooms
  useEffect(() => {
    const loadData = async () => {
      try {
        const buildingsData = await buildingsAPI.getAll();
        setBuildings(buildingsData);

        if (buildingsData.length > 0) {
          setSelectedBuilding(buildingsData[0]);
        }
      } catch (error) {
        console.error("Failed to load buildings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load rooms when building changes
  useEffect(() => {
    const loadRooms = async () => {
      if (!selectedBuilding) return;

      try {
        const buildingRooms = await buildingsAPI.getRooms(selectedBuilding.id);
        setRooms(buildingRooms);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    };

    loadRooms();
  }, [selectedBuilding]);

  // color variables for room status
  const getColor = (status: string) => {
    switch (status) {
      case "occupied":
        return colors.occupied;
      case "available":
        return colors.available;
      default:
        return colors.gray400;
    }
  };

  // Convert API rooms to RoomItem format
  const roomItems: RoomItem[] = rooms.map((room) => ({
    id: room.room_number,
    status: getRoomStatus(room.is_available),
    roomId: room.id,
    buildingId: room.building_id,
  }));

  // helper to check if a room is in favorites
  const isFavorite = (roomId: number) =>
    favorites.some((f: FavoriteItem) => f.roomId === roomId);

  // handle add/remove favorite toggle
  const toggleFavorite = (room: RoomItem) => {
    const buildingName = selectedBuilding?.name || "Unknown";
    const roomName = `${buildingName} ${room.id}`;
    const exists = isFavorite(room.roomId);
    if (exists) {
      removeFavorite(roomName);
    } else {
      addFavorite({
        name: roomName,
        status: room.status,
        tstatus: room.status.charAt(0).toUpperCase() + room.status.slice(1),
        roomId: room.roomId,
      });
    }
  };

  return (
    <ScrollView
      // makes page scrollable
      style={styles.container}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Home"); // fallback to Home
              }
            }}
          >
            <Ionicons name="arrow-back" size={28} color={colors.primary} />
          </TouchableOpacity>

          {/* centered title */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.title}>FIND A ROOM</Text>
          </View>

          {/* empty placeholder for spacing */}
          <View style={{ width: 28 }} />
        </View>

        {/* Subheader row now contains dropdown and edit button side by side */}
        <View style={styles.subHeader}>
          {/* Dropdown toggle */}
          <View style={styles.dropdownRow}>
            <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)}>
              <Ionicons
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.subHeaderText}>
              {selectedBuilding?.name || "Select Building"}
            </Text>
          </View>

          {/* Edit Favorites button */}
          <TouchableOpacity
            style={[
              styles.editButtonRow,
              editMode && { backgroundColor: colors.available + "33" }, // subtle tint when editing
            ]}
            onPress={() => setEditMode(!editMode)}
          >
            <Feather
              name={editMode ? "check" : "edit"}
              size={20}
              color={editMode ? colors.primary : colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.editLabelRow}>
              {editMode ? "Done" : "Edit Favorites"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {buildings.map((building) => (
              <TouchableOpacity
                key={building.id}
                style={[
                  styles.dropdownItem, // selected item gets highlighted
                  selectedBuilding?.id === building.id &&
                    styles.dropdownSelected,
                ]}
                onPress={() => {
                  setSelectedBuilding(building); // changes layout to selected building
                  setDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText, // selected text changes to white
                    selectedBuilding?.id === building.id &&
                      styles.dropdownTextSelected,
                  ]}
                >
                  {building.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Room grid */}
      <View style={styles.gridContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.white}
            style={{ marginVertical: 40 }}
          />
        ) : roomItems.length === 0 ? (
          <Text
            style={{
              color: colors.white,
              textAlign: "center",
              marginVertical: 40,
            }}
          >
            No rooms found
          </Text>
        ) : (
          <FlatList
            data={roomItems}
            numColumns={2}
            keyExtractor={(item) => item.roomId.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const favorite = isFavorite(item.roomId); // check if room is in favorites

              return (
                // tap to toggle favorite (only when in edit mode)
                <TouchableOpacity
                  onPress={() => {
                    if (editMode) {
                      // when in edit mode, clicking toggles favorites
                      toggleFavorite(item);
                    } else {
                      // when not in edit mode, go to room details screen
                      navigation.navigate("RoomDetails", {
                        building: selectedBuilding?.name || "Unknown",
                        roomId: item.id,
                        status: item.status as
                          | "available"
                          | "occupied"
                          | "offline",
                      });
                    }
                  }}
                  style={[
                    styles.roomBox,
                    { backgroundColor: getColor(item.status) },
                  ]}
                  activeOpacity={0.8}
                >
                  {/* gradient background for room boxes */}
                  <LinearGradient
                    colors={[
                      getColor(item.status), // base color
                      getColor(item.status) + "CC",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.roomBox, { aspectRatio: 1, width: 120 }]} // keeps square shape even on iOS
                  >
                    <Text style={styles.roomText}>{item.id}</Text>

                    {/* heart icon overlay logic */}
                    {editMode ? (
                      // show outline heart when editing favorites
                      <Ionicons
                        name={favorite ? "heart" : "heart-outline"}
                        size={22}
                        color={favorite ? colors.white : colors.white}
                        style={{ position: "absolute", top: 6, right: 6 }}
                      />
                    ) : (
                      // show filled heart only if it’s already in favorites
                      favorite && (
                        <Ionicons
                          name="heart"
                          size={22}
                          color={colors.gray100}
                          style={{ position: "absolute", top: 6, right: 6 }}
                        />
                      )
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: 1,
              width: "100%",
            }}
            columnWrapperStyle={{
              justifyContent: "center", // centers each row
            }}
          />
        )}
      </View>

      {/* color coded legend appears on bottom of screen */}
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <LinearGradient
            colors={[colors.available, colors.available + "CC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.legendBox}
          />
          <Text style={styles.legendText}>AVAILABLE</Text>
        </View>

        <View style={styles.legendRow}>
          <LinearGradient
            colors={[colors.occupied, colors.occupied + "CC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.legendBox}
          />
          <Text style={styles.legendText}>OCCUPIED</Text>
        </View>

        <View style={styles.legendRow}>
          <LinearGradient
            colors={[colors.offline, colors.offline + "CC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.legendBox}
          />
          <Text style={styles.legendText}>ROOM DATA UNAVAILABLE</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// style sheet section - implements layout and sets up components
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray100 },
  headerWrapper: { width: "100%", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    maxWidth: 400,
    marginTop: 80,
  },
  title: {
    fontSize: 38,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "500",
    color: colors.primary,
    textTransform: "uppercase",
    textAlign: "center",
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    width: "90%",
    maxWidth: 400,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subHeaderText: { fontSize: 18, color: colors.primary },
  editButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.primary, // green outline
  },
  editLabelRow: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: "Poppins",
  },
  dropdownMenu: {
    backgroundColor: colors.white,
    borderRadius: 4,
    marginBottom: 20,
    width: "83%",
    alignSelf: "flex-start",
    marginLeft: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: { padding: 10 },
  dropdownText: { fontSize: 16, fontFamily: "Poppins", color: colors.primary },
  dropdownSelected: { backgroundColor: colors.primary },
  dropdownTextSelected: { color: colors.white },
  gridContainer: {
    backgroundColor: colors.primary,
    borderRadius: 0,
    width: "100%",
    maxWidth: 450,
    paddingVertical: 40,
    justifyContent: "center",
  },
  roomBox: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 140,
    borderRadius: 4,
    margin: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    position: "relative",
  },
  roomText: {
    fontSize: 25,
    fontWeight: "200",
    color: "#000",
    fontFamily: "Poppins",
  },
  legendContainer: {
    marginTop: 24,
    alignItems: "flex-start",
    width: "90%",
    maxWidth: 400,
  },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  legendBox: { width: 28, height: 28, marginRight: 12, borderRadius: 2 },
  legendText: {
    fontSize: 24,
    fontFamily: "BebasNeue-Regular",
    color: colors.primary,
  },
});
