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
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_TITLE_LARGE,
  FONT_SIZE_SECTION,
  FONT_SIZE_CARD_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_CAPTION,
  FONT_SIZE_NAV,
  WEB_SIDEBAR_WIDTH,
  WEB_TOPBAR_HEIGHT,
  WEB_NAV_ITEM_PADDING_V,
  WEB_NAV_ITEM_PADDING_H,
  WEB_NAV_ITEM_MARGIN_BOTTOM,
  WEB_CONTENT_PADDING_TOP,
  WEB_CONTENT_PADDING_BOTTOM,
  WEB_CONTENT_PADDING_H,
  WEB_SIDEBAR_PADDING_H,
  PAGE_CONTENT_PADDING_H,
  CARD_PADDING,
  CARD_MARGIN_BOTTOM,
  CARD_BORDER_RADIUS,
  SCROLL_PADDING_BOTTOM,
  SPACE_MD,
  SPACE_LG,
} from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";
import { useRegisterSessionExpiryNavigation } from "@/context/SessionExpiryContext";
import { LinearGradient } from "expo-linear-gradient";
import { useFavorites } from "@/context/FavoritesContext";
import { useRoomAvailability } from "@/context/RoomAvailabilityContext";
import { buildingsAPI, authAPI, usersAPI, Room } from "@/utils/api"; // added usersAPI
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import InfoTooltip from "@/components/InfoTooltip";
import HoverTooltip from "@/components/HoverTooltip";


// describes what each favorite looks like for type safety
interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
  roomId?: number;
}

// Maximum width for large screens
const MAX_SCREEN_WIDTH = 1400;

type MenuRoute =
  | "Home"
  | "FindRoom"
  | "CampusMap"
  | "Favorites"
  | "Preferences";

type RoomStatus = "available" | "occupied" | "offline";

function roomStatusLabel(s: RoomStatus) {
  if (s === "available") return "Available";
  if (s === "occupied") return "Occupied";
  return "Offline";
}

function roomStatusColor(s: RoomStatus, colors: any) {
  if (s === "available") return colors.available;
  if (s === "occupied") return colors.occupied;
  return colors.gray400; // offline
}

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useRegisterSessionExpiryNavigation();
  const { user } = useUser();
  const { colors } = useTheme();
  const name = (user as any)?.name ?? "User";

  const isWeb = Platform.OS === "web";
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { width, height } = useWindowDimensions();
  const pagePad = PAGE_CONTENT_PADDING_H;

  const [favoriteRooms, setFavoriteRooms] = useState<Room[]>([]); // real time favorites data
  // mobile content
  const contentWidthMobile = width;
  // get correct building name for favorites
  const [buildingNameById, setBuildingNameById] = useState<
    Record<string, string>
  >({});

  // Web content width accounts for sidebar and max width
  const webAvailable = width - WEB_SIDEBAR_WIDTH - pagePad * 2;
  const contentWidthWeb = Math.min(webAvailable, MAX_SCREEN_WIDTH);

  const { favorites } = useFavorites() as {
    favorites: FavoriteItem[];
    addFavorite: (item: FavoriteItem) => void;
    removeFavorite: (name: string) => void;
  };

  // Mobile Menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const { availabilities: liveAvailabilities } = useRoomAvailability();

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    Animated.timing(menuAnim, {
      toValue: next ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const menuTranslate = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-height, 0],
  });
  // just ARC on IOS to fix formatting issue
  const displayName = (name: string) => {
    if (Platform.OS !== "web" && name === "Academic Research Center") {
      return "ARC";
    }
    return name;
  };

  const [buildingMeta, setBuildingMeta] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [buildingRoomIds, setBuildingRoomIds] = useState<
    Record<number, number[]>
  >({});
  const [seedAvailability, setSeedAvailability] = useState<
    Record<number, boolean>
  >({});
  const [loading, setLoading] = useState(true);

  const effectiveAvailability = useMemo(
    () => ({ ...seedAvailability, ...liveAvailabilities }),
    [seedAvailability, liveAvailabilities],
  );

  const buildingSummaries = useMemo(() => {
    return buildingMeta.map((building) => {
      const ids = buildingRoomIds[building.id] ?? [];
      const availableCount = ids.filter(
        (id) => effectiveAvailability[id],
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
    });
  }, [buildingMeta, buildingRoomIds, effectiveAvailability]);

  const favoriteRoomsLive = useMemo(() => {
    return favoriteRooms.map((room: any) => {
      const id = room.id as number | undefined;
      if (
        id == null ||
        !Object.prototype.hasOwnProperty.call(effectiveAvailability, id)
      ) {
        return room;
      }
      const next = effectiveAvailability[id];
      if (next === room.is_available) return room;
      return { ...room, is_available: next };
    });
  }, [favoriteRooms, effectiveAvailability]);

  // only used for the "No rooms available" message
  const availableRooms = buildingSummaries.filter(
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
  // automatically jump to correct preferences section when clicked on hoome screen
  const goToPreferencesSection = (
    section: "Account" | "Groups" | "Notifications"
  ) => {
    (navigation as any).navigate("Preferences", { section });
  };

  const normalizeBuildingForRoomDetails = (buildingName: string) => {
  if (buildingName === "Academic Research Center") {
      return "Academic & Research Center";
    }
    return buildingName as
      | "Stocker Center"
      | "Academic & Research Center"
      | "Alden Library";
  };

  // get building names for favorites
  useEffect(() => {
    const loadBuildingNames = async () => {
      try {
        const buildings = await buildingsAPI.getAll();
        const map: Record<string, string> = {};
        for (const b of buildings) {
          map[String((b as any).id)] = (b as any).name;
        }
        setBuildingNameById(map);
      } catch (e) {
        console.error("Failed to load building names:", e);
        setBuildingNameById({});
      }
    };

    loadBuildingNames();
  }, []);
  // load favorites data
  // updates status when screens switch
  // load favorites data (and attach building_name)
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favsRaw = await usersAPI.getFavorites();

        const favs: any[] = Array.isArray(favsRaw)
          ? favsRaw
          : Array.isArray((favsRaw as any)?.favorites)
          ? (favsRaw as any).favorites
          : Array.isArray((favsRaw as any)?.data)
          ? (favsRaw as any).data
          : [];

        const normalized = favs.map((room: any) => {
          const buildingId =
            room.building_id ??
            room.buildingId ??
            room.buildingID ??
            room.building;

          const buildingName =
            room.building?.name ??
            room.building_name ??
            room.buildingName ??
            (buildingId != null ? buildingNameById[String(buildingId)] : "");

          return { ...room, building_name: buildingName };
        });

        setFavoriteRooms(normalized);
      } catch (error) {
        console.error("Failed to load favorites:", error);
        setFavoriteRooms([]);
      }
    };

    loadFavorites();
  }, [buildingNameById, favorites]);

  // Load building + room id layout once; live counts come from RoomAvailabilityContext
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const buildings = await buildingsAPI.getAll();
        const meta = buildings.map((b: any) => ({
          id: b.id,
          name: b.name,
        }));
        const roomIds: Record<number, number[]> = {};
        const seed: Record<number, boolean> = {};

        for (const building of buildings) {
          const buildingRooms = await buildingsAPI.getRooms(building.id);
          roomIds[building.id] = buildingRooms.map((r: Room) => r.id);
          for (const r of buildingRooms) {
            seed[r.id] = r.is_available;
          }
        }

        setBuildingMeta(meta);
        setBuildingRoomIds(roomIds);
        setSeedAvailability(seed);
      } catch (error) {
        console.error("Failed to load buildings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBuildings();
  }, []);


  // WEB VERSION
  if (isWeb) {
    return (
      <View style={styles.webPage} accessibilityLabel="Home screen">
        {/* top bar */}
        <LinearGradient
          colors={["#06442A", "#04301D"]}
          style={styles.webTopBar}
          accessibilityLabel="Top bar"
        >
          <Image
            source={require("@/assets/images/bf_logo.png")}
            style={styles.webTopBarLogo}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Bobcat Finder logo"
            accessibilityIgnoresInvertColors
          />
          <View style={styles.topBarTooltipSlot}>
            <InfoTooltip message="This is your dashboard. View favorites, available rooms, and manage your account." />
          </View>
        </LinearGradient>

        {/* sidebar + main */}
        <View style={styles.webBody}>
          {/* Left Sidebar */}
          <View style={styles.webSidebar}
            accessibilityLabel="Navigation sidebar"
          >
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
                paddingBottom: SCROLL_PADDING_BOTTOM,
                paddingHorizontal: 0,
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
              accessibilityLabel="Home content"
            >
              <View style={[styles.webContentWrap, { width: contentWidthWeb }]}>
                <View style={styles.webWelcomeWrap}>
                  <Text
                    style={styles.webWelcomeText}
                    accessibilityRole="header"
                  >
                    WELCOME BACK, {name}!
                  </Text>
                </View>

                {/* WEB: Find a Room + Campus Map side-by-side */}
                <View
                  style={styles.webTwoColRow}
                  accessibilityLabel="Quick actions"
                >
                  <TouchableOpacity
                    style={styles.webTwoColItem}
                    onPress={() => navigation.navigate("FindRoom" as never)}
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel="Find a room"
                    accessibilityHint="Opens the Find a Room screen"
                  >
                    <View style={styles.bannerContainerWeb}>
                      <View style={styles.imageShadow}>
                        <Image
                          source={require("@/assets/images/library.jpg")}
                          style={styles.bannerImageWeb}
                          accessibilityRole="image"
                          accessibilityLabel="Library"
                          accessibilityIgnoresInvertColors
                        />
                      </View>
                      <Text style={styles.bannerTextWeb}>FIND A ROOM</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.webTwoColItem}
                    onPress={() => navigation.navigate("CampusMap" as never)}
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel="Campus map"
                    accessibilityHint="Opens the Campus Map screen"
                  >
                    <View style={styles.mapContainerWeb}>
                      <View style={styles.imageShadow}>
                        <Image
                          source={require("@/assets/images/map.jpeg")}
                          style={styles.mapImageWeb}
                          accessibilityRole="image"
                          accessibilityLabel="Campus map preview"
                          accessibilityIgnoresInvertColors
                        />
                      </View>
                      <Text style={styles.mapTextWeb}>CAMPUS MAP</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* WEB: Available Now + Favorites side-by-side */}
                <View style={styles.webTwoColRow} accessibilityLabel="Cards row">
                  <View style={styles.webDashboardLeftColumn}>
                    {/* Available Now */}
                    <TouchableOpacity
                      style={styles.webLeftColumnCard}
                      onPress={() => navigation.navigate("CampusMap" as never)}
                      activeOpacity={0.9}
                      accessibilityRole="button"
                      accessibilityLabel="Available now"
                      accessibilityHint="Opens the Campus Map screen"
                    >
                      <View
                        style={styles.cardShadow}
                        accessibilityLabel="Available now"
                      >
                        <LinearGradient
                          colors={["#06442A", "#04301D"]}
                          style={styles.availableNowCard}
                        >
                          <View style={styles.availableHeader}>
                            <Text style={styles.availableTitle}>AVAILABLE NOW</Text>
                            <Ionicons
                              name="location-sharp"
                              size={22}
                              color={colors.white}
                              accessibilityElementsHidden
                              importantForAccessibility="no"
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
                              <LinearGradient
                                key={room.name}
                                colors={["#0F7046", "#0D6440"]}
                                style={styles.availableItem}
                                accessibilityLabel={`${room.name}, ${room.subtitle}`}
                              >
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
                              </LinearGradient>
                            ))
                          )}
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>

                    {/* WEB: Manage row */}
                    <View style={styles.webLeftColumnCard}>
                      <View style={[styles.cardShadow, { marginHorizontal: 0, borderRadius: CARD_BORDER_RADIUS }]}>
                        <LinearGradient
                          colors={["#0F7046", "#0D6440"]}
                          style={styles.manageCardWeb}
                        >
                          <View style={styles.manageHeader}>
                            <Text style={styles.manageTitle}>MANAGE</Text>
                            <Feather
                              name="menu"
                              size={22}
                              color={colors.white}
                              accessibilityElementsHidden
                              importantForAccessibility="no"
                            />
                          </View>

                          <View style={styles.manageRowWeb}>
                            <TouchableOpacity
                              style={styles.manageBtnWrap}
                              onPress={() => goToPreferencesSection("Account")}
                              activeOpacity={0.9}
                            >
                              <LinearGradient
                                colors={["#F3F7F5", "#E4ECE7"]}
                                style={styles.manageBtn}
                              >
                                <Text style={styles.manageBtnText} numberOfLines={1}>
                                  ACCOUNT
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.manageBtnWrap}
                              onPress={() => goToPreferencesSection("Groups")}
                              activeOpacity={0.9}
                            >
                              <LinearGradient
                                colors={["#F3F7F5", "#E4ECE7"]}
                                style={styles.manageBtn}
                              >
                                <Text style={styles.manageBtnText} numberOfLines={1}>
                                  GROUPS
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.manageBtnWrap}
                              onPress={() => goToPreferencesSection("Notifications")}
                              activeOpacity={0.9}
                            >
                              <LinearGradient
                                colors={["#F3F7F5", "#E4ECE7"]}
                                style={styles.manageBtn}
                              >
                                <Text style={styles.manageBtnText} numberOfLines={1}>
                                  NOTIFICATIONS
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.manageBtnWrap}
                              onPress={handleLogout}
                              activeOpacity={0.9}
                            >
                              <LinearGradient
                                colors={["#D96B68", "#B95653"]}
                                style={styles.logoutBtn}
                              >
                                <Text style={styles.logoutBtnText} numberOfLines={1}>
                                  LOG OUT
                                </Text>
                                <Feather
                                  name="log-out"
                                  size={20}
                                  color={colors.white}
                                  accessibilityElementsHidden
                                  importantForAccessibility="no"
                                />
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        </LinearGradient>
                      </View>
                    </View>
                  </View>

                  <View style={styles.webDashboardRightColumn}>
                    {/* Favorites */}
                    <TouchableOpacity
                      style={styles.webRightColumnCard}
                      onPress={() => navigation.navigate("Favorites" as never)}
                      activeOpacity={0.9}
                      accessibilityRole="button"
                      accessibilityLabel="My favorites"
                      accessibilityHint="Opens the Favorites screen"
                    >
                      <View style={styles.cardShadow}>
                        <LinearGradient
                          colors={["#06442A", "#04301D"]}
                          style={styles.favoritesCard}
                        >
                          <View style={styles.favoritesHeader}>
                            <Text style={styles.favoritesTitle}>MY FAVORITES</Text>
                            <Feather
                              name="heart"
                              size={22}
                              color={colors.white}
                              accessibilityElementsHidden
                              importantForAccessibility="no"
                            />
                          </View>

                          {favoriteRoomsLive.length === 0 ? (
                            <Text style={styles.emptyText}>
                              No favorites added yet
                            </Text>
                          ) : (
                            favoriteRoomsLive.map((room: any, idx: number) => {
                              const buildingName = String(
                                room.building_name ?? room.buildingName ?? ""
                              );

                              return (
                                <LinearGradient
                                  key={String(
                                    room.id ??
                                      room.room_id ??
                                      `${buildingName}-${room.room_number}-${idx}`
                                  )}
                                  colors={["#0F7046", "#0D6440"]}
                                  style={styles.favItem}
                                >
                                  <Text style={styles.favItemText}>
                                    {displayName(buildingName).toUpperCase()}{" "}
                                    {room.room_number}
                                  </Text>

                                  <View style={styles.favRight}>
                                    <View
                                      style={[
                                        styles.favstatusDot,
                                        {
                                          backgroundColor: room.is_available
                                            ? colors.available
                                            : colors.occupied,
                                        },
                                      ]}
                                    />

                                    <Text style={styles.favNumber}>
                                      {room.is_available
                                        ? "Available"
                                        : "Unavailable"}
                                    </Text>
                                  </View>
                                </LinearGradient>
                              );
                            })
                          )}
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
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
    <View
      style={{ flex: 1, alignItems: "center", backgroundColor: colors.white }}
      accessibilityLabel="Home screen"
    >
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: SCROLL_PADDING_BOTTOM,
          paddingHorizontal: pagePad,
        }}
        scrollEnabled={!menuOpen}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel="Home content"
      >
        <View
          style={[
            styles.container,
            { width: contentWidthMobile, alignSelf: "center" },
          ]}
        >
          {/* Header style setup */}
          <LinearGradient
            colors={["#06442A", "#04301D"]}
            style={styles.header}
          >
            <Image
              source={require("@/assets/images/bf_logo.png")}
              style={styles.logo}
              accessibilityRole="image"
              accessibilityLabel="Bobcat Finder logo"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.topBarTooltipSlot}>
              <InfoTooltip message="This is your dashboard. View favorites, available rooms, and manage your account." />
            </View>
          </LinearGradient>

          {/* Welcome message style setup */}
          <View style={styles.welcome}>
            <Text style={styles.welcome} accessibilityRole="header">
              Welcome Back, {name}!
            </Text>
          </View>

          {/* Favorites moved to the top but aligned with the rest of the cards */}
          <View style={styles.favoritesTopContainer}>
            <TouchableOpacity
              onPress={() =>
                !menuOpen && navigation.navigate("Favorites" as never)
              }
              activeOpacity={0.9}
            >
              <View style={styles.cardShadow}>
                <LinearGradient
                  colors={["#06442A", "#04301D"]}
                  style={styles.favoritesCard}
                >
                  {/* Header with title and heart icon */}
                  <View style={styles.favoritesHeader}>
                    <Text style={styles.favoritesTitle}>MY FAVORITES</Text>
                    <Feather name="heart" size={22} color={colors.white} />
                  </View>

                  {favoriteRoomsLive.length === 0 ? (
                    <Text style={styles.emptyText}>No favorites added yet</Text>
                  ) : (
                    favoriteRoomsLive.map((room: any) => {
                      const buildingName = String(
                        room.building_name ?? room.buildingName ?? ""
                      );

                      return (
                        <LinearGradient
                          key={String(
                            room.id ??
                              room.room_id ??
                              `${buildingName}-${room.room_number}`
                          )}
                          colors={["#0F7046", "#0D6440"]}
                          style={styles.favItem}
                        >
                          <Text style={styles.favItemText}>
                            {displayName(buildingName).toUpperCase()}{" "}
                            {room.room_number}
                          </Text>
                          <View style={styles.favRight}>
                            <View
                              style={[
                                styles.favstatusDot,
                                {
                                  backgroundColor: room.is_available
                                    ? colors.available
                                    : colors.occupied,
                                },
                              ]}
                            />
                            <Text style={styles.favNumber}>
                              {room.is_available ? "Available" : "Unavailable"}
                            </Text>
                          </View>
                        </LinearGradient>
                      );
                    })
                  )}
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>

          {/* Find a Room Banner style setup */}
          <TouchableOpacity
            onPress={() => !menuOpen && navigation.navigate("FindRoom" as never)}
            accessibilityRole="button"
            accessibilityLabel="Find a room"
            accessibilityHint="Opens the Find a Room screen"
          >
            <View style={styles.bannerContainer}>
              <View style={styles.imageShadow}>
                <Image
                  source={require("@/assets/images/library.jpg")}
                  style={styles.bannerImage}
                  accessibilityRole="image"
                  accessibilityLabel="Library"
                  accessibilityIgnoresInvertColors
                />
              </View>
              <Text style={styles.bannerText}>FIND A ROOM</Text>
            </View>
          </TouchableOpacity>

          {/* Campus Map style setup*/}
          <TouchableOpacity
            onPress={() => !menuOpen && navigation.navigate("CampusMap" as never)}
            accessibilityRole="button"
            accessibilityLabel="Campus map"
            accessibilityHint="Opens the Campus Map screen"
          >
            <View style={styles.mapContainer}>
              <View style={styles.imageShadow}>
                <Image
                  source={require("@/assets/images/map.jpeg")}
                  style={styles.mapImage}
                  accessibilityRole="image"
                  accessibilityLabel="Campus map preview"
                  accessibilityIgnoresInvertColors
                />
              </View>
              <Text style={styles.mapText}>CAMPUS MAP</Text>
            </View>
          </TouchableOpacity>

          {/* Room Cards + Favorites style setup */}
          <View style={styles.cardsContainer} accessibilityLabel="Cards">
            {/* Available Now Section */}
            <TouchableOpacity
              style={styles.cardShadow}
              onPress={() => !menuOpen && navigation.navigate("CampusMap" as never)}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Available now"
              accessibilityHint="Opens the Campus Map screen"
            >
              <LinearGradient
                colors={["#06442A", "#04301D"]}style={styles.availableNowCard}>
                <View style={styles.availableHeader}>
                  <Text style={styles.availableTitle}>AVAILABLE NOW</Text>
                  <Ionicons
                    name="location-sharp"
                    size={22}
                    color={colors.white}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                </View>

                {loading ? (
                  <Text
                    style={styles.loadingText}
                    accessibilityLabel="Loading available rooms"
                  >
                    Loading...
                  </Text>
                ) : availableRooms.length === 0 ? (
                  <Text style={styles.noAvailableText}>
                    No rooms available right now
                  </Text>
                ) : (
                  availableRooms.map((room) => (
                    <LinearGradient
                      key={room.name}
                      colors={["#0F7046", "#0D6440"]}
                      style={styles.availableItem}
                      accessibilityLabel={`${room.name}, ${room.subtitle}`}
                    >
                      <Text style={styles.availableItemText}>
                        {displayName(room.name)}
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
                        <Text style={styles.availableSubtitle}>{room.subtitle}</Text>
                      </View>
                    </LinearGradient>
                  ))
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Manage quick buttons (mobile) */}
            <View style={[styles.cardShadow, { marginVertical: 0 }]}>
              <LinearGradient
                colors={["#0F7046", "#0D6440"]}
                style={styles.manageCard}
              >
                <View style={styles.manageHeader}>
                  <Text style={styles.manageTitle}>MANAGE</Text>
                  <Feather name="menu" size={22} color={colors.white} />
                </View>

                {/* Row 1: ACCOUNT + GROUPS */}
                <View style={styles.manageRowMobile}>
                  <TouchableOpacity
                    style={styles.manageBtnWrap}
                    onPress={() => !menuOpen && goToPreferencesSection("Account")}
                    activeOpacity={0.9}
                  >
                    <LinearGradient colors={["#F3F7F5", "#E4ECE7"]} style={styles.manageBtn}>
                      <Text style={styles.manageBtnText} numberOfLines={1}>
                        ACCOUNT
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.manageBtnWrap}
                    onPress={() => !menuOpen && goToPreferencesSection("Groups")}
                    activeOpacity={0.9}
                  >
                    <LinearGradient colors={["#F3F7F5", "#E4ECE7"]} style={styles.manageBtn}>
                      <Text style={styles.manageBtnText} numberOfLines={1}>
                        GROUPS
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Row 2: NOTIFICATIONS + LOG OUT */}
                <View style={styles.manageRowMobile}>
                  <TouchableOpacity
                    style={styles.manageBtnWrap}
                    onPress={() => !menuOpen && goToPreferencesSection("Notifications")}
                    activeOpacity={0.9}
                  >
                    <LinearGradient colors={["#F3F7F5", "#E4ECE7"]} style={styles.manageBtn}>
                      <Text style={styles.manageBtnText} numberOfLines={1}>
                        NOTIFICATIONS
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.manageBtnWrap}
                    onPress={() => !menuOpen && handleLogout()}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#D96B68", "#B95653"]}
                      style={styles.logoutBtn}
                    >
                      <Text style={styles.logoutBtnText} numberOfLines={1}>
                        LOG OUT
                      </Text>
                      <Feather name="log-out" size={20} color={colors.white} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Menu Button (MOBILE ONLY) */}
      <View style={styles.menuButtonContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleMenu}
          accessibilityRole="button"
          accessibilityLabel={menuOpen ? "Close menu" : "Open menu"}
          accessibilityHint="Opens the navigation menu"
          accessibilityState={{ expanded: menuOpen }}
        >
          <Feather
            name="menu"
            size={28}
            color="white"
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </TouchableOpacity>
      </View>

      {/* Overlay Dropdown Menu setup (MOBILE ONLY) */}
      {menuOpen && (
        <Animated.View
          style={[
            styles.menuOverlay,
            { width: "100%", transform: [{ translateY: menuTranslate }] },
          ]}
          accessibilityLabel="Menu overlay"
        >
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
            activeOpacity={1}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
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
                accessibilityRole="button"
                accessibilityLabel={`Go to ${item.name}`}
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

    topBarTooltipSlot: {
      position: "absolute",
      right: 20,
      top: "50%",
      transform: [{ translateY: -11 }],
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
      paddingHorizontal: WEB_SIDEBAR_PADDING_H,
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
      paddingVertical: WEB_NAV_ITEM_PADDING_V,
      paddingHorizontal: WEB_NAV_ITEM_PADDING_H,
      borderRadius: 2,
      marginBottom: WEB_NAV_ITEM_MARGIN_BOTTOM,
    },
    webNavItemSelected: { backgroundColor: "rgba(255,255,255,0.18)" },
    webNavText: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_NAV,
      letterSpacing: 0.8,
      textShadowColor: "rgba(0, 0, 0, 0.1)",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 8,
    },
    webNavTextSelected: { color: c.white },

    webMain: { flex: 1, backgroundColor: c.gray100 },

    webContentWrap: {
      paddingTop: WEB_CONTENT_PADDING_TOP,
      paddingBottom: WEB_CONTENT_PADDING_BOTTOM,
      paddingHorizontal: WEB_CONTENT_PADDING_H,
    },

    webWelcomeWrap: {
      paddingHorizontal: 0,
      marginBottom: 14,
      marginTop: 15,
    },
    webWelcomeText: {
      fontSize: FONT_SIZE_TITLE_LARGE + 8,
      fontFamily: FONT_HEADING,
      color: c.primary,
    },

    // Two-column web rows
    webTwoColRow: {
      flexDirection: "row",
      gap: 20,
      paddingHorizontal: 0,
      marginBottom: 16,
      alignItems: "flex-start",
    },
    webTwoColItem: { flex: 1 },

    webDashboardLeftColumn: {
      flex: 1,
      alignItems: "stretch",
    },

    webDashboardRightColumn: {
      flex: 1,
      alignItems: "stretch",
    },

    webLeftColumnCard: {
      width: "100%",
      marginBottom: 16,
    },

    webRightColumnCard: {
      width: "100%",
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
      paddingHorizontal: SPACE_LG,
      bottom: 14,
      left: 12,
      fontSize: FONT_SIZE_TITLE_LARGE + 6,
      fontFamily: FONT_HEADING,
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
      paddingHorizontal: SPACE_LG,
      bottom: 14,
      left: 12,
      fontSize: FONT_SIZE_TITLE_LARGE + 6,
      fontFamily: FONT_HEADING,
      color: c.white,
      textShadowColor: "rgba(0, 0, 0, 200)",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 10,
    },

    favoriteDetailsBtn: {
      marginLeft: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    // Mobile styles
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
      marginLeft: -5,
      fontSize: FONT_SIZE_TITLE_LARGE - 8,
      fontFamily: FONT_HEADING,
      color: c.primary,
      position: "relative",
      paddingHorizontal: PAGE_CONTENT_PADDING_H,
    },

    favoritesTopContainer: {
      marginVertical: 16,
      paddingHorizontal: PAGE_CONTENT_PADDING_H,
      top: 35,
      bottom: 0,
    },

    bannerContainer: {
      marginVertical: 12,
      paddingHorizontal: PAGE_CONTENT_PADDING_H,
      //top: 15,
      //bottom: 0,
      position: "relative",
    },
    bannerImage: { width: "100%", height: 200, borderRadius: CARD_BORDER_RADIUS },
    bannerText: {
      position: "absolute",
      paddingHorizontal: SPACE_LG,
      bottom: 12,
      left: 12,
      fontSize: FONT_SIZE_TITLE_LARGE + 2,
      fontFamily: FONT_HEADING,
      color: c.gray100,
      textShadowColor: "rgba(0, 0, 0, 200)",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 15,
    },

    imageShadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.65,
      shadowRadius: 6,
      elevation: 8,
      borderRadius: 9,
    },

    mapContainer: {
      marginVertical: 12,
      paddingHorizontal: PAGE_CONTENT_PADDING_H,
      top: 0,
      position: "relative",
    },
    mapImage: { width: "100%", height: 200, borderRadius: CARD_BORDER_RADIUS },
    mapText: {
      position: "absolute",
      paddingHorizontal: SPACE_LG,
      bottom: 12,
      left: 12,
      fontSize: FONT_SIZE_TITLE_LARGE + 2,
      fontFamily: FONT_HEADING,
      color: c.white,
      textShadowColor: "rgba(0, 0, 0, 200)",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 10,
    },

    cardsContainer: { marginVertical: 0, paddingHorizontal: PAGE_CONTENT_PADDING_H, top: 16 },

    roomCardContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: CARD_PADDING,
      backgroundColor: c.primary,
      borderRadius: CARD_BORDER_RADIUS,
      marginBottom: CARD_MARGIN_BOTTOM - 10,
      shadowColor: "#000",
      shadowOpacity: 0.65,
      shadowRadius: 6,
      elevation: 2,
      shadowOffset: { width: 0, height: 6 },
    },
    roomCardTextLeft: {
      fontSize: FONT_SIZE_SECTION,
      fontFamily: FONT_HEADING,
      color: c.white,
    },

    availableNowCard: {
      borderRadius: CARD_BORDER_RADIUS,
      padding: CARD_PADDING,
      marginBottom: 0,
      backgroundColor: c.primary,
    },

    availableHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    availableTitle: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_SECTION,
      letterSpacing: 0.5,
    },

    availableItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: 0,
      padding: 18,
      marginBottom: 7,
    },

    availableItemText: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_CARD_TITLE,
    },
    availableRight: { flexDirection: "row", alignItems: "center", gap: 12 },
    availableStatusDot: { width: 11, height: 11, borderRadius: 5.5 },
    availableSubtitle: {
      color: c.white,
      fontSize: FONT_SIZE_CAPTION,
      fontFamily: FONT_BODY,
    },

    favoritesCard: {
      padding: CARD_PADDING,
      borderRadius: CARD_BORDER_RADIUS,
      overflow: "hidden",
      marginTop: 0,
      marginBottom: 0,
      backgroundColor: c.primary,
    },

    favoritesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    favoritesTitle: {
      fontSize: FONT_SIZE_SECTION,
      fontFamily: FONT_HEADING,
      color: c.white,
    },

    emptyText: {
      color: c.white,
      fontSize: FONT_SIZE_BODY,
      fontFamily: FONT_BODY,
      textAlign: "center",
      marginVertical: 10,
    },

    noAvailableText: {
      color: c.white,
      fontSize: FONT_SIZE_BODY,
      fontFamily: FONT_BODY,
      textAlign: "center",
      marginVertical: 10,
    },

    favItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 18,
      paddingHorizontal: 18,
      marginVertical: 4,
      borderRadius: 0,
    },
    favItemText: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_CARD_TITLE,
    },
    favRight: { flexDirection: "row", alignItems: "center", gap: 12 },
    favstatusDot: { width: 11, height: 11, borderRadius: 5.5 },
    favNumber: {
      color: c.white,
      fontSize: FONT_SIZE_CAPTION,
      fontFamily: FONT_BODY,
    },

    preferencesLeft: {
      marginTop: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
    prefIcon: { marginTop: 2, marginRight: 12 },

    cardShadow: {
      borderRadius: CARD_BORDER_RADIUS,
      marginBottom: SCROLL_PADDING_BOTTOM,
      ...(Platform.OS === "web"
        ? {
            boxShadow: "0px 10px 26px rgba(0, 0, 0, 0.35)"// fixed shadow on web
          }
        : {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.65,
            shadowRadius: 6,
            elevation: 8,
          }),
    },

    loadingText: {
      color: c.primary,
      fontFamily: FONT_BODY,
      textAlign: "center",
      marginVertical: 10,
    },

    // Manage card
    manageCard: {
      borderRadius: CARD_BORDER_RADIUS,
      padding: 20,
      marginTop: -5,
      marginBottom: 0,
    },
    manageHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    manageTitle: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: 27,
      letterSpacing: 0.5,
    },

    // WEB manage row
    manageRowWeb: {
      flexDirection: "row",
      gap: 14,
      alignItems: "stretch",
    },
    manageCardWeb: {
      borderRadius: CARD_BORDER_RADIUS,
      padding: 20,
      marginTop: 0,
      marginBottom: 0,
      width: "100%",
    },

    // MOBILE manage rows
    manageRowMobile: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
    },

    manageBtnWrap: { flex: 1 },

    manageBtn: {
      width: "100%",
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    manageBtnText: {
      color: c.primary,
      fontFamily: FONT_HEADING,
      fontSize: 22,
      letterSpacing: 0.4,
    },

    logoutBtn: {
      width: "100%",
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: 6,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#D9534F",
      gap: 8,
    },

    logoutBtnText: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: 22,
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
    menuItemContainer: { paddingVertical: 12, paddingHorizontal: SPACE_MD },
    menuItemText: {
      fontSize: FONT_SIZE_CARD_TITLE,
      fontFamily: FONT_HEADING,
      color: c.primary,
    },
  });
}