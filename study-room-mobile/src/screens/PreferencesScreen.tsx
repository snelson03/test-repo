// Preferences Screen File
// Implements the Preferences page where users can manage notifications, account info, and groups.
// includes dropdown navigation, saving user name globally, and persistent storage using AsyncStorage.
// Includes web and mobile formatting

import React, { useState, useEffect } from "react";
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
import colors from "@/constants/colors";
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

  // keeps track of which category (Notifications, Account, or Groups) is being viewed
  const [activeCategory, setActiveCategory] = useState<
    "Notifications" | "Account" | "Groups"
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

  const categories: Array<"Notifications" | "Account" | "Groups"> = [
    "Notifications",
    "Account",
    "Groups",
  ];

  return (
    <View style={styles.page}>
      {/* Web left sidebar */}
      {isWeb && (
        <View style={styles.webSidebar}>
          <View style={styles.webSidebarHeader}>
            <Image
              source={require("@/assets/images/bf_logo.png")}
              style={styles.webSidebarLogo}
              resizeMode="contain"
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
      <View style={[styles.container, isWeb && styles.webContent]}>
        {/* Header */}
        <View style={[styles.header, isWeb && styles.headerWeb]}>
          {/* back arrow on web + mobile */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate("Home");
          }}
        >
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>


          <Text style={[styles.title, isWeb && styles.titleWeb]}>
            PREFERENCES
          </Text>
        </View>

        {/* Dropdown */}
        <View style={styles.subHeader}>
          <TouchableOpacity
            style={styles.dropdownToggle}
            onPress={() => setDropdownOpen(!dropdownOpen)}
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
            <View style={styles.dropdownMenu}>
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
        >
          {/* Notification Section */}
          {activeCategory === "Notifications" && (
            <View style={[styles.section, isWeb && styles.sectionWeb]}>
              <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

              <Text style={styles.categoryTitle}>NOTIFICATION TYPES</Text>
              {[
                { key: "allRooms", label: "All Available Rooms" },
                { key: "favoritesOnly", label: "Favorites Only", editable: true },
                {
                  key: "buildingSpecific",
                  label: "Building Specific",
                  editable: true,
                },
              ].map(({ key, label, editable }) => (
                <View key={key} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      notificationTypes[key as keyof typeof notificationTypes] &&
                        styles.checkboxChecked,
                    ]}
                    onPress={() =>
                      toggle("types", key as keyof typeof notificationTypes)
                    }
                  >
                    {notificationTypes[key as keyof typeof notificationTypes] && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.optionText}>{label}</Text>

                  {editable && (
                    <TouchableOpacity onPress={() => openModal(key)}>
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <Text style={styles.categoryTitle}>NOTIFICATION METHODS</Text>
              {Object.keys(methods).map((key) => (
                <View key={key} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      methods[key as keyof typeof methods] &&
                        styles.checkboxChecked,
                    ]}
                    onPress={() => toggle("methods", key as keyof typeof methods)}
                  >
                    {methods[key as keyof typeof methods] && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.optionText}>
                    {key === "sms" ? "SMS" : "Email"}
                  </Text>
                </View>
              ))}

              <Text style={styles.categoryTitle}>NOTIFICATION SCHEDULING</Text>
              {Object.keys(schedule).map((key) => (
                <View key={key} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      schedule[key as keyof typeof schedule] &&
                        styles.checkboxChecked,
                    ]}
                    onPress={() =>
                      toggle("schedule", key as keyof typeof schedule)
                    }
                  >
                    {schedule[key as keyof typeof schedule] && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.optionText}>
                    {key === "standard"
                      ? "9:00AM - 5:00PM"
                      : key === "alwaysOn"
                      ? "Always On"
                      : "Custom"}
                  </Text>

                  {key === "custom" && (
                    <TouchableOpacity onPress={() => openModal("customSchedule")}>
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Account Section */}
          {activeCategory === "Account" && (
            <View style={[styles.section, isWeb && styles.sectionWeb]}>
              <Text style={styles.sectionTitle}>MY ACCOUNT</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  style={[styles.inputBox, { backgroundColor: colors.gray300 }]}
                  value={user?.email || ""}
                  editable={false}
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>NAME</Text>
                <TextInput
                  style={styles.inputBox}
                  value={user?.name || ""}
                  onChangeText={(val) => updateUserField("name", val)}
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>PHONE</Text>
                <TextInput
                  style={styles.inputBox}
                  value={user?.phone || ""}
                  onChangeText={(val) => updateUserField("phone", val)}
                />
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setLogoutModalVisible(true)}
              >
                <Text style={styles.logoutText}>LOG OUT</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Groups Section */}
          {activeCategory === "Groups" && (
            <View style={[styles.section, isWeb && styles.sectionWeb]}>
              <Text style={styles.sectionTitle}>MY GROUPS</Text>

              {groups.map((g) => (
                <View key={g} style={styles.groupRow}>
                  <Text style={styles.groupItem}>• {g}</Text>
                  <TouchableOpacity onPress={() => removeGroup(g)}>
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
                />
                <TouchableOpacity style={styles.addButton} onPress={addGroup}>
                  <Ionicons name="add-circle" size={28} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Modal for custom preferences */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {modalType === "favoritesOnly" && (
                <>
                  <Text style={styles.modalTitle}>My Favorites</Text>

                  <View style={styles.greenBox}>
                    {favorites.map((fav) => (
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
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selectedFavorites.some((f) => f.name === fav.name) && {
                              backgroundColor: colors.white,
                            },
                          ]}
                        >
                          {selectedFavorites.some((f) => f.name === fav.name) && (
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
                    ))}
                  </View>

                  <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}

              {modalType === "buildingSpecific" && (
                <>
                  <Text style={styles.modalTitle}>Select Buildings</Text>

                  <View style={styles.greenBox}>
                    {["ARC", "Alden Library", "Stocker"].map((bld) => (
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
                      >
                        <View
                          style={[
                            styles.checkbox,
                            customInputs.buildingSpecific.includes(bld) && {
                              backgroundColor: colors.white,
                            },
                          ]}
                        >
                          {customInputs.buildingSpecific.includes(bld) && (
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
                    ))}
                  </View>

                  <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}

              {modalType === "customSchedule" && (
                <>
                  <Text style={styles.modalTitle}>Custom Schedule</Text>

                  <TextInput
                    style={styles.modalInput}
                    placeholder="Example: 10:00AM - 3:00PM"
                    placeholderTextColor={colors.gray400}
                    value={tempText}
                    onChangeText={setTempText}
                  />

                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={[styles.modalButtonSmall, styles.modalCancel]}
                      onPress={closeModal}
                    >
                      <Text
                        style={[styles.modalButtonText, { color: colors.primary }]}
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
                    >
                      <Text
                        style={[styles.modalButtonText, { color: colors.white }]}
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
          <View style={styles.logoutOverlay}>
            <View style={styles.logoutBox}>
              <Text style={styles.logoutModalTitle}>Log Out</Text>
              <Text style={styles.logoutModalMessage}>
                Are you sure you want to log out?
              </Text>

              <View style={styles.logoutButtonsRow}>
                <TouchableOpacity
                  style={[styles.logoutModalButton, styles.cancelButton]}
                  onPress={() => setLogoutModalVisible(false)}
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

const SIDEBAR_WIDTH = 275;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.gray100,
  },

  container: {
    flex: 1,
    backgroundColor: colors.gray100,
    paddingHorizontal: 16,
  },

  // ✅ reduced top whitespace on web
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
    paddingHorizontal: 36
  },

  // ✅ center header + reduce top whitespace on web
  headerWeb: {
    justifyContent: "center",
    marginTop: 35, // was 80 visually on web
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
    color: colors.primary,
    textAlign: "center",
  },

  // ✅ center title on web
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
    color: colors.primary,
    marginLeft: 8,
    fontFamily: "Poppins-Regular",
  },

  dropdownMenu: {
    backgroundColor: colors.white,
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
    color: colors.primary,
    fontFamily: "Poppins-Regular",
  },

  dropdownSelected: {
    backgroundColor: colors.primary,
  },

  dropdownTextSelected: {
    color: colors.white,
  },

  section: {
    backgroundColor: colors.primary,
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
    color: colors.white,
    marginBottom: 14,
  },

  categoryTitle: {
    fontSize: 22,
    fontFamily: "BebasNeue-Regular",
    color: colors.white,
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
    backgroundColor: colors.gray300,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  checkboxChecked: {
    backgroundColor: colors.white,
  },

  optionText: {
    color: colors.white,
    fontSize: 14,
    flex: 1,
    fontFamily: "Poppins-Regular",
  },

  editText: {
    color: colors.offWhite,
    fontSize: 13,
    textDecorationLine: "underline",
    fontFamily: "Poppins-Regular",
  },

  inputRow: { marginBottom: 16 },

  inputLabel: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 4,
    fontFamily: "BebasNeue-Regular",
  },

  inputBox: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 8,
    color: colors.primary,
    fontFamily: "Poppins-Regular",
  },

  groupItem: { color: colors.white, fontSize: 18 },

  groupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  addGroupRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },

  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 6,
    marginLeft: 8,
  },

  webSidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.primary,
    paddingTop: 18,
    paddingHorizontal: 12,
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

  webSidebarLinks: {
    marginTop: 6,
  },

  webNavItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 6,
  },

  webNavItemSelected: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  webNavText: {
    color: colors.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 22,
    letterSpacing: 0.5,
  },

  webNavTextSelected: {
    color: colors.white,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxWidth: 700,
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: 22,
    fontFamily: "BebasNeue-Regular",
    color: colors.primary,
    marginBottom: 16,
    textAlign: "center",
  },

  modalButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
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
    color: colors.white,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: 10,
    color: colors.primary,
    fontFamily: "Poppins-Regular",
  },

  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  modalCancel: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  modalSave: {
    backgroundColor: colors.primary,
  },

  greenBox: {
    backgroundColor: colors.primary,
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
    color: colors.white,
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
    backgroundColor: colors.white,
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
    color: colors.primary,
    marginBottom: 10,
  },

  logoutModalMessage: {
    fontSize: 16,
    color: colors.primary,
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
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  cancelText: {
    color: colors.primary,
    fontFamily: "BebasNeue-Regular",
    fontSize: 22,
  },

  confirmLogoutButton: {
    backgroundColor: colors.primary,
  },

  confirmLogoutText: {
    color: colors.white,
    fontFamily: "BebasNeue-Regular",
    fontSize: 22,
  },
});
