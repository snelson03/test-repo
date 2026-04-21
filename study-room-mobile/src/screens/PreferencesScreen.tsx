// Preferences Screen File
// Implements the Preferences page where users can manage notifications, account info, and groups.
// Includes dropdown navigation, saving user name globally, and persistent storage using AsyncStorage.
// Includes web and mobile formatting

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
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
  WEB_CONTENT_PADDING_H,
  WEB_SIDEBAR_PADDING_H,
  WEB_DESKTOP_LAYOUT_MIN_WIDTH,
  PAGE_CONTENT_PADDING_H,
  CARD_PADDING,
  CARD_BORDER_RADIUS,
  BUTTON_BORDER_RADIUS,
  INPUT_PADDING,
  INPUT_MARGIN_BOTTOM,
  LABEL_MARGIN_BOTTOM,
  SPACE_MD,
} from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import type { ThemeMode } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { useRegisterSessionExpiryNavigation } from "@/context/SessionExpiryContext";
import InfoTooltip from "@/components/InfoTooltip";
import HoverTooltip from "@/components/HoverTooltip";
import { LinearGradient } from "expo-linear-gradient";

type PrefCategory = "Notifications" | "Account" | "Groups" | "Appearance";

export default function PreferencesScreen() {
  type PreferencesNavProp = NativeStackNavigationProp<
    RootStackParamList,
    "Preferences"
  >;

  // Navigation setup for Preferences screen
  const navigation = useNavigation<PreferencesNavProp>();
  useRegisterSessionExpiryNavigation();

  const route = useRoute<RouteProp<RootStackParamList, "Preferences">>();
  const { colors, mode, setMode } = useTheme();
  const { width } = useWindowDimensions();
  // Determines responsive layout (desktop vs mobile)
  const isWebDesktop =
    Platform.OS === "web" && width >= WEB_DESKTOP_LAYOUT_MIN_WIDTH;

  // Sidebar navigation items for desktop layout
  const menuItems = [
    { name: "Home", route: "Home" as const },
    { name: "Find a Room", route: "FindRoom" as const },
    { name: "Campus Map", route: "CampusMap" as const },
    { name: "Favorites", route: "Favorites" as const },
    { name: "Preferences", route: "Preferences" as const },
  ];

  // Tracks active preferences section (Notifications, Account, etc.)
  const [activeCategory, setActiveCategory] = useState<PrefCategory>(
    "Notifications"
  );
  // Controls dropdown menu visibility for selecting sections
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Syncs selected section when navigating with parameters
  useEffect(() => {
    const section = (route.params as any)?.section as PrefCategory | undefined;

    if (section === "Notifications") setActiveCategory("Notifications");
    if (section === "Account") setActiveCategory("Account");
    if (section === "Groups") setActiveCategory("Groups");
    if (section === "Appearance") setActiveCategory("Appearance");
  }, [route.params]);

  const { user, updateUserField, logoutUser } = useUser();

  // Predefined available groups
  const AVAILABLE_GROUPS = useMemo(
    () => [
      "Computer Science",
      "Engineering",
      "Honors College",
      "Graduate Students",
      "West Green Study Group",
      "Alden Library Regulars",
    ],
    []
  );

  const [groups, setGroups] = useState<string[]>(["Computer Science"]);
  const [newGroup, setNewGroup] = useState("");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Simple master toggle for favorite-room notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Adds a new group if valid and not already joined
  const addGroup = () => {
    if (!newGroup.trim()) return;
    if (!AVAILABLE_GROUPS.includes(newGroup.trim())) return;
    if (groups.includes(newGroup.trim())) return;
    setGroups((prev) => [...prev, newGroup.trim()]);
    setNewGroup("");
  };

  // Removes a group from user's list
  const removeGroup = (groupToRemove: string) => {
    setGroups(groups.filter((g) => g !== groupToRemove));
  };

  // Saves preferences to persistent storage
  const savePreferences = async () => {
    try {
      const data = {
        notificationsEnabled,
        mode,
      };
      await AsyncStorage.setItem("preferences", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  // Loads preferences from storage on startup
  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem("preferences");
      if (saved) {
        const parsed = JSON.parse(saved);

        if (typeof parsed.notificationsEnabled === "boolean") {
          setNotificationsEnabled(parsed.notificationsEnabled);
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  // Loads saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Automatically saves preferences when relevant state changes
  useEffect(() => {
    savePreferences();
  }, [notificationsEnabled, mode]);

  // Available preference sections
  const categories: PrefCategory[] = [
    "Notifications",
    "Account",
    "Groups",
    "Appearance",
  ];

  const styles = useMemo(() => createStyles(colors), [colors]);

  {/* Main preferences content container */}
  const mainContent = (
    <View
      style={[styles.container, isWebDesktop && styles.webContent]}
      accessibilityLabel="Preferences content"
    >
      {/* Responsive header (desktop vs mobile) */}
      {isWebDesktop ? (
        <View style={styles.webHeaderRow}>
          <Text style={styles.webPageTitle} accessibilityRole="header">
            PREFERENCES
          </Text>
        </View>
      ) : (
        <LinearGradient
          colors={["#06442A", "#04301D"]}
          style={styles.mobileHeaderBar}
        >
          <HoverTooltip message="Go back">
            <TouchableOpacity
              style={styles.backButtonMobile}
              onPress={() => {
                if (navigation.canGoBack()) navigation.goBack();
                else navigation.navigate("Home");
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={28} color={colors.white} />
            </TouchableOpacity>
          </HoverTooltip>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.mobileHeaderTitle} accessibilityRole="header">
              PREFERENCES
            </Text>
          </View>

          <View style={{ width: 28 }} />
        </LinearGradient>
      )}

      <View
        style={[
          styles.contentArea,
          { paddingHorizontal: isWebDesktop ? 0 : PAGE_CONTENT_PADDING_H },
        ]}
      >
        <View style={styles.subHeader}>
          <HoverTooltip message="Choose a preferences section">
            <TouchableOpacity
              style={styles.dropdownToggle}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              accessibilityRole="button"
              accessibilityLabel={`Select preferences section. Currently ${activeCategory}`}
              accessibilityState={{ expanded: dropdownOpen }}
            >
              <Feather name="menu" size={16} color={colors.primary} />
              <Text style={styles.subHeaderText}>{activeCategory}</Text>
              <Ionicons
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.primary}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </HoverTooltip>

          {dropdownOpen && (
            <View
              style={styles.dropdownMenu}
              accessibilityLabel="Preferences sections"
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.dropdownItem,
                    activeCategory === cat && styles.dropdownSelected,
                  ]}
                  onPress={() => {
                    setActiveCategory(cat);
                    setDropdownOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${cat} settings`}
                  accessibilityState={{ selected: activeCategory === cat }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      activeCategory === cat && styles.dropdownTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={[
            styles.scrollContent,
            isWebDesktop && styles.scrollContentWeb,
          ]}
          keyboardShouldPersistTaps="handled"
          accessibilityLabel="Preferences options"
          showsVerticalScrollIndicator={false}
        >
          {activeCategory === "Notifications" && (
            <LinearGradient
              colors={["#06442A", "#04301D"]}
              style={[styles.section, styles.sectionWeb]}
              accessibilityLabel="Notifications settings"
            >
              <Text style={styles.sectionTitle} accessibilityRole="header">
                NOTIFICATIONS
              </Text>

              <View
                style={[
                  styles.optionRow,
                  {
                    marginBottom: 18,
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      fontFamily: FONT_BODY,
                      fontSize: FONT_SIZE_SECTION - 8,
                      flex: 0,
                      marginRight: 12,
                    },
                  ]}
                >
                  Allow Notifications
                </Text>

                <TouchableOpacity
                  style={[
                    styles.pillBtn,
                    notificationsEnabled ? styles.pillBtnOn : styles.pillBtnOff,
                  ]}
                  onPress={() => setNotificationsEnabled((prev) => !prev)}
                  accessibilityRole="switch"
                  accessibilityLabel="Allow notifications"
                  accessibilityState={{ checked: notificationsEnabled }}
                >
                  <Text
                    style={[
                      styles.pillBtnText,
                      { fontFamily: FONT_BODY, fontSize: 16 },
                      notificationsEnabled && { color: colors.primary },
                    ]}
                  >
                    {notificationsEnabled ? "On" : "Off"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={styles.greenBox}
                accessibilityLabel="Notification details"
              >
                <Text style={[styles.optionText, { color: colors.white }]}>
                  Notifications will be sent for your favorite rooms when they
                  become available.
                </Text>
              </View>
            </LinearGradient>
          )}

          {activeCategory === "Account" && (
            <LinearGradient
              colors={["#06442A", "#04301D"]}
              style={[styles.section, styles.sectionWeb]}
              accessibilityLabel="Account settings"
            >
              <Text style={styles.sectionTitle} accessibilityRole="header">
                MY ACCOUNT
              </Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: colors.gray300 }]}
                  value={(user as any)?.email || ""}
                  editable={false}
                  accessibilityLabel="Email"
                  accessibilityHint="Email cannot be edited"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>NAME</Text>
                <TextInput
                  style={styles.inputBox}
                  value={(user as any)?.name || ""}
                  onChangeText={(val) => updateUserField("name" as any, val)}
                  accessibilityLabel="Name"
                  accessibilityHint="Edit your name"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>PHONE</Text>
                <TextInput
                  style={styles.inputBox}
                  value={(user as any)?.phone || ""}
                  onChangeText={(val) => updateUserField("phone" as any, val)}
                  accessibilityLabel="Phone number"
                  accessibilityHint="Edit your phone number"
                />
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setLogoutModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Log out"
                accessibilityHint="Opens confirmation dialog"
              >
                <Text style={styles.logoutText}>LOG OUT</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}

          {activeCategory === "Groups" && (
            <LinearGradient
              colors={["#06442A", "#04301D"]}
              style={[styles.section, styles.sectionWeb]}
              accessibilityLabel="Groups settings"
            >
              <Text style={styles.sectionTitle} accessibilityRole="header">
                MY GROUPS
              </Text>

              <Text style={styles.categoryTitle} accessibilityRole="header">
                JOINED
              </Text>

              {groups.length === 0 ? (
                <Text style={[styles.optionText, { opacity: 0.9 }]}>
                  No groups joined yet
                </Text>
              ) : (
                groups.map((g) => (
                  <View
                    key={g}
                    style={styles.groupRow}
                    accessibilityLabel={`Group ${g}`}
                  >
                    <Text style={styles.groupItem}>• {g}</Text>
                    <TouchableOpacity
                      onPress={() => removeGroup(g)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove group ${g}`}
                    >
                      <Ionicons name="trash" size={22} color={colors.offWhite} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <Text
                style={[styles.categoryTitle, { marginTop: 18 }]}
                accessibilityRole="header"
              >
                AVAILABLE
              </Text>

              {AVAILABLE_GROUPS.map((g) => {
                const joined = groups.includes(g);
                return (
                  <View key={g} style={styles.groupPickRow}>
                    <Text style={[styles.optionText, { flex: 1 }]}>{g}</Text>
                    <TouchableOpacity
                      style={[
                        styles.pillBtn,
                        joined ? styles.pillBtnOn : styles.pillBtnOff,
                      ]}
                      onPress={() => {
                        if (joined) removeGroup(g);
                        else setGroups((prev) => [...prev, g]);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={joined ? `Leave ${g}` : `Join ${g}`}
                    >
                      <Text
                        style={[
                          styles.pillBtnText,
                          joined && { color: colors.primary },
                        ]}
                      >
                        {joined ? "Joined" : "Join"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <View style={{ height: 16 }} />

              <View style={styles.addGroupRow}>
                <TextInput
                  placeholder="Select a group name..."
                  placeholderTextColor={colors.gray400}
                  style={styles.inputBox}
                  value={newGroup}
                  onChangeText={setNewGroup}
                  accessibilityLabel="Group name"
                  accessibilityHint="Type an available group exactly"
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addGroup}
                  accessibilityRole="button"
                  accessibilityLabel="Add group"
                >
                  <Ionicons name="add-circle" size={28} color={colors.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}

          {activeCategory === "Appearance" && (
            <LinearGradient
              colors={["#06442A", "#04301D"]}
              style={[styles.section, styles.sectionWeb]}
            >
              <Text style={styles.sectionTitle}>APPEARANCE</Text>
              <Text style={styles.categoryTitle}>THEME</Text>
              {(["light", "dark", "system"] as ThemeMode[]).map(
                (themeOption) => {
                  const checked = mode === themeOption;
                  return (
                    <View key={themeOption} style={styles.optionRow}>
                      <TouchableOpacity
                        style={[
                          styles.radioOuter,
                          checked && styles.radioOuterSelected,
                        ]}
                        onPress={() => setMode(themeOption)}
                        accessibilityRole="radio"
                        accessibilityLabel={themeOption}
                        accessibilityState={{ selected: checked }}
                      >
                        {checked && <View style={styles.radioInner} />}
                      </TouchableOpacity>

                      <Text style={styles.optionText}>
                        {themeOption === "system"
                          ? "System (follow device)"
                          : themeOption === "light"
                          ? "Light"
                          : "Dark"}
                      </Text>
                    </View>
                  );
                }
              )}
            </LinearGradient>
          )}
        </ScrollView>
      </View>

      {logoutModalVisible && (
        <View
          style={styles.logoutOverlay}
          accessibilityViewIsModal
          accessibilityLabel="Log out confirmation"
        >
          <View style={styles.logoutBox}>
            <Text style={styles.logoutModalTitle} accessibilityRole="header">
              Log Out
            </Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.logoutButtonsRow}>
              <TouchableOpacity
                style={[styles.logoutModalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel log out"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutModalButton, styles.confirmLogoutButton]}
                onPress={async () => {
                  setLogoutModalVisible(false);
                  await logoutUser();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                }}
                accessibilityRole="button"
                accessibilityLabel="Confirm log out"
              >
                <Text style={styles.confirmLogoutText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (isWebDesktop) {
    return (
      <View style={styles.webPage} accessibilityLabel="Preferences screen">
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
            <InfoTooltip message="Manage your account settings, notifications, and appearance preferences." />
          </View>
        </LinearGradient>

        <View
          style={styles.webBody}
          accessibilityLabel="Preferences page layout"
        >
          <View style={styles.webSidebar} accessibilityLabel="Sidebar navigation">
            <View style={styles.webSidebarLinks}>
              {menuItems.map((item) => {
                const selected = item.route === "Preferences";
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[
                      styles.webNavItem,
                      selected && styles.webNavItemSelected,
                    ]}
                    onPress={() => navigation.navigate(item.route)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name} page`}
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

          <View style={styles.webMain}>{mainContent}</View>
        </View>
      </View>
    );
  }

  return <View style={styles.mobilePage}>{mainContent}</View>;
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
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

    mobilePage: {
      flex: 1,
      backgroundColor: c.gray100,
    },

    container: {
      flex: 1,
      backgroundColor: c.gray100,
      paddingHorizontal: 0,
    },

    webContent: {
      paddingTop: 16,
      paddingLeft: WEB_CONTENT_PADDING_H,
      paddingRight: WEB_CONTENT_PADDING_H,
      flex: 1,
      alignSelf: "stretch",
    },

    webHeaderRow: {
      width: "100%",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      marginTop: 25,
      marginBottom: 8,
      paddingLeft: 8,
    },

    webPageTitle: {
      fontSize: FONT_SIZE_TITLE + 18,
      fontFamily: FONT_HEADING,
      color: c.primary,
      textTransform: "uppercase",
      textAlign: "left",
      letterSpacing: 1,
    },

    mobileHeaderBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 22,
      borderRadius: 0,
      marginBottom: 8,
    },

    mobileHeaderTitle: {
      fontSize: FONT_SIZE_TITLE + 6,
      fontFamily: FONT_HEADING,
      color: c.white,
      textTransform: "uppercase",
      textAlign: "center",
      marginRight: 24,
    },

    backButtonMobile: {
      marginLeft: 14,
    },

    contentArea: {
      flex: 1,
      width: "100%",
    },

    contentScroll: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 60,
    },

    scrollContentWeb: {
      alignItems: "stretch",
      width: "100%",
    },

    subHeader: {
      marginTop: 6,
      marginBottom: 10,
      alignSelf: "stretch",
      width: "100%",
    },

    dropdownToggle: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingVertical: 6,
      paddingHorizontal: 2,
    },

    subHeaderText: {
      fontSize: FONT_SIZE_BODY,
      color: c.primary,
      marginLeft: SPACE_MD,
      fontFamily: FONT_BODY,
    },

    dropdownMenu: {
      backgroundColor: c.white,
      borderRadius: CARD_BORDER_RADIUS,
      marginTop: 6,
      paddingVertical: 6,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      width: 220,
    },

    dropdownItem: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    dropdownText: {
      fontSize: FONT_SIZE_BODY,
      color: c.primary,
      fontFamily: FONT_BODY,
    },

    dropdownSelected: {
      backgroundColor: c.primary,
    },

    dropdownTextSelected: {
      color: c.white,
    },

    section: {
      borderRadius: CARD_BORDER_RADIUS,
      paddingVertical: CARD_PADDING,
      paddingHorizontal: CARD_PADDING,
      marginTop: 10,
      marginBottom: 40,
      width: "100%",
      alignSelf: "flex-start",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 4,
    },

    sectionWeb: {
      width: "100%",
      alignSelf: "stretch",
    },

    sectionTitle: {
      fontSize: FONT_SIZE_TITLE - 2,
      fontFamily: FONT_HEADING,
      color: c.white,
      marginBottom: 14,
    },

    categoryTitle: {
      fontSize: FONT_SIZE_CARD_TITLE,
      fontFamily: FONT_HEADING,
      color: c.white,
      marginTop: 12,
      marginBottom: SPACE_MD,
    },

    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 3,
      backgroundColor: c.gray300,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    optionText: {
      color: c.white,
      fontSize: FONT_SIZE_BODY - 2,
      flex: 1,
      fontFamily: FONT_BODY,
    },

    editText: {
      color: c.offWhite,
      fontSize: 13,
      textDecorationLine: "underline",
      fontFamily: FONT_BODY,
    },

    radioOuter: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: c.white,
      marginRight: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },

    radioOuterSelected: {
      borderColor: c.white,
    },

    radioInner: {
      width: 9,
      height: 9,
      borderRadius: 4.5,
      backgroundColor: c.white,
    },

    inputRow: {
      marginBottom: INPUT_MARGIN_BOTTOM,
    },

    inputLabel: {
      color: c.white,
      fontSize: FONT_SIZE_BODY,
      marginBottom: LABEL_MARGIN_BOTTOM,
      fontFamily: FONT_HEADING,
    },

    inputBox: {
      backgroundColor: c.white,
      borderRadius: CARD_BORDER_RADIUS,
      padding: INPUT_PADDING,
      color: c.primary,
      fontFamily: FONT_BODY,
    },

    groupItem: {
      color: c.white,
      fontSize: 18,
      fontFamily: FONT_BODY,
    },

    groupRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },

    groupPickRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      gap: 10,
    },

    pillBtn: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      minWidth: 92,
      alignItems: "center",
      justifyContent: "center",
    },

    pillBtnOn: {
      backgroundColor: c.white,
      borderColor: c.white,
    },

    pillBtnOff: {
      backgroundColor: "transparent",
      borderColor: c.offWhite,
    },

    pillBtnText: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: 14,
      letterSpacing: 0.3,
    },

    addGroupRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },

    addButton: {
      backgroundColor: c.primary,
      borderRadius: 50,
      padding: 6,
      marginLeft: 8,
    },

    greenBox: {
      backgroundColor: c.primary,
      borderRadius: BUTTON_BORDER_RADIUS,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginTop: 10,
      marginBottom: 10,
    },

    logoutButton: {
      backgroundColor: "#D9534F",
      paddingVertical: 10,
      borderRadius: CARD_BORDER_RADIUS,
      alignItems: "center",
      marginTop: 30,
      width: "40%",
      alignSelf: "center",
    },

    logoutText: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_SECTION,
    },

    logoutOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
    },

    logoutBox: {
      backgroundColor: c.white,
      width: "100%",
      maxWidth: 700,
      paddingVertical: 28,
      paddingHorizontal: 20,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
      alignItems: "center",
    },

    logoutModalTitle: {
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_TITLE - 2,
      color: c.primary,
      marginBottom: 10,
    },

    logoutModalMessage: {
      fontSize: FONT_SIZE_BODY,
      color: c.primary,
      textAlign: "center",
      marginBottom: 25,
      fontFamily: FONT_BODY,
    },

    logoutButtonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "80%",
      marginTop: 10,
    },

    logoutModalButton: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 8,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelButton: {
      backgroundColor: c.gray100,
      borderWidth: 1,
      borderColor: c.primary,
    },

    cancelText: {
      color: c.primary,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_CARD_TITLE,
    },

    confirmLogoutButton: {
      backgroundColor: c.primary,
    },

    confirmLogoutText: {
      color: c.white,
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_CARD_TITLE,
    },
  });
}