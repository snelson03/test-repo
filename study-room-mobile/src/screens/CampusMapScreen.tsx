// Campus Map screen file 
// This screen shows the campus map that includes zoom and pins at the three selected buildings
// implements auto zoom when a pin is pressed and pulsing animation on selected pin

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

// used to size layout based on device width
const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_WIDTH = 420;

type BuildingWithPin = {
  id: string;
  name: string;
  address: string;
  image: any;
  pinX: number;
  pinY: number;
};

export default function CampusMapScreen() {
  const router = useRouter();

  const scrollViewMainRef = useRef<ScrollView | null>(null);

  // controls zooming and panning on the map
  const mapScrollRef = useRef<ScrollView | null>(null);

  // keeps track of which building was tapped
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // drives the glowing pulse animation
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // stores the map size so pin positions can be calculated correctly
  const [mapSize, setMapSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Start pulsing whenever a building is selected
  const startPulse = () => {
    pulseAnim.setValue(0);
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  };

  // list of buildings that appear in both the map and the list below
  const buildings: BuildingWithPin[] = [
    {
      id: 'arc',
      name: 'Academic & Research Center',
      address: '61 Oxbow Trail, Athens, OH 45701',
      image: require('../assets/images/arc.png'),
      pinX: 0.144,
      pinY: 0.252,
    },
    {
      id: 'stocker',
      name: 'Stocker Center',
      address: '28 West Green Dr, Athens, OH 45701',
      image: require('../assets/images/stocker.png'),
      pinX: 0.097,
      pinY: 0.285,
    },
    {
      id: 'alden',
      name: 'Alden Library',
      address: '30 Park Pl, Athens, OH 45701',
      image: require('../assets/images/alden.png'),
      pinX: 0.483,
      pinY: 0.445,
    },
  ];

  // compute pixel locations of pins (turns percentages into real coordinates)
  const pinPositions: Record<string, { x: number; y: number }> = {};
  if (mapSize.width > 0 && mapSize.height > 0) {
    buildings.forEach((b) => {
      pinPositions[b.id] = {
        x: mapSize.width * b.pinX,
        y: mapSize.height * b.pinY,
      };
    });
  }

  // zooms in on the selected pin
  const zoomToBuilding = (buildingId: string) => {
    const pin = pinPositions[buildingId];
    const scrollView: any = mapScrollRef.current;
    if (!pin || !scrollView || !scrollView.scrollResponderZoomTo) return;

    const zoomRect = {
      x: pin.x - mapSize.width * 0.25,
      y: pin.y - mapSize.height * 0.25,
      width: mapSize.width * 0.5,
      height: mapSize.height * 0.5,
      animated: true,
    };

    scrollView.scrollResponderZoomTo(zoomRect);

    // Scroll main view to map so user always sees the map first
    scrollViewMainRef.current?.scrollTo({ y: 0, animated: true });
  };

  // runs when user taps a building in map or list
  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    startPulse();
    zoomToBuilding(buildingId);
  };

  // captures the map size after layout so pins can be positioned
  const handleMapLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setMapSize({ width, height });
  };

  return (
    <ScrollView
      ref={scrollViewMainRef}
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
        <View style={styles.mapBackground}>
          <ScrollView
            ref={mapScrollRef}
            style={styles.zoomScroll}
            contentContainerStyle={styles.zoomContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            centerContent
            bounces={false}
          >
            <View style={styles.mapInner} onLayout={handleMapLayout}>
              <Image
                source={require('../assets/images/map.jpeg')}
                style={styles.mapImage}
                resizeMode="contain"
              />

              {/* PINS */}
              {mapSize.width > 0 &&
                buildings.map((b) => {
                  const pin = pinPositions[b.id];
                  if (!pin) return null;

                  const isSelected = selectedBuildingId === b.id;

                  // pulse size animation values
                  const pulseScale = pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1.6],
                  });

                  const pulseOpacity = pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 0],
                  });

                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.pin,
                        {
                          left: pin.x - 11,
                          top: pin.y - 22,
                        },
                      ]}
                      onPress={() => handleSelectBuilding(b.id)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.pinContainer}>
                        {/* Building label appears above pin */}
                        {isSelected && (
                          <Text style={styles.pinLabel}>{b.name}</Text>
                        )}

                        {/* Pulse ring underneath pin */}
                        {isSelected && (
                          <Animated.View
                            style={[
                              styles.pulseRing,
                              {
                                transform: [{ scale: pulseScale }],
                                opacity: pulseOpacity,
                              },
                            ]}
                          />
                        )}

                        {/* Actual pin */}
                        <Ionicons name="location-sharp" size={22} color="red" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Available Buildings Section */}
      <View
        style={[
          styles.buildingsContainer,
          { width: SCREEN_WIDTH > MAX_WIDTH ? MAX_WIDTH : '90%' },
        ]}
      >
        <Text style={styles.sectionTitle}>AVAILABLE BUILDINGS</Text>

        {buildings.map((b) => (
          <View key={b.id} style={styles.buildingCard}>
            <View style={styles.buildingNameRow}>
              <Text style={styles.buildingName}>{b.name}</Text>

              {/* taps here also zooms to pin */}
              <TouchableOpacity
                style={styles.buildingPinButton}
                onPress={() => handleSelectBuilding(b.id)}
              >
                <Ionicons name="location-sharp" size={20} color={colors.occupied} />
              </TouchableOpacity>
            </View>

            <Text style={styles.address}>{b.address}</Text>
            <Image source={b.image} style={styles.buildingImage} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* Styles */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },

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
    paddingBottom: 38,
  },

  zoomScroll: { width: '100%' },
  zoomContent: { alignItems: 'center', justifyContent: 'center' },
  mapInner: { width: '100%', height: 300 },
  mapImage: { width: '100%', height: '100%', },

  pin: { position: 'absolute' },
  pinContainer: { alignItems: 'center', justifyContent: 'center' },

  pinLabel: {
    position: 'absolute',
    bottom: 28,
    backgroundColor: 'rgba(5, 71, 42, 0.75)',
    color: colors.white,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 0,
    fontSize: 13,
    fontFamily: 'BebasNeue-Regular',
    textAlign: 'center',
    maxWidth: 80,     // prevents giant labels
    minWidth: 80,      // prevents vertical squish
    fontWeight: '500', textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 3,
  },

  pulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,0,0,0.5)',
  },

  buildingsContainer: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingVertical: 25,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },

  sectionTitle: {
    fontSize: 30,
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

  buildingCard: { alignItems: 'center', marginBottom: 30, width: '95%' },
  buildingNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buildingPinButton: { padding:0, marginLeft: 5, marginBottom: 6, },

  buildingName: {
    fontSize: 24,
    marginLeft: 30,
    color: colors.primary,
    marginBottom: 4,
    fontFamily: 'BebasNeue-Regular',
  },

  address: { fontSize: 14, color: colors.primary, marginBottom: 10 },

  buildingImage: {
    width: '85%',
    height: 200,
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
});
