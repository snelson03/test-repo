// Preferences Screen File
// Implements the Preferences page where users can manage notifications, account info, and groups.
// includes dropdown navigation, saving user name globally, and persistent storage using AsyncStorage.
// Includes web and mobile formatting

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import type { ThemeMode } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { useFavorites } from "@/context/FavoritesContext";

// describes what each favorite looks like
interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
}

export default function PreferencesScreen() {
  // Navigation setup
  type PreferencesNavProp = NativeStackNavigationProp<
    RootStackParamList,
    "Preferences"
  >;
  const navigation = useNavigation<PreferencesNavProp>();
  const { colors, mode, setMode } = useTheme();

  // check if running on web
  const isWeb = Platform.OS === "web";

  // menu items for the left side nav on web (matches Home screen)
  const menuItems = [
    { name: "Home", route: "Home" as const },
    { name: "Find a Room", route: "FindRoom" as const },
    { name: "Campus Map", route: "CampusMap" as const },
    { name: "Favorites", route: "Favorites" as const },
    { name: "Preferences", route: "Preferences" as const },
  ];

  // keeps track of which category is being viewed
  const [activeCategory, setActiveCategory] = useState<
    "Notifications" | "Account" | "Groups" | "Appearance"
  >("Notifications");

  // handles the dropdown open or closed state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Notification states
  const [notificationTypes, setNotificationTypes] = useState({
    allRooms: true,
    favoritesOnly: false,
    buildingSpecific: false,
  });

  const [methods, setMethods] = useState({
    email: true,
    sms: false,
  });

  const [schedule, setSchedule] = useState({
    standard: false,
    alwaysOn: false,
    custom: true,
  });

  // fields for custom input values
  const [customInputs, setCustomInputs] = useState({
    favoritesOnly: "",
    buildingSpecific: "",
    customSchedule: "",
  });

  // Account info section — using real user context now
  const { user, updateUserField, logoutUser } = useUser();

  // example data for groups screen
  const [groups, setGroups] = useState(["Computer Science"]);
  const [newGroup, setNewGroup] = useState("");

  // controls the popup window for editing custom preferences
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [tempText, setTempText] = useState("");

  // controls logout confirmation modal
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // get real favorites data from shared context
  const { favorites } = useFavorites() as { favorites: FavoriteItem[] };
  const [selectedFavorites, setSelectedFavorites] = useState<FavoriteItem[]>([]);

  // toggle function setup
  type NotificationTypeKey = keyof typeof notificationTypes;
  type MethodKey = keyof typeof methods;
  type ScheduleKey = keyof typeof schedule;

  // flips toggle switches for notifications
  const toggle = (
    group: "types" | "methods" | "schedule",
    key: NotificationTypeKey | MethodKey | ScheduleKey
  ) => {
    if (group === "types" && key in notificationTypes) {
      const typedKey = key as NotificationTypeKey;
      setNotificationTypes((prev) => ({
        ...prev,
        [typedKey]: !prev[typedKey],
      }));
    } else if (group === "methods" && key in methods) {
      const typedKey = key as MethodKey;
      setMethods((prev) => ({
        ...prev,
        [typedKey]: !prev[typedKey],
      }));
    } else if (group === "schedule" && key in schedule) {
      const typedKey = key as ScheduleKey;
      setSchedule((prev) => ({
        ...prev,
        [typedKey]: !prev[typedKey],
      }));
    }
  };

  // opens the modal for editable preferences
  const openModal = (type: string) => {
    setModalType(type);
    setTempText(customInputs[type as keyof typeof customInputs] || "");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTempText("");
  };

  // Adds a group
  const addGroup = () => {
    if (newGroup.trim() && !groups.includes(newGroup)) {
      setGroups([...groups, newGroup.trim()]);
      setNewGroup("");
    }
  };

  // Removes a group
  const removeGroup = (groupToRemove: string) => {
    setGroups(groups.filter((g) => g !== groupToRemove));
  };

  // Saves preferences to AsyncStorage
  const savePreferences = async () => {
    try {
      const data = {
        notificationTypes,
        methods,
        schedule,
        customInputs,
        selectedFavorites,
      };
      await AsyncStorage.setItem("preferences", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  // Loads preferences from AsyncStorage on start
  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem("preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotificationTypes(parsed.notificationTypes);
        setMethods(parsed.methods);
        setSchedule(parsed.schedule);
        setCustomInputs(parsed.customInputs);
        setSelectedFavorites(parsed.selectedFavorites || []);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    savePreferences();
  }, [notificationTypes, methods, schedule, customInputs, selectedFavorites]);

  const categories: Array<"Notifications" | "Account" | "Groups" | "Appearance"> = [
    "Notifications",
    "Account",
    "Groups",
    "Appearance",
  ];

  const styles = useMemo(() => createStyles(colors), [colors]);

  // WEB ONLY: use the same top bar + sidebar layout as HomeScreen
  if (isWeb) {
    return (
      <View style={styles.webPage} accessibilityLabel="Preferences screen">
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
        </View>

        {/* sidebar + main */}
        <View style={styles.webBody} accessibilityLabel="Preferences page layout">
          {/* Left Sidebar */}
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

          {/* Main area */}
          <View style={styles.webMain}>
            {/* MAIN CONTENT WRAP */}
            <View
              style={[styles.container, styles.webContent]}
              accessibilityLabel="Preferences content"
            >
              {/* Header */}
              <View style={[styles.header, styles.headerWeb]}>
                {/* back arrow on web + mobile */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    if (navigation.canGoBack()) navigation.goBack();
                    else navigation.navigate("Home");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <Ionicons
                    name="arrow-back"
                    size={26}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <Text
                  style={[styles.title, styles.titleWeb]}
                  accessibilityRole="header"
                >
                  PREFERENCES
                </Text>
              </View>

              {/* Dropdown */}
              <View style={styles.subHeader}>
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
                            activeCategory === cat &&
                              styles.dropdownTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* page content */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                  styles.scrollContent,
                  styles.scrollContentWeb,
                ]}
                accessibilityLabel="Preferences options"
              >
                {/* Notification Section */}
                {activeCategory === "Notifications" && (
                  <View
                    style={[styles.section, styles.sectionWeb]}
                    accessibilityLabel="Notifications settings"
                  >
                    <Text
                      style={styles.sectionTitle}
                      accessibilityRole="header"
                    >
                      NOTIFICATIONS
                    </Text>

                    <Text style={styles.categoryTitle} accessibilityRole="header">
                      NOTIFICATION TYPES
                    </Text>
                    {[
                      { key: "allRooms", label: "All Available Rooms" },
                      {
                        key: "favoritesOnly",
                        label: "Favorites Only",
                        editable: true,
                      },
                      {
                        key: "buildingSpecific",
                        label: "Building Specific",
                        editable: true,
                      },
                    ].map(({ key, label, editable }) => {
                      const checked =
                        notificationTypes[key as keyof typeof notificationTypes];
                      return (
                        <View key={key} style={styles.optionRow}>
                          <TouchableOpacity
                            style={[
                              styles.checkbox,
                              checked && styles.checkboxChecked,
                            ]}
                            onPress={() =>
                              toggle(
                                "types",
                                key as keyof typeof notificationTypes
                              )
                            }
                            accessibilityRole="checkbox"
                            accessibilityLabel={label}
                            accessibilityState={{ checked }}
                          >
                            {checked && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.primary}
                              />
                            )}
                          </TouchableOpacity>

                          <Text style={styles.optionText}>{label}</Text>

                          {editable && (
                            <TouchableOpacity
                              onPress={() => openModal(key)}
                              accessibilityRole="button"
                              accessibilityLabel={`Edit ${label}`}
                            >
                              <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}

                    <Text style={styles.categoryTitle} accessibilityRole="header">
                      NOTIFICATION METHODS
                    </Text>
                    {Object.keys(methods).map((key) => {
                      const checked = methods[key as keyof typeof methods];
                      const label = key === "sms" ? "SMS" : "Email";
                      return (
                        <View key={key} style={styles.optionRow}>
                          <TouchableOpacity
                            style={[
                              styles.checkbox,
                              checked && styles.checkboxChecked,
                            ]}
                            onPress={() =>
                              toggle("methods", key as keyof typeof methods)
                            }
                            accessibilityRole="checkbox"
                            accessibilityLabel={label}
                            accessibilityState={{ checked }}
                          >
                            {checked && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.primary}
                              />
                            )}
                          </TouchableOpacity>

                          <Text style={styles.optionText}>{label}</Text>
                        </View>
                      );
                    })}

                    <Text style={styles.categoryTitle} accessibilityRole="header">
                      NOTIFICATION SCHEDULING
                    </Text>
                    {Object.keys(schedule).map((key) => {
                      const checked = schedule[key as keyof typeof schedule];
                      const label =
                        key === "standard"
                          ? "9:00AM - 5:00PM"
                          : key === "alwaysOn"
                          ? "Always On"
                          : "Custom";
                      return (
                        <View key={key} style={styles.optionRow}>
                          <TouchableOpacity
                            style={[
                              styles.checkbox,
                              checked && styles.checkboxChecked,
                            ]}
                            onPress={() =>
                              toggle("schedule", key as keyof typeof schedule)
                            }
                            accessibilityRole="checkbox"
                            accessibilityLabel={label}
                            accessibilityState={{ checked }}
                          >
                            {checked && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.primary}
                              />
                            )}
                          </TouchableOpacity>

                          <Text style={styles.optionText}>{label}</Text>

                          {key === "custom" && (
                            <TouchableOpacity
                              onPress={() => openModal("customSchedule")}
                              accessibilityRole="button"
                              accessibilityLabel="Edit custom schedule"
                            >
                              <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Account Section */}
                {activeCategory === "Account" && (
                  <View
                    style={[styles.section, styles.sectionWeb]}
                    accessibilityLabel="Account settings"
                  >
                    <Text
                      style={styles.sectionTitle}
                      accessibilityRole="header"
                    >
                      MY ACCOUNT
                    </Text>

                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>EMAIL</Text>
                      <TextInput
                        style={[
                          styles.inputBox,
                          { backgroundColor: colors.gray300 },
                        ]}
                        value={user?.email || ""}
                        editable={false}
                        accessibilityLabel="Email"
                        accessibilityHint="Email cannot be edited"
                      />
                    </View>

                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>NAME</Text>
                      <TextInput
                        style={styles.inputBox}
                        value={user?.name || ""}
                        onChangeText={(val) => updateUserField("name", val)}
                        accessibilityLabel="Name"
                        accessibilityHint="Edit your name"
                      />
                    </View>

                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>PHONE</Text>
                      <TextInput
                        style={styles.inputBox}
                        value={user?.phone || ""}
                        onChangeText={(val) => updateUserField("phone", val)}
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
                  </View>
                )}

                {/* Groups Section */}
                {activeCategory === "Groups" && (
                  <View
                    style={[styles.section, styles.sectionWeb]}
                    accessibilityLabel="Groups settings"
                  >
                    <Text
                      style={styles.sectionTitle}
                      accessibilityRole="header"
                    >
                      MY GROUPS
                    </Text>

                    {groups.map((g) => (
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
                          <Ionicons
                            name="trash"
                            size={22}
                            color={colors.offWhite}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}

                    <View style={styles.addGroupRow}>
                      <TextInput
                        placeholder="Join a new group..."
                        placeholderTextColor={colors.gray400}
                        style={styles.inputBox}
                        value={newGroup}
                        onChangeText={setNewGroup}
                        accessibilityLabel="New group name"
                        accessibilityHint="Type a group name to add"
                      />
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={addGroup}
                        accessibilityRole="button"
                        accessibilityLabel="Add group"
                      >
                        <Ionicons
                          name="add-circle"
                          size={28}
                          color={colors.white}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Appearance Section (Dark mode) */}
                {activeCategory === "Appearance" && (
                  <View style={[styles.section, styles.sectionWeb]}>
                    <Text style={styles.sectionTitle}>APPEARANCE</Text>
                    <Text style={styles.categoryTitle}>THEME</Text>
                    {(["light", "dark", "system"] as ThemeMode[]).map((themeOption) => (
                      <View key={themeOption} style={styles.optionRow}>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            mode === themeOption && styles.checkboxChecked,
                          ]}
                          onPress={() => setMode(themeOption)}
                        >
                          {mode === themeOption && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                        <Text style={styles.optionText}>
                          {themeOption === "system"
                            ? "System (follow device)"
                            : themeOption === "light"
                            ? "Light"
                            : "Dark"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Modal for custom preferences */}
              <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                accessibilityViewIsModal
                onRequestClose={closeModal}
              >
                <View
                  style={styles.modalOverlay}
                  accessibilityLabel="Preferences dialog"
                >
                  <View style={styles.modalContainer}>
                    {modalType === "favoritesOnly" && (
                      <>
                        <Text
                          style={styles.modalTitle}
                          accessibilityRole="header"
                        >
                          My Favorites
                        </Text>

                        <View
                          style={styles.greenBox}
                          accessibilityLabel="Favorite rooms list"
                        >
                          {favorites.map((fav) => {
                            const checked = selectedFavorites.some(
                              (f) => f.name === fav.name
                            );
                            return (
                              <TouchableOpacity
                                key={fav.name}
                                style={styles.optionRow}
                                onPress={() => {
                                  const exists = selectedFavorites.some(
                                    (f) => f.name === fav.name
                                  );
                                  setSelectedFavorites(
                                    exists
                                      ? selectedFavorites.filter(
                                          (f) => f.name !== fav.name
                                        )
                                      : [...selectedFavorites, fav]
                                  );
                                }}
                                accessibilityRole="checkbox"
                                accessibilityLabel={fav.name}
                                accessibilityState={{ checked }}
                              >
                                <View
                                  style={[
                                    styles.checkbox,
                                    checked && {
                                      backgroundColor: colors.white,
                                    },
                                  ]}
                                >
                                  {checked && (
                                    <Ionicons
                                      name="checkmark"
                                      size={16}
                                      color={colors.primary}
                                    />
                                  )}
                                </View>

                                <Text
                                  style={[
                                    styles.optionText,
                                    { color: colors.white },
                                  ]}
                                >
                                  {fav.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={closeModal}
                          accessibilityRole="button"
                          accessibilityLabel="Close dialog"
                        >
                          <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {modalType === "buildingSpecific" && (
                      <>
                        <Text
                          style={styles.modalTitle}
                          accessibilityRole="header"
                        >
                          Select Buildings
                        </Text>

                        <View
                          style={styles.greenBox}
                          accessibilityLabel="Buildings list"
                        >
                          {["ARC", "Alden Library", "Stocker"].map((bld) => {
                            const checked =
                              customInputs.buildingSpecific.includes(bld);
                            return (
                              <TouchableOpacity
                                key={bld}
                                style={styles.optionRow}
                                onPress={() => {
                                  const selected = customInputs.buildingSpecific
                                    .split(",")
                                    .map((x) => x.trim())
                                    .filter(Boolean);

                                  const exists = selected.includes(bld);
                                  const newList = exists
                                    ? selected.filter((x) => x !== bld)
                                    : [...selected, bld];

                                  setCustomInputs({
                                    ...customInputs,
                                    buildingSpecific: newList.join(", "),
                                  });
                                }}
                                accessibilityRole="checkbox"
                                accessibilityLabel={bld}
                                accessibilityState={{ checked }}
                              >
                                <View
                                  style={[
                                    styles.checkbox,
                                    checked && {
                                      backgroundColor: colors.white,
                                    },
                                  ]}
                                >
                                  {checked && (
                                    <Ionicons
                                      name="checkmark"
                                      size={16}
                                      color={colors.primary}
                                    />
                                  )}
                                </View>

                                <Text
                                  style={[
                                    styles.optionText,
                                    { color: colors.white },
                                  ]}
                                >
                                  {bld}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={closeModal}
                          accessibilityRole="button"
                          accessibilityLabel="Close dialog"
                        >
                          <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {modalType === "customSchedule" && (
                      <>
                        <Text
                          style={styles.modalTitle}
                          accessibilityRole="header"
                        >
                          Custom Schedule
                        </Text>

                        <TextInput
                          style={styles.modalInput}
                          placeholder="Example: 10:00AM - 3:00PM"
                          placeholderTextColor={colors.gray400}
                          value={tempText}
                          onChangeText={setTempText}
                          accessibilityLabel="Custom schedule"
                          accessibilityHint="Enter a time range"
                        />

                        <View style={styles.modalActionsRow}>
                          <TouchableOpacity
                            style={[
                              styles.modalButtonSmall,
                              styles.modalCancel,
                            ]}
                            onPress={closeModal}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel"
                          >
                            <Text
                              style={[
                                styles.modalButtonText,
                                { color: colors.primary },
                              ]}
                            >
                              Cancel
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.modalButtonSmall, styles.modalSave]}
                            onPress={() => {
                              setCustomInputs({
                                ...customInputs,
                                customSchedule: tempText,
                              });
                              setModalVisible(false);
                              setTempText("");
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Save custom schedule"
                          >
                            <Text
                              style={[
                                styles.modalButtonText,
                                { color: colors.white },
                              ]}
                            >
                              Save
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </Modal>

              {/* Logout Confirmation Modal */}
              {logoutModalVisible && (
                <View
                  style={styles.logoutOverlay}
                  accessibilityViewIsModal
                  accessibilityLabel="Log out confirmation"
                >
                  <View style={styles.logoutBox}>
                    <Text
                      style={styles.logoutModalTitle}
                      accessibilityRole="header"
                    >
                      Log Out
                    </Text>
                    <Text style={styles.logoutModalMessage}>
                      Are you sure you want to log out?
                    </Text>

                    <View style={styles.logoutButtonsRow}>
                      <TouchableOpacity
                        style={[
                          styles.logoutModalButton,
                          styles.cancelButton,
                        ]}
                        onPress={() => setLogoutModalVisible(false)}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel log out"
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.logoutModalButton,
                          styles.confirmLogoutButton,
                        ]}
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
          </View>
        </View>
      </View>
    );
  }

  // Mobile version (unchanged)
  return (
    <View style={styles.page} accessibilityLabel="Preferences screen">
      {/* Web left sidebar */}
      {isWeb && (
        <View style={styles.webSidebar} accessibilityLabel="Sidebar navigation">
          <View style={styles.webSidebarHeader}>
            <Image
              source={require("@/assets/images/bf_logo.png")}
              style={styles.webSidebarLogo}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Bobcat Finder logo"
              accessibilityIgnoresInvertColors
            />
          </View>

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
      )}

      {/* MAIN CONTENT WRAP */}
      <View
        style={[styles.container, isWeb && styles.webContent]}
        accessibilityLabel="Preferences content"
      >
        {/* Header */}
        <View style={[styles.header, isWeb && styles.headerWeb]}>
          {/* back arrow on web + mobile */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate("Home");
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={26} color={colors.primary} />
          </TouchableOpacity>

          <Text
            style={[styles.title, isWeb && styles.titleWeb]}
            accessibilityRole="header"
          >
            PREFERENCES
          </Text>
        </View>

        {/* Dropdown */}
        <View style={styles.subHeader}>
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

        {/* page content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && styles.scrollContentWeb,
          ]}
          accessibilityLabel="Preferences options"
        >
          {/* Notification Section */}
          {activeCategory === "Notifications" && (
            <View
              style={[styles.section, isWeb && styles.sectionWeb]}
              accessibilityLabel="Notifications settings"
            >
              <Text style={styles.sectionTitle} accessibilityRole="header">
                NOTIFICATIONS
              </Text>

              <Text style={styles.categoryTitle} accessibilityRole="header">
                NOTIFICATION TYPES
              </Text>
              {[
                { key: "allRooms", label: "All Available Rooms" },
                { key: "favoritesOnly", label: "Favorites Only", editable: true },
                {
                  key: "buildingSpecific",
                  label: "Building Specific",
                  editable: true,
                },
              ].map(({ key, label, editable }) => {
                const checked =
                  notificationTypes[key as keyof typeof notificationTypes];
                return (
                  <View key={key} style={styles.optionRow}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        checked && styles.checkboxChecked,
                      ]}
                      onPress={() =>
                        toggle("types", key as keyof typeof notificationTypes)
                      }
                      accessibilityRole="checkbox"
                      accessibilityLabel={label}
                      accessibilityState={{ checked }}
                    >
                      {checked && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>

                    <Text style={styles.optionText}>{label}</Text>

                    {editable && (
                      <TouchableOpacity
                        onPress={() => openModal(key)}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${label}`}
                      >
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              <Text style={styles.categoryTitle} accessibilityRole="header">
                NOTIFICATION METHODS
              </Text>
              {Object.keys(methods).map((key) => {
                const checked = methods[key as keyof typeof methods];
                const label = key === "sms" ? "SMS" : "Email";
                return (
                  <View key={key} style={styles.optionRow}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        checked && styles.checkboxChecked,
                      ]}
                      onPress={() => toggle("methods", key as keyof typeof methods)}
                      accessibilityRole="checkbox"
                      accessibilityLabel={label}
                      accessibilityState={{ checked }}
                    >
                      {checked && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>

                    <Text style={styles.optionText}>{label}</Text>
                  </View>
                );
              })}

              <Text style={styles.categoryTitle} accessibilityRole="header">
                NOTIFICATION SCHEDULING
              </Text>
              {Object.keys(schedule).map((key) => {
                const checked = schedule[key as keyof typeof schedule];
                const label =
                  key === "standard"
                    ? "9:00AM - 5:00PM"
                    : key === "alwaysOn"
                    ? "Always On"
                    : "Custom";
                return (
                  <View key={key} style={styles.optionRow}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        checked && styles.checkboxChecked,
                      ]}
                      onPress={() =>
                        toggle("schedule", key as keyof typeof schedule)
                      }
                      accessibilityRole="checkbox"
                      accessibilityLabel={label}
                      accessibilityState={{ checked }}
                    >
                      {checked && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>

                    <Text style={styles.optionText}>{label}</Text>

                    {key === "custom" && (
                      <TouchableOpacity
                        onPress={() => openModal("customSchedule")}
                        accessibilityRole="button"
                        accessibilityLabel="Edit custom schedule"
                      >
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Account Section */}
          {activeCategory === "Account" && (
            <View
              style={[styles.section, isWeb && styles.sectionWeb]}
              accessibilityLabel="Account settings"
            >
              <Text style={styles.sectionTitle} accessibilityRole="header">
                MY ACCOUNT
              </Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: colors.gray300 }]}
                  value={user?.email || ""}
                  editable={false}
                  accessibilityLabel="Email"
                  accessibilityHint="Email cannot be edited"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>NAME</Text>
                <TextInput
                  style={styles.inputBox}
                  value={user?.name || ""}
                  onChangeText={(val) => updateUserField("name", val)}
                  accessibilityLabel="Name"
                  accessibilityHint="Edit your name"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>PHONE</Text>
                <TextInput
                  style={styles.inputBox}
                  value={user?.phone || ""}
                  onChangeText={(val) => updateUserField("phone", val)}
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
            </View>
          )}

          {/* Groups Section */}
          {activeCategory === "Groups" && (
            <View
              style={[styles.section, isWeb && styles.sectionWeb]}
              accessibilityLabel="Groups settings"
            >
              <Text style={styles.sectionTitle} accessibilityRole="header">
                MY GROUPS
              </Text>

              {groups.map((g) => (
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
              ))}

              <View style={styles.addGroupRow}>
                <TextInput
                  placeholder="Join a new group..."
                  placeholderTextColor={colors.gray400}
                  style={styles.inputBox}
                  value={newGroup}
                  onChangeText={setNewGroup}
                  accessibilityLabel="New group name"
                  accessibilityHint="Type a group name to add"
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
            </View>
          )}

          {/* Appearance Section (Dark mode) */}
          {activeCategory === "Appearance" && (
            <View style={[styles.section, isWeb && styles.sectionWeb]}>
              <Text style={styles.sectionTitle}>APPEARANCE</Text>
              <Text style={styles.categoryTitle}>THEME</Text>
              {(["light", "dark", "system"] as ThemeMode[]).map((themeOption) => (
                <View key={themeOption} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      mode === themeOption && styles.checkboxChecked,
                    ]}
                    onPress={() => setMode(themeOption)}
                  >
                    {mode === themeOption && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.optionText}>
                    {themeOption === "system"
                      ? "System (follow device)"
                      : themeOption === "light"
                      ? "Light"
                      : "Dark"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Modal for custom preferences */}
        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          accessibilityViewIsModal
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay} accessibilityLabel="Preferences dialog">
            <View style={styles.modalContainer}>
              {modalType === "favoritesOnly" && (
                <>
                  <Text style={styles.modalTitle} accessibilityRole="header">
                    My Favorites
                  </Text>

                  <View style={styles.greenBox} accessibilityLabel="Favorite rooms list">
                    {favorites.map((fav) => {
                      const checked = selectedFavorites.some(
                        (f) => f.name === fav.name
                      );
                      return (
                        <TouchableOpacity
                          key={fav.name}
                          style={styles.optionRow}
                          onPress={() => {
                            const exists = selectedFavorites.some(
                              (f) => f.name === fav.name
                            );
                            setSelectedFavorites(
                              exists
                                ? selectedFavorites.filter(
                                    (f) => f.name !== fav.name
                                  )
                                : [...selectedFavorites, fav]
                            );
                          }}
                          accessibilityRole="checkbox"
                          accessibilityLabel={fav.name}
                          accessibilityState={{ checked }}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              checked && { backgroundColor: colors.white },
                            ]}
                          >
                            {checked && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.primary}
                              />
                            )}
                          </View>

                          <Text style={[styles.optionText, { color: colors.white }]}>
                            {fav.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={closeModal}
                    accessibilityRole="button"
                    accessibilityLabel="Close dialog"
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}

              {modalType === "buildingSpecific" && (
                <>
                  <Text style={styles.modalTitle} accessibilityRole="header">
                    Select Buildings
                  </Text>

                  <View style={styles.greenBox} accessibilityLabel="Buildings list">
                    {["ARC", "Alden Library", "Stocker"].map((bld) => {
                      const checked = customInputs.buildingSpecific.includes(bld);
                      return (
                        <TouchableOpacity
                          key={bld}
                          style={styles.optionRow}
                          onPress={() => {
                            const selected = customInputs.buildingSpecific
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean);

                            const exists = selected.includes(bld);
                            const newList = exists
                              ? selected.filter((x) => x !== bld)
                              : [...selected, bld];

                            setCustomInputs({
                              ...customInputs,
                              buildingSpecific: newList.join(", "),
                            });
                          }}
                          accessibilityRole="checkbox"
                          accessibilityLabel={bld}
                          accessibilityState={{ checked }}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              checked && { backgroundColor: colors.white },
                            ]}
                          >
                            {checked && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.primary}
                              />
                            )}
                          </View>

                          <Text style={[styles.optionText, { color: colors.white }]}>
                            {bld}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={closeModal}
                    accessibilityRole="button"
                    accessibilityLabel="Close dialog"
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}

              {modalType === "customSchedule" && (
                <>
                  <Text style={styles.modalTitle} accessibilityRole="header">
                    Custom Schedule
                  </Text>

                  <TextInput
                    style={styles.modalInput}
                    placeholder="Example: 10:00AM - 3:00PM"
                    placeholderTextColor={colors.gray400}
                    value={tempText}
                    onChangeText={setTempText}
                    accessibilityLabel="Custom schedule"
                    accessibilityHint="Enter a time range"
                  />

                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={[styles.modalButtonSmall, styles.modalCancel]}
                      onPress={closeModal}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel"
                    >
                      <Text
                        style={[
                          styles.modalButtonText,
                          { color: colors.primary },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButtonSmall, styles.modalSave]}
                      onPress={() => {
                        setCustomInputs({
                          ...customInputs,
                          customSchedule: tempText,
                        });
                        setModalVisible(false);
                        setTempText("");
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Save custom schedule"
                    >
                      <Text
                        style={[
                          styles.modalButtonText,
                          { color: colors.white },
                        ]}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Logout Confirmation Modal */}
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
    </View>
  );
}

const WEB_SIDEBAR_WIDTH = 300;
const WEB_TOPBAR_HEIGHT = 170;

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
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 2,
    marginBottom: 8,
  },

  webNavItemSelected: { backgroundColor: "rgba(255,255,255,0.18)" },

  webNavText: {
    color: c.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 28,
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
    paddingHorizontal: 16,
  },

  //  reduced top whitespace on web
  webContent: {
    paddingTop: 16, // was 40
    paddingLeft: 36,
    paddingRight: 36,
    flex: 1,
    alignSelf: "stretch",
  },

  scrollContent: {
    paddingBottom: 60,
  },
  scrollContentWeb: {
    alignItems: "stretch",
    width: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 80, // mobile spacing
    marginBottom: 10,
    paddingHorizontal: 36,
  },

  //  center header + reduce top whitespace on web
  headerWeb: {
    justifyContent: "center",
    marginTop: 35,
  },

  backButton: {
    padding: 5,
    marginLeft: -40,
    marginRight: 8,
  },

  title: {
    flex: 1,
    fontSize: 38,
    fontFamily: "BebasNeue-Regular",
    color: c.primary,
    textAlign: "center",
  },

  // center title on web
  titleWeb: {
    textAlign: "center",
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
    fontSize: 16,
    color: c.primary,
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
  },

  dropdownMenu: {
    backgroundColor: c.white,
    borderRadius: 6,
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
    fontSize: 16,
    color: c.primary,
    fontFamily: "Poppins-Regular",
  },

  dropdownSelected: {
    backgroundColor: c.primary,
  },

  dropdownTextSelected: {
    color: c.white,
  },

  section: {
    backgroundColor: c.primary,
    borderRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 40,
    width: "100%",
    alignSelf: "flex-start",
  },

  sectionWeb: {
    maxWidth: undefined,
    width: "100%",
    alignSelf: "stretch",
  },

  sectionTitle: {
    fontSize: 30,
    fontFamily: "BebasNeue-Regular",
    color: c.white,
    marginBottom: 14,
  },

  categoryTitle: {
    fontSize: 22,
    fontFamily: "BebasNeue-Regular",
    color: c.white,
    marginTop: 12,
    marginBottom: 8,
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

  checkboxChecked: {
    backgroundColor: c.white,
  },

  optionText: {
    color: c.white,
    fontSize: 14,
    flex: 1,
    fontFamily: "Poppins-Regular",
  },

  editText: {
    color: c.offWhite,
    fontSize: 13,
    textDecorationLine: "underline",
    fontFamily: "Poppins-Regular",
  },

  inputRow: { marginBottom: 16 },

  inputLabel: {
    color: c.white,
    fontSize: 16,
    marginBottom: 4,
    fontFamily: "BebasNeue-Regular",
  },

  inputBox: {
    backgroundColor: c.white,
    borderRadius: 6,
    padding: 8,
    color: c.primary,
    fontFamily: "Poppins-Regular",
  },

  groupItem: { color: c.white, fontSize: 18 },

  groupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  addGroupRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },

  addButton: {
    backgroundColor: c.primary,
    borderRadius: 50,
    padding: 6,
    marginLeft: 8,
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

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalContainer: {
    backgroundColor: c.white,
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxWidth: 700,
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: 22,
    fontFamily: "BebasNeue-Regular",
    color: c.primary,
    marginBottom: 16,
    textAlign: "center",
  },

  modalButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: c.primary,
    marginTop: 18,
  },

  modalButtonSmall: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  modalButtonText: {
    fontSize: 18,
    fontFamily: "BebasNeue-Regular",
    color: c.white,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: c.gray300,
    borderRadius: 8,
    padding: 10,
    color: c.primary,
    fontFamily: "Poppins-Regular",
  },

  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  modalCancel: {
    backgroundColor: c.gray100,
    borderWidth: 1,
    borderColor: c.primary,
  },

  modalSave: {
    backgroundColor: c.primary,
  },

  greenBox: {
    backgroundColor: c.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
  },

  logoutButton: {
    backgroundColor: "#D9534F",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 30,
    width: "40%",
    alignSelf: "center",
  },

  logoutText: {
    color: c.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 25,
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
    fontFamily: "BebasNeue-Regular",
    fontSize: 30,
    color: c.primary,
    marginBottom: 10,
  },

  logoutModalMessage: {
    fontSize: 16,
    color: c.primary,
    textAlign: "center",
    marginBottom: 25,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "BebasNeue-Regular",
    fontSize: 22,
  },

  confirmLogoutButton: {
    backgroundColor: c.primary,
  },

  confirmLogoutText: {
    color: c.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 22,
  },
});
