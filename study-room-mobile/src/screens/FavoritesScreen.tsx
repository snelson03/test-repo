// Favorites Screen File
// matches the same web sidebar/top bar and mobile green header pattern
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

  const screenContent = (
    <View
      style={[styles.container, isWeb && styles.webContent]}
      accessibilityLabel="Favorites screen"
    >
      {isWeb && (
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
      )}

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
            const statusLabel =
              item.status === "available"
                ? "available"
                : item.status === "occupied"
                ? "occupied"
                : "offline";

            return (
              <LinearGradient
                colors={["#06442A", "#04301D"]}
                key={item.name}
                style={styles.card}
                accessibilityLabel={`Favorite room ${item.name}`}
              >
                <Text style={styles.roomText}>{displayFavName(item.name)}</Text>

                <View style={styles.rightSection}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                    accessibilityRole="image"
                    accessibilityLabel={`Status indicator: ${statusLabel}`}
                  />

                  <Text
                    style={styles.statusText}
                    accessibilityLabel={`Status ${item.tstatus ?? statusLabel}`}
                  >
                    {item.tstatus ?? statusLabel.toUpperCase()}
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
            );
          })
        )}
      </ScrollView>
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

    webHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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

    webEditButton: {
      width: 42,
      alignItems: "center",
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
      borderRadius: 0,
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