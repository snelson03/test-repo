// Favorites Screen File
// Formatting for IOS and web
import React, { useState, useMemo } from "react";
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
import type { ThemeColors } from "@/constants/theme";
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_TITLE,
  FONT_SIZE_SECTION,
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
  WEB_CONTENT_PADDING_H,
  WEB_SIDEBAR_PADDING_H,
  PAGE_CONTENT_PADDING_H,
  CARD_PADDING,
  CARD_MARGIN_BOTTOM,
  CONTAINER_PADDING_TOP_MOBILE,
  CONTAINER_PADDING_TOP_WEB,
  HEADER_MARGIN_BOTTOM,
  SCROLL_PADDING_BOTTOM,
  SPACE_MD,
  SPACE_LG,
} from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { useFavorites } from "@/context/FavoritesContext"; // shared favorites context

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { useRegisterSessionExpiryNavigation } from "@/context/SessionExpiryContext";
import InfoTooltip from "@/components/InfoTooltip";
import HoverTooltip from "@/components/HoverTooltip";

// define interface to recognize favorite
interface FavoriteRoom {
  name: string;
  status?: string;
  tstatus?: string;
}

// Maximum width for large screens
const MAX_SCREEN_WIDTH = 1400;

type MenuRoute = "Home" | "FindRoom" | "CampusMap" | "Favorites" | "Preferences";

export default function FavoritesScreen() {
  // Navigation setup
  type FavoritesNavProp = NativeStackNavigationProp<RootStackParamList, "Favorites">;
  const navigation = useNavigation<FavoritesNavProp>();
  useRegisterSessionExpiryNavigation();
  const { colors } = useTheme();
  const { favorites, removeFavorite } = useFavorites(); // shared list and remove function
  const [editMode, setEditMode] = useState(false); // keeps track of edit mode state

  // checks if on web
  const isWeb = Platform.OS === "web";
  const styles = useMemo(() => createStyles(colors), [colors]);

  // used to size the web content area like Home Screen
  const { width } = useWindowDimensions();
  const pagePad = width < 480 ? 12 : 0;
  const webAvailable = width - WEB_SIDEBAR_WIDTH - pagePad * 2;
  const contentWidthWeb = Math.min(webAvailable, MAX_SCREEN_WIDTH);

  // menu items for the web sidebar
  const menuItems: { name: string; route: MenuRoute }[] = [
    { name: "Home", route: "Home" },
    { name: "Find a Room", route: "FindRoom" },
    { name: "Campus Map", route: "CampusMap" },
    { name: "Favorites", route: "Favorites" },
    { name: "Preferences", route: "Preferences" },
  ];
// ARC on mobile only to fit display
  const displayFavName = (name: string) => {
    // mobile only
    if (Platform.OS !== "web" && name.startsWith("Academic Research Center")) {
      return name.replace("Academic Research Center", "ARC");
    }
    return name;
  };

  // toggle edit mode on or off
  const toggleEdit = () => setEditMode(!editMode);

  // WEB VERSION (adds the same top bar + sidebar as Home Screen)
  if (isWeb) {
    return (
      <View style={styles.webPage} accessibilityLabel="Favorites screen">
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
          <View style={styles.topBarTooltipSlot}>
            <InfoTooltip message="Explore campus buildings on the interactive map. Click a pin to ping the appropriate building and show its name." />
          </View>
        </View>

        {/* sidebar + main */}
        <View style={styles.webBody}>
          {/* Left Sidebar */}
          <View style={styles.webSidebar} accessibilityLabel="Navigation sidebar">
            <View style={styles.webSidebarLinks}>
              {menuItems.map((item) => {
                // highlights the current page
                const selected = item.route === "Favorites";
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[styles.webNavItem, selected && styles.webNavItemSelected]}
                    onPress={() => navigation.navigate(item.route)}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to ${item.name}`}
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.webNavText, selected && styles.webNavTextSelected]}>
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
              }}
              keyboardShouldPersistTaps="handled"
              accessibilityLabel="Favorites content"
            >
              <View style={[styles.webContentWrap, { width: contentWidthWeb }]}>
                {/* main page container (same iOS layout, just placed inside the web frame) */}
                <View style={styles.container}>
                  {/* Header */}
                  <View style={styles.header}>
                    <HoverTooltip message="Go back">
                    <Pressable
                      onPress={() => {
                        if (navigation.canGoBack()) {
                          navigation.goBack();
                        } else {
                          navigation.navigate("Home"); // fallback to Home
                        }
                      }}
                      style={styles.backButton}
                      accessibilityRole="button"
                      accessibilityLabel="Go back"
                      accessibilityHint="Returns to the previous screen"
                    >
                      <Ionicons name="arrow-back" size={35} color={colors.primary} />
                    </Pressable>
                    </HoverTooltip>

                    <Text style={styles.title} accessibilityRole="header">
                      FAVORITES
                    </Text>

                    {/* edit button (pencil icon turns into checkmark when editing) */}
                    <HoverTooltip message={editMode ? "Done editing" : "Edit favorites"}>
                    <Pressable
                      onPress={toggleEdit}
                      style={styles.backButton}
                      accessibilityRole="button"
                      accessibilityLabel={editMode ? "Done editing favorites" : "Edit favorites"}
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

                  {/* Favorite Rooms List */}
                  <ScrollView
                    contentContainerStyle={styles.listContainer}
                    accessibilityLabel="Favorites list"
                  >
          {favorites.length === 0 ? (
            <View
              style={{ alignItems: "center", marginTop: 50 }}
              accessibilityLabel="No favorites message"
            >
              <Text style={styles.emptyMessage}>
                No favorites added yet.
              </Text>
            </View>
          ) : (
            favorites.map((item: FavoriteRoom) => {
                        const statusLabel =
                          item.status === "available"
                            ? "available"
                            : item.status === "occupied"
                            ? "occupied"
                            : "offline";

                        return (
                          <View
                            key={item.name}
                            style={styles.card}
                            accessibilityLabel={`Favorite room ${item.name}`}
                          >
                            <Text style={styles.roomText}>{item.name}</Text>

                            <View style={styles.rightSection}>
                              <View
                                style={[
                                  styles.statusDot, // status dot color coded by available, occupied, offline
                                  {
                                    backgroundColor:
                                      item.status === "available"
                                        ? colors.available
                                        : item.status === "occupied"
                                        ? colors.occupied
                                        : colors.offline,
                                  },
                                ]}
                                accessibilityRole="image"
                                accessibilityLabel={`Status indicator: ${statusLabel}`}
                              />
                              <Text
                                style={styles.statusText}
                                accessibilityLabel={`Status ${item.tstatus ?? statusLabel}`}
                              >
                                {item.tstatus}
                              </Text>

                              {/* trash button only shows when in edit mode */}
                              {editMode && (
                                <HoverTooltip message="Remove favorite">
                                <TouchableOpacity
                                  onPress={() => removeFavorite(item.name)}
                                  style={{ marginLeft: 12 }}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Remove ${item.name} from favorites`}
                                  accessibilityHint="Deletes this room from your favorites list"
                                >
                                  <Ionicons name="trash" size={22} color={colors.white} />
                                </TouchableOpacity>
                                </HoverTooltip>
                              )}
                            </View>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // Mobile version (unchanged)
  return (
    // wrapper holds sidebar + main content on web
    <View style={styles.page} accessibilityLabel="Favorites screen">
      {/* WEB LEFT SIDEBAR (only shows on web) */}
      {isWeb && (
        <View style={styles.webSidebar} accessibilityLabel="Navigation sidebar">
          {/* top logo/header area */}
          <View style={styles.webSidebarHeader}>
            <Image
              source={require("@/assets/images/bf_logo.png")}
              style={styles.webSidebarLogo}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Bobcat Finder logo"
              accessibilityIgnoresInvertColors
            />
          <InfoTooltip message="Explore campus buildings on the interactive map. Click a pin to ping the appropriate building and show its name." />
          </View>

          {/* list of pages  */}
          <View style={styles.webSidebarLinks}>
            {menuItems.map((item) => {
              // highlights the current page
              const selected = item.route === "Favorites";
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.webNavItem, selected && styles.webNavItemSelected]}
                  onPress={() => navigation.navigate(item.route)}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to ${item.name}`}
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.webNavText, selected && styles.webNavTextSelected]}>
                    {item.name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* main page container (same iOS layout, just shifts right on web) */}
      <View style={[styles.container, isWeb && styles.webContent]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Home"); // fallback to Home
              }
            }}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
          >
            <Ionicons name="arrow-back" size={35} color={colors.primary} />
          </Pressable>

          <Text style={styles.title} accessibilityRole="header">
            FAVORITES
          </Text>

          {/* edit button (pencil icon turns into checkmark when editing) */}
          <Pressable
            onPress={toggleEdit}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={editMode ? "Done editing favorites" : "Edit favorites"}
            accessibilityHint={
              editMode ? "Exits edit mode" : "Enables edit mode to remove favorites"
            }
            accessibilityState={{ selected: editMode }}
          >
            <Ionicons
              name={editMode ? "checkmark" : "create-outline"}
              size={30}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {/* Favorite Rooms List */}
        <ScrollView contentContainerStyle={styles.listContainer} accessibilityLabel="Favorites list">
          {favorites.length === 0 ? (
            <View
              style={{ alignItems: "center", marginTop: 50 }}
              accessibilityLabel="No favorites message"
            >
              <Text style={styles.emptyMessage}>
                No favorites added yet.
              </Text>
            </View>
          ) : (
            favorites.map((item: FavoriteRoom) => {
              const statusLabel =
                item.status === "available"
                  ? "available"
                  : item.status === "occupied"
                  ? "occupied"
                  : "offline";

              return (
                <View
                  key={item.name}
                  style={styles.card}
                  accessibilityLabel={`Favorite room ${item.name}`}
                >
                  <Text style={styles.roomText}>{displayFavName(item.name)}</Text>

                  <View style={styles.rightSection}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            item.status === "available"
                              ? colors.available
                              : item.status === "occupied"
                              ? colors.occupied
                              : colors.offline,
                        },
                      ]}
                      accessibilityRole="image"
                      accessibilityLabel={`Status indicator: ${statusLabel}`}
                    />
                    <Text
                      style={styles.statusText}
                      accessibilityLabel={`Status ${item.tstatus ?? statusLabel}`}
                    >
                      {item.tstatus}
                    </Text>

                    {editMode && (
                      <TouchableOpacity
                        onPress={() => removeFavorite(item.name)}
                        style={{ marginLeft: 12 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${item.name} from favorites`}
                        accessibilityHint="Deletes this room from your favorites list"
                      >
                        <Ionicons name="trash" size={22} color={colors.white} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// applies styles and sets up page
function createStyles(c: ThemeColors) {
  return StyleSheet.create({
  page: {
    // wrapper for web layout (sidebar + page content)
    flex: 1,
    flexDirection: "row",
    backgroundColor: c.gray100,
  },

  container: {
    flex: 1,
    backgroundColor: c.gray100,
    paddingTop: CONTAINER_PADDING_TOP_MOBILE,
    paddingHorizontal: PAGE_CONTENT_PADDING_H,
  },

  webContent: {
    paddingTop: CONTAINER_PADDING_TOP_WEB + 26,
    paddingLeft: WEB_CONTENT_PADDING_H,
    paddingRight: WEB_CONTENT_PADDING_H,
  },

  // Web styles (same top bar + sidebar as Home Screen)
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

  // left sidebar styles (web only)
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

  webMain: { flex: 1, backgroundColor: c.gray100 },

  webContentWrap: {
    paddingTop: WEB_CONTENT_PADDING_TOP,
    paddingBottom: WEB_CONTENT_PADDING_BOTTOM,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: HEADER_MARGIN_BOTTOM,
  },

  backButton: {
    width: 40,
    alignItems: "center",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: FONT_SIZE_TITLE + 6,
    fontFamily: FONT_HEADING,
    color: c.primary,
  },

  listContainer: {
    paddingBottom: SPACE_LG,
  },

  card: {
    flexDirection: "row",
    backgroundColor: c.primary,
    borderRadius: 6,
    padding: CARD_PADDING + 5,
    marginBottom: CARD_MARGIN_BOTTOM - 5,
    marginHorizontal: 0,
    justifyContent: "space-between",
    alignItems: "center",
  },

  roomText: {
    color: c.white,
    fontSize: FONT_SIZE_SECTION - 2,
    fontFamily: FONT_HEADING,
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  statusDot: {
    // status dot placement
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  statusText: {
    color: c.white,
    fontSize: FONT_SIZE_BODY,
    fontFamily: FONT_BODY,
  },

  emptyMessage: {
    color: c.primary,
    fontSize: FONT_SIZE_BODY + 2,
    fontFamily: FONT_BODY,
  },
  });
}
