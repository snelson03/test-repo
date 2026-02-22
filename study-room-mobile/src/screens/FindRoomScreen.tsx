// Find a Room screen file

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

interface WebMenuItem {
  name: string;
  route: MenuRoute;
}

const getRoomStatus = (
  isAvailable: boolean
): "available" | "occupied" | "offline" => {
  return isAvailable ? "available" : "occupied";
};

// Maximum width for large screens
const MAX_SCREEN_WIDTH = 1400;

// Web sizing (matches Home Screen)
const WEB_SIDEBAR_WIDTH = 300;
const WEB_TOPBAR_HEIGHT = 170;

type MenuRoute = "Home" | "FindRoom" | "CampusMap" | "Favorites" | "Preferences";

export default function FindARoomScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { width } = useWindowDimensions();

  const pagePad = width < 480 ? 12 : width < 900 ? 18 : width < 1400 ? 28 : 40;
  const usableWidth = Math.max(320, width - pagePad * 2);

  const tileMargin = 12;
  const gridSidePad = 16;

  const numColumns = useMemo(() => {
    const w = usableWidth - gridSidePad * 2;
    if (w < 520) return 2;
    if (w < 820) return 3;
    if (w < 1180) return 4;
    if (w < 1540) return 5;
    return 6;
  }, [usableWidth]);

  const tileSize = useMemo(() => {
    const w = usableWidth - gridSidePad * 2;
    const totalMarginsPerRow = tileMargin * 2 * numColumns;
    const raw = (w - totalMarginsPerRow) / numColumns;

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

  // New: toggle between rooms grid and floor plan (per selected building)
  const [viewMode, setViewMode] = useState<"rooms" | "floorPlan">("rooms");

  const isWeb = Platform.OS === "web";

  // used to size the web content area like Home Screen
  const webPagePad = width < 480 ? 12 : 0;
  const webAvailable = width - WEB_SIDEBAR_WIDTH - webPagePad * 2;
  const contentWidthWeb = Math.min(webAvailable, MAX_SCREEN_WIDTH);

  const menuItems: WebMenuItem[] = [
    { name: "Home", route: "Home" },
    { name: "Find a Room", route: "FindRoom" },
    { name: "Campus Map", route: "CampusMap" },
    { name: "Favorites", route: "Favorites" },
    { name: "Preferences", route: "Preferences" },
  ];

  const suppressTilePressRef = useRef(false);

  // Map building name -> floor plan image (UPDATE THESE FILES to your real PNGs)
  const FLOOR_PLANS: Record<string, any> = {
    // Example filenames — replace with your actual assets:
    "Stocker Center": require("@/assets/images/placeholder.png"),
    "Academic Research Center": require("@/assets/images/placeholder.png"),
    "Alden Library": require("@/assets/images/placeholder.png"),
  };

  const selectedFloorPlan =
    selectedBuilding?.name ? FLOOR_PLANS[selectedBuilding.name] : null;

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

      // We only need rooms when viewing the grid.
      if (viewMode !== "rooms") return;

      try {
        const buildingRooms = await buildingsAPI.getRooms(selectedBuilding.id);
        setRooms(buildingRooms);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    };
    loadRooms();
  }, [selectedBuilding, viewMode]);

  // When the building changes, default back to the room grid
  useEffect(() => {
    setViewMode("rooms");
  }, [selectedBuilding?.id]);

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

  const oldUI = (
    <View
      style={[styles.mainContent, isWeb && styles.webContent]}
      accessibilityLabel="Find a room screen"
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 40,
          paddingHorizontal: pagePad,
        }}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel="Find a room content"
      >
        <View style={{ width: "100%" }}>
          {/* Header */}
          <View style={styles.headerWrapper}>
            <View style={[styles.header, { width: "100%" }]}>
              <TouchableOpacity
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate("Home");
                }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                accessibilityHint="Returns to the previous screen"
              >
                <Ionicons name="arrow-back" size={28} color={colors.primary} />
              </TouchableOpacity>

              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={styles.title} accessibilityRole="header">
                  FIND A ROOM
                </Text>
              </View>

              <View style={{ width: 28 }} />
            </View>

            {/* Subheader row */}
            <View style={[styles.subHeader, { width: "100%" }]}>
              <TouchableOpacity
                style={styles.dropdownRow}
                activeOpacity={0.8}
                onPress={() => setDropdownOpen((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Select building. Currently ${
                  selectedBuilding?.name ?? "none"
                }`}
                accessibilityHint="Opens the building list"
                accessibilityState={{ expanded: dropdownOpen }}
              >
                <Ionicons
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={colors.primary}
                />
                <Text style={styles.subHeaderText}>
                  {selectedBuilding?.name || "Select Building"}
                </Text>
              </TouchableOpacity>
            </View>

            {dropdownOpen && (
              <View
                style={[styles.dropdownMenu, { width: "100%" }]}
                accessibilityLabel="Building options"
              >
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
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${building.name}`}
                    accessibilityState={{
                      selected: selectedBuilding?.id === building.id,
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

          {/* Toggle button (only when a building is selected) */}
          {!!selectedBuilding && (
            <View style={{ width: "100%", marginTop: 8, marginBottom: 8 }}>
              <TouchableOpacity
                style={styles.toggleBtn}
                activeOpacity={0.85}
                onPress={() =>
                  setViewMode((m) => (m === "rooms" ? "floorPlan" : "rooms"))
                }
                accessibilityRole="button"
                accessibilityLabel={
                  viewMode === "rooms"
                    ? "Show floor plan"
                    : "Show room grid"
                }
                accessibilityHint="Toggles between floor plan and room grid"
              >
                <Text style={styles.toggleBtnText}>
                  {viewMode === "rooms" ? "VIEW FLOOR PLAN" : "VIEW ROOM GRID"}
                </Text>
                <Ionicons
                  name={viewMode === "rooms" ? "map-outline" : "grid-outline"}
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Main content area */}
          {viewMode === "floorPlan" ? (
            <View style={{ width: "100%", marginTop: 6 }}>
              {selectedFloorPlan ? (
                <Image
                  source={selectedFloorPlan}
                  style={styles.floorPlanImage}
                  resizeMode="contain"
                  accessibilityRole="image"
                  accessibilityLabel={`Floor plan for ${
                    selectedBuilding?.name ?? "building"
                  }`}
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View
                  style={styles.noFloorPlanBox}
                  accessibilityLabel="No floor plan available"
                >
                  <Text style={styles.noFloorPlanText}>
                    No floor plan available for this building yet.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {/* Room grid */}
              <View
                style={[
                  styles.gridContainer,
                  {
                    width: "100%",
                    paddingHorizontal: gridSidePad,
                  },
                ]}
                accessibilityLabel="Room grid"
              >
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.white}
                    style={{ marginVertical: 40 }}
                    accessibilityLabel="Loading rooms"
                  />
                ) : roomItems.length === 0 ? (
                  <Text
                    style={{
                      color: colors.white,
                      textAlign: "center",
                      marginVertical: 40,
                    }}
                    accessibilityLabel="No rooms found"
                  >
                    No rooms found
                  </Text>
                ) : (
                  <FlatList
                    data={roomItems}
                    numColumns={numColumns}
                    key={numColumns}
                    keyExtractor={(item) => item.roomId.toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                      const favorite = isFavorite(item.roomId);

                      return (
                        <TouchableOpacity
                          onPress={() => {
                            if (suppressTilePressRef.current) {
                              suppressTilePressRef.current = false;
                              return;
                            }

                            navigation.navigate("RoomDetails", {
                              building:
                                selectedBuilding?.name ===
                                "Academic Research Center"
                                  ? "Academic & Research Center"
                                  : selectedBuilding?.name || "Unknown",
                              roomId: item.id,
                              status: item.status as
                                | "available"
                                | "occupied"
                                | "offline",
                            });
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
                          accessibilityRole="button"
                          accessibilityLabel={`Room ${item.id}, ${item.status}`}
                          accessibilityHint="Opens room details"
                        >
                          <LinearGradient
                            colors={[
                              getColor(item.status),
                              getColor(item.status) + "CC",
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                              styles.roomBoxInner,
                              { width: "100%", height: "100%" },
                            ]}
                          >
                            <Text style={styles.roomText}>{item.id}</Text>

                            <TouchableOpacity
                              style={styles.heartBtn}
                              activeOpacity={0.85}
                              onPressIn={() => {
                                suppressTilePressRef.current = true;
                              }}
                              onPress={() => {
                                toggleFavorite(item);
                                setTimeout(() => {
                                  suppressTilePressRef.current = false;
                                }, 0);
                              }}
                              accessibilityRole="button"
                              accessibilityLabel={
                                favorite
                                  ? `Remove room ${item.id} from favorites`
                                  : `Add room ${item.id} to favorites`
                              }
                              accessibilityHint="Toggles favorite"
                              accessibilityState={{ selected: favorite }}
                            >
                              <Ionicons
                                name={favorite ? "heart" : "heart-outline"}
                                size={22}
                                color={favorite ? colors.gray100 : colors.white}
                              />
                            </TouchableOpacity>
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
              <View
                style={[styles.legendContainer, { width: "100%" }]}
                accessibilityLabel="Legend"
              >
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
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );

  // WEB VERSION (adds the same top bar + sidebar as Home Screen)
  if (isWeb) {
    return (
      <View style={styles.webPage} accessibilityLabel="Find a room screen">
        {/* top bar */}
        <View style={styles.webTopBar} accessibilityLabel="Top bar">
          <Image
            source={require("@/assets/images/bf_logo.png")}
            style={styles.webTopBarLogo}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Bobcat Finder logo"
            accessibilityIgnoresInvertColors
          />
        </View>

        {/* sidebar + main */}
        <View style={styles.webBody}>
          {/* Left Sidebar */}
          <View style={styles.webSidebar} accessibilityLabel="Navigation sidebar">
            <View style={styles.webSidebarLinks}>
              {menuItems.map((item) => {
                const selected = item.route === "FindRoom";
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[
                      styles.webNavItem,
                      selected && styles.webNavItemSelected,
                    ]}
                    onPress={() => navigation.navigate(item.route as any)}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to ${item.name}`}
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.webNavText,
                        selected && styles.webNavTextSelected,
                      ]}
                    >
                      {item.name.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Main area */}
          <View style={styles.webMain}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 32,
                paddingHorizontal: 0,
              }}
              keyboardShouldPersistTaps="handled"
              accessibilityLabel="Find a room content"
            >
              <View style={[styles.webContentWrap, { width: contentWidthWeb }]}>
                {/* page content (same as before, only wrapped for the web frame) */}
                {oldUI}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // Mobile version (unchanged)
  return oldUI;
}

const SIDEBAR_WIDTH = 275;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.white,
  },

  mainContent: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 80,
    paddingHorizontal: 16,
  },

  webContent: {
    paddingTop: 50,
    paddingLeft: 36,
    paddingRight: 36,
  },

  headerWrapper: { width: "100%", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 0,
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
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  subHeaderText: { fontSize: 18, color: colors.primary },

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

  toggleBtn: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleBtnText: {
    fontFamily: "BebasNeue-Regular",
    fontSize: 20,
    color: colors.primary,
    letterSpacing: 0.5,
  },

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

  heartBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    padding: 6,
    borderRadius: 14,
  },

  floorPlanImage: {
    width: "100%",
    height: Platform.OS === "web" ? 650 : 520,
    alignSelf: "center",
  },

  noFloorPlanBox: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  noFloorPlanText: {
    color: colors.white,
    fontFamily: "Poppins",
    textAlign: "center",
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

  // Web styles (same top bar + sidebar as Home Screen)
  webPage: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.white,
  },

  webTopBar: {
    height: WEB_TOPBAR_HEIGHT,
    backgroundColor: colors.darkAccent,
    width: "100%",
    justifyContent: "center",
    paddingLeft: 20,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // android
    elevation: 10,
    zIndex: 10,
  },

  webTopBarLogo: {
    height: 130,
    width: 400,
  },

  webBody: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.white,
  },

  // sidebar styles (web only)
  webSidebar: {
    width: WEB_SIDEBAR_WIDTH,
    backgroundColor: colors.primary,
    paddingTop: 0,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    // android
    elevation: 8,
    zIndex: 5,
  },

  webSidebarHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.25)",
    marginBottom: 12,
  },

  webSidebarLogo: {
    width: "100%",
    height: 80,
  },

  webSidebarLinks: { marginTop: 6 },

  webNavItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 2,
    marginBottom: 8,
  },
  webNavItemSelected: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  webNavText: {
    color: colors.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 28,
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  webNavTextSelected: { color: colors.white },

  webMain: { flex: 1, backgroundColor: colors.white },

  webContentWrap: { paddingTop: 22, paddingBottom: 24 },
});