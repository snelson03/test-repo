// Campus Map screen file

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from 'src/constants/colors';

// Get screen dimensions for responsive layout
const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_WIDTH = 420; // keeps content neat on larger screens

export default function CampusMapScreen() {
  const router = useRouter();

  const buildings = [
    {
      name: 'Academic & Research Center',
      address: '61 Oxbow Trail, Athens, OH 45701',
      image: require('../assets/images/arc.png'),
    },
    {
      name: 'Stocker Center',
      address: '28 West Green Dr, Athens, OH 45701',
      image: require('../assets/images/stocker.png'),
    },
    {
      name: 'Alden Library',
      address: '30 Park Pl, Athens, OH 45701',
      image: require('../assets/images/alden.png'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: 'center', paddingBottom: 50 }}
    >
      {/* Header */}
      <View style={[styles.header, { width: SCREEN_WIDTH > MAX_WIDTH ? MAX_WIDTH : '100%' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>CAMPUS MAP</Text>
      </View>

      {/* Map Section */}
      <View
        style={[
          styles.mapWrapper,
          { width: SCREEN_WIDTH > MAX_WIDTH ? MAX_WIDTH : '100%' },
        ]}
      >
        {/* Green background behind map */}
        <View style={styles.mapBackground}>
          <Image
            source={require('../assets/images/map.png')}
            style={styles.mapImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Available Buildings container (with outer shadow) */}
      <View
        style={[
          styles.buildingsContainer,
          { width: SCREEN_WIDTH > MAX_WIDTH ? MAX_WIDTH : '90%' },
        ]}
      >
        <Text style={styles.sectionTitle}>AVAILABLE BUILDINGS</Text>

        {buildings.map((building, index) => (
          <View key={index} style={styles.buildingCard}>
            <Text style={styles.buildingName}>{building.name}</Text>
            <Text style={styles.address}>{building.address}</Text>
            <Image source={building.image} style={styles.buildingImage} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // main scroll container
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  // top header with title
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    gap: 20,
  },
  backButton: { padding: 5 },
  title: {
    paddingHorizontal: 55,
    fontSize: 38,
    fontFamily: 'BebasNeue-Regular',
    color: colors.primary,
  },

  // map section with green background
  mapWrapper: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 45,
  },
  mapBackground: {
    backgroundColor: colors.primary,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingTop: 38,
    paddingBottom:  38,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  mapImage: {
    width: '100%',
    height: 300,
  },

  // container for all building cards with shadow
  buildingsContainer: {
    backgroundColor: colors.white,
    borderRadius: 0,
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 25,
    fontFamily: 'BebasNeue-Regular',
    color: colors.white,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    textAlign: 'center',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: -10,
    marginTop: -25, 
    marginHorizontal: -10,
    marginLeft: 0,
    alignSelf: 'stretch',
    
  },
  // individual building listing (no shadow)
  buildingCard: {
    alignItems: 'center',
    marginBottom: 30,
    width: '95%',
  },
  buildingName: {
    fontSize: 20,
    fontFamily: 'BebasNeue-Regular',
    color: colors.primary,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  buildingImage: {
    width: '85%',
    height: 200,
    borderWidth: 2.5,
    borderColor: colors.primary,
    borderRadius: 0,
  },
});
