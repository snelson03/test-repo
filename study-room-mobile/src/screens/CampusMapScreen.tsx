// This screen shows the campus map that includes zoom and pins at the three selected buildings
// implements auto zoom when a pin is pressed and pulsing animation on selected pin
// added color coded buildings and  key inside map

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  WEB_CONTENT_PADDING_H,
  WEB_SIDEBAR_PADDING_H,
  PAGE_CONTENT_PADDING_H,
  CARD_BORDER_RADIUS,
  SPACE_MD,
} from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type {
  RootStackParamList,
  MapBuildingId,
} from "@/navigation/AppNavigator";
import { useRegisterSessionExpiryNavigation } from "@/context/SessionExpiryContext";
import InfoTooltip from "@/components/InfoTooltip";
import HoverTooltip from "@/components/HoverTooltip";

type BuildingWithPin = {
  id: string;
  name: string;
  address: string;
  image: any;
  pinX: number;
  pinY: number;
  pinColor: string;
};

export default function CampusMapScreen() {
  const router = useRouter();

  // typed navigation (so we can pass params to FindRoom)
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useRegisterSessionExpiryNavigation();

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const scrollViewMainRef = useRef<ScrollView | null>(null);

  // nested scroll (we pan horizontally + vertically)
  const mapScrollXRef = useRef<ScrollView | null>(null);
  const mapScrollYRef = useRef<ScrollView | null>(null);

  const route = useRoute() as any;
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

  // Measure the map viewport width for IOS
  const [viewportWidth, setViewportWidth] = useState<number>(0);

  // Cross-platform zoom state (works on web + android + ios)
  const [zoom, setZoom] = useState<number>(1);

  // Show/hide the key
  const [showLegend, setShowLegend] = useState<boolean>(true);

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
      pinX: 0.194,
      pinY: 0.25,
      pinColor: "#E53935", // red
    },
    {
      id: "stocker",
      name: "Stocker Center",
      address: "28 West Green Dr, Athens, OH 45701",
      image: require("../assets/images/stocker.png"),
      pinX: 0.15555,
      pinY: 0.285,
      pinColor: "#FB8C00", // orange
    },
    {
      id: "alden",
      name: "Alden Library",
      address: "30 Park Pl, Athens, OH 45701",
      image: require("../assets/images/alden.png"),
      pinX: 0.483,
      pinY: 0.455,
      pinColor: "#1E88E5", // blue
    },
  ];

  const buildingById = useMemo(() => {
    const m: Record<string, BuildingWithPin> = {};
    buildings.forEach((b) => (m[b.id] = b));
    return m;
  }, [buildings]);

  // taller map for web
  const mapHeight = isWide ? (isWeb ? 650 : 930) : 300;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const setZoomSafe = (next: number) => setZoom(clamp(next, 1, 3));

  // Base sizing for zoom content
  const baseWidth = viewportWidth || mapSize.width;
  const baseHeight = mapHeight;

  // compute pixel locations of pins
  const contentWidth = baseWidth * zoom;
  const contentHeight = baseHeight * zoom;

  const pinPositions: Record<string, { x: number; y: number }> = {};
  if (baseWidth > 0 && baseHeight > 0) {
    buildings.forEach((b) => {
      pinPositions[b.id] = {
        x: baseWidth * b.pinX * zoom,
        y: baseHeight * b.pinY * zoom,
      };
    });
  }

  const zoomToBuilding = (buildingId: string) => {
    const pin = pinPositions[buildingId];
    const scrollX: any = mapScrollXRef.current;
    const scrollY: any = mapScrollYRef.current;

    if (!pin || !scrollX || !scrollY || baseWidth <= 0 || baseHeight <= 0)
      return;

    // Scroll main view so the map is visible (mobile)
    if (!isWide) {
      scrollViewMainRef.current?.scrollTo({ y: 0, animated: true });
    }

    // Center the pin in the viewport
    const viewportW = baseWidth;
    const viewportH = mapHeight;

    const targetX = clamp(
      pin.x - viewportW / 2,
      0,
      Math.max(0, contentWidth - viewportW)
    );
    const targetY = clamp(
      pin.y - viewportH / 2,
      0,
      Math.max(0, contentHeight - viewportH)
    );

    // Address the error that comes from clicking a pin:
    try {
      scrollX.scrollTo({ x: targetX, animated: true });
      scrollY.scrollTo({ y: targetY, animated: true });
    } catch (e) {
      // prevents platform-specific scroll responder issues from crashing
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
      navigation.navigate("FindRoom", {
        buildingIdFromMap: buildingId as MapBuildingId,
      });
      return;
    }

    lastTapRef.current = { buildingId, at: now };
    setSelectedBuildingId(buildingId);
    startPulse();

    // If map isn't measured yet, delay the zoom-to so pinPositions is ready
    if (baseWidth <= 0 || baseHeight <= 0) {
      setTimeout(() => zoomToBuilding(buildingId), 0);
      return;
    }

    zoomToBuilding(buildingId);
  };

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    startPulse();

    // If map isn't measured yet, delay the zoom-to so pinPositions is ready
    if (baseWidth <= 0 || baseHeight <= 0) {
      setTimeout(() => zoomToBuilding(buildingId), 0);
      return;
    }
    zoomToBuilding(buildingId);
  };

  const handleMapLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setMapSize({ width: w, height: h });
  };

  useEffect(() => {
    // When zoom changes, keep selected building centered
    if (selectedBuildingId) {
      setTimeout(() => zoomToBuilding(selectedBuildingId), 0);
    }
  }, [zoom, selectedBuildingId]); // include selectedBuildingId so it's not stale
  // take directly to building when clicked on room details
  useEffect(() => {
    const id = route?.params?.selectedBuildingId as string | undefined;
    if (!id) return;

    setSelectedBuildingId(id);
    startPulse();

    // wait for layout measurement so pinPositions is ready
    setTimeout(() => zoomToBuilding(id), 0);
  }, [route?.params?.selectedBuildingId]);
  const pagePadding = isWide ? WEB_CONTENT_PADDING_H : PAGE_CONTENT_PADDING_H;

  const headerTopPad = isWide ? 50 : 80;
  const mainTopGap = isWide ? 50 : 20;

  const webScale = isWide ? 1.0 : 1;

  const framePad = isWide ? 10 : 18;

  // two-column sizing
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
      accessibilityLabel="Campus map content"
    >
      {/* Header (full width on web) */}
      <View
        style={[
          styles.header,
          {
            width: "100%",
            paddingTop: headerTopPad,
            paddingHorizontal: isWide ? 0 : PAGE_CONTENT_PADDING_H,
          },
        ]}
        accessibilityLabel="Campus map header"
      >
        <TouchableOpacity onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, isWide && styles.titleWide]}
          accessibilityRole="header"
          accessibilityLabel="Campus map title"
        >CAMPUS MAP</Text>
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
        accessibilityLabel="Campus map main layout"
      >
        {/* LEFT: MAP */}
        <View style={[styles.leftCol, isWide && { flex: leftColFlex }]}
          accessibilityLabel="Map section"
        >
          <View style={[styles.mapWrapper, isWide && { marginBottom: 0 }]}
            accessibilityLabel="Map wrapper"
          >
            {/* Uniform green frame */}
            <View style={[styles.mapFrame, { padding: framePad }]}
              accessibilityLabel="Map frame"
            >
              {/* Map viewport */}
              <View
                style={[
                  styles.mapViewport,
                  {
                    height: mapHeight,
                    width: "100%",
                  },
                ]}
                onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
                accessibilityLabel="Map viewport"
              >
                {/* Zoom controls (web + mobile) */}
                <View style={styles.zoomControls} accessibilityLabel="Map controls">
                  <HoverTooltip message="Zoom in">
                  <TouchableOpacity
                    style={styles.zoomBtn}
                    onPress={() => setZoomSafe(zoom + 0.25)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Zoom in"
                    accessibilityHint="Increases map zoom"
                  >
                    <Ionicons name="add" size={18} color={colors.white} />
                  </TouchableOpacity>
                  </HoverTooltip>

                  <HoverTooltip message="Zoom out">
                  <TouchableOpacity
                    style={styles.zoomBtn}
                    onPress={() => setZoomSafe(zoom - 0.25)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Zoom out"
                    accessibilityHint="Decreases map zoom"
                  >
                    <Ionicons name="remove" size={18} color={colors.white} />
                  </TouchableOpacity>
                  </HoverTooltip>

                  <HoverTooltip message="Reset zoom">
                  <TouchableOpacity
                    style={styles.zoomBtn}
                    onPress={() => setZoomSafe(1)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Reset zoom"
                    accessibilityHint="Resets map zoom to default"
                  >
                    <Ionicons name="refresh" size={16} color={colors.white} />
                  </TouchableOpacity>
                  </HoverTooltip>

                  {/* Key toggle */}
                  <HoverTooltip message={showLegend ? "Hide legend" : "Show legend"}>
                  <TouchableOpacity
                    style={styles.zoomBtn}
                    onPress={() => setShowLegend((prev) => !prev)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={showLegend ? "Hide legend" : "Show legend"}
                    accessibilityHint="Toggles the legend for map pins"
                    accessibilityState={{ expanded: showLegend }}
                  >
                    <Ionicons
                      name={showLegend ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                  </HoverTooltip>
                </View>

                {/* PAN (both axes) via nested scrollviews */}
                <ScrollView
                  ref={mapScrollXRef}
                  style={{ width: "100%" }}
                  horizontal
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.panOuterContent}
                  accessibilityLabel="Map horizontal pan"
                >
                  <ScrollView
                    ref={mapScrollYRef}
                    style={{ width: "100%" }}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.panInnerContent}
                    accessibilityLabel="Map vertical pan"
                  >
                    <View
                      style={[styles.mapInner, { height: mapHeight, width: "100%" }]}
                      onLayout={handleMapLayout}
                      accessibilityLabel="Map content container"
                    >
                      <View
                        style={[
                          styles.mapScaledLayer,
                          {
                            width: baseWidth > 0 ? baseWidth * zoom : "100%",
                            height: baseHeight > 0 ? baseHeight * zoom : "100%",
                          },
                        ]}
                        accessibilityLabel="Scaled map layer"
                      >
                        <Image
                          source={require("../assets/images/map.jpeg")}
                          style={styles.mapImage}
                          resizeMode="contain"
                          accessibilityRole="image"
                          accessibilityLabel="Campus map image"
                          accessibilityIgnoresInvertColors
                        />

                        {/* PINS */}
                        {baseWidth > 0 &&
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
                                style={[styles.pin, { left: pin.x - 11, top: pin.y - 22 }]}
                                onPress={() => handlePinPress(b.id)}
                                activeOpacity={0.9}
                                accessibilityRole="button"
                                accessibilityLabel={`Map pin: ${b.name}`}
                                accessibilityHint="Tap once to zoom to this building. Tap twice quickly to open Find a Room for this building."
                                accessibilityState={{ selected: isSelected }}
                              >
                                <View style={styles.pinContainer}
                                  accessibilityLabel={`Pin container for ${b.name}`}>
                                  {isSelected && (
                                    <Text 
                                      style={styles.pinLabel}
                                      accessibilityLabel={`Selected building: ${b.name}`}
                                    >
                                      {b.name}
                                    </Text>
                                  )}

                                  {isSelected && (
                                    <Animated.View
                                      style={[
                                        styles.pulseRing,
                                        {
                                          backgroundColor: b.pinColor,
                                          transform: [{ scale: pulseScale }],
                                          opacity: pulseOpacity,
                                        },
                                      ]}
                                      accessibilityElementsHidden
                                      importantForAccessibility="no"
                                    />
                                  )}

                                  <Ionicons
                                    name="location-sharp"
                                    size={22}
                                    color={b.pinColor}
                                    accessibilityElementsHidden
                                    importantForAccessibility="no"
                                  />
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                      </View>
                    </View>
                  </ScrollView>
                </ScrollView>

                {/* Legend (pins + ping effect) */}
                {showLegend && (
                  <View style={styles.legend} accessibilityLabel="Map legend">
                    {buildings.map((b) => {
                      const isSelected = selectedBuildingId === b.id;

                      const pulseScale = pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1.6],
                      });

                      const pulseOpacity = pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.75, 0],
                      });

                      return (
                        <View key={b.id} style={styles.legendRowWrap}>
                        <TouchableOpacity
                          style={styles.legendItem}
                          onPress={() => handleSelectBuilding(b.id)}
                          activeOpacity={0.9}
                          accessibilityRole="button"
                          accessibilityLabel={`Legend item: ${b.name}`}
                          accessibilityHint="Selects this building and centers it on the map"
                          accessibilityState={{ selected: isSelected }}
                        >
                          <View 
                            style={styles.legendIconWrap}
                            accessibilityLabel={`Legend icon for ${b.name}`}
                          >
                            {isSelected && (
                              <Animated.View
                                style={[
                                  styles.legendPulse,
                                  {
                                    backgroundColor: b.pinColor,
                                    transform: [{ scale: pulseScale }],
                                    opacity: pulseOpacity,
                                  },
                                ]}
                                accessibilityElementsHidden
                                importantForAccessibility="no"
                              />
                            )}
                            <Ionicons
                              name="location-sharp"
                              size={18}
                              color={b.pinColor}
                              accessibilityElementsHidden
                              importantForAccessibility="no"
                            />
                          </View>
                          <Text
                           style={styles.legendText}
                           accessibilityLabel={`Legend text: ${b.name}`}
                          >
                            {b.name}</Text>
                        </TouchableOpacity>

                        <HoverTooltip message={`Open ${b.name} in Find a Room`}>
                          <TouchableOpacity
                            style={styles.takeMeThereBtn}
                            onPress={() =>
                              navigation.navigate("FindRoom", {
                                buildingIdFromMap: b.id as MapBuildingId,
                              })
                            }
                            activeOpacity={0.9}
                            accessibilityRole="button"
                            accessibilityLabel={`Take me to ${b.name}`}
                            accessibilityHint="Opens Find a Room filtered to this building"
                          >
                            <Text style={styles.takeMeThereText}>TAKE ME THERE</Text>
                          </TouchableOpacity>
                        </HoverTooltip>
                      </View>
                      );
                    })}
                  </View>
                )}
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
          accessibilityLabel="Buildings section"
        >
          <View style={[styles.buildingsContainer, { width: "100%" }]}
            accessibilityLabel="Available buildings container"
          >
            <Text style={styles.sectionTitle}
              accessibilityRole="header"
              accessibilityLabel="Available buildings"
            >AVAILABLE BUILDINGS</Text>

            {buildings.map((b) => (
              <View key={b.id} style={styles.buildingCard}
                accessibilityLabel={`Building card: ${b.name}`}
              >
                <View style={styles.buildingNameRow}
                  accessibilityLabel={`Building name row: ${b.name}`}
                >
                  <Text style={styles.buildingName}
                    accessibilityLabel={`Building name: ${b.name}`}
                  >
                    {b.name}
                  </Text>
                  <HoverTooltip message={`Center map on ${b.name}`}>
                  <TouchableOpacity
                    style={styles.buildingPinButton}
                    onPress={() => handleSelectBuilding(b.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Center map on ${b.name}`}
                    accessibilityHint="Selects this building and centers it on the map"
                    accessibilityState={{ selected: selectedBuildingId === b.id }}
                  >
                    <Ionicons
                      name="location-sharp"
                      size={20}
                      color={b.pinColor}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    />
                  </TouchableOpacity>
                  </HoverTooltip>
                </View>

                <Text style={styles.address}
                  accessibilityLabel={`Address for ${b.name}: ${b.address}`}
                >
                  {b.address}
                </Text>
                <Image source={b.image} style={styles.buildingImage} 
                  accessibilityRole="image"
                  accessibilityLabel={`Image of ${b.name}`}
                  accessibilityIgnoresInvertColors
                />
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
    <View style={styles.webPage} accessibilityLabel="Campus map screen">
      {/* top bar */}
      <View style={styles.webTopBar} accessibilityLabel="Top bar">
        <Image
          source={require("../assets/images/bf_logo.png")}
          style={styles.webTopBarLogo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Bobcat Finder logo"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.topBarTooltipSlot}>
          <InfoTooltip message="Explore campus buildings on the interactive map. Select a map pin or legend pin to find a particular building, or use Take Me There to view its rooms." />
        </View>
      </View>

      {/* sidebar + main */}
      <View style={styles.webBody} accessibilityLabel="Web layout">
        {/* Left Sidebar */}
        <View style={styles.webSidebar} accessibilityLabel="Navigation sidebar">
          <View style={styles.webSidebarLinks} accessibilityLabel="Navigation links">
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
                  accessibilityRole="button"
                  accessibilityLabel={`Go to ${item.name}`}
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.webNavText,
                      selected && styles.webNavTextSelected,
                    ]}
                    accessibilityLabel={`${item.name} navigation item`}
                  >
                    {item.name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Main area */}
        <View style={styles.webMain} accessibilityLabel="Main content">
          {screenContent}</View>
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

    //
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

    titleWide: {
      flex: 1,
      textAlign: "center",
      paddingHorizontal: 0,
    },

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
      marginBottom: 0,
    },

    mapFrame: {
      backgroundColor: c.darkAccent,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 0,
      paddingVertical: 30,
    },

    mapViewport: {
      width: "100%",
      overflow: "hidden",
      position: "relative",
      borderRadius: CARD_BORDER_RADIUS,
    },

    //  pan container helpers
    panOuterContent: { alignItems: "flex-start", justifyContent: "flex-start" },
    panInnerContent: { alignItems: "flex-start", justifyContent: "flex-start" },

    mapInner: { width: "100%", position: "relative" },

    // zoomed content layer
    mapScaledLayer: {
      position: "relative",
    },

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
      opacity: 0.35,
    },

    // zoom buttons (map overlay)
    zoomControls: {
      position: "absolute",
      right: 12,
      top: 12,
      zIndex: 20,
      gap: 8,
    },

    zoomBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(5, 71, 42, 0.9)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 6,
    },

    // legend with colored pins + ping effect
    legend: {
      position: "absolute",
      left: 15,
      right: 110,
      bottom: 25,
      zIndex: 20,
      backgroundColor: "rgba(5, 71, 42, 0.75)",

      // solid border around the legend
      borderWidth: 1.5,
      borderColor: c.primary,

      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 8,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 1,
    },

    legendIconWrap: {
      width: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
    },

    legendPulse: {
      position: "absolute",
      width: 20,
      height: 20,
      borderRadius: 10,
      opacity: 0.3,
    },

    legendText: {
      flex: 1,
      color: c.white,
      fontSize: 15,
      fontFamily: "BebasNeue-Regular",
      letterSpacing: 0.4,
      textShadowColor: "rgba(0, 0, 0, 0.4)",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 3,
    },

    legendRowWrap: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    legendItemMain: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 2,
      flex: 1,
    },

    takeMeThereBtn: {
      backgroundColor: c.primary,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    takeMeThereText: {
      color: c.white,
      fontSize: FONT_SIZE_CAPTION,
      fontFamily: FONT_HEADING,
      letterSpacing: 0.4,
    },

    buildingsContainer: {
      backgroundColor: c.white,
      alignItems: "center",
      paddingTop: 0,
      paddingBottom: 25,
      shadowColor: "#000",
      shadowOpacity: 0.6,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 6,
      elevation: 8,
      borderRadius: 0,
      overflow: "hidden",
    },

    sectionTitle: {
      fontSize: FONT_SIZE_TITLE - 2,
      fontFamily: FONT_HEADING,
      color: c.white,
      backgroundColor: c.green3,
      paddingVertical:13,
      textAlign: "center",
      width: "100%",
      marginBottom: 30,
      marginTop: 0,
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

    address: {
      fontSize: FONT_SIZE_CAPTION,
      color: c.primary,
      marginBottom: 10,
      fontFamily: FONT_BODY,
    },

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