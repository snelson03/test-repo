// Home Screen layout file

//import navigation, colors, react packages
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '@/context/FavoritesContext'; // added for shared favorites data

// describes what each favorite looks like for type safety
interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
}

// Device dimensions
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Maximum width for large screens
const MAX_SCREEN_WIDTH = 480;

export default function HomeScreen() {
  const navigation = useNavigation();
  const { name } = useUser(); // updates user's name for welcome message
  const [menuOpen, setMenuOpen] = useState(false);

  // type annotations to favorites 
  const { favorites, addFavorite, removeFavorite } = useFavorites() as {
    favorites: FavoriteItem[];
    addFavorite: (item: FavoriteItem) => void;
    removeFavorite: (name: string) => void;
  };

  const [roomStatuses, setRoomStatuses] = useState<Record<string, string>>({}); //store live status changes

  // Animation for menu dropdown
  const menuAnim = useRef(new Animated.Value(0)).current;

  // Menu animation
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // static room variables for testing layout
  const rooms = [
    { name: 'Stocker Center', status: 'busy', subtitle: 'No rooms available' },
    { name: 'ARC', status: 'almost_filled', subtitle: 'All rooms offline' },
    { name: 'Alden Library', status: 'available', subtitle: '5 rooms available' },
  ];

  // simulate changing status for favorites every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRoomStatuses((prev) => {
        const updated = { ...prev };
        favorites.forEach((fav: FavoriteItem) => {
          const statuses = ['available', 'occupied', 'offline'];
          // randomly assign new status
          updated[fav.name] = statuses[Math.floor(Math.random() * statuses.length)];
        });
        return updated;
      });
    }, 4000); // updates every 4 seconds
    return () => clearInterval(interval);
  }, [favorites]);

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
    // sets up style and alignment of homepage
    <View style={{ flex: 1, alignItems: 'center' }}>
      <ScrollView
        style={[styles.container, { width: contentWidth }]}
        contentContainerStyle={{ paddingBottom: 32 }}
        scrollEnabled={!menuOpen}
        keyboardShouldPersistTaps="handled"
      >
  
        {/* Header style setup */}
        <View style={styles.header}>
          <Image source={require('@/assets/images/bf_logo.png')} style={styles.logo} />
        </View>

        {/* Welcome message style setup */}
        <View style={styles.welcome}>
          <Text style={styles.welcome}>Welcome Back, {name}!</Text>
        </View>

        {/* Find a Room Banner style setup */}
        <TouchableOpacity onPress={() => !menuOpen && navigation.navigate('FindRoom' as never)}>
          <View style={styles.bannerContainer}>
            <View style={styles.imageShadow}>
              <Image source={require('@/assets/images/library.jpg')} style={styles.bannerImage} />
            </View>
            <Text style={styles.bannerText}>FIND A ROOM</Text>
          </View>
        </TouchableOpacity>

        {/* Campus Map style setup*/}
        <TouchableOpacity onPress={() => !menuOpen && navigation.navigate('CampusMap' as never)}>
          <View style={styles.mapContainer}>
            <View style={styles.imageShadow}>
              <Image source={require('@/assets/images/map.png')} style={styles.mapImage} />
            </View>
            <Text style={styles.mapText}>CAMPUS MAP</Text>
          </View>
        </TouchableOpacity>

        {/* Room Cards + Favorites style setup - added color coded dots next to room headers*/}
        <View style={styles.cardsContainer}>
          {/* Available Now Section */}
          <View style={styles.cardShadow}>
            <LinearGradient
              colors={['#F4F4F4', '#A1B5A8']} // added gradient '#F4F4F4'
              style={styles.availableNowCard}
            >
              <View style={styles.availableHeader}>
                <Text style={styles.availableTitle}>AVAILABLE NOW</Text>
                <Ionicons name="location-sharp" size={22} color={colors.primary} />
              </View>

              {rooms.map((room) => (
                <View key={room.name} style={styles.availableItem}>
                  <Text style={styles.availableItemText}>{room.name}</Text>
                  <View style={styles.availableRight}>
                    <View
                      style={[
                        styles.availableStatusDot,
                        {
                          backgroundColor:
                            room.status === 'available'
                              ? colors.available
                              : room.status === 'busy'
                              ? colors.occupied
                              : colors.offline,
                        },
                      ]}
                    />
                    <Text style={styles.availableSubtitle}>{room.subtitle}</Text>
                  </View>
                </View>
              ))}
            </LinearGradient>
          </View>

          <TouchableOpacity
            onPress={() => !menuOpen && navigation.navigate('Favorites' as never)}
            activeOpacity={0.9}
          >
            <View style={styles.cardShadow}> 
              <LinearGradient
                colors={['#F4F4F4', '#A1B5A8']}  // favorites caard gradient
                style={styles.favoritesCard}
              >
                {/* Header with title and star icon */}
                <View style={styles.favoritesHeader}>
                  <Text style={styles.favoritesTitle}>MY FAVORITES</Text>
                  <Feather name="heart" size={22} color={colors.primary} />
                </View>

                {/* dynamically show saved favorites with live status */}
                {favorites.length === 0 ? (
                  <Text style={{ color: colors.primary, fontSize: 16, textAlign: 'center', marginVertical: 10 }}>
                    No favorites added yet
                  </Text>
                ) : (
                  favorites.map((fav: FavoriteItem) => {
                    // type annotation
                    const status = roomStatuses[fav.name] || fav.status || 'available'; // get current or saved status
                    return (
                      <View key={fav.name} style={styles.favItem}>
                        <Text style={styles.favItemText}>{fav.name}</Text>
                        <View style={styles.favRight}>
                          <View
                            style={[
                              styles.favstatusDot,
                              {
                                backgroundColor:
                                  status === 'available'
                                    ? colors.available
                                    : status === 'occupied'
                                    ? colors.occupied
                                    : colors.offline,
                              },
                            ]}
                          />
                          <Text style={styles.favNumber}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => !menuOpen && navigation.navigate('Preferences' as never)}>
            <View style={styles.roomCardContainer}>
              <View style={styles.preferencesLeft}>
                <Text style={styles.roomCardTextLeft}>PREFERENCES</Text>
              </View>
              <Feather name="menu" size={25} color={colors.white} style={styles.prefIcon} />
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

      {/* Overlay Dropdown Menu setup */}
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

// Implemets object styles and sets colors + spacing, etc
const styles = StyleSheet.create({
  // background color
  container: { flex: 1, backgroundColor: colors.white },
  // header color and logo alignment
  header: { flexDirection: 'row', backgroundColor: colors.primary, padding: 30, paddingTop: 60,
      alignItems: 'center', justifyContent: 'flex-start', width: '100%' },
  logo: {width: 300, height: 80, marginRight: 12 },
  // Welcome message
  welcome: { paddingHorizontal: 0, bottom: 0, top: 15, left: 12, fontSize: 30,// fontFamily: 'BebasNeue-Regular',
  fontWeight: '500', fontFamily: 'BebasNeue-Regular', color: colors.primary, position: 'relative',},

  // Find a Room banner image, spacing, text color, and shadows implemented
  bannerContainer: { marginVertical: 12, paddingHorizontal: 20, top: 40, bottom: 15, position: 'relative' },
  bannerImage: { width: '100%', height: 200, borderRadius: 0 },
  bannerText: { position: 'absolute', paddingHorizontal: 20, bottom: 12, left: 12, fontSize: 40, fontFamily: 'BebasNeue-Regular',
  fontWeight: '500', color: colors.gray100, textShadowColor: 'rgba(0, 0, 0, 200)',
      textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 15, },
  imageShadow: {
      shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6,
      shadowRadius: 6, elevation: 8, borderRadius: 10,},

  // Campus Map banner image, spacing, text color, and shadows implemented
  mapContainer: { marginVertical: 16, paddingHorizontal: 20, top: 40, position: 'relative' },
  mapImage: { width: '100%', height: 200, borderRadius: 0 },
  mapText: { position: 'absolute', paddingHorizontal: 20, bottom: 12, left: 12, fontSize: 40, fontFamily: 'BebasNeue-Regular',
      fontWeight: '500', color: colors.white, textShadowColor: 'rgba(0, 0, 0, 200)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 10, },

  // room card, spacing, text color, implemented
  cardsContainer: { marginVertical: 16, paddingHorizontal: 20, top: 40, },
  roomCardContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, 
        backgroundColor: colors.primary, borderRadius: 0, marginBottom: 7, shadowColor: '#000', 
        shadowOpacity: 0.8, shadowRadius: 6, elevation: 2, shadowOffset: { width: 0, height: 5 },},
  roomCardTextLeft: { fontSize: 27, fontFamily: 'BebasNeue-Regular', color: colors.white },
  roomCardTextRight: { fontSize: 14, color: colors.white },

  // availaable now section implemented
  availableNowCard: { borderRadius: 0, padding: 20,
    marginBottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6, shadowRadius: 12, elevation: 5 },
  
  availableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  availableTitle: { color: colors.primary, fontFamily: 'BebasNeue-Regular', fontSize: 27, letterSpacing: 0.5, },
  
  availableItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.primary, borderRadius: 0, padding: 18, marginBottom: 6 },
  
  availableItemText: { color: colors.white, fontFamily: 'BebasNeue-Regular', fontSize: 20 },
  availableRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  availableStatusDot: { width: 11, height: 11, borderRadius: 5.5 },
  availableSubtitle: { color: colors.white, fontSize: 14 },
  
  statusDot: { width: 8, height: 9, borderRadius: 4, marginHorizontal: 8 },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  
  favoritesLeft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1,},
  heartIcon: {marginTop: 2, marginRight: 12,},
// favorites card implementation
  favoritesCard: { backgroundColor: colors.marigold, padding: 20, borderRadius: 0, marginTop: 0, marginBottom: 0, 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.6,
  shadowRadius: 12,
  elevation: 8, },
  favoritesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
  favoritesTitle: { fontSize: 27, fontFamily: 'BebasNeue-Regular', color: colors.primary,},
  favItem: { backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 18, paddingHorizontal: 18, marginVertical: 3, },
  favItemText: { color: colors.white, fontFamily: 'BebasNeue-Regular', fontSize: 20,},
  favRight: { flexDirection: 'row', alignItems: 'center',gap: 12, },
  favstatusDot: { width: 11, height: 11, borderRadius: 5.5, },
  favNumber: { color: colors.white, fontSize: 14, },
// preferences card
  preferencesLeft: { marginTop:0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1,},
  prefIcon: {marginTop: 2, marginRight: 12,},

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
    borderRadius: 0,
    marginBottom: 32,
  },
  
  // Floating button moved to bottom-right corner
  menuButtonContainer: {
    position: 'absolute',
    top: 100,           
    right: 20,
    zIndex: 100,        
    pointerEvents: 'box-none',
  },
  menuButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  
  // Dropdown menu options and background shading upon opening menu
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', // translucent gray overlay
  },
  menuContent: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: '100%',
  },
  menuItemContainer: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: { fontSize: 22, fontFamily: 'BebasNeue-Regular', color: colors.primary },
});
