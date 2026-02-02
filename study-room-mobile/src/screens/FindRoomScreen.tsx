// Find a Room screen file
// ✅ Dynamic responsive formatting for ANY screen size (mobile/tablet/desktop/web)
// CHANGES (sizing only):
// 1) ✅ No hard max-width for the page: uses full width but keeps responsive padding
// 2) ✅ Grid uses full available width
// 3) ✅ numColumns calculated from available width (auto scales)
// 4) ✅ Tile size computed from available width (no "mobile-only" clamp)

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { useFavorites } from "@/context/FavoritesContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { buildingsAPI } from "@/utils/api";
import type { Building, Room } from "@/utils/api";

interface RoomItem {
  id: string;
  status: "occupied" | "available" | "offline";
  roomId: number;
  buildingId: number;
}

interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
  roomId?: number;
}

const getRoomStatus = (
  isAvailable: boolean
): "available" | "occupied" | "offline" => {
  return isAvailable ? "available" : "occupied";
};

export default function FindARoomScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { width } = useWindowDimensions();

  // ✅ responsive outer padding (keeps your look, just scales)
  const pagePad = width < 480 ? 12 : width < 900 ? 18 : width < 1400 ? 28 : 40;

  // ✅ this is the actual usable width for content
  const usableWidth = Math.max(320, width - pagePad * 2);

  // ✅ grid padding/margins match your design feel
  const tileMargin = 12; // same as your original margin
  const gridSidePad = 16; // slight inner breathing room inside green box

  // ✅ compute columns dynamically from available width
  // target tile around ~150–220px depending on screen size
  const numColumns = useMemo(() => {
    const w = usableWidth - gridSidePad * 2;
    if (w < 520) return 2;
    if (w < 820) return 3;
    if (w < 1180) return 4;
    if (w < 1540) return 5;
    return 6;
  }, [usableWidth]);

  // ✅ compute tile size to perfectly fit the row
  const tileSize = useMemo(() => {
    const w = usableWidth - gridSidePad * 2;
    const totalMarginsPerRow = tileMargin * 2 * numColumns;
    const raw = (w - totalMarginsPerRow) / numColumns;

    // keep tiles from being absurdly small/huge (still “dynamic”)
    const min = 110;
    const max = 260;
    const size = Math.max(min, Math.min(raw, max));

    return { size, margin: tileMargin };
  }, [usableWidth, numColumns]);

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
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const buildingsData = await buildingsAPI.getAll();
        setBuildings(buildingsData);
        if (buildingsData.length > 0) setSelectedBuilding(buildingsData[0]);
      } catch (error) {
        console.error("Failed to load buildings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

  const roomItems: RoomItem[] = rooms.map((room) => ({
    id: room.room_number,
    status: getRoomStatus(room.is_available),
    roomId: room.id,
    buildingId: room.building_id,
  }));

  const isFavorite = (roomId: number) =>
    favorites.some((f: FavoriteItem) => f.roomId === roomId);

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
      style={styles.container}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 40,
        paddingHorizontal: pagePad, // ✅ dynamic padding
      }}
    >
      {/* ✅ full-width content wrapper */}
      <View style={{ width: "100%" }}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          {/* ✅ widen header area dynamically (no hard max) */}
          <View style={[styles.header, { width: "100%" }]}>
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) navigation.goBack();
                else navigation.navigate("Home");
              }}
            >
              <Ionicons name="arrow-back" size={28} color={colors.primary} />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={styles.title}>FIND A ROOM</Text>
            </View>

            <View style={{ width: 28 }} />
          </View>

          {/* Subheader row */}
          <View style={[styles.subHeader, { width: "100%" }]}>
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

            <TouchableOpacity
              style={[
                styles.editButtonRow,
                editMode && { backgroundColor: colors.available + "33" },
              ]}
              onPress={() => setEditMode(!editMode)}
            >
              <Feather
                name={editMode ? "check" : "edit"}
                size={20}
                color={colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.editLabelRow}>
                {editMode ? "Done" : "Edit Favorites"}
              </Text>
            </TouchableOpacity>
          </View>

          {dropdownOpen && (
            <View style={[styles.dropdownMenu, { width: "100%" }]}>
              {buildings.map((building) => (
                <TouchableOpacity
                  key={building.id}
                  style={[
                    styles.dropdownItem,
                    selectedBuilding?.id === building.id &&
                      styles.dropdownSelected,
                  ]}
                  onPress={() => {
                    setSelectedBuilding(building);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
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
        <View
          style={[
            styles.gridContainer,
            {
              width: "100%", // ✅ full width
              paddingHorizontal: gridSidePad, // ✅ inner padding inside green box
            },
          ]}
        >
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
              numColumns={numColumns}
              key={numColumns} // ✅ relayout on resize
              keyExtractor={(item) => item.roomId.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const favorite = isFavorite(item.roomId);

                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (editMode) toggleFavorite(item);
                      else {
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
                      {
                        backgroundColor: getColor(item.status),
                        width: tileSize.size,
                        height: tileSize.size,
                        margin: tileSize.margin,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        getColor(item.status),
                        getColor(item.status) + "CC",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.roomBoxInner, { width: "100%", height: "100%" }]}
                    >
                      <Text style={styles.roomText}>{item.id}</Text>

                      {editMode ? (
                        <Ionicons
                          name={favorite ? "heart" : "heart-outline"}
                          size={22}
                          color={colors.white}
                          style={{ position: "absolute", top: 6, right: 6 }}
                        />
                      ) : (
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
                width: "100%",
              }}
              columnWrapperStyle={{
                justifyContent: "center",
              }}
            />
          )}
        </View>

        {/* Legend */}
        <View style={[styles.legendContainer, { width: "100%" }]}>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray100 },

  headerWrapper: { width: "100%", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    borderColor: colors.primary,
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
    paddingVertical: 40,
    justifyContent: "center",
    alignSelf: "center",
  },

  roomBox: {
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    position: "relative",
    overflow: "hidden",
  },

  roomBoxInner: {
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
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
    alignSelf: "center",
  },
  legendRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  legendBox: { width: 28, height: 28, marginRight: 12, borderRadius: 2 },
  legendText: {
    fontSize: 24,
    fontFamily: "BebasNeue-Regular",
    color: colors.primary,
  },
});
