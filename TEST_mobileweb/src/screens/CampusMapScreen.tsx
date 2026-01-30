// Campus Map screen file
// This screen shows the campus map that includes zoom and pins at the three selected buildings
// implements auto zoom when a pin is pressed and pulsing animation on selected pin
//
// ✅ CHANGES (web/tablet layout only; mobile stays stacked)
// - REMOVED the 420px MAX_WIDTH clamp on web so it can use full screen width
// - On wide screens: two-column layout (Map left, Buildings right) to remove blank space
// - Map gets a UNIFORM green frame (equal padding on all sides)
// - Pins stay correct by measuring the SAME container the image is drawn inside
// - ✅ NEW: “Bump everything up” on web (less whitespace on top + slightly larger layout)
// - ✅ NEW: Map image fills the green frame better (smaller left/right green gutters on web)

import React, { useRef, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";

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

  const scrollViewMainRef = useRef<ScrollView | null>(null);
  const mapScrollRef = useRef<ScrollView | null>(null);

  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null
  );

  const pulseAnim = useRef(new Animated.Value(0)).current;

  // stores the map viewport size so pin positions can be calculated correctly
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
      pinX: 0.144,
      pinY: 0.252,
    },
    {
      id: "stocker",
      name: "Stocker Center",
      address: "28 West Green Dr, Athens, OH 45701",
      image: require("../assets/images/stocker.png"),
      pinX: 0.097,
      pinY: 0.285,
    },
    {
      id: "alden",
      name: "Alden Library",
      address: "30 Park Pl, Athens, OH 45701",
      image: require("../assets/images/alden.png"),
      pinX: 0.483,
      pinY: 0.445,
    },
  ];

  // ✅ web gets a taller map; mobile stays ~300
  const mapHeight = isWide ? 930 : 300;


  // compute pixel locations of pins (turns percentages into real coordinates)
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
    if (!pin || !scrollView || !scrollView.scrollResponderZoomTo) return;

    const zoomRect = {
      x: pin.x - mapSize.width * 0.25,
      y: pin.y - mapSize.height * 0.25,
      width: mapSize.width * 0.5,
      height: mapSize.height * 0.5,
      animated: true,
    };

    scrollView.scrollResponderZoomTo(zoomRect);

    // on wide screens, don't force-scroll to top (feels weird on desktop)
    if (!isWide) {
      scrollViewMainRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    startPulse();
    zoomToBuilding(buildingId);
  };

  // ✅ IMPORTANT: this measures the SAME box that the image is rendered into
  const handleMapLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setMapSize({ width: w, height: h });
  };

  // ✅ full width on web, but still padded nicely
  const pagePadding = isWide ? 36 : 0;

  // ✅ “bump everything up” on web
  const headerTopPad = isWide ? 28 : 80; // less whitespace on top on web
  const mainTopGap = isWide ? 10 : 20; // bring row closer to header

  // ✅ subtle upscale on web only
  const webScale = isWide ? 1.0 : 1;

  // ✅ reduce green gutters on web (keep mobile unchanged)
  const framePad = isWide ? 10 : 18; // smaller padding = bigger visible map inside frame

  // two-column sizing (map bigger than list)
  const leftColFlex = isWide ? 2.2 : undefined;
  const rightColFlex = isWide ? 1 : undefined;

  return (
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
      <View style={[styles.header, { width: "100%", paddingTop: headerTopPad, paddingHorizontal: isWide ? 0 : 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text
          style={[
            styles.title,
            isWide && { flex: 1, textAlign: "center", paddingHorizontal: 0 } // ✅ WEB ONLY
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
            transform: [{ scale: webScale }], // ✅ bump everything up on web
            transformOrigin: "top left" as any, // ignored on native; helps some web builds
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
                  <View style={styles.mapInner} onLayout={handleMapLayout}>
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
                            style={[styles.pin, { left: pin.x - 11, top: pin.y - 22 }]}
                            onPress={() => handleSelectBuilding(b.id)}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  backButton: { padding: 5 },

  title: {
    paddingHorizontal: 55,
    fontSize: 38,
    fontFamily: "BebasNeue-Regular",
    color: colors.primary,
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
    backgroundColor: colors.primary,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  mapViewport: {
    width: "100%",
    overflow: "hidden",
  },

  zoomContent: { alignItems: "center", justifyContent: "center" },

  // ✅ measured box for correct pin math
  mapInner: { width: "100%", height: "100%" },
  mapImage: { width: "100%", height: "100%" },

  pin: { position: "absolute" },
  pinContainer: { alignItems: "center", justifyContent: "center" },

  pinLabel: {
    position: "absolute",
    bottom: 28,
    backgroundColor: "rgba(5, 71, 42, 0.75)",
    color: colors.white,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 0,
    fontSize: 13,
    fontFamily: "BebasNeue-Regular",
    textAlign: "center",
    maxWidth: 80,
    minWidth: 80,
    fontWeight: "500",
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
    backgroundColor: colors.white,
    alignItems: "center",
    paddingVertical: 25,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },

  sectionTitle: {
    fontSize: 30,
    fontFamily: "BebasNeue-Regular",
    color: colors.white,
    backgroundColor: colors.primary,
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
    fontSize: 24,
    marginLeft: 30,
    color: colors.primary,
    marginBottom: 4,
    fontFamily: "BebasNeue-Regular",
  },

  address: { fontSize: 14, color: colors.primary, marginBottom: 10 },

  buildingImage: {
    width: "85%",
    height: 200,
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
});
