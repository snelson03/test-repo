// Preferences Screen File
// Implements the Preferences page where users can manage notifications, account info, and groups.
// includes dropdown navigation, saving user name globally, and persistent storage using AsyncStorage.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '@/constants/colors';
import { useUser } from '@/context/UserContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator'; 
import { useFavorites } from '@/context/FavoritesContext';

// describes what each favorite looks like
interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
}

export default function PreferencesScreen() {
  // Navigation setup
  type PreferencesNavProp = NativeStackNavigationProp<RootStackParamList, 'Preferences'>; 
  const navigation = useNavigation<PreferencesNavProp>();

  // keeps track of which category (Notifications, Account, or Groups) is being viewed
  const [activeCategory, setActiveCategory] = useState<'Notifications' | 'Account' | 'Groups'>('Notifications');

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
    favoritesOnly: '',
    buildingSpecific: '',
    customSchedule: '',
  });

  // Account info section
  const { name, setName } = useUser();
  const [account, setAccount] = useState({
    name,
    email: 'ms773121@ohio.edu',
    phone: '(740) 555-2391',
  });

  // example data for groups screen
  const [groups, setGroups] = useState(['Computer Science']);
  const [newGroup, setNewGroup] = useState('');

  // controls the popup window for editing custom preferences
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [tempText, setTempText] = useState('');

  //  controls logout confirmation modal
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
    group: 'types' | 'methods' | 'schedule',
    key: NotificationTypeKey | MethodKey | ScheduleKey
  ) => {
    if (group === 'types' && key in notificationTypes) {
      const typedKey = key as NotificationTypeKey;
      setNotificationTypes((prev) => ({
        ...prev,
        [typedKey]: !prev[typedKey],
      }));
    } else if (group === 'methods' && key in methods) {
      const typedKey = key as MethodKey;
      setMethods((prev) => ({
        ...prev,
        [typedKey]: !prev[typedKey],
      }));
    } else if (group === 'schedule' && key in schedule) {
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
    setTempText(customInputs[type as keyof typeof customInputs] || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTempText('');
  };

  const saveModal = () => {
    setCustomInputs({ ...customInputs, [modalType]: tempText });
    setModalVisible(false);
  };

  // Updates the account info as the user types
  const handleAccountChange = (key: keyof typeof account, value: string) => {
    setAccount({ ...account, [key]: value });
  };

  // Adds a group
  const addGroup = () => {
    if (newGroup.trim() && !groups.includes(newGroup)) {
      setGroups([...groups, newGroup.trim()]);
      setNewGroup('');
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
        account,
        groups,
        customInputs,
        selectedFavorites,
      };
      await AsyncStorage.setItem('preferences', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Loads preferences from AsyncStorage on start
  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotificationTypes(parsed.notificationTypes);
        setMethods(parsed.methods);
        setSchedule(parsed.schedule);
        setAccount(parsed.account);
        setGroups(parsed.groups);
        setCustomInputs(parsed.customInputs);
        setSelectedFavorites(parsed.selectedFavorites || []);
        setName(parsed.account.name);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('loggedInUser');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.log('Logout error:', err);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    savePreferences();
  }, [notificationTypes, methods, schedule, account, groups, customInputs, selectedFavorites]);

  // UI LAYOUT
  return (
    <View style={styles.container}>

      {/* Header with title and back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
        >
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>PREFERENCES</Text>
      </View>

      {/* Dropdown to switch between sections */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.dropdownToggle}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Feather name="menu" size={22} color={colors.primary} />
          <Text style={styles.subHeaderText}>{activeCategory}</Text>
          <Ionicons
            name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.primary}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {['Notifications', 'Account', 'Groups'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.dropdownItem,
                  activeCategory === cat && styles.dropdownSelected,
                ]}
                onPress={() => {
                  setActiveCategory(cat as any);
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

      {/* Notification Section */}
      {activeCategory === 'Notifications' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

          <Text style={styles.categoryTitle}>NOTIFICATION TYPES</Text>

          {[
            { key: 'allRooms', label: 'All Available Rooms' },
            { key: 'favoritesOnly', label: 'Favorites Only', editable: true },
            { key: 'buildingSpecific', label: 'Building Specific', editable: true },
          ].map(({ key, label, editable }) => (
            <View key={key} style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  notificationTypes[key as keyof typeof notificationTypes] &&
                    styles.checkboxChecked,
                ]}
                onPress={() =>
                  toggle('types', key as keyof typeof notificationTypes)
                }
              >
                {notificationTypes[key as keyof typeof notificationTypes] && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
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
                  methods[key as keyof typeof methods] && styles.checkboxChecked,
                ]}
                onPress={() =>
                  toggle('methods', key as keyof typeof methods)
                }
              >
                {methods[key as keyof typeof methods] && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>

              <Text style={styles.optionText}>{key.toUpperCase()}</Text>
            </View>
          ))}

          <Text style={styles.categoryTitle}>NOTIFICATION SCHEDULE</Text>

          {Object.keys(schedule).map((key) => (
            <View key={key} style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  schedule[key as keyof typeof schedule] &&
                    styles.checkboxChecked,
                ]}
                onPress={() =>
                  toggle('schedule', key as keyof typeof schedule)
                }
              >
                {schedule[key as keyof typeof schedule] && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>

              <Text style={styles.optionText}>{key.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Account Section */}
      {activeCategory === 'Account' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY ACCOUNT</Text>

          {Object.keys(account).map((key) => (
            <View key={key} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{key.toUpperCase()}</Text>
              <TextInput
                style={styles.inputBox}
                value={account[key as keyof typeof account]}
                onChangeText={(val) => {
                  handleAccountChange(key as keyof typeof account, val);
                  if (key === 'name') setName(val);
                }}
              />
            </View>
          ))}

          {/* Logout button now opens modal  */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Groups Section */}
      {activeCategory === 'Groups' && (
        <View style={styles.section}>
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

      {/* Modal for custom preferences */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            {/* Favorites Modal */}
            {modalType === 'favoritesOnly' && (
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
                            ? selectedFavorites.filter((f) => f.name !== fav.name)
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
                            size={18}
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

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary, marginTop: 20 },
                  ]}
                  onPress={closeModal}
                >
                  <Text style={[styles.modalButtonText, { color: colors.white }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Building Specific Modal */}
            {modalType === 'buildingSpecific' && (
              <>
                <Text style={styles.modalTitle}>Select Buildings</Text>

                <View style={styles.greenBox}>
                  {['ARC', 'Alden Library', 'Stocker'].map((bld) => (
                    <TouchableOpacity
                      key={bld}
                      style={styles.optionRow}
                      onPress={() => {
                        const selected = customInputs.buildingSpecific
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean);

                        const exists = selected.includes(bld);

                        const newList = exists
                          ? selected.filter((x) => x !== bld)
                          : [...selected, bld];

                        setCustomInputs({
                          ...customInputs,
                          buildingSpecific: newList.join(', '),
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
                            size={18}
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

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary, marginTop: 20 },
                  ]}
                  onPress={closeModal}
                >
                  <Text style={[styles.modalButtonText, { color: colors.white }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/*  Logout Confirmation Modal */}
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
                onPress={() => {
                  setLogoutModalVisible(false);
                  handleLogout();
                }}
              >
                <Text style={styles.confirmLogoutText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// Styles section -implements layout of screen with all components applied
const styles = StyleSheet.create({
  // header and subheader
  container: { flex: 1, backgroundColor: colors.gray100, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 80,},
  backButton: { padding: 5 },
  title: { fontSize: 38, fontFamily: 'BebasNeue-Regular', color: colors.primary, textAlign: 'center', marginLeft: 70 },
  subHeader: { marginTop: 12, marginBottom: 10 },
  dropdownToggle: { flexDirection: 'row', alignItems: 'center' },
  subHeaderText: { fontSize: 20, color: colors.primary, marginLeft: 6 },

  // drop down menu
  dropdownMenu: { 
    backgroundColor: colors.white, 
    borderRadius: 4, 
    marginTop: 8, 
    padding: 6, 
    elevation: 6, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4 
  },
  dropdownItem: { padding: 8 },
  dropdownText: { fontSize: 16, color: colors.primary },
  dropdownSelected: { backgroundColor: colors.primary },
  dropdownTextSelected: { color: colors.white },

  // section setup
  section: { 
    backgroundColor: colors.primary, 
    borderRadius: 4, 
    paddingVertical: 20, 
    paddingHorizontal: 20, 
    marginTop: 10, 
    marginBottom: 40 
  },
  sectionTitle: { fontSize: 28, fontFamily: 'BebasNeue-Regular', color: colors.white, marginBottom: 16 },
  categoryTitle: { fontSize: 24, fontFamily: 'BebasNeue-Regular', color: colors.white, marginTop: 10, marginBottom: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },

  // checkboxes
  checkbox: { width: 24, height: 24, borderRadius: 4, backgroundColor: colors.gray300, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: colors.white, color: colors.primary },

  // input text from user
  optionText: { color: colors.white, fontSize: 16, flex: 1 },
  editText: { color: colors.offWhite, fontSize: 14, textDecorationLine: 'underline' },
  inputRow: { marginBottom: 16 },
  inputLabel: { color: colors.white, fontSize: 16, marginBottom: 4, fontFamily: 'BebasNeue-Regular' },
  inputBox: { backgroundColor: colors.white, borderRadius: 6, padding: 8, color: colors.primary },

  groupItem: { color: colors.white, fontSize: 18 },
  groupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addGroupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  addButton: { backgroundColor: colors.primary, borderRadius: 50, padding: 6, marginLeft: 8 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
    justifyContent: 'center',
  },
  modalTitle: { fontSize: 22, fontFamily: 'BebasNeue-Regular', color: colors.primary, marginBottom: 16, textAlign: 'center' },
  modalButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginTop: 20,
  },
  modalButtonText: { fontSize: 18, fontFamily: 'BebasNeue-Regular', color: colors.white },
  greenBox: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
  },

  logoutButton: { // logout button style
    backgroundColor: "#D9534F", //#D9534F
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
    width: '40%',
    alignSelf: 'center',
  },
  logoutText: {
    color: colors.white,
    fontFamily: 'BebasNeue-Regular',
    fontSize: 25,
  },

  /* Logout modal styles */
  logoutOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoutBox: {
    backgroundColor: colors.white,
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 30,
    color: colors.primary,
    marginBottom: 10,
  },
  logoutModalMessage: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: 'Poppins-Regular',
  },
  logoutButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  logoutModalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cancelText: {
    color: colors.primary,
    fontFamily: 'BebasNeue-Regular',
    fontSize: 22,
  },
  confirmLogoutButton: {
    backgroundColor: colors.primary,
  },
  confirmLogoutText: {
    color: colors.white,
    fontFamily: 'BebasNeue-Regular',
    fontSize: 22,
  },
});
