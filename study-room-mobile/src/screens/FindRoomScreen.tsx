// Find a Room screen file

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

export default function FindARoomScreen() {
  const router = useRouter();

  // Dropdown open/close control
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Selected building state
  const [selectedBuilding, setSelectedBuilding] = useState<'Stocker Center' | 'ARC' | 'Alden Library'>('Stocker Center');

  // Example layouts for each building - admin will be able to edit these layouts
  const buildingLayouts = {
    'Stocker Center': [
      { id: '151', status: 'occupied' },
      { id: '152', status: 'available' },
      { id: '153', status: 'available' },
      { id: '154', status: 'offline' },
      { id: '155', status: 'available' },
      { id: '156', status: 'occupied' },
      { id: '157', status: 'available' },
      { id: '158', status: 'available' },
    ],
    'ARC': [
      { id: '101', status: 'available' },
      { id: '102', status: 'occupied' },
      { id: '103', status: 'offline' },
      { id: '104', status: 'occupied' },
      { id: '105', status: 'available' },
      { id: '106', status: 'available' },
      { id: '107', status: 'offline' },
    ],
    'Alden Library': [
      { id: '201', status: 'available' },
      { id: '202', status: 'available' },
      { id: '203', status: 'occupied' },
      { id: '204', status: 'occupied' },
      { id: '205', status: 'available' },
      { id: '206', status: 'offline' },
      { id: '310', status: 'available' },
      { id: '312', status: 'available' },
      { id: '405', status: 'offline' },
      { id: '406', status: 'occupied' },
    ],
  };

  // color variables for room status
  const getColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return colors.occupied;
      case 'available':
        return colors.available;
      default:
        return colors.gray400;
    }
  };

  const rooms = buildingLayouts[selectedBuilding];

  return (
    <ScrollView // makes page scrollable
        style={styles.container}
        contentContainerStyle={{
          alignItems: 'center',
          paddingBottom: 40,
        }}
      >
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>FIND A ROOM</Text>
        </View>

        {/* Subheader with dropdown menu */}
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)}>
            <Ionicons
              name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={styles.subHeaderText}>{selectedBuilding}</Text>
        </View>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {['Stocker Center', 'ARC', 'Alden Library'].map((building) => (
              <TouchableOpacity
                key={building}
                style={[
                  styles.dropdownItem, // selected item gets highlighted
                  selectedBuilding === building && styles.dropdownSelected,
                ]}
                onPress={() => {
                  setSelectedBuilding(building as any); // changes layout to selected bulding
                  setDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText, // selected text changes to white
                    selectedBuilding === building && styles.dropdownTextSelected,
                  ]}
                >
                  {building}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Room grid */}
      <View style={styles.gridContainer}>
        <FlatList
          data={rooms}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (       // changes room color based on status
            <View style={[styles.roomBox, { backgroundColor: getColor(item.status) }]}> 
              <Text style={styles.roomText}>{item.id}</Text>
            </View>
          )}
          contentContainerStyle={{
            alignItems: 'center',
            paddingBottom: 32,
          }}
        />
      </View>
            {/* color coded legend appears on bottom of screen */}
            <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: colors.available }]} />
          <Text style={styles.legendText}>AVAILABLE</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: colors.occupied }]} />
          <Text style={styles.legendText}>OCCUPIED</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendBox, { backgroundColor: colors.offline }]} />
          <Text style={styles.legendText}>ROOM DATA UNAVAILABLE</Text>
        </View>
      </View>

      </ScrollView>
  );
}
 // style sheet section - implements layout and sets up components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  headerWrapper: { // header
    width: '100%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 102,
    width: '90%',
    maxWidth: 400,
  },
  title: { // title
    fontSize: 38,
    fontFamily: 'BebasNeue-Regular',
    fontWeight: '500',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  subHeader: { // subheader
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
    gap: 10,
    width: '90%',
    maxWidth: 400,
  },
  subHeaderText: {
    fontSize: 18,
    color: colors.primary,
  },
  dropdownMenu: { // drop down menu
    backgroundColor: colors.white,
    borderRadius: 4,
    marginBottom: 20,
    width: '83%',
    alignSelf: 'flex-start',
    marginLeft: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.primary,
  },
  dropdownSelected: {
    backgroundColor: colors.primary,
  },
  dropdownTextSelected: {
    color: colors.white,
  },
  gridContainer: { // room grid container
    backgroundColor: colors.primary,
    borderRadius: 0,
    width: '100%',
    maxWidth: 400,
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  roomBox: { // individual room boxes
    flex: 1,
    aspectRatio: 1,
    minWidth: 110,
    borderRadius: 4,
    margin: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  roomText: { 
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  legendContainer: { // legend
    marginTop: 24,
    alignItems: 'flex-start',
    width: '90%',
    maxWidth: 400,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendBox: {
    width: 28,
    height: 28,
    marginRight: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 24,
    fontFamily: 'BebasNeue-Regular',
    color: colors.primary,
  },

});
