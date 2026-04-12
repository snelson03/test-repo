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
  Animated,
  useWindowDimensions,
  Platform,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import type { ThemeColors } from "@/constants/theme";
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_TITLE,
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
  WEB_DESKTOP_LAYOUT_MIN_WIDTH,
  PAGE_CONTENT_PADDING_H,
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

  const scrollViewMainRef = useRef<ScrollView | null>(null);

  // horizontal-only map pan
  const mapScrollXRef = useRef<ScrollView | null>(null);

  const route = useRoute() as any;
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const isWebDesktop =
    Platform.OS === "web" && width >= WEB_DESKTOP_LAYOUT_MIN_WIDTH;

  const styles = useMemo(
    () => createStyles(colors, isWebDesktop),
    [colors, isWebDesktop],
  );
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

  // Measure the map viewport width
  const [viewportWidth, setViewportWidth] = useState<number>(0);

  // Use the real image aspect ratio here
  const MAP_ASPECT_RATIO = 1536 / 960;

  // Cross-platform zoom state
  const mobileDefaultZoom = 1.4;
  const webDefaultZoom = 1;

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

  const [zoom, setZoom] = useState<number>(
    Platform.OS === "web" && width >= WEB_DESKTOP_LAYOUT_MIN_WIDTH
      ? webDefaultZoom
      : mobileDefaultZoom
  );
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

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
      pinX: 0.135,
      pinY: 0.2,
      pinColor: "#E53935", // red
    },
    {
      id: "stocker",
      name: "Stocker Center",
      address: "28 West Green Dr, Athens, OH 45701",
      image: require("../assets/images/stocker.png"),
      pinX: 0.087,
      pinY: 0.237,
      pinColor: "#FB8C00", // orange
    },
    {
      id: "alden",
      name: "Alden Library",
      address: "30 Park Pl, Athens, OH 45701",
      image: require("../assets/images/alden.png"),
      pinX: 0.483,
      pinY: 0.43,
      pinColor: "#1E88E5", // blue
    },
  ];

  const buildingById = useMemo(() => {
    const m: Record<string, BuildingWithPin> = {};
    buildings.forEach((b) => (m[b.id] = b));
    return m;
  }, [buildings]);

  // taller map for web and bigger on mobile
  const mapHeight = isWide ? (isWebDesktop ? 650 : 930) : 430;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const setZoomSafe = (next: number) => {
  const clampedZoom = clamp(next, MIN_ZOOM, MAX_ZOOM);
  setZoom(clampedZoom);

  const bounds = getPanBounds(clampedZoom);
  const nextX = clamp(pan.x, bounds.minX, bounds.maxX);
  const nextY = clamp(pan.y, bounds.minY, bounds.maxY);

  setPan({ x: nextX, y: nextY });
  panX.setValue(nextX);
  panY.setValue(nextY);
};

  // Match React Native Image resizeMode="cover"
  const viewportAspect =
    viewportWidth > 0 ? viewportWidth / mapHeight : MAP_ASPECT_RATIO;

  let baseWidth = 0;
  let baseHeight = 0;

  if (viewportAspect > MAP_ASPECT_RATIO) {
    // viewport is wider than the image aspect, so cover is width-driven
    baseWidth = viewportWidth;
    baseHeight = viewportWidth / MAP_ASPECT_RATIO;
  } else {
    // viewport is taller/narrower, so cover is height-driven
    baseHeight = mapHeight;
    baseWidth = mapHeight * MAP_ASPECT_RATIO;
  }

  const contentWidth = baseWidth;
  const contentHeight = baseHeight;

  const pinPositions: Record<string, { x: number; y: number }> = {};
  if (baseWidth > 0 && baseHeight > 0) {
    buildings.forEach((b) => {
      pinPositions[b.id] = {
        x: baseWidth * b.pinX,
        y: baseHeight * b.pinY,
      };
    });
  }

  const zoomToBuilding = (buildingId: string) => {
    const building = buildingById[buildingId];
    if (!building || viewportWidth <= 0) return;

    const pinXPos = baseWidth * building.pinX;
    const pinYPos = baseHeight * building.pinY;

    const scaledX = pinXPos * zoom;
    const scaledY = pinYPos * zoom;

    const targetX = viewportWidth / 2 - scaledX;
    const targetY = mapHeight / 2 - scaledY;

    const bounds = getPanBounds(zoom);

    const nextX = clamp(targetX, bounds.minX, bounds.maxX);
    const nextY = clamp(targetY, bounds.minY, bounds.maxY);

    setPan({ x: nextX, y: nextY });
    Animated.spring(panX, {
      toValue: nextX,
      useNativeDriver: true,
    }).start();
    Animated.spring(panY, {
      toValue: nextY,
      useNativeDriver: true,
    }).start();
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

    if (viewportWidth <= 0 || baseHeight <= 0) {
      setTimeout(() => zoomToBuilding(buildingId), 0);
      return;
    }

    zoomToBuilding(buildingId);
  };

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    startPulse();

    if (viewportWidth <= 0 || baseHeight <= 0) {
      setTimeout(() => zoomToBuilding(buildingId), 0);
      return;
    }
    zoomToBuilding(buildingId);
  };

  useEffect(() => {
    // When zoom changes, keep selected building centered
    if (selectedBuildingId) {
      setTimeout(() => zoomToBuilding(selectedBuildingId), 0);
    }
  }, [zoom, selectedBuildingId]);

  // take directly to building when clicked on room details
  useEffect(() => {
    const id = route?.params?.selectedBuildingId as string | undefined;
    if (!id) return;

    setSelectedBuildingId(id);
    startPulse();

    setTimeout(() => zoomToBuilding(id), 0);
  }, [route?.params?.selectedBuildingId]);

  const pagePadding = isWide ? WEB_CONTENT_PADDING_H : PAGE_CONTENT_PADDING_H;

  const mainTopGap = isWide ? 20 : 20;

  const webScale = isWide ? 1.0 : 1;

  const framePad = isWide ? 10 : 18;

  // two-column sizing
  const leftColFlex = isWide ? 2.2 : undefined;
  const rightColFlex = isWide ? 1 : undefined;

const getPanBounds = (nextZoom: number) => {
  const scaledWidth = baseWidth * nextZoom;
  const scaledHeight = baseHeight * nextZoom;

  const maxOffsetX = Math.max(0, (scaledWidth - viewportWidth) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - mapHeight) / 2);

  return {
    minX: -maxOffsetX,
    maxX: maxOffsetX,
    minY: -maxOffsetY,
    maxY: maxOffsetY,
  };
};

  const panStart = useRef({ x: 0, y: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: () => {
          panStart.current = pan;
        },

        onPanResponderMove: (_, gesture) => {
          const bounds = getPanBounds(zoom);

          const nextX = clamp(
            panStart.current.x + gesture.dx,
            bounds.minX,
            bounds.maxX
          );
          const nextY = clamp(
            panStart.current.y + gesture.dy,
            bounds.minY,
            bounds.maxY
          );

          panX.setValue(nextX);
          panY.setValue(nextY);
        },

        onPanResponderRelease: (_, gesture) => {
          const bounds = getPanBounds(zoom);

          const nextX = clamp(
            panStart.current.x + gesture.dx,
            bounds.minX,
            bounds.maxX
          );
          const nextY = clamp(
            panStart.current.y + gesture.dy,
            bounds.minY,
            bounds.maxY
          );

          setPan({ x: nextX, y: nextY });
          panX.setValue(nextX);
          panY.setValue(nextY);
        },
      }),
    [pan, zoom, viewportWidth, mapHeight, baseWidth, baseHeight]
  );

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
      {isWebDesktop && (
        <View style={styles.webHeaderRow}>
          <Text style={styles.webPageTitle}>CAMPUS MAP</Text>
        </View>
      )}

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
        <View
          style={[styles.leftCol, isWide && { flex: leftColFlex }]}
          accessibilityLabel="Map section"
        >
          <View
            style={[styles.mapWrapper, isWide && { marginBottom: 0 }]}
            accessibilityLabel="Map wrapper"
          >
            {/* Uniform green frame */}
            <LinearGradient
              colors={["#06442A", "#04301D"]}
              style={[styles.mapFrame, { padding: framePad }]}
              accessibilityLabel="Map frame"
            >
              {/* Map viewport */}
              <LinearGradient
                colors={["#0F7046", "#0D6440"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
                      onPress={() =>
                        setZoomSafe(
                          isWebDesktop ? webDefaultZoom : mobileDefaultZoom,
                        )
                      }
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

                {/* horizontal only pan */}
                <View
                  style={{ width: "100%", height: "100%", overflow: "hidden" }}
                  accessibilityLabel="Map pan and zoom viewport"
                >
                  <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                      styles.mapInner,
                      {
                        width: baseWidth,
                        height: baseHeight,
                        transform: [
                          { translateX: panX },
                          { translateY: panY },
                          { scale: zoom },
                        ],
                        ...(Platform.OS === "web" ? ({ transformOrigin: "top left" } as any) : {}),
                      },
                    ]}
                  >
                    <Image
                      source={require("../assets/images/map.jpeg")}
                      style={styles.mapImage}
                      resizeMode="cover"
                      accessibilityRole="image"
                      accessibilityLabel="Campus map image"
                      accessibilityIgnoresInvertColors
                    />

                    {buildings.map((b) => {
                      const pinX = baseWidth * b.pinX;
                      const pinY = baseHeight * b.pinY;
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
                          style={[styles.pin, { left: pinX - 11, top: pinY - 22 }]}
                          onPress={() => handlePinPress(b.id)}
                          activeOpacity={0.9}
                          accessibilityRole="button"
                          accessibilityLabel={`Map pin: ${b.name}`}
                        >
                          <View style={styles.pinContainer}>
                            {isSelected && <Text style={styles.pinLabel}>{b.name}</Text>}

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
                              />
                            )}

                            <Ionicons name="location-sharp" size={22} color={b.pinColor} />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </Animated.View>
                </View>

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
                              {b.name}
                            </Text>
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
                              <Text style={styles.takeMeThereText}>
                                {isWebDesktop ? "TAKE ME THERE" : "SEE ROOMS"}
                              </Text>
                            </TouchableOpacity>
                          </HoverTooltip>
                        </View>
                      );
                    })}
                  </View>
                )}
              </LinearGradient>
            </LinearGradient>
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
          <View
            style={[styles.buildingsContainer, { width: "100%" }]}
            accessibilityLabel="Available buildings container"
          >
            <LinearGradient
              colors={["#0F7046", "#0D6440"]}
              style={styles.sectionTitleBanner}
            >
              <Text
                style={styles.sectionTitle}
                accessibilityRole="header"
                accessibilityLabel="Available buildings"
              >
                AVAILABLE BUILDINGS
              </Text>
            </LinearGradient>

            {buildings.map((b) => (
              <View
                key={b.id}
                style={styles.buildingCard}
                accessibilityLabel={`Building card: ${b.name}`}
              >
                <View
                  style={styles.buildingNameRow}
                  accessibilityLabel={`Building name row: ${b.name}`}
                >
                  <Text
                    style={styles.buildingName}
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

                <Text
                  style={styles.address}
                  accessibilityLabel={`Address for ${b.name}: ${b.address}`}
                >
                  {b.address}
                </Text>
                <Image
                  source={b.image}
                  style={styles.buildingImage}
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

  if (!isWebDesktop) {
    return (
      <View style={{ flex: 1 }}>
        {/* MOBILE HEADER */}
        <LinearGradient
          colors={["#06442A", "#04301D"]}
          style={styles.mobileHeaderBar}
        >
          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.mobileHeaderTitle}>
              CAMPUS MAP
            </Text>
          </View>

          <View style={{ width: 28 }} />
        </LinearGradient>

        {screenContent}
      </View>
    );
  }

  // WEB ONLY: use the same top bar + sidebar layout as HomeScreen
  return (
    <View style={styles.webPage} accessibilityLabel="Campus map screen">
      {/* top bar */}
      <LinearGradient
        colors={["#06442A", "#04301D"]}
        style={styles.webTopBar}
        accessibilityLabel="Top bar"
      >
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
      </LinearGradient>

      {/* sidebar + main */}
      <View style={styles.webBody} accessibilityLabel="Web layout">
        {/* Left Sidebar */}
        <View style={styles.webSidebar} accessibilityLabel="Navigation sidebar">
          <View
            style={styles.webSidebarLinks}
            accessibilityLabel="Navigation links"
          >
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
          {screenContent}
        </View>
      </View>
    </View>
  );
}

function createStyles(c: ThemeColors, isWebDesktop: boolean) {
  return StyleSheet.create({
    // Web styles
    webPage: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: c.gray100,
    },

    webTopBar: {
      height: WEB_TOPBAR_HEIGHT,
      width: "100%",
      justifyContent: "center",
      paddingLeft: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
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

    page: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: c.gray100,
    },

    container: {
      flex: 1,
      backgroundColor: c.gray100,
    },

    webHeaderRow: {
      width: "100%",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      marginTop: 35,
      marginBottom: 8,
      paddingLeft: 8,
    },

    webPageTitle: {
      fontSize: FONT_SIZE_TITLE + 16,
      fontFamily: FONT_HEADING,
      color: c.primary,
      textTransform: "uppercase",
      textAlign: "left",
      letterSpacing: 1,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
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
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 0,
      paddingVertical: 30,
      overflow: "hidden",
    },

    mapViewport: {
      width: "100%",
      overflow: "hidden",
      position: "relative",
      borderRadius: 6,
    },

    mapInner: {
      position: "relative",
    },

    mapScaledLayer: {
      position: "relative",
      height: "100%",
    },

    mapImage: {
      width: "100%",
      height: "100%",
    },

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

    legend: {
      position: "absolute",
      left: 15,
      right: isWebDesktop ? 110 : 15,
      bottom: isWebDesktop ? 25 : 10,
      zIndex: 20,
      backgroundColor: "rgba(5, 71, 42, 0.75)",
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
      justifyContent: isWebDesktop ? "space-between" : "flex-start",
      gap: isWebDesktop ? 10 : 6,
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
      marginLeft: 0,
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
      shadowOpacity: 0.28,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 18,
      elevation: 12,
      borderRadius: 0,
      overflow: "visible",
      ...(isWebDesktop
        ? {
            boxShadow: "0px 14px 30px rgba(0, 0, 0, 0.22)",
          }
        : {}),
    },

    sectionTitleBanner: {
      width: "100%",
      marginBottom: 30,
      alignSelf: "stretch",
      borderRadius: 0,
      overflow: "hidden",
    },

    sectionTitle: {
      fontSize: FONT_SIZE_TITLE - 2,
      fontFamily: FONT_HEADING,
      color: c.white,
      paddingVertical: 13,
      textAlign: "center",
      width: "100%",
      marginBottom: 0,
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

    mobileHeaderBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 24,
      paddingTop: 65,
      paddingBottom: 22,
      marginBottom: 8,
    },

    mobileHeaderTitle: {
      fontSize: FONT_SIZE_TITLE + 6,
      fontFamily: FONT_HEADING,
      color: c.white,
      textTransform: "uppercase",
      textAlign: "center",
    },
  });
}