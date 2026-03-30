// Favorites Screen File
// matches the same web sidebar/top bar and mobile green header pattern
import React, { useState, useMemo } from "react";
import { useRoomAvailability } from "@/context/RoomAvailabilityContext";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Platform,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ThemeColors } from "@/constants/theme";
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_TITLE,
  FONT_SIZE_BODY,
  FONT_SIZE_CARD_TITLE,
  FONT_SIZE_NAV,
  WEB_SIDEBAR_WIDTH,
  WEB_TOPBAR_HEIGHT,
  WEB_NAV_ITEM_PADDING_V,
  WEB_NAV_ITEM_PADDING_H,
  WEB_NAV_ITEM_MARGIN_BOTTOM,
  WEB_CONTENT_PADDING_TOP,
  WEB_CONTENT_PADDING_BOTTOM,
  WEB_SIDEBAR_PADDING_H,
  PAGE_CONTENT_PADDING_H,
  CARD_PADDING,
  CARD_MARGIN_BOTTOM,
  SCROLL_PADDING_BOTTOM,
  SPACE_MD,
  SPACE_LG,
  CARD_BORDER_RADIUS,
} from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { useRegisterSessionExpiryNavigation } from "@/context/SessionExpiryContext";
import InfoTooltip from "@/components/InfoTooltip";
import HoverTooltip from "@/components/HoverTooltip";

interface FavoriteRoom {
  name: string;
  status?: string;
  tstatus?: string;
  roomId?: number;
}

type MenuRoute =
  | "Home"
  | "FindRoom"
  | "CampusMap"
  | "Favorites"
  | "Preferences";

const MAX_SCREEN_WIDTH = 1400;

export default function FavoritesScreen() {
  type FavoritesNavProp = NativeStackNavigationProp<
    RootStackParamList,
    "Favorites"
  >;

  const navigation = useNavigation<FavoritesNavProp>();
  useRegisterSessionExpiryNavigation();

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { favorites, removeFavorite } = useFavorites() as {
    favorites: FavoriteRoom[];
    removeFavorite: (name: string) => void;
  };

  const { availabilities: liveAvailabilities } = useRoomAvailability();

  const [editMode, setEditMode] = useState(false);

  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();

  const webPagePad = width < 480 ? 12 : 0;
  const webAvailable = width - WEB_SIDEBAR_WIDTH - webPagePad * 2;
  const contentWidthWeb = Math.min(webAvailable, MAX_SCREEN_WIDTH);

  const menuItems: { name: string; route: MenuRoute }[] = [
    { name: "Home", route: "Home" },
    { name: "Find a Room", route: "FindRoom" },
    { name: "Campus Map", route: "CampusMap" },
    { name: "Favorites", route: "Favorites" },
    { name: "Preferences", route: "Preferences" },
  ];

  const displayFavName = (name: string) => {
    if (!isWeb && name.startsWith("Academic Research Center")) {
      return name.replace("Academic Research Center", "ARC");
    }
    if (!isWeb && name.startsWith("Stocker Center")) {
      return name.replace("Stocker Center", "Stocker");
    }
    return name;
  };

  const toggleEdit = () => {
    setEditMode((prev) => !prev);
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === "available") return colors.available;
    if (status === "occupied") return colors.occupied;
    return colors.offline;
  };

  // this pulls the building and room number out of the favorite card name
  const parseFavoriteRoom = (name: string) => {
    const trimmed = name.trim();

    const stockerMatch = trimmed.match(/^Stocker Center\s+([A-Za-z0-9]+)$/i);
    if (stockerMatch) {
      return {
        building: "Stocker Center",
        roomId: stockerMatch[1],
      };
    }

    const arcMatch = trimmed.match(
      /^(Academic Research Center|Academic & Research Center|ARC)\s+([A-Za-z0-9]+)$/i
    );
    if (arcMatch) {
      return {
        building: "Academic Research Center",
        roomId: arcMatch[2],
      };
    }

    return null;
  };

  const liveStatusForFavorite = (item: FavoriteRoom): string => {
    const rid = item.roomId;
    if (
      rid != null &&
      Object.prototype.hasOwnProperty.call(liveAvailabilities, rid)
    ) {
      return liveAvailabilities[rid] ? "available" : "occupied";
    }
    return item.status === "available"
      ? "available"
      : item.status === "occupied"
        ? "occupied"
        : "offline";
  };

  const handleRoomPress = (item: FavoriteRoom) => {
    if (editMode) return;

    const parsed = parseFavoriteRoom(item.name);
    if (!parsed) return;

    const roomStatus = liveStatusForFavorite(item) as
      | "available"
      | "occupied"
      | "offline";

    navigation.navigate("RoomDetails", {
      building: parsed.building,
      roomId: parsed.roomId,
      roomDbId: item.roomId,
      status: roomStatus,
    } as never);
  };

  const rightSideMessage =
    "Get live updates on your favorite rooms and quickly check availability before you head out.";

  const favoritesList = (
    <ScrollView
      contentContainerStyle={styles.listContainer}
      accessibilityLabel="Favorites list"
      showsVerticalScrollIndicator={false}
    >
      {favorites.length === 0 ? (
        <View
          style={styles.emptyState}
          accessibilityLabel="No favorites message"
        >
          <Text style={styles.emptyMessage}>No favorites added yet.</Text>
        </View>
      ) : (
        favorites.map((item: FavoriteRoom) => {
          const statusLabel = liveStatusForFavorite(item);
          const statusTitle =
            statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);

          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={editMode ? 1 : 0.9}
              onPress={() => handleRoomPress(item)}
              disabled={editMode}
              accessibilityRole="button"
              accessibilityLabel={`Open details for ${item.name}`}
              accessibilityHint="Navigates to the room details screen"
            >
              <LinearGradient
                colors={["#0F7046", "#0D6440"]}
                style={styles.card}
              >
                <Text style={styles.roomText}>{displayFavName(item.name)}</Text>

                <View style={styles.rightSection}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(statusLabel) },
                    ]}
                    accessibilityRole="image"
                    accessibilityLabel={`Status indicator: ${statusLabel}`}
                  />

                  <Text
                    style={styles.statusText}
                    accessibilityLabel={`Status ${statusTitle}`}
                  >
                    {statusTitle}
                  </Text>

                  {editMode && (
                    <HoverTooltip message="Remove favorite">
                      <TouchableOpacity
                        onPress={() => removeFavorite(item.name)}
                        style={styles.deleteButton}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${item.name} from favorites`}
                        accessibilityHint="Deletes this room from your favorites list"
                      >
                        <Ionicons name="trash" size={22} color={colors.white} />
                      </TouchableOpacity>
                    </HoverTooltip>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })
      )}

    {!isWeb && (
      <View style={styles.mobileNoteCard}>
        <Text style={styles.mobileNoteTitle}>LIVE ROOM UPDATES</Text>
        <Text style={styles.mobileNoteText}>{rightSideMessage}</Text>
      </View>
    )}
    </ScrollView>
  );

  const screenContent = (
    <View
      style={[styles.container, isWeb && styles.webContent]}
      accessibilityLabel="Favorites screen"
    >
      {isWeb ? (
        <>
          <View style={styles.webSplitLayout}>
            <View style={styles.webLeftPane}>
              <View style={styles.webHeaderRow}>
                <Text style={styles.webPageTitle} accessibilityRole="header">
                  FAVORITES
                </Text>

                <HoverTooltip
                  message={editMode ? "Done editing" : "Edit favorites"}
                >
                  <Pressable
                    onPress={toggleEdit}
                    style={styles.webEditButton}
                    accessibilityRole="button"
                    accessibilityLabel={
                      editMode ? "Done editing favorites" : "Edit favorites"
                    }
                    accessibilityHint={
                      editMode
                        ? "Exits edit mode"
                        : "Enables edit mode to remove favorites"
                    }
                    accessibilityState={{ selected: editMode }}
                  >
                    <Ionicons
                      name={editMode ? "checkmark" : "create-outline"}
                      size={30}
                      color={colors.primary}
                    />
                  </Pressable>
                </HoverTooltip>
              </View>

              {favoritesList}
            </View>

            <View style={styles.webRightPane}>
              <View style={styles.webNoteCard}>
                <Text style={styles.webNoteTitle}>LIVE ROOM UPDATES</Text>
                <Text style={styles.webNoteText}>{rightSideMessage}</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        favoritesList
      )}
    </View>
  );

  if (isWeb) {
    return (
      <View style={styles.webPage} accessibilityLabel="Favorites screen">
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
            <InfoTooltip message="View saved favorite rooms and edit your favorites list." />
          </View>
        </LinearGradient>

        <View style={styles.webBody}>
          <View style={styles.webSidebar} accessibilityLabel="Navigation sidebar">
            <View style={styles.webSidebarLinks}>
              {menuItems.map((item) => {
                const selected = item.route === "Favorites";

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

          <View style={styles.webMain}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: SCROLL_PADDING_BOTTOM,
                paddingHorizontal: 0,
              }}
              keyboardShouldPersistTaps="handled"
              accessibilityLabel="Favorites content"
            >
              <View style={[styles.webContentWrap, { width: contentWidthWeb }]}>
                {screenContent}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobilePage} accessibilityLabel="Favorites screen">
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
            FAVORITES
          </Text>
        </View>

        <HoverTooltip message={editMode ? "Done editing" : "Edit favorites"}>
          <Pressable
            onPress={toggleEdit}
            style={styles.mobileHeaderIcon}
            accessibilityRole="button"
            accessibilityLabel={
              editMode ? "Done editing favorites" : "Edit favorites"
            }
            accessibilityHint={
              editMode
                ? "Exits edit mode"
                : "Enables edit mode to remove favorites"
            }
            accessibilityState={{ selected: editMode }}
          >
            <Ionicons
              name={editMode ? "checkmark" : "create-outline"}
              size={26}
              color={colors.white}
            />
          </Pressable>
        </HoverTooltip>
      </LinearGradient>

      {screenContent}
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    mobilePage: {
      flex: 1,
      backgroundColor: c.gray100,
    },

    container: {
      flex: 1,
      backgroundColor: c.gray100,
      paddingTop: 0,
      paddingHorizontal: PAGE_CONTENT_PADDING_H,
    },

    webContent: {
      paddingTop: 0,
      paddingLeft: PAGE_CONTENT_PADDING_H,
      paddingRight: PAGE_CONTENT_PADDING_H,
    },

    webSplitLayout: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 32,
    },

    // left side holds the cards now
    webLeftPane: {
      width: "48%",
    },

    // right side is just the message area
    webRightPane: {
      width: "48%",
      paddingTop: 106,
    },

    webHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: SPACE_LG,
      width: "100%",
    },

    webPageTitle: {
      fontSize: FONT_SIZE_TITLE + 16,
      fontFamily: FONT_HEADING,
      color: c.primary,
      textTransform: "uppercase",
      textAlign: "left",
      letterSpacing: 1,
    },

    // this keeps the icon lined up with the card column
    webEditButton: {
      width: 42,
      alignItems: "flex-end",
      justifyContent: "center",
    },

    listContainer: {
      paddingBottom: SCROLL_PADDING_BOTTOM,
      paddingTop: 24,
    },

    emptyState: {
      alignItems: "center",
      marginTop: 50,
    },

    emptyMessage: {
      fontSize: FONT_SIZE_BODY + 2,
      fontFamily: FONT_BODY,
      color: c.primary,
      textAlign: "center",
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: CARD_PADDING,
      paddingHorizontal: CARD_PADDING,
      marginBottom: CARD_MARGIN_BOTTOM,
      borderRadius: CARD_BORDER_RADIUS,
    },

    roomText: {
      flex: 1,
      fontSize: FONT_SIZE_CARD_TITLE,
      fontFamily: FONT_HEADING,
      color: c.white,
      marginRight: SPACE_MD,
    },

    rightSection: {
      flexDirection: "row",
      alignItems: "center",
    },

    statusDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: 8,
    },

    statusText: {
      fontSize: FONT_SIZE_BODY,
      fontFamily: FONT_BODY,
      color: c.white,
    },

    deleteButton: {
      marginLeft: 12,
    },

    webNoteCard: {
      backgroundColor: c.white,
      borderRadius: CARD_BORDER_RADIUS,
      paddingVertical: 28,
      paddingHorizontal: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },

    webNoteTitle: {
      fontSize: FONT_SIZE_BODY + 8,
      fontFamily: FONT_HEADING,
      color: c.primary,
      marginBottom: 12,
      letterSpacing: 0.6,
    },

    webNoteText: {
      fontSize: FONT_SIZE_BODY + 2,
      fontFamily: FONT_BODY,
      color: c.primary,
      lineHeight: 30,
    },

    mobileNoteWrap: {
      marginTop: 10,
      marginBottom: 24,
      paddingHorizontal: 8,
      alignItems: "center",
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

    mobileNoteCard: {
      backgroundColor: c.white,
      borderRadius: CARD_BORDER_RADIUS,
      paddingVertical: 22,
      paddingHorizontal: 20,
      marginTop: 50, 
      marginBottom: 24,
    
      // stronger shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,   
      shadowRadius: 10,      
      elevation: 8,          // Android shadow
      marginHorizontal: 15,
    },
    
    mobileNoteTitle: {
      fontSize: FONT_SIZE_BODY + 6,
      fontFamily: FONT_HEADING,
      color: c.primary,
      marginBottom: 10,
      letterSpacing: 0.6,
      textAlign: "center",
    },
    
    mobileNoteText: {
      fontSize: FONT_SIZE_BODY,
      fontFamily: FONT_BODY,
      color: c.primary,
      textAlign: "center",
      lineHeight: 26,
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
      borderRadius: 2,
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

    webContentWrap: {
      paddingTop: WEB_CONTENT_PADDING_TOP,
      paddingBottom: WEB_CONTENT_PADDING_BOTTOM,
    },
  });
}