// Home Screen layout file
// formattingfor IOS and web
import React, { useState, useRef, useEffect } from "react";
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
import colors from "@/constants/colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { useFavorites } from "@/context/FavoritesContext";
import { buildingsAPI, authAPI } from "@/utils/api";

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

type MenuRoute = "Home" | "FindRoom" | "CampusMap" | "Favorites" | "Preferences";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const name = (user as any)?.name ?? "User";

  const isWeb = Platform.OS === "web";

  const { width, height } = useWindowDimensions();
  const pagePad = width < 480 ? 12 : 0;

  // mobile content
  const contentWidthMobile = width;

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
    (room) => room.status === "available" || room.status === "almost_filled"
  );

  // menu items
  const menuItems: { name: string; route: MenuRoute }[] = [
    { name: "Home", route: "Home" },
    { name: "Find a Room", route: "FindRoom" },
    { name: "Campus Map", route: "CampusMap" },
    { name: "Favorites", route: "Favorites" },
    { name: "Preferences", route: "Preferences" },
  ];

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      // reset navigation back to Login so you can't go "Back" into the app
      (navigation as any).reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  const goToPreferencesSection = (
    section: "Account" | "Groups" | "Notifications"
  ) => {
    (navigation as any).navigate("Preferences", { section });
  };

  // Load building data
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const buildings = await buildingsAPI.getAll();
        const buildingSummaries = await Promise.all(
          buildings.map(async (building: any) => {
            const buildingRooms = await buildingsAPI.getRooms(building.id);
            const availableCount = buildingRooms.filter(
              (r: any) => r.is_available
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
          })
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
  useEffect(() => {
    const interval = setInterval(() => {
      setRoomStatuses((prev) => {
        const updated = { ...prev };
        favorites.forEach((fav: FavoriteItem) => {
          const statuses = ["available", "occupied", "offline"];
          updated[fav.name] =
            statuses[Math.floor(Math.random() * statuses.length)];
        });
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [favorites]);

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
                paddingBottom: 8,
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

                {/* Cards */}
                <View style={styles.cardsContainerWeb}>
                  {/* Favorites at the top (web) */}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Favorites" as never)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.cardShadow}>
                      <LinearGradient
                        colors={["#F4F4F4", "#A1B5A8"]}
                        style={styles.favoritesCard}
                      >
                        <View style={styles.favoritesHeader}>
                          <Text style={styles.favoritesTitle}>MY FAVORITES</Text>
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

                  {/* WEB ONLY: Available Now + Manage side-by-side */}
                  <View style={styles.webBottomTwoColRow}>
                    {/* Available Now (left) */}
                    <View style={styles.webBottomTwoColItem}>
                      <View style={styles.cardShadow}>
                        <LinearGradient
                          colors={["#F4F4F4", "#A1B5A8"]}
                          style={[styles.availableNowCard, styles.availableNowCardWeb]}
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
                    </View>

                    {/* Manage (right) */}
                    <View style={styles.webBottomTwoColItem}>
                      <View style={styles.cardShadow}>
                        <View
                          style={[
                            styles.preferencesQuickCard,
                            styles.preferencesQuickCardWeb,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <View style={styles.preferencesQuickHeader}>
                            <Text style={styles.preferencesQuickTitle}>
                              MANAGE
                            </Text>
                            <Feather
                              name="menu"
                              size={22}
                              color={colors.white}
                            />
                          </View>

                          {/* WEB ONLY: single-row Manage buttons */}
                          <View style={styles.preferencesQuickRowWeb}>
                            <TouchableOpacity
                              style={styles.preferencesQuickButtonWrap}
                              onPress={() => goToPreferencesSection("Account")}
                              activeOpacity={0.9}
                            >
                              <LinearGradient
                                colors={["#F4F4F4", "#A1B5A8"]}
                                style={styles.preferencesQuickButton}
                              >
                                <Text
                                  style={styles.preferencesQuickButtonText}
                                  numberOfLines={1}
                                >
                                  ACCOUNT
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.preferencesQuickButtonWrap}
                              onPress={() => goToPreferencesSection("Groups")}
                              activeOpacity={0.9}
                            >
                              <LinearGradient
                                colors={["#F4F4F4", "#A1B5A8"]}
                                style={styles.preferencesQuickButton}
                              >
                                <Text
                                  style={styles.preferencesQuickButtonText}
                                  numberOfLines={1}
                                >
                                  GROUPS
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.preferencesQuickButtonWrap}
                              onPress={() =>
                                goToPreferencesSection("Notifications")
                              }
                              activeOpacity={0.9}
                            >
                              <LinearGradient
                                colors={["#F4F4F4", "#A1B5A8"]}
                                style={styles.preferencesQuickButton}
                              >
                                <Text
                                  style={styles.preferencesQuickButtonText}
                                  numberOfLines={1}
                                >
                                  NOTIFICATIONS
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.preferencesQuickButtonWrap}
                              onPress={handleLogout}
                              activeOpacity={0.9}
                            >
                              <View style={styles.preferencesQuickLogoutLightRed}>
                                <Text
                                  style={styles.preferencesQuickLogoutText}
                                  numberOfLines={1}
                                >
                                  LOG OUT
                                </Text>
                                <Feather
                                  name="log-out"
                                  size={20}
                                  color={colors.white}
                                />
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
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
    <View style={{ flex: 1, alignItems: "center", backgroundColor: colors.white }}>
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
        <View style={[styles.container, { width: contentWidthMobile, alignSelf: "center" }]}>
          {/* Header style setup */}
          <View style={styles.header}>
            <Image source={require("@/assets/images/bf_logo.png")} style={styles.logo} />
          </View>

          {/* Welcome message style setup */}
          <View style={styles.welcome}>
            <Text style={styles.welcome}>Welcome Back, {name}!</Text>
          </View>

          {/* Favorites moved to the top but aligned with the rest of the cards */}
          <View style={styles.favoritesTopContainer}>
            <TouchableOpacity
              onPress={() => !menuOpen && navigation.navigate("Favorites" as never)}
              activeOpacity={0.9}
            >
              <View style={styles.cardShadow}>
                <LinearGradient colors={["#F4F4F4", "#A1B5A8"]} style={styles.favoritesCard}>
                  {/* Header with title and heart icon */}
                  <View style={styles.favoritesHeader}>
                    <Text style={styles.favoritesTitle}>MY FAVORITES</Text>
                    <Feather name="heart" size={22} color={colors.primary} />
                  </View>

                  {favorites.length === 0 ? (
                    <Text style={styles.emptyText}>No favorites added yet</Text>
                  ) : (
                    favorites.map((fav: FavoriteItem) => {
                      const status = roomStatuses[fav.name] || fav.status || "available";
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
          </View>

          {/* Find a Room Banner style setup */}
          <TouchableOpacity onPress={() => !menuOpen && navigation.navigate("FindRoom" as never)}>
            <View style={styles.bannerContainer}>
              <View style={styles.imageShadow}>
                <Image source={require("@/assets/images/library.jpg")} style={styles.bannerImage} />
              </View>
              <Text style={styles.bannerText}>FIND A ROOM</Text>
            </View>
          </TouchableOpacity>

          {/* Campus Map style setup*/}
          <TouchableOpacity onPress={() => !menuOpen && navigation.navigate("CampusMap" as never)}>
            <View style={styles.mapContainer}>
              <View style={styles.imageShadow}>
                <Image source={require("@/assets/images/map.jpeg")} style={styles.mapImage} />
              </View>
              <Text style={styles.mapText}>CAMPUS MAP</Text>
            </View>
          </TouchableOpacity>

          {/* Room Cards + Favorites style setup */}
          <View style={styles.cardsContainer}>
            {/* Available Now Section */}
            <View style={styles.cardShadow}>
              <LinearGradient colors={["#F4F4F4", "#A1B5A8"]} style={styles.availableNowCard}>
                <View style={styles.availableHeader}>
                  <Text style={styles.availableTitle}>AVAILABLE NOW</Text>
                  <Ionicons name="location-sharp" size={22} color={colors.primary} />
                </View>

                {loading ? (
                  <Text style={styles.loadingText}>Loading...</Text>
                ) : availableRooms.length === 0 ? (
                  <Text style={styles.noAvailableText}>No rooms available right now</Text>
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
                                room.status === "available" ? colors.available : colors.occupied,
                            },
                          ]}
                        />
                        <Text style={styles.availableSubtitle}>{room.subtitle}</Text>
                      </View>
                    </View>
                  ))
                )}
              </LinearGradient>
            </View>

            <View style={styles.cardShadow}>
              <View style={[styles.preferencesQuickCard, { backgroundColor: colors.primary }]}>
                <View style={styles.preferencesQuickHeader}>
                  <Text style={styles.preferencesQuickTitle}>MANAGE</Text>
                  <Feather name="menu" size={22} color={colors.white} />
                </View>

                {/* Row 1: ACCOUNT + GROUPS */}
                <View style={styles.preferencesQuickRowTwo}>
                  <TouchableOpacity
                    style={styles.preferencesQuickButtonWrap}
                    onPress={() => !menuOpen && goToPreferencesSection("Account")}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#F4F4F4", "#A1B5A8"]}
                      style={styles.preferencesQuickButton}
                    >
                      <Text style={styles.preferencesQuickButtonText} numberOfLines={1}>
                        ACCOUNT
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.preferencesQuickButtonWrap}
                    onPress={() => !menuOpen && goToPreferencesSection("Groups")}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#F4F4F4", "#A1B5A8"]}
                      style={styles.preferencesQuickButton}
                    >
                      <Text style={styles.preferencesQuickButtonText} numberOfLines={1}>
                        GROUPS
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Row 2: LOG OUT + NOTIFICATIONS */}
                <View style={styles.preferencesQuickBottomRow}>
                  <TouchableOpacity
                    style={styles.preferencesQuickButtonWrap}
                    onPress={() => !menuOpen && goToPreferencesSection("Notifications")}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#F4F4F4", "#A1B5A8"]}
                      style={styles.preferencesQuickButton}
                    >
                      <Text style={styles.preferencesQuickButtonText} numberOfLines={1}>
                        NOTIFICATIONS
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.preferencesQuickButtonWrap}
                    onPress={() => !menuOpen && handleLogout()}
                    activeOpacity={0.9}
                  >
                    <View style={styles.preferencesQuickLogoutLightRed}>
                      <Text style={styles.preferencesQuickLogoutText} numberOfLines={1}>
                        LOG OUT
                      </Text>
                      <Feather name="log-out" size={20} color={colors.white} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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

const styles = StyleSheet.create({
  // Web styles
  webPage: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.gray100,
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
    backgroundColor: colors.gray100,
  },

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

  webSidebarLinks: { marginTop: 6 },

  webNavItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 2,
    marginBottom: 8,
  },
  webNavItemSelected: { backgroundColor: "rgba(255,255,255,0.18)" },
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

  webMain: { flex: 1, backgroundColor: colors.gray100 },

  webContentWrap: { paddingTop: 22, paddingBottom: 0 },

  webWelcomeWrap: { paddingHorizontal: 20, marginBottom: 14, marginTop: 15 },
  webWelcomeText: {
    fontSize: 46,
    fontWeight: "500",
    fontFamily: "BebasNeue-Regular",
    color: colors.primary,
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

  // NEW: bottom row (Available Now + Manage) side-by-side
  webBottomTwoColRow: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 12,
    marginBottom: 0,
    alignItems: "stretch",
  },
  webBottomTwoColItem: {
    flex: 1,
    minWidth: 0,
  },

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
    color: colors.white,
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
    color: colors.white,
    textShadowColor: "rgba(0, 0, 0, 200)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },

  cardsContainerWeb: { marginVertical: 16, paddingHorizontal: 0 },

  // Mobile styles (unchanged)
  container: { flex: 1, backgroundColor: colors.gray100 },

  header: {
    flexDirection: "row",
    backgroundColor: colors.primary,
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
    color: colors.primary,
    position: "relative",
    paddingHorizontal: 12,
  },

  favoritesTopContainer: {
    marginVertical: 16,
    paddingHorizontal: 20,
    top: 40,
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
    color: colors.gray100,
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
    color: colors.white,
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
    backgroundColor: colors.primary,
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
    color: colors.white,
  },

  availableNowCard: {
    borderRadius: 0,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },

  // NEW: web override to remove the big bottom gap
  availableNowCardWeb: {
    marginBottom: 0,
  },

  availableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  availableTitle: {
    color: colors.primary,
    fontFamily: "BebasNeue-Regular",
    fontSize: 27,
    letterSpacing: 0.5,
  },

  availableItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 0,
    padding: 18,
    marginBottom: 6,
  },

  availableItemText: {
    color: colors.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 20,
  },
  availableRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  availableStatusDot: { width: 11, height: 11, borderRadius: 5.5 },
  availableSubtitle: { color: colors.white, fontSize: 14 },

  favoritesCard: {
    backgroundColor: colors.marigold,
    padding: 20,
    borderRadius: 0,
    marginTop: 0,
    marginBottom: 0,
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
    color: colors.primary,
  },

  emptyText: {
    color: colors.primary,
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },

  // no rooms available text
  noAvailableText: {
    color: colors.primary,
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
    //fontFamily: "BebasNeue-Regular",
  },

  favItem: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginVertical: 3,
  },
  favItemText: {
    color: colors.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 20,
  },
  favRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  favstatusDot: { width: 11, height: 11, borderRadius: 5.5 },
  favNumber: { color: colors.white, fontSize: 14 },

  preferencesLeft: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  prefIcon: { marginTop: 2, marginRight: 12 },

  logoutCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.primary,
    borderRadius: 0,
    marginTop: 10,
    marginBottom: 7,
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 5 },
  },
  logoutText: {
    fontSize: 27,
    fontFamily: "BebasNeue-Regular",
    color: colors.white,
  },

  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
    borderRadius: 0,
    marginBottom: 0,
  },

  loadingText: {
    color: colors.white,
    textAlign: "center",
    marginVertical: 10,
  },

  preferencesQuickCard: {
    borderRadius: 0,
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
  },

  // NEW: web override so it lines up tight in the 2-col row
  preferencesQuickCardWeb: {
    marginTop: 0,
    marginBottom: 0,
  },

  preferencesQuickHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  preferencesQuickTitle: {
    color: colors.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 27,
    letterSpacing: 0.5,
  },

  // single-row Manage buttons (WEB ONLY, used only in web render branch)
  preferencesQuickRowWeb: {
    flexDirection: "row",
    gap: 14,
    alignItems: "stretch",
  },

  // Existing mobile rows (still used ONLY by mobile JSX)
  preferencesQuickRowTwo: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  preferencesQuickBottomRow: {
    flexDirection: "row",
    gap: 10,
  },

  preferencesQuickButtonWrap: {
    flex: 1,
  },

  // Button is the gradient container now
  preferencesQuickButton: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  preferencesQuickButtonText: {
    color: colors.primary,
    fontFamily: "BebasNeue-Regular",
    fontSize: 22,
    letterSpacing: 0.4,
  },

  // Light red logout button (same size as others)
  preferencesQuickLogoutLightRed: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#D9534F",
  },
  preferencesQuickLogoutText: {
    color: colors.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 23,
    letterSpacing: 0.4,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.white,
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
    color: colors.primary,
  },
});
