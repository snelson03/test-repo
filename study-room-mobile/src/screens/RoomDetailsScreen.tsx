// Room Details Screen file
// Displays detailed info about a selected room such as location, restrictions, and floor plan.
// Uses the same web top bar and sidebar pattern as the Favorites page and the same mobile green header style.

import React, { useMemo } from "react";
import { useRoomAvailability } from "@/context/RoomAvailabilityContext";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  DimensionValue,
  ScrollView,
  Platform,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { useRegisterSessionExpiryNavigation } from "@/context/SessionExpiryContext";
import type { ThemeColors } from "@/constants/theme";
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_TITLE,
  FONT_SIZE_SECTION,
  FONT_SIZE_BODY,
  WEB_SIDEBAR_WIDTH,
  WEB_TOPBAR_HEIGHT,
  WEB_NAV_ITEM_PADDING_V,
  WEB_NAV_ITEM_PADDING_H,
  WEB_NAV_ITEM_MARGIN_BOTTOM,
  WEB_CONTENT_PADDING_TOP,
  WEB_CONTENT_PADDING_BOTTOM,
  WEB_SIDEBAR_PADDING_H,
  WEB_DESKTOP_LAYOUT_MIN_WIDTH,
  PAGE_CONTENT_PADDING_H,
  CARD_PADDING,
  CARD_BORDER_RADIUS,
  BUTTON_BORDER_RADIUS,
  SPACE_MD,
  SPACE_LG,
  SCROLL_PADDING_BOTTOM,
  FONT_SIZE_NAV,
} from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import InfoTooltip from "@/components/InfoTooltip";
import HoverTooltip from "@/components/HoverTooltip";

type CanonicalBuildingName = "Stocker Center" | "Academic & Research Center";

type IncomingBuildingName =
  | "Stocker Center"
  | "Academic & Research Center"
  | "Academic Research Center"
  | "ARC"
  | "Alden Library";

type RoomStatus = "available" | "occupied" | "offline";

type RoomDetailsScreenRouteProp = {
  params: {
    building: IncomingBuildingName;
    roomId: string;
    status: RoomStatus;
    roomDbId?: number;
  };
};

type HighlightBox = {
  left: DimensionValue;
  top: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
};

type MenuRoute =
  | "Home"
  | "FindRoom"
  | "CampusMap"
  | "Favorites"
  | "Preferences";

const MAX_SCREEN_WIDTH = 1400;

const FLOOR_PLAN_IMAGES: Record<CanonicalBuildingName, ImageSourcePropType> = {
  "Stocker Center": require("@/assets/images/stocker_floorplan.png"),
  "Academic & Research Center": require("@/assets/images/arc_floorplan.png"),
};

const ROOM_HIGHLIGHTS: Record<string, HighlightBox> = {
  "Stocker Center-102": { left: "49.5%", top: "63.3%", width: "6.2%", height: "8.6%" },
  "Stocker Center-104": { left: "49.4%", top: "55.1%", width: "6.3%", height: "8.2%" },
  "Stocker Center-108": { left: "39.8%", top: "44.2%", width: "3.4%", height: "4.6%" },
  "Stocker Center-190": { left: "54.8%", top: "55.1%", width: "6.0%", height: "8.2%" },
  "Stocker Center-192": { left: "54.7%", top: "63.3%", width: "6.0%", height: "8.6%" },
  "Stocker Center-194": { left: "55.0%", top: "37.1%", width: "5.4%", height: "12.7%" },
  "Stocker Center-195": { left: "50.8%", top: "51.4%", width: "8.5%", height: "4.8%" },
  "Stocker Center-208B": { left: "60%", top: "58%", width: "11%", height: "8%" },
  "Stocker Center-210": { left: "74%", top: "58%", width: "9%", height: "8%" },

  "Academic & Research Center-108": { left: "58.1%", top: "39.6%", width: "6.5%", height: "8.7%" },
  "Academic & Research Center-110": { left: "58.1%", top: "31.8%", width: "6.5%", height: "8.7%" },
  "Academic & Research Center-112": { left: "64.8%", top: "13.6%", width: "13.2%", height: "15.4%" },
  "Academic & Research Center-121": { left: "28.5%", top: "13.6%", width: "10.0%", height: "15.4%" },

  "Academic & Research Center-147": { left: "42.6%", top: "74.0%", width: "5.0%", height: "7.6%" },
  "Academic & Research Center-149": { left: "47.7%", top: "74.0%", width: "5.0%", height: "7.6%" },
  "Academic & Research Center-151": { left: "52.8%", top: "74.0%", width: "5.0%", height: "7.6%" },
  "Academic & Research Center-153": { left: "57.9%", top: "74.0%", width: "5.3%", height: "7.6%" },
  "Academic & Research Center-155": { left: "63.5%", top: "74.0%", width: "5.8%", height: "7.6%" },
  "Academic & Research Center-157": { left: "69.5%", top: "74.0%", width: "5.8%", height: "7.6%" },
  "Academic & Research Center-215": { left: "28%", top: "18%", width: "8%", height: "7%" },
  "Academic & Research Center-216": { left: "40%", top: "18%", width: "8%", height: "7%" },
  "Academic & Research Center-217": { left: "52%", top: "18%", width: "8%", height: "7%" },
};

function normalizeBuildingName(name: string): CanonicalBuildingName {
  const value = name.trim().toLowerCase();

  if (value.includes("stocker")) return "Stocker Center";
  if (value === "arc" || value.includes("academic") || value.includes("alden")) {
    return "Academic & Research Center";
  }

  return "Stocker Center";
}

function getFloorFromRoom(id: string): string {
  const floorNum = parseInt(id.charAt(0), 10);

  if (Number.isNaN(floorNum)) return "Unknown Floor";
  if (floorNum === 1) return "1st Floor";
  if (floorNum === 2) return "2nd Floor";
  if (floorNum === 3) return "3rd Floor";
  return `${floorNum}th Floor`;
}

export default function RoomDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useRegisterSessionExpiryNavigation();

  const route = useRoute() as unknown as RoomDetailsScreenRouteProp;
  const { building: rawBuilding, roomId, status, roomDbId } = route.params;

  const { availabilities: liveAvailabilities } = useRoomAvailability();

  const building = normalizeBuildingName(rawBuilding);

  const liveStatus: RoomStatus = useMemo(() => {
    if (
      roomDbId != null &&
      Object.prototype.hasOwnProperty.call(liveAvailabilities, roomDbId)
    ) {
      return liveAvailabilities[roomDbId] ? "available" : "occupied";
    }
    return status;
  }, [roomDbId, liveAvailabilities, status]);

  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isWebDesktop =
    Platform.OS === "web" && width >= WEB_DESKTOP_LAYOUT_MIN_WIDTH;
  const styles = useMemo(() => createStyles(colors, isWebDesktop), [colors, isWebDesktop]);

  const webPagePad = width < 480 ? 12 : 0;
  const webAvailable = width - WEB_SIDEBAR_WIDTH - webPagePad * 2;
  const contentWidthWeb = Math.min(webAvailable, MAX_SCREEN_WIDTH);

  const buildingInfo: Record<
    CanonicalBuildingName,
    { address: string; restrictions: string }
  > = {
    "Stocker Center": {
      address: "28 West Green Dr, Athens, OH 45701",
      restrictions: "Computer Science Students",
    },
    "Academic & Research Center": {
      address: "20 South Green Dr, Athens, OH 45701",
      restrictions: "Open to All Students",
    },
  };

  const info = buildingInfo[building] ?? {
    address: "Address unavailable",
    restrictions: "Restrictions unavailable",
  };

  const floorPlanImage = FLOOR_PLAN_IMAGES[building];
  const roomHighlight = ROOM_HIGHLIGHTS[`${building}-${roomId}`];
  const floor = getFloorFromRoom(roomId);

  // shorten long building names on mobile so they fit better
  const displayBuildingName = !isWebDesktop
    ? building === "Academic & Research Center"
      ? "ARC"
      : building === "Stocker Center"
        ? "Stocker"
        : building
    : building;

  const getStatusMeta = (stat: RoomStatus) => {
    switch (stat) {
      case "available":
        return {
          label: "Available",
          dotColor: colors.available,
        };
      case "occupied":
        return {
          label: "Occupied",
          dotColor: colors.occupied,
        };
      default:
        return {
          label: "Unavailable",
          dotColor: colors.offline,
        };
    }
  };

  const statusMeta = getStatusMeta(liveStatus);

  const toMapId = (b: CanonicalBuildingName) => {
    if (b === "Stocker Center") return "stocker";
    return "arc";
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const menuItems: { name: string; route: MenuRoute }[] = [
    { name: "Home", route: "Home" },
    { name: "Find a Room", route: "FindRoom" },
    { name: "Campus Map", route: "CampusMap" },
    { name: "Favorites", route: "Favorites" },
    { name: "Preferences", route: "Preferences" },
  ];

  const ShadowWrap = ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: any;
  }) => <View style={[styles.shadowWrap, style]}>{children}</View>;

  const TopRoomCard = (
    <ShadowWrap>
      <LinearGradient
        colors={["#0A7A44", "#0B7643"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topBox}
        accessible
        accessibilityRole="summary"
        accessibilityLabel={`${building}, room ${roomId}. Status: ${statusMeta.label}.`}
      >
        <View style={styles.topBoxContent}>
          <View style={styles.leftGroup}>
            <Text style={styles.buildingNameInline} numberOfLines={1}>
              {displayBuildingName} {roomId}
            </Text>
          </View>

          <View style={styles.rightGroup}>
            <View
              style={[styles.statusDot, { backgroundColor: statusMeta.dotColor }]}
            />
            <Text style={styles.statusText}>{statusMeta.label}</Text>
          </View>
        </View>
      </LinearGradient>
    </ShadowWrap>
  );

  const GrayCard = ({
    title,
    children,
    accessibilityLabel,
  }: {
    title: string;
    children: React.ReactNode;
    accessibilityLabel: string;
  }) => (
    <ShadowWrap>
      <LinearGradient
        colors={["#D8D8D8", "#CBCBCB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.infoBox}
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
      </LinearGradient>
    </ShadowWrap>
  );

  const MapButton = (
    <ShadowWrap style={styles.mapButtonWrap}>
      <TouchableOpacity
        style={isWebDesktop ? styles.webMapButton : styles.mobileMapButton}
        onPress={() =>
          navigation.navigate("CampusMap", {
            selectedBuildingId: toMapId(building),
          } as any)
        }
        accessibilityRole="button"
        accessibilityLabel="View on map"
      >
        <View
          style={styles.webMapButtonSpacer}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />

        <Text style={isWebDesktop ? styles.webMapButtonText : styles.mobileMapButtonText}>
          VIEW ON MAP
        </Text>

        <Ionicons
          name="location-sharp"
          size={isWebDesktop ? 22 : 24}
          color={colors.white}
          style={isWebDesktop ? styles.webMapIcon : undefined}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </TouchableOpacity>
    </ShadowWrap>
  );

  const LocationCard = (
    <GrayCard title="LOCATION" accessibilityLabel="Location card">
      <Text style={styles.locationTitleText}>
        {building}, {floor}
      </Text>

      <Text style={styles.locationAddressText}>{info.address}</Text>

      {MapButton}
    </GrayCard>
  );

  const RestrictionsCard = (
    <GrayCard title="RESTRICTIONS" accessibilityLabel="Restrictions card">
      <Text style={styles.subText}>{info.restrictions}</Text>
    </GrayCard>
  );

  const FloorPlanCard = (
    <GrayCard title="FLOOR PLAN" accessibilityLabel="Floor plan card">
      <View style={styles.floorPlanWrapper}>
        <Image
          source={floorPlanImage}
          style={styles.floorPlanImage}
          resizeMode="contain"
        />

        {roomHighlight && (
          <View
            style={[
              styles.roomHighlight,
              {
                left: roomHighlight.left,
                top: roomHighlight.top,
                width: roomHighlight.width,
                height: roomHighlight.height,
              },
            ]}
          />
        )}
      </View>

      {!roomHighlight && (
        <Text style={styles.subText}>
          Floor plan available, but this room has not been mapped yet.
        </Text>
      )}
    </GrayCard>
  );

  if (!isWebDesktop) {
    return (
      <View style={styles.mobilePage} accessibilityLabel="Room details screen">
        <LinearGradient
          colors={["#06442A", "#04301D"]}
          style={styles.mobileHeaderBar}
        >
          <HoverTooltip message="Go back">
            <Pressable
              onPress={handleGoBack}
              style={styles.mobileHeaderIcon}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the previous screen"
            >
              <Ionicons name="arrow-back" size={28} color={colors.white} />
            </Pressable>
          </HoverTooltip>

          <View style={styles.mobileHeaderTitleWrap}>
            <Text style={styles.mobileHeaderTitle} accessibilityRole="header">
              ROOM DETAILS
            </Text>
          </View>

          <View style={styles.mobileHeaderIcon} />
        </LinearGradient>

        <ScrollView
          style={styles.mobileContentArea}
          contentContainerStyle={styles.mobileScrollContent}
          showsVerticalScrollIndicator={false}
          accessibilityLabel="Room details content"
        >
          <View style={styles.mobileInner}>
            {TopRoomCard}
            {LocationCard}
            {RestrictionsCard}
            {FloorPlanCard}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.webPage} accessibilityLabel="Room details screen">
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
          <InfoTooltip message="View room details, restrictions, and the room floor plan." />
        </View>
      </LinearGradient>

      <View style={styles.webBody}>
        <View style={styles.webSidebar} accessibilityLabel="Navigation sidebar">
          <View style={styles.webSidebarLinks}>
            {menuItems.map((item) => {
              const selected = false;

              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.webNavItem,
                    selected && styles.webNavItemSelected,
                  ]}
                  onPress={() => navigation.navigate(item.route)}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to ${item.name}`}
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

        <View style={styles.webMain}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.webMainScroll}
            showsVerticalScrollIndicator={false}
            accessibilityLabel="Room details content"
          >
            <View style={[styles.webContentWrap, { width: contentWidthWeb }]}>
              <View style={styles.webTitleRow}>
                <Text style={styles.webPageTitle} accessibilityRole="header">
                  ROOM DETAILS
                </Text>
              </View>

              <View style={styles.webGrid}>
                <View style={styles.webLeftColumn}>
                  {TopRoomCard}
                  {LocationCard}
                  {/* keep restrictions under location on web */}
                  {RestrictionsCard}
                </View>

                <View style={styles.webRightColumn}>
                  {/* right side only has the floor plan now */}
                  {FloorPlanCard}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

function createStyles(c: ThemeColors, isWebDesktop: boolean) {
  return StyleSheet.create({
    shadowWrap: {
      borderRadius: isWebDesktop ? CARD_BORDER_RADIUS : 0,
      marginBottom: 18,
      backgroundColor: "transparent",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 4,
      elevation: 5,
    },

    mapButtonWrap: {
      marginTop: 34,
      marginBottom: 0,
      alignSelf: "center",
      width: isWebDesktop ? undefined : "100%",
      borderRadius: CARD_BORDER_RADIUS,
    },

    mobilePage: {
      flex: 1,
      backgroundColor: c.gray100,
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

    mobileHeaderTitleWrap: {
      flex: 1,
      alignItems: "center",
    },

    mobileHeaderTitle: {
      fontSize: FONT_SIZE_TITLE + 6,
      fontFamily: FONT_HEADING,
      color: c.white,
      textTransform: "uppercase",
      textAlign: "center",
    },

    mobileHeaderIcon: {
      width: 32,
      alignItems: "center",
      justifyContent: "center",
    },

    mobileContentArea: {
      flex: 1,
      backgroundColor: c.gray100,
    },

    mobileScrollContent: {
      paddingBottom: 40,
    },

    mobileInner: {
      paddingHorizontal: PAGE_CONTENT_PADDING_H,
      paddingTop: 8,
      backgroundColor: c.gray100,
    },

    topBox: {
      paddingVertical: 20,
      paddingHorizontal: 18,
      borderRadius: CARD_BORDER_RADIUS,
      width: "100%",
    },

    topBoxContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },

    leftGroup: {
      flex: 1,
      justifyContent: "center",
    },

    rightGroup: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      minWidth: isWebDesktop ? 120 : 110,
      marginLeft: 12,
    },

    buildingNameInline: {
      fontFamily: FONT_HEADING,
      fontSize: isWebDesktop ? FONT_SIZE_SECTION + 4 : FONT_SIZE_SECTION + 2,
      color: c.white,
      letterSpacing: 0.4,
    },

    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 10,
    },

    statusText: {
      fontFamily: FONT_BODY,
      fontSize: isWebDesktop ? FONT_SIZE_BODY + 3 : FONT_SIZE_BODY + 1,
      color: c.white,
      textAlign: "left",
    },

    infoBox: {
      paddingVertical: isWebDesktop ? 22 : SPACE_MD,
      paddingHorizontal: isWebDesktop ? 22 : CARD_PADDING - 2,
      borderRadius: CARD_BORDER_RADIUS,
    },

    sectionTitle: {
      fontFamily: FONT_HEADING,
      fontSize: isWebDesktop ? FONT_SIZE_SECTION + 4 : FONT_SIZE_SECTION,
      color: c.primary,
      marginBottom: SPACE_MD,
    },

    locationTitleText: {
      fontFamily: FONT_BODY,
      fontWeight: "700",
      color: c.primary,
      fontSize: isWebDesktop ? FONT_SIZE_BODY + 4 : FONT_SIZE_BODY,
      marginBottom: 4,
    },

    locationAddressText: {
      fontFamily: FONT_BODY,
      fontWeight: "400",
      color: c.primary,
      fontSize: isWebDesktop ? FONT_SIZE_BODY + 2 : FONT_SIZE_BODY - 1,
      lineHeight: isWebDesktop ? 34 : 25,
    },

    boldText: {
      fontFamily: FONT_BODY,
      fontWeight: "700",
      color: c.primary,
      fontSize: isWebDesktop ? FONT_SIZE_BODY + 4 : FONT_SIZE_BODY,
      marginBottom: 4,
    },

    subText: {
      fontFamily: FONT_BODY,
      color: c.primary,
      fontSize: isWebDesktop ? FONT_SIZE_BODY + 2 : FONT_SIZE_BODY - 1,
      lineHeight: isWebDesktop ? 34 : 25,
    },

    floorPlanWrapper: {
      width: "100%",
      aspectRatio: isWebDesktop ? 1.45 : 1.2,
      borderRadius: CARD_BORDER_RADIUS,
      overflow: "hidden",
      backgroundColor: c.white,
      position: "relative",
      marginTop: 4,
    },

    floorPlanImage: {
      width: "100%",
      height: "100%",
    },

    roomHighlight: {
      position: "absolute",
      borderWidth: 3,
      borderColor: "#FFCC00",
      backgroundColor: "rgba(255, 204, 0, 0.28)",
      borderRadius: 8,
    },

    mobileMapButton: {
      backgroundColor: c.primary,
      paddingVertical: 15,
      width: "100%",
      alignSelf: "center",
      borderRadius: BUTTON_BORDER_RADIUS,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },

    mobileMapButtonText: {
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_SECTION,
      color: c.white,
      textAlign: "center",
      flex: 1,
      transform: [{ translateY: 2 }],
    },

    webMapButton: {
      backgroundColor: c.primary,
      alignSelf: "center",
      minWidth: 300,
      paddingVertical: 20,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: CARD_BORDER_RADIUS,
      flexDirection: "row",
    },

    webMapButtonSpacer: {
      width: 24,
    },

    webMapIcon: {
      marginTop: 1,
    },

    webMapButtonText: {
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_SECTION + 2,
      color: c.white,
      textAlign: "center",
      flex: 1,
    },

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

    webSidebarLinks: {
      marginTop: 6,
    },

    webNavItem: {
      paddingVertical: WEB_NAV_ITEM_PADDING_V,
      paddingHorizontal: WEB_NAV_ITEM_PADDING_H,
      borderRadius: 8,
      marginBottom: WEB_NAV_ITEM_MARGIN_BOTTOM,
    },

    webNavItemSelected: {
      backgroundColor: "rgba(255,255,255,0.18)",
    },

    webNavText: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_NAV,
      letterSpacing: 0.8,
      textShadowColor: "rgba(0, 0, 0, 0.1)",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 8,
    },

    webNavTextSelected: {
      color: c.white,
    },

    webMain: {
      flex: 1,
      backgroundColor: c.gray100,
    },

    webMainScroll: {
      alignItems: "center",
      paddingBottom: SCROLL_PADDING_BOTTOM,
      paddingHorizontal: 0,
    },

    webContentWrap: {
      paddingTop: WEB_CONTENT_PADDING_TOP,
      paddingBottom: WEB_CONTENT_PADDING_BOTTOM,
    },

    webTitleRow: {
      marginTop: 20,
      marginBottom: SPACE_LG,
    },

    webPageTitle: {
      fontSize: FONT_SIZE_TITLE + 16,
      fontFamily: FONT_HEADING,
      color: c.primary,
      textTransform: "uppercase",
      textAlign: "left",
      letterSpacing: 1,
    },

    webGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 32,
    },

    // left side keeps the stacked info cards
    webLeftColumn: {
      width: "48%",
    },

    // right side starts at the top now with only the floor plan
    webRightColumn: {
      width: "48%",
      marginTop: 0,
      paddingTop: 0,
      alignSelf: "flex-start",
    },
  });
}