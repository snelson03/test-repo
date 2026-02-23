// Campus Map screen file
// This screen shows the campus map that includes zoom and pins at the three selected buildings
// implements auto zoom when a pin is pressed and pulsing animation on selected pin

import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  LayoutChangeEvent,
  Animated,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ThemeColors } from "@/constants/theme";
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_TITLE,
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
  CARD_BORDER_RADIUS,
  SPACE_MD,
} from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, MapBuildingId } from "@/navigation/AppNavigator";

type BuildingWithPin = {
  id: string;
  name: string;
  address: string;
  image: any;
  pinX: number;
  pinY: number;
};

export default function CampusMapScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const scrollViewMainRef = useRef<ScrollView | null>(null);
  const mapScrollRef = useRef<ScrollView | null>(null);

  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  // sidebar only on web
  const isWeb = Platform.OS === "web";
  const menuItems = [
    { name: "Home", route: "Home" as const },
    { name: "Find a Room", route: "FindRoom" as const },
    { name: "Campus Map", route: "CampusMap" as const },
    { name: "Favorites", route: "Favorites" as const },
    { name: "Preferences", route: "Preferences" as const },
  ];

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null
  );

  const pulseAnim = useRef(new Animated.Value(0)).current;

  const [mapSize, setMapSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const startPulse = () => {
    pulseAnim.setValue(0);
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  };

  const buildings: BuildingWithPin[] = [
    {
      id: "arc",
      name: "Academic & Research Center",
      address: "61 Oxbow Trail, Athens, OH 45701",
      image: require("../assets/images/arc.png"),
      pinX: 0.135,
      pinY: 0.29,
    },
    {
      id: "stocker",
      name: "Stocker Center",
      address: "28 West Green Dr, Athens, OH 45701",
      image: require("../assets/images/stocker.png"),
      pinX: 0.087,
      pinY: 0.325,
    },
    {
      id: "alden",
      name: "Alden Library",
      address: "30 Park Pl, Athens, OH 45701",
      image: require("../assets/images/alden.png"),
      pinX: 0.483,
      pinY: 0.455,
    },
  ];

  // web gets a taller map; mobile stays ~300
  const mapHeight = isWide ? 930 : 300;

  // compute pixel locations of pins
  const pinPositions: Record<string, { x: number; y: number }> = {};
  if (mapSize.width > 0 && mapSize.height > 0) {
    buildings.forEach((b) => {
      pinPositions[b.id] = {
        x: mapSize.width * b.pinX,
        y: mapSize.height * b.pinY,
      };
    });
  }

  const zoomToBuilding = (buildingId: string) => {
    const pin = pinPositions[buildingId];
    const scrollView: any = mapScrollRef.current;
    if (!pin || !scrollView) return;

    // Scroll main view so the map is visible (mobile)
    if (!isWide) {
      scrollViewMainRef.current?.scrollTo({ y: 0, animated: true });
    }

    // scrollResponderZoomTo is iOS-only; on web it can exist but throw (e.g. "Second argument must be a string")
    if (Platform.OS !== "ios") return;
    const zoomTo = scrollView.scrollResponderZoomTo;
    if (typeof zoomTo !== "function") return;
    const zoomRect = {
      x: pin.x - mapSize.width * 0.25,
      y: pin.y - mapSize.height * 0.25,
      width: mapSize.width * 0.5,
      height: mapSize.height * 0.5,
    };
    try {
      zoomTo.call(scrollView, zoomRect, true);
    } catch (_) {
      // Ignore if zoom fails
    }
  };

  // Double-tap: first tap selects/zooms, second tap within 400ms navigates to Find a Room
  const lastTapRef = useRef<{ buildingId: string; at: number } | null>(null);
  const DOUBLE_TAP_MS = 400;

  const handlePinPress = (buildingId: string) => {
    const now = Date.now();
    const last = lastTapRef.current;
    if (last?.buildingId === buildingId && now - last.at < DOUBLE_TAP_MS) {
      lastTapRef.current = null;
      (navigation as NativeStackNavigationProp<RootStackParamList, "CampusMap">).navigate("FindRoom", {
        buildingIdFromMap: buildingId as MapBuildingId,
      });
      return;
    }
    lastTapRef.current = { buildingId, at: now };
    setSelectedBuildingId(buildingId);
    startPulse();
    zoomToBuilding(buildingId);
  };

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    startPulse();
    zoomToBuilding(buildingId);
  };

  const handleMapLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setMapSize({ width: w, height: h });
  };

  const pagePadding = isWide ? 36 : 0;

  const headerTopPad = isWide ? 50 : 80;
  const mainTopGap = isWide ? 50 : 20;

  const webScale = isWide ? 1.0 : 1;

  const framePad = isWide ? 10 : 18;

  // two-column sizing (map bigger than list)
  const leftColFlex = isWide ? 2.2 : undefined;
  const rightColFlex = isWide ? 1 : undefined;

  const screenContent = (
    <ScrollView
      ref={scrollViewMainRef}
      style={styles.container}
      contentContainerStyle={{
        alignItems: "stretch",
        paddingBottom: 50,
        paddingHorizontal: pagePadding,
      }}
    >
      {/* Header (full width on web) */}
      <View
        style={[
          styles.header,
          {
            width: "100%",
            paddingTop: headerTopPad,
            paddingHorizontal: isWide ? 0 : 20,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text
          style={[
            styles.title,
            isWide && { flex: 1, paddingHorizontal: 650 },
          ]}
        >
          CAMPUS MAP
        </Text>
      </View>

      {/* Wide layout = row, Mobile = column */}
      <View
        style={[
          styles.mainRow,
          {
            flexDirection: isWide ? "row" : "column",
            width: "100%",
            marginTop: mainTopGap,
            transform: [{ scale: webScale }],
            transformOrigin: "top left" as any,
          },
        ]}
      >
        {/* LEFT: MAP */}
        <View style={[styles.leftCol, isWide && { flex: leftColFlex }]}>
          <View style={[styles.mapWrapper, isWide && { marginBottom: 0 }]}>
            {/* Uniform green frame */}
            <View style={[styles.mapFrame, { padding: framePad }]}>
              {/* Map viewport */}
              <View
                style={[
                  styles.mapViewport,
                  {
                    height: mapHeight,
                    width: "100%",
                  },
                ]}
              >
                <ScrollView
                  ref={mapScrollRef}
                  style={{ width: "100%" }}
                  contentContainerStyle={styles.zoomContent}
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  centerContent
                  bounces={false}
                >
                  <View
                    style={[styles.mapInner, { height: mapHeight }]}
                    onLayout={handleMapLayout}
                  >
                    <Image
                      source={require("../assets/images/map.jpeg")}
                      style={styles.mapImage}
                      resizeMode="contain"
                    />

                    {/* PINS */}
                    {mapSize.width > 0 &&
                      buildings.map((b) => {
                        const pin = pinPositions[b.id];
                        if (!pin) return null;

                        const isSelected = selectedBuildingId === b.id;

                        const pulseScale = pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1.6],
                        });

                        const pulseOpacity = pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 0],
                        });

                        return (
                          <TouchableOpacity
                            key={b.id}
                            style={[
                              styles.pin,
                              { left: pin.x - 11, top: pin.y - 22 },
                            ]}
                            onPress={() => handlePinPress(b.id)}
                            activeOpacity={0.9}
                          >
                            <View style={styles.pinContainer}>
                              {isSelected && (
                                <Text style={styles.pinLabel}>{b.name}</Text>
                              )}

                              {isSelected && (
                                <Animated.View
                                  style={[
                                    styles.pulseRing,
                                    {
                                      transform: [{ scale: pulseScale }],
                                      opacity: pulseOpacity,
                                    },
                                  ]}
                                />
                              )}

                              <Ionicons
                                name="location-sharp"
                                size={22}
                                color="red"
                              />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </View>

        {/* RIGHT (or BELOW on mobile): BUILDINGS */}
        <View
          style={[
            styles.rightCol,
            isWide && { flex: rightColFlex, marginLeft: 28 },
          ]}
        >
          <View style={[styles.buildingsContainer, { width: "100%" }]}>
            <Text style={styles.sectionTitle}>AVAILABLE BUILDINGS</Text>

            {buildings.map((b) => (
              <View key={b.id} style={styles.buildingCard}>
                <View style={styles.buildingNameRow}>
                  <Text style={styles.buildingName}>{b.name}</Text>
                  <TouchableOpacity
                    style={styles.buildingPinButton}
                    onPress={() => handleSelectBuilding(b.id)}
                  >
                    <Ionicons
                      name="location-sharp"
                      size={20}
                      color={colors.occupied}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.address}>{b.address}</Text>
                <Image source={b.image} style={styles.buildingImage} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  if (!isWeb) return screenContent;

  // WEB ONLY: use the same top bar + sidebar layout as HomeScreen
  return (
    <View style={styles.webPage}>
      {/* top bar */}
      <View style={styles.webTopBar}>
        <Image
          source={require("../assets/images/bf_logo.png")}
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
              const selected = item.route === "CampusMap";
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
        <View style={styles.webMain}>{screenContent}</View>
      </View>
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

  // Existing styles (kept as-is)
  page: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: c.gray100,
  },

  container: {
    flex: 1,
    backgroundColor: c.gray100,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    //paddingHorizontal: 20,
    //gap: 20,
  },
  backButton: { padding: 5 },

  title: {
    paddingHorizontal: 55,
    fontSize: FONT_SIZE_TITLE + 6,
    fontFamily: FONT_HEADING,
    color: c.primary,
  },

  mainRow: {
    alignItems: "stretch",
    justifyContent: "flex-start",
  },

  leftCol: {
    alignItems: "stretch",
  },

  rightCol: {
    alignItems: "stretch",
    marginTop: 0,
  },

  mapWrapper: {
    alignItems: "stretch",
    marginBottom: 45,
  },

  mapFrame: {
    backgroundColor: c.primary,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  mapViewport: {
    width: "100%",
    overflow: "hidden",
  },

  zoomContent: { alignItems: "center", justifyContent: "center" },

  mapInner: { width: "100%", position: "relative" },
  mapImage: { width: "100%", height: "100%" },

  pin: { position: "absolute" },
  pinContainer: { alignItems: "center", justifyContent: "center" },

  pinLabel: {
    position: "absolute",
    bottom: 28,
    backgroundColor: "rgba(5, 71, 42, 0.75)",
    color: c.white,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 0,
    fontSize: FONT_SIZE_BODY - 3,
    fontFamily: FONT_HEADING,
    textAlign: "center",
    maxWidth: 80,
    minWidth: 80,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },

  pulseRing: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,0,0,0.5)",
  },

  buildingsContainer: {
    backgroundColor: c.white,
    alignItems: "center",
    paddingVertical: 25,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },

  sectionTitle: {
    fontSize: FONT_SIZE_TITLE - 2,
    fontFamily: FONT_HEADING,
    color: c.white,
    backgroundColor: c.primary,
    paddingVertical: 15,
    textAlign: "center",
    width: "100%",
    marginBottom: 30,
    marginTop: -25,
    alignSelf: "stretch",
  },

  buildingCard: { alignItems: "center", marginBottom: 30, width: "95%" },
  buildingNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  buildingPinButton: { padding: 0, marginLeft: 5, marginBottom: 6 },

  buildingName: {
    fontSize: FONT_SIZE_CARD_TITLE + 2,
    marginLeft: 30,
    color: c.primary,
    marginBottom: 4,
    fontFamily: FONT_HEADING,
  },

  address: { fontSize: FONT_SIZE_CAPTION, color: c.primary, marginBottom: 10, fontFamily: FONT_BODY },

  buildingImage: {
    width: "85%",
    height: 200,
    borderWidth: 2.5,
    borderColor: c.primary,
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
  });
}
