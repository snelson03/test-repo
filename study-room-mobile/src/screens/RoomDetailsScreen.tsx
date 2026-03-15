// Room Details Screen file
// Displays detailed info about a selected room such as location, restrictions, and status.
// Includes navigation back button and link to open the campus map screen.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useRegisterSessionExpiryNavigation } from '@/context/SessionExpiryContext';
import type { ThemeColors } from '@/constants/theme';
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_TITLE,
  FONT_SIZE_SECTION,
  FONT_SIZE_BODY,
  CARD_PADDING,
  CARD_BORDER_RADIUS,
  CONTAINER_PADDING_H,
  CONTAINER_PADDING_TOP_MOBILE,
  HEADER_BACK_ICON_SIZE,
  HEADER_MARGIN_BOTTOM,
  BUTTON_BORDER_RADIUS,
  SPACE_MD,
  SPACE_LG,
} from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';

// typed props for screen
type RoomDetailsScreenRouteProp = {
  params: {
    building: 'Stocker Center' | 'ARC' | 'Academic & Research Center' | 'Alden Library';
    roomId: string;
    status: 'available' | 'occupied' | 'offline';
  };
};

export default function RoomDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useRegisterSessionExpiryNavigation();
  const route = useRoute() as unknown as RoomDetailsScreenRouteProp;
  const { building, roomId, status } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // helper to determine floor number based on room ID’s first digit
  const getFloorFromRoom = (id: string): string => {
    const floorNum = parseInt(id.charAt(0));
    if (isNaN(floorNum)) return 'Unknown Floor';
    if (floorNum === 1) return '1st Floor';
    if (floorNum === 2) return '2nd Floor';
    if (floorNum === 3) return '3rd Floor';
    return `${floorNum}th Floor`;
  };

  // Building info record
  const BuildingInfo: Record<
    'Stocker Center' | 'ARC' | 'Academic & Research Center' | 'Alden Library',
    { address: string; restrictions: string }
  > = {
    'Stocker Center': {
      address: '28 West Green Dr, Athens, OH 45701',
      restrictions: 'Computer Science Students',
    },
    ARC: {
      address: '20 South Green Dr, Athens, OH 45701',
      restrictions: 'Open to All Students',
    },
    'Academic & Research Center': {
      address: '20 South Green Dr, Athens, OH 45701',
      restrictions: 'Open to All Students',
    },
    'Alden Library': {
      address: '30 Park Place, Athens, OH 45701',
      restrictions: 'Open to All Students',
    },
  };

  // pull data for selected building
  const info = BuildingInfo[building as keyof typeof BuildingInfo];
  const floor = getFloorFromRoom(roomId);

  // color for room status
  const getColor = (stat: string) => {
    switch (stat) {
      case 'available':
        return colors.available;
      case 'occupied':
        return colors.occupied;
      default:
        return colors.gray400;
    }
  };

  const statusLabel =
    status === 'available' ? 'Available' : status === 'occupied' ? 'Occupied' : 'Offline';

  return (
    <View
      style={styles.container}
      accessibilityLabel="Room details screen"
      accessibilityRole="summary"
    >
      {/* Back button and page title */}
      <View style={styles.header} accessibilityRole="header" accessibilityLabel="Room details">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={HEADER_BACK_ICON_SIZE} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title} accessibilityRole="header">
          ROOM DETAILS
        </Text>
      </View>

      {/* Top green section with building and room number */}
      <LinearGradient
        colors={[colors.primary, '#005E39']}
        style={styles.topBox}
        accessible
        accessibilityRole="summary"
        accessibilityLabel={`${building}, room ${roomId}. Status: ${statusLabel}.`}
      >
        <Text style={styles.buildingName}>{building}</Text>

        <View style={styles.statusDotRow}>
          <View
            style={[styles.statusDot, { backgroundColor: getColor(status) }]}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Status indicator: ${statusLabel}`}
          />
          <Text style={styles.roomNumber}>{roomId}</Text>
        </View>
      </LinearGradient>

      {/* Location box */}
      <View style={styles.infoBox} accessible accessibilityRole="summary" accessibilityLabel="Location">
        <Text style={styles.sectionTitle} accessibilityRole="header">
          LOCATION
        </Text>
        <Text style={styles.boldText}>
          {building}, {floor}
        </Text>
        <Text style={styles.subText}>{info.address}</Text>
      </View>

      {/* Restrictions box */}
      <View
        style={styles.infoBox}
        accessible
        accessibilityRole="summary"
        accessibilityLabel="Restrictions"
      >
        <Text style={styles.sectionTitle} accessibilityRole="header">
          RESTRICTIONS
        </Text>
        <Text style={styles.subText}>{info.restrictions}</Text>
      </View>

      {/* View on Map Section */}
      <TouchableOpacity
        style={[
          styles.sectionBox,
          {
            backgroundColor: colors.primary,
            marginTop: 60,
            paddingVertical: 15,
            width: '85%',
            alignSelf: 'center',
            borderRadius: CARD_BORDER_RADIUS,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
          },
        ]}
        onPress={() => {
          // converts the building name to the id used by CampusMap pins
          const toMapId = (b: string) => {
            const s = b.toLowerCase();
            if (s.includes("stocker")) return "stocker";
            if (s.includes("alden")) return "alden";
            // handles ARC / Academic & Research Center
            return "arc";
          };
        
          navigation.navigate("CampusMap", {
            selectedBuildingId: toMapId(building),
          } as any);
        }}
        accessibilityRole="button"
        accessibilityLabel="View on map"
        accessibilityHint="Opens the campus map screen"
      >
        {/* Invisible spacer on left to balance icon */}
        <View
          style={{ width: 24 }}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />

        {/* Centered text */}
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.white, textAlign: 'center', transform: [{ translateY: 6 }] },
          ]}
        >
          VIEW ON MAP
        </Text>

        {/* Icon on right */}
        <Ionicons
          name="location-sharp"
          size={24}
          color={colors.white}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </TouchableOpacity>
    </View>
  );
}

// Style section - implements styles for each section
function createStyles(c: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.gray100,
    paddingHorizontal: CONTAINER_PADDING_H,
    paddingTop: CONTAINER_PADDING_TOP_MOBILE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEADER_MARGIN_BOTTOM,
    marginTop: SPACE_LG,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE_TITLE + 2,
    fontFamily: FONT_HEADING,
    color: c.primary,
    marginRight: HEADER_BACK_ICON_SIZE,
  },
  topBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: CARD_PADDING,
    paddingHorizontal: CARD_PADDING - 2,
    borderRadius: CARD_BORDER_RADIUS,
    marginBottom: HEADER_MARGIN_BOTTOM,
  },
  buildingName: {
    fontFamily: FONT_HEADING,
    fontSize: FONT_SIZE_SECTION,
    color: c.white,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_MD,
  },
  statusDot: { width: 12, height: 12, borderRadius: 7 },
  roomNumber: {
    fontFamily: FONT_HEADING,
    fontSize: FONT_SIZE_SECTION,
    color: c.white,
  },
  infoBox: {
    backgroundColor: c.gray300,
    paddingVertical: SPACE_MD,
    paddingHorizontal: CARD_PADDING - 2,
    borderRadius: CARD_BORDER_RADIUS,
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: FONT_HEADING,
    fontSize: FONT_SIZE_SECTION,
    color: c.primary,
    marginBottom: SPACE_MD,
  },
  boldText: {
    fontFamily: FONT_BODY,
    fontWeight: '700',
    color: c.primary,
    fontSize: FONT_SIZE_BODY,
  },
  subText: {
    fontFamily: FONT_BODY,
    color: c.primary,
    fontSize: FONT_SIZE_BODY - 1,
    lineHeight: 25,
  },
  sectionBox: {
    paddingVertical: CARD_PADDING,
    paddingHorizontal: SPACE_MD,
    borderRadius: BUTTON_BORDER_RADIUS,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  availabilityTitle: {
    fontSize: FONT_SIZE_SECTION,
    fontFamily: FONT_HEADING,
    textAlign: 'center',
  },
});
}