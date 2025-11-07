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

export default function PreferencesScreen() {
  // Navigation setup
  const navigation = useNavigation();

  // keeps track of which category (Notifications, Account, or Groups) is being viewed
  const [activeCategory, setActiveCategory] = useState<'Notifications' | 'Account' | 'Groups'>('Notifications');

  // handles the dropdown open or closed state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Notification states
  // holds the user’s selected notification settings
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
  // The user context stores the global name for use on the Home screen
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

  // Closes modal
  const closeModal = () => {
    setModalVisible(false);
    setTempText('');
  };

  // Saves modal input
  const saveModal = () => {
    setCustomInputs({ ...customInputs, [modalType]: tempText });
    setModalVisible(false);
  };

  // Updates the account info as the user types
  const handleAccountChange = (key: keyof typeof account, value: string) => {
    setAccount({ ...account, [key]: value });
  };

  // Adds a group if it does not already exist
  const addGroup = () => {
    if (newGroup.trim() && !groups.includes(newGroup)) {
      setGroups([...groups, newGroup.trim()]);
      setNewGroup('');
    }
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
        setName(parsed.account.name);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  // Load once when screen opens
  useEffect(() => {
    loadPreferences();
  }, []);

  // Save automatically whenever preferences change
  useEffect(() => {
    savePreferences();
  }, [notificationTypes, methods, schedule, account, groups, customInputs]);

  // Screen Layout - controls what appears on the screen visually
  return (
    <ScrollView style={styles.container}>
      {/* Header with title and back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>PREFERENCES</Text>
      </View>

      {/* Dropdown to switch between sections */}
      <View style={styles.subHeader}>
        <TouchableOpacity style={styles.dropdownToggle} onPress={() => setDropdownOpen(!dropdownOpen)}>
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
                  activeCategory === cat && styles.dropdownSelected, // highlight selected item
                ]}
                onPress={() => {
                  setActiveCategory(cat as any);
                  setDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    activeCategory === cat && styles.dropdownTextSelected, // change selected text
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Notification section*/}
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
                style={[styles.checkbox, notificationTypes[key as NotificationTypeKey] && styles.checkboxChecked]}
                onPress={() => toggle('types', key as NotificationTypeKey)} // allows user to check box to recieve notifications
              >
                {notificationTypes[key as NotificationTypeKey] && <Ionicons name="checkmark" size={18} color={colors.primary} />}
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
                style={[styles.checkbox, methods[key as MethodKey] && styles.checkboxChecked]}
                onPress={() => toggle('methods', key as MethodKey)} // allows user to check box for how they want to recieve notifications
              >
                {methods[key as MethodKey] && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
              <Text style={styles.optionText}>{key.toUpperCase()}</Text>
            </View>
          ))}

          <Text style={styles.categoryTitle}>NOTIFICATION SCHEDULE</Text>
          {Object.keys(schedule).map((key) => (
            <View key={key} style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.checkbox, schedule[key as ScheduleKey] && styles.checkboxChecked]}
                onPress={() => toggle('schedule', key as ScheduleKey)} // allows user to set a notification schedule
              >
                {schedule[key as ScheduleKey] && <Ionicons name="checkmark" size={18} color={colors.primary} />}
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
                  if (key === 'name') setName(val); // allows user to change name that will updat globally
                }}
              />
            </View>
          ))}
        </View>
      )}

      {/* Groups Section */}
      {activeCategory === 'Groups' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY GROUPS</Text>
          {groups.map((g) => (
            <Text key={g} style={styles.groupItem}>• {g}</Text>
          ))}
          <View style={styles.addGroupRow}>
            <TextInput
              placeholder="Join a new group..."
              placeholderTextColor={colors.gray400}
              style={styles.inputBox}
              value={newGroup}
              onChangeText={setNewGroup} // allows user to add groups which will eventually give access to restricted group rooms
            />
            <TouchableOpacity style={styles.addButton} onPress={addGroup}>
              <Ionicons name="add-circle" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal for custom preferences - makes edit button clickable and allow user to enter custom options 
      (custom optioins do not currently do anything) */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit {modalType}</Text> 
            <TextInput 
              style={styles.modalInput}
              placeholder="Enter custom preference..."
              placeholderTextColor={colors.gray400}
              value={tempText}
              onChangeText={setTempText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={saveModal}
              >
                <Text style={[styles.modalButtonText, { color: colors.white }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Styles section -implements layout of screen with all components applied
const styles = StyleSheet.create({
  // header and subheader
  container: { flex: 1, backgroundColor: colors.gray100, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, },
  backButton: { padding: 5 },
  title: { fontSize: 48, fontFamily: 'BebasNeue-Regular', color: colors.primary, textAlign: 'center', marginLeft: 50},
  subHeader: { marginTop: 12, marginBottom: 10 },
  dropdownToggle: { flexDirection: 'row', alignItems: 'center' },
  subHeaderText: { fontSize: 20, color: colors.primary, marginLeft: 6 },
  // drop down menu
  dropdownMenu: { backgroundColor: colors.white, borderRadius: 4, marginTop: 8, padding: 6, elevation: 6, shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 4, },
  dropdownItem: { padding: 8 },
  dropdownText: { fontSize: 16, color: colors.primary },
  dropdownSelected: { backgroundColor: colors.primary, },
  dropdownTextSelected: { color: colors.white, },
  // section setup
  section: { backgroundColor: colors.primary, borderRadius: 4, paddingVertical: 20, paddingHorizontal: 20, marginTop: 10, marginBottom: 40 },
  sectionTitle: { fontSize: 28, fontFamily: 'BebasNeue-Regular', color: colors.white, marginBottom: 16 },
  categoryTitle: { fontSize: 24, fontFamily: 'BebasNeue-Regular', color: colors.white, marginTop: 10, marginBottom: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  // checkboxes
  checkbox: { width: 24, height: 24, borderRadius: 4, backgroundColor: colors.gray300, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: colors.white },
  // input text from user
  optionText: { color: colors.white, fontSize: 16, flex: 1, },
  editText: { color: colors.offWhite, fontSize: 14, textDecorationLine: 'underline' },
  inputRow: { marginBottom: 16 },
  inputLabel: { color: colors.white, fontSize: 16, marginBottom: 4, fontFamily: 'BebasNeue-Regular' },
  inputBox: { backgroundColor: colors.white, borderRadius: 6, padding: 8, color: colors.primary },
  groupItem: { color: colors.white, fontSize: 18, marginBottom: 8 },
  addGroupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  addButton: { backgroundColor: colors.primary, borderRadius: 50, padding: 6, marginLeft: 8 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: colors.white, borderRadius: 8, padding: 20, width: '80%' },
  modalTitle: { fontSize: 22, fontFamily: 'BebasNeue-Regular', color: colors.primary, marginBottom: 10, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: colors.gray300, borderRadius: 6, padding: 10, marginBottom: 20, color: colors.primary },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center', marginHorizontal: 5, backgroundColor: colors.gray200 },
  modalButtonText: { fontSize: 16, fontFamily: 'BebasNeue-Regular', color: colors.primary },
});
