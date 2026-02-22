// Home Screen layout file
// formattingfor IOS and web
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { useFavorites } from "@/context/FavoritesContext";
import { buildingsAPI } from "@/utils/api";

// describes what each favorite looks like for type safety
interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
}

// Maximum width for large screens
const MAX_SCREEN_WIDTH = 1400;

// Web sizing
const WEB_SIDEBAR_WIDTH = 300;
const WEB_TOPBAR_HEIGHT = 170;

type MenuRoute =
  | "Home"
  | "FindRoom"
  | "CampusMap"
  | "Favorites"
  | "Preferences";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { colors } = useTheme();
  const name = (user as any)?.name ?? "User";

  const isWeb = Platform.OS === "web";
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { width, height } = useWindowDimensions();
  const pagePad = width < 480 ? 12 : 0;

  // mobile content
  const contentWidthMobile = width - pagePad * 2;

  // Web content width accounts for sidebar and max width
  const webAvailable = width - WEB_SIDEBAR_WIDTH - pagePad * 2;
  const contentWidthWeb = Math.min(webAvailable, MAX_SCREEN_WIDTH);

  const { favorites } = useFavorites() as {
    favorites: FavoriteItem[];
    addFavorite: (item: FavoriteItem) => void;
    removeFavorite: (name: string) => void;
  };

  const [roomStatuses, setRoomStatuses] = useState<Record<string, string>>({});

  // Mobile Menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const menuTranslate = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-height, 0],
  });

  const [rooms, setRooms] = useState<
    Array<{ name: string; status: string; subtitle: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  // only used for the "No rooms available" message
  const availableRooms = rooms.filter(
    (room) => room.status === "available" || room.status === "almost_filled",
  );

  // menu items
  const menuItems: { name: string; route: MenuRoute }[] = [
    { name: "Home", route: "Home" },
    { name: "Find a Room", route: "FindRoom" },
    { name: "Campus Map", route: "CampusMap" },
    { name: "Favorites", route: "Favorites" },
    { name: "Preferences", route: "Preferences" },
  ];

  // Load building data
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const buildings = await buildingsAPI.getAll();
        const buildingSummaries = await Promise.all(
          buildings.map(async (building: any) => {
            const buildingRooms = await buildingsAPI.getRooms(building.id);
            const availableCount = buildingRooms.filter(
              (r: any) => r.is_available,
            ).length;

            let status = "busy";
            let subtitle = "All rooms full";

            if (availableCount > 0) {
              status = availableCount >= 5 ? "available" : "almost_filled";
              subtitle = `${availableCount} room${
                availableCount === 1 ? "" : "s"
              } free`;
            }

            return { name: building.name, status, subtitle };
          }),
        );
        setRooms(buildingSummaries);
      } catch (error) {
        console.error("Failed to load buildings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBuildings();
  }, []);

  // simulate changing status for favorites every few seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRoomStatuses((prev) => {
  //       const updated = { ...prev };
  //       favorites.forEach((fav: FavoriteItem) => {
  //         const statuses = ["available", "occupied", "offline"];
  //         updated[fav.name] =
  //           statuses[Math.floor(Math.random() * statuses.length)];
  //       });
  //       return updated;
  //     });
  //   }, 4000);

  //   return () => clearInterval(interval);
  // }, [favorites]);

  // WEB VERSION
  if (isWeb) {
    return (
      <View style={styles.webPage}>
        {/* top bar */}
        <View style={styles.webTopBar}>
          <Image
            source={require("@/assets/images/bf_logo.png")}
            style={styles.webTopBarLogo}
            resizeMode="contain"
          />
        </View>

        {/* sidebar + main */}
        <View style={styles.webBody}>
          {/* Left Sidebar */}
          <View style={styles.webSidebar}>
            <View style={styles.webSidebarLinks}>
              {menuItems.map((item) => {
                const selected = item.route === "Home";
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[
                      styles.webNavItem,
                      selected && styles.webNavItemSelected,
                    ]}
                    onPress={() => navigation.navigate(item.route as never)}
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
            >
              <View style={[styles.webContentWrap, { width: contentWidthWeb }]}>
                <View style={styles.webWelcomeWrap}>
                  <Text style={styles.webWelcomeText}>
                    WELCOME BACK, {name}!
                  </Text>
                </View>

                {/* WEB: Find a Room + Campus Map side-by-side */}
                <View style={styles.webTwoColRow}>
                  <TouchableOpacity
                    style={styles.webTwoColItem}
                    onPress={() => navigation.navigate("FindRoom" as never)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.bannerContainerWeb}>
                      <View style={styles.imageShadow}>
                        <Image
                          source={require("@/assets/images/library.jpg")}
                          style={styles.bannerImageWeb}
                        />
                      </View>
                      <Text style={styles.bannerTextWeb}>FIND A ROOM</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.webTwoColItem}
                    onPress={() => navigation.navigate("CampusMap" as never)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.mapContainerWeb}>
                      <View style={styles.imageShadow}>
                        <Image
                          source={require("@/assets/images/map.jpeg")}
                          style={styles.mapImageWeb}
                        />
                      </View>
                      <Text style={styles.mapTextWeb}>CAMPUS MAP</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Cards */}
                <View style={styles.cardsContainerWeb}>
                  {/* Available Now + Favorites side-by-side for web */}
                  <View style={styles.webTwoColRow}>
                    <View style={[styles.webTwoColItem, styles.cardShadow]}>
                      <LinearGradient
                        colors={["#F4F4F4", "#A1B5A8"]}
                        style={styles.availableNowCard}
                      >
                        <View style={styles.availableHeader}>
                          <Text style={styles.availableTitle}>
                            AVAILABLE NOW
                          </Text>
                          <Ionicons
                            name="location-sharp"
                            size={22}
                            color={colors.primary}
                          />
                        </View>

                        {loading ? (
                          <Text style={styles.loadingText}>Loading...</Text>
                        ) : availableRooms.length === 0 ? (
                          <Text style={styles.noAvailableText}>
                            No rooms available right now
                          </Text>
                        ) : (
                          availableRooms.map((room) => (
                            <View key={room.name} style={styles.availableItem}>
                              <Text style={styles.availableItemText}>
                                {room.name}
                              </Text>
                              <View style={styles.availableRight}>
                                <View
                                  style={[
                                    styles.availableStatusDot,
                                    {
                                      backgroundColor:
                                        room.status === "available"
                                          ? colors.available
                                          : colors.occupied,
                                    },
                                  ]}
                                />
                                <Text style={styles.availableSubtitle}>
                                  {room.subtitle}
                                </Text>
                              </View>
                            </View>
                          ))
                        )}
                      </LinearGradient>
                    </View>

                    <TouchableOpacity
                      style={styles.webTwoColItem}
                      onPress={() => navigation.navigate("Favorites" as never)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.cardShadow}>
                        <LinearGradient
                          colors={["#F4F4F4", "#A1B5A8"]}
                          style={styles.favoritesCard}
                        >
                          <View style={styles.favoritesHeader}>
                            <Text style={styles.favoritesTitle}>
                              MY FAVORITES
                            </Text>
                            <Feather
                              name="heart"
                              size={22}
                              color={colors.primary}
                            />
                          </View>

                          {favorites.length === 0 ? (
                            <Text style={styles.emptyText}>
                              No favorites added yet
                            </Text>
                          ) : (
                            favorites.map((fav: FavoriteItem) => {
                              const status =
                                roomStatuses[fav.name] ||
                                fav.status ||
                                "available";
                              return (
                                <View key={fav.name} style={styles.favItem}>
                                  <Text style={styles.favItemText}>
                                    {fav.name}
                                  </Text>
                                  <View style={styles.favRight}>
                                    <View
                                      style={[
                                        styles.favstatusDot,
                                        {
                                          backgroundColor:
                                            status === "available"
                                              ? colors.available
                                              : status === "occupied"
                                                ? colors.occupied
                                                : colors.offline,
                                        },
                                      ]}
                                    />
                                    <Text style={styles.favNumber}>
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })
                          )}
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Preferences (full width) */}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Preferences" as never)}
                  >
                    <View style={styles.roomCardContainer}>
                      <View style={styles.preferencesLeft}>
                        <Text style={styles.roomCardTextLeft}>PREFERENCES</Text>
                      </View>
                      <Feather
                        name="menu"
                        size={25}
                        color={colors.white}
                        style={styles.prefIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // Mobile version
  return (
    <View
      style={{ flex: 1, alignItems: "center", backgroundColor: colors.gray100 }}
    >
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 32,
          paddingHorizontal: pagePad,
        }}
        scrollEnabled={!menuOpen}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.container,
            { width: contentWidthMobile, alignSelf: "center" },
          ]}
        >
          {/* Header style setup */}
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/bf_logo.png")}
              style={styles.logo}
            />
          </View>

          {/* Welcome message style setup */}
          <View style={styles.welcome}>
            <Text style={styles.welcome}>Welcome Back, {name}!</Text>
          </View>

          {/* Find a Room Banner style setup */}
          <TouchableOpacity
            onPress={() =>
              !menuOpen && navigation.navigate("FindRoom" as never)
            }
          >
            <View style={styles.bannerContainer}>
              <View style={styles.imageShadow}>
                <Image
                  source={require("@/assets/images/library.jpg")}
                  style={styles.bannerImage}
                />
              </View>
              <Text style={styles.bannerText}>FIND A ROOM</Text>
            </View>
          </TouchableOpacity>

          {/* Campus Map style setup*/}
          <TouchableOpacity
            onPress={() =>
              !menuOpen && navigation.navigate("CampusMap" as never)
            }
          >
            <View style={styles.mapContainer}>
              <View style={styles.imageShadow}>
                <Image
                  source={require("@/assets/images/map.jpeg")}
                  style={styles.mapImage}
                />
              </View>
              <Text style={styles.mapText}>CAMPUS MAP</Text>
            </View>
          </TouchableOpacity>

          {/* Room Cards + Favorites style setup */}
          <View style={styles.cardsContainer}>
            {/* Available Now Section */}
            <View style={styles.cardShadow}>
              <LinearGradient
                colors={["#F4F4F4", "#A1B5A8"]}
                style={styles.availableNowCard}
              >
                <View style={styles.availableHeader}>
                  <Text style={styles.availableTitle}>AVAILABLE NOW</Text>
                  <Ionicons
                    name="location-sharp"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                {loading ? (
                  <Text style={styles.loadingText}>Loading...</Text>
                ) : availableRooms.length === 0 ? (
                  <Text style={styles.noAvailableText}>
                    No rooms available right now
                  </Text>
                ) : (
                  availableRooms.map((room) => (
                    <View key={room.name} style={styles.availableItem}>
                      <Text style={styles.availableItemText}>{room.name}</Text>
                      <View style={styles.availableRight}>
                        <View
                          style={[
                            styles.availableStatusDot,
                            {
                              backgroundColor:
                                room.status === "available"
                                  ? colors.available
                                  : colors.occupied,
                            },
                          ]}
                        />
                        <Text style={styles.availableSubtitle}>
                          {room.subtitle}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </LinearGradient>
            </View>

            <TouchableOpacity
              onPress={() =>
                !menuOpen && navigation.navigate("Favorites" as never)
              }
              activeOpacity={0.9}
            >
              <View style={styles.cardShadow}>
                <LinearGradient
                  colors={["#F4F4F4", "#A1B5A8"]}
                  style={styles.favoritesCard}
                >
                  {/* Header with title and heart icon */}
                  <View style={styles.favoritesHeader}>
                    <Text style={styles.favoritesTitle}>MY FAVORITES</Text>
                    <Feather name="heart" size={22} color={colors.primary} />
                  </View>

                  {favorites.length === 0 ? (
                    <Text style={styles.emptyText}>No favorites added yet</Text>
                  ) : (
                    favorites.map((fav: FavoriteItem) => {
                      const status =
                        roomStatuses[fav.name] || fav.status || "available";
                      return (
                        <View key={fav.name} style={styles.favItem}>
                          <Text style={styles.favItemText}>{fav.name}</Text>
                          <View style={styles.favRight}>
                            <View
                              style={[
                                styles.favstatusDot,
                                {
                                  backgroundColor:
                                    status === "available"
                                      ? colors.available
                                      : status === "occupied"
                                        ? colors.occupied
                                        : colors.offline,
                                },
                              ]}
                            />
                            <Text style={styles.favNumber}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </LinearGradient>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                !menuOpen && navigation.navigate("Preferences" as never)
              }
            >
              <View style={styles.roomCardContainer}>
                <View style={styles.preferencesLeft}>
                  <Text style={styles.roomCardTextLeft}>PREFERENCES</Text>
                </View>
                <Feather
                  name="menu"
                  size={25}
                  color={colors.white}
                  style={styles.prefIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Menu Button (MOBILE ONLY) */}
      <View style={styles.menuButtonContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Feather name="menu" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Overlay Dropdown Menu setup (MOBILE ONLY) */}
      {menuOpen && (
        <Animated.View
          style={[
            styles.menuOverlay,
            { width: "100%", transform: [{ translateY: menuTranslate }] },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
            activeOpacity={1}
          />
          <View style={[styles.menuContent, { width: contentWidthMobile }]}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItemContainer}
                onPress={() => {
                  toggleMenu();
                  navigation.navigate(item.route as never);
                }}
              >
                <Text style={styles.menuItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
  // Web styles
  webPage: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: c.gray100,
  },

  webTopBar: {
    height: WEB_TOPBAR_HEIGHT,
    backgroundColor: c.darkAccent,
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
    backgroundColor: c.gray100,
  },

  webSidebar: {
    width: WEB_SIDEBAR_WIDTH,
    backgroundColor: c.primary,
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

  webSidebarLinks: { marginTop: 6 },

  webNavItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 2,
    marginBottom: 8,
  },
  webNavItemSelected: { backgroundColor: "rgba(255,255,255,0.18)" },
  webNavText: {
    color: c.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 28,
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  webNavTextSelected: { color: c.white },

  webMain: { flex: 1, backgroundColor: c.gray100 },

  webContentWrap: { paddingTop: 22, paddingBottom: 24 },

  webWelcomeWrap: { paddingHorizontal: 20, marginBottom: 14, marginTop: 15 },
  webWelcomeText: {
    fontSize: 46,
    fontWeight: "500",
    fontFamily: "BebasNeue-Regular",
    color: c.primary,
  },

  // Two-column web rows
  webTwoColRow: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  webTwoColItem: { flex: 1 },

  // Web image blocks
  bannerContainerWeb: {
    marginVertical: 12,
    paddingHorizontal: 0,
    position: "relative",
  },
  bannerImageWeb: { width: "100%", height: 230, borderRadius: 0 },
  bannerTextWeb: {
    position: "absolute",
    paddingHorizontal: 20,
    bottom: 14,
    left: 12,
    fontSize: 44,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "500",
    color: c.white,
    textShadowColor: "rgba(0, 0, 0, 200)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 15,
  },

  mapContainerWeb: {
    marginVertical: 12,
    paddingHorizontal: 0,
    position: "relative",
  },
  mapImageWeb: { width: "100%", height: 230, borderRadius: 0 },
  mapTextWeb: {
    position: "absolute",
    paddingHorizontal: 20,
    bottom: 14,
    left: 12,
    fontSize: 44,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "500",
    color: c.white,
    textShadowColor: "rgba(0, 0, 0, 200)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },

  cardsContainerWeb: { marginVertical: 16, paddingHorizontal: 0 },

  // Mobile styles (unchanged)
  container: { flex: 1, backgroundColor: c.gray100 },

  header: {
    flexDirection: "row",
    backgroundColor: c.primary,
    padding: 30,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  logo: { width: 300, height: 80, marginRight: 20 },

  welcome: {
    top: 15,
    fontSize: 30,
    fontWeight: "500",
    fontFamily: "BebasNeue-Regular",
    color: c.primary,
    position: "relative",
    paddingHorizontal: 12,
  },

  bannerContainer: {
    marginVertical: 12,
    paddingHorizontal: 20,
    top: 40,
    bottom: 15,
    position: "relative",
  },
  bannerImage: { width: "100%", height: 200, borderRadius: 0 },
  bannerText: {
    position: "absolute",
    paddingHorizontal: 20,
    bottom: 12,
    left: 12,
    fontSize: 40,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "500",
    color: c.gray100,
    textShadowColor: "rgba(0, 0, 0, 200)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 15,
  },

  imageShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
    borderRadius: 10,
  },

  mapContainer: {
    marginVertical: 16,
    paddingHorizontal: 20,
    top: 40,
    position: "relative",
  },
  mapImage: { width: "100%", height: 200, borderRadius: 0 },
  mapText: {
    position: "absolute",
    paddingHorizontal: 20,
    bottom: 12,
    left: 12,
    fontSize: 40,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "500",
    color: c.white,
    textShadowColor: "rgba(0, 0, 0, 200)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },

  cardsContainer: { marginVertical: 16, paddingHorizontal: 20, top: 40 },

  roomCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: c.primary,
    borderRadius: 0,
    marginBottom: 7,
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 5 },
  },
  roomCardTextLeft: {
    fontSize: 27,
    fontFamily: "BebasNeue-Regular",
    color: c.white,
  },

  availableNowCard: {
    borderRadius: 0,
    padding: 20,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },

  availableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  availableTitle: {
    color: c.primary,
    fontFamily: "BebasNeue-Regular",
    fontSize: 27,
    letterSpacing: 0.5,
  },

  availableItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: c.primary,
    borderRadius: 0,
    padding: 18,
    marginBottom: 6,
  },

  availableItemText: {
    color: c.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 20,
  },
  availableRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  availableStatusDot: { width: 11, height: 11, borderRadius: 5.5 },
  availableSubtitle: { color: c.white, fontSize: 14 },

  favoritesCard: {
    backgroundColor: c.marigold,
    padding: 20,
    borderRadius: 0,
    marginTop: 0,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  favoritesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  favoritesTitle: {
    fontSize: 27,
    fontFamily: "BebasNeue-Regular",
    color: c.primary,
  },

  emptyText: {
    color: c.primary,
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },

  // no rooms available text
  noAvailableText: {
    color: c.primary,
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
    //fontFamily: "BebasNeue-Regular",
  },

  favItem: {
    backgroundColor: c.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginVertical: 3,
  },
  favItemText: {
    color: c.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 20,
  },
  favRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  favstatusDot: { width: 11, height: 11, borderRadius: 5.5 },
  favNumber: { color: c.white, fontSize: 14 },

  preferencesLeft: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  prefIcon: { marginTop: 2, marginRight: 12 },

  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
    borderRadius: 0,
    marginBottom: 32,
  },

  loadingText: {
    color: c.white,
    textAlign: "center",
    marginVertical: 10,
  },

  // MOBILE floating menu (unchanged)
  menuButtonContainer: {
    position: "absolute",
    top: 100,
    right: 20,
    zIndex: 100,
    pointerEvents: "box-none",
  },
  menuButton: {
    backgroundColor: c.primary,
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuContent: {
    backgroundColor: c.white,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: "100%",
  },
  menuItemContainer: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: {
    fontSize: 22,
    fontFamily: "BebasNeue-Regular",
    color: c.primary,
  },
  });
}
