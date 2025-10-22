import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '@/constants/colors';
import { Feather } from '@expo/vector-icons';

// Device dimensions
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Maximum width for large screens
const MAX_SCREEN_WIDTH = 480;

export default function HomeScreen() {
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Animation for menu dropdown
  const menuAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const rooms = [
    { name: 'Stocker Center', status: 'busy', subtitle: 'All rooms full' },
    { name: 'ARC', status: 'almost_filled', subtitle: '2 rooms free' },
    { name: 'Alden Library', status: 'available', subtitle: '5 rooms free' },
  ];

  // Menu items
  const menuItems = [
    { name: 'Home', route: 'Home' },
    { name: 'Find a Room', route: 'FindRoom' },
    { name: 'Campus Map', route: 'CampusMap' },
    { name: 'Favorites', route: 'Favorites' },
    { name: 'Preferences', route: 'Preferences' },
  ];

  // Dropdown animation style
  const menuTranslate = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_HEIGHT, 0],
  });

  // Common width for all content
  const contentWidth = SCREEN_WIDTH > MAX_SCREEN_WIDTH ? MAX_SCREEN_WIDTH : SCREEN_WIDTH;

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <ScrollView
        style={[styles.container, { width: contentWidth }]}
        contentContainerStyle={{ paddingBottom: 32 }}
        scrollEnabled={!menuOpen}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('@/assets/images/bf_logo.png')} style={styles.logo} />
        </View>

        {/* Find a Room Banner */}
        <TouchableOpacity onPress={() => !menuOpen && navigation.navigate('FindRoom' as never)}>
          <View style={styles.bannerContainer}>
            <View style={styles.imageShadow}>
              <Image source={require('@/assets/images/library.jpg')} style={styles.bannerImage} />
            </View>
            <Text style={styles.bannerText}>FIND A ROOM</Text>
          </View>
        </TouchableOpacity>

        {/* Campus Map */}
        <TouchableOpacity onPress={() => !menuOpen && navigation.navigate('CampusMap' as never)}>
          <View style={styles.mapContainer}>
            <View style={styles.imageShadow}>
              <Image source={require('@/assets/images/map.png')} style={styles.mapImage} />
            </View>
            <Text style={styles.mapText}>CAMPUS MAP</Text>
          </View>
        </TouchableOpacity>

        {/* Room Cards + Favorites */}
        <View style={styles.cardsContainer}>
          {rooms.map((room) => (
            <View key={room.name} style={styles.roomCardContainer}>
              <Text style={styles.roomCardTextLeft}>{room.name}</Text>
              <Text style={styles.roomCardTextRight}>{room.subtitle}</Text>
            </View>
          ))}

          <TouchableOpacity onPress={() => !menuOpen && navigation.navigate('Favorites' as never)}>
            <View style={styles.roomCardContainer}>
              <Text style={styles.roomCardTextLeft}>MY FAVORITES</Text>
              <Text style={styles.roomCardTextRight}>3 Rooms</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => !menuOpen && navigation.navigate('Preferences' as never)}>
            <View style={styles.roomCardContainer}>
              <Text style={styles.roomCardTextLeft}>PREFERENCES</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Menu Button */}
      <View style={styles.menuButtonContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Feather name="menu" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Overlay Dropdown Menu */}
      {menuOpen && (
        <Animated.View style={[styles.menuOverlay, { width: contentWidth, transform: [{ translateY: menuTranslate }] }]}>
          <TouchableOpacity style={styles.overlayBackground} onPress={toggleMenu} activeOpacity={1} />
          <View style={[styles.menuContent, { width: contentWidth }]}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItemContainer}
                onPress={() => {
                  toggleMenu();
                  navigation.navigate(item.route as never);
                }}
              >
                <Text style={styles.menuItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', backgroundColor: colors.primary, padding: 20, alignItems: 'center', justifyContent: 'flex-start', width: '100%' },
  logo: {width: 300, height: 80, marginRight: 12 },

  bannerContainer: { marginVertical: 16, paddingHorizontal: 20, position: 'relative' },
  bannerImage: { width: '100%', height: 200, borderRadius: 0 },
  bannerText: { position: 'absolute', paddingHorizontal: 20, bottom: 12, left: 12, fontSize: 40, fontFamily: 'BebasNeue-Regular', color: colors.white },

  mapContainer: { marginVertical: 16, paddingHorizontal: 20, position: 'relative' },
  mapImage: { width: '100%', height: 200, borderRadius: 0 },
  mapText: { position: 'absolute', paddingHorizontal: 20, bottom: 12, left: 12, fontSize: 40, fontFamily: 'BebasNeue-Regular', color: colors.primary },

  cardsContainer: { marginVertical: 16, paddingHorizontal: 20 },
  roomCardContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: colors.primary,
        borderRadius: 0, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  roomCardTextLeft: { fontSize: 27, fontFamily: 'BebasNeue-Regular', color: colors.white },
  roomCardTextRight: { fontSize: 14, color: colors.white },

  menuButtonContainer: { position: 'absolute', top: 50, right: 20 },
  menuButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 30, elevation: 5 },

  menuOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start', zIndex: 1000, alignSelf: 'center' },
  overlayBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  menuContent: { backgroundColor: colors.white, marginTop: 80, borderRadius: 8, paddingVertical: 10, elevation: 10 },
  menuItemContainer: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: { fontSize: 22, fontFamily: 'BebasNeue-Regular', color: colors.primary },
});
