// Favorites Screen File
// Formatting for IOS and web
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { useFavorites } from "@/context/FavoritesContext"; // shared favorites context

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";

// define interface to recognize favorite
interface FavoriteRoom {
  name: string;
  status?: string;
  tstatus?: string;
}

export default function FavoritesScreen() {
  // Navigation setup 
  type FavoritesNavProp = NativeStackNavigationProp<
    RootStackParamList,
    "Favorites"
  >;
  const navigation = useNavigation<FavoritesNavProp>();

  const { favorites, removeFavorite } = useFavorites(); // shared list and remove function
  const [editMode, setEditMode] = useState(false); // keeps track of edit mode state

  // checks if on web
  const isWeb = Platform.OS === "web";

  // menu items for the web sidebar
  const menuItems = [
    { name: "Home", route: "Home" as const },
    { name: "Find a Room", route: "FindRoom" as const },
    { name: "Campus Map", route: "CampusMap" as const },
    { name: "Favorites", route: "FavoritesScreen" as const }, 
    { name: "Preferences", route: "Preferences" as const },
  ];

  // toggle edit mode on or off
  const toggleEdit = () => setEditMode(!editMode);

  return (
    // wrapper holds sidebar + main content on web 
    <View style={styles.page}>
      {/* WEB LEFT SIDEBAR (only shows on web) */}
      {isWeb && (
        <View style={styles.webSidebar}>
          {/* top logo/header area */}
          <View style={styles.webSidebarHeader}>
            <Image
              source={require("@/assets/images/bf_logo.png")}
              style={styles.webSidebarLogo}
              resizeMode="contain"
            />
          </View>

          {/* list of pages  */}
          <View style={styles.webSidebarLinks}>
            {menuItems.map((item) => {
              // highlights the current page
              const selected = item.route === "FavoritesScreen";
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

      {/* main page container (same iOS layout, just shifts right on web) */}
      <View style={[styles.container, isWeb && styles.webContent]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Home"); // fallback to Home
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={35} color={colors.primary} />
          </Pressable>

          <Text style={styles.title}>FAVORITES</Text>

          {/* edit button (pencil icon turns into checkmark when editing) */}
          <Pressable onPress={toggleEdit} style={styles.backButton}>
            <Ionicons
              name={editMode ? "checkmark" : "create-outline"}
              size={30}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {/* Favorite Rooms List */}
        <ScrollView contentContainerStyle={styles.listContainer}>
          {favorites.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={{ color: colors.primary, fontSize: 18 }}>
                No favorites added yet.
              </Text>
            </View>
          ) : (
            favorites.map((item: FavoriteRoom) => (
              <View key={item.name} style={styles.card}>
                <Text style={styles.roomText}>{item.name}</Text>

                <View style={styles.rightSection}>
                  <View
                    style={[
                      styles.statusDot, // status dot color coded by available, occupied, offline
                      {
                        backgroundColor:
                          item.status === "available"
                            ? colors.available
                            : item.status === "occupied"
                            ? colors.occupied
                            : colors.offline,
                      },
                    ]}
                  />
                  <Text style={styles.statusText}>{item.tstatus}</Text>

                  {/*  trash button only shows when in edit mode */}
                  {editMode && (
                    <TouchableOpacity
                      onPress={() => removeFavorite(item.name)}
                      style={{ marginLeft: 12 }}
                    >
                      <Ionicons name="trash" size={22} color={colors.white} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// applies styles and sets up page
const SIDEBAR_WIDTH = 275;

const styles = StyleSheet.create({
  page: {
    // wrapper for web layout (sidebar + page content)
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.gray100,
  },

  container: {
    // background container
    flex: 1,
    backgroundColor: colors.gray100,
    paddingTop: 80,
    paddingHorizontal: 16,
  },

  webContent: {
    // web version spacing so the content lines up nicely next to the sidebar
    paddingTop: 50,
    paddingLeft: 36,
    paddingRight: 36,
  },

  // left sidebar styles (web only)
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
    // highlights current page
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

  header: {
    // header container
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // centers title between two equal sides
    marginBottom: 24,
  },

  backButton: {
    // back button
    width: 40, // keeps both sides equal width
    alignItems: "center",
  },

  title: {
    // sets up title for each room
    flex: 1,
    textAlign: "center",
    fontSize: 38,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "500",
    color: colors.primary,
  },

  listContainer: {
    paddingBottom: 20,
  },

  card: {
    // room card container
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 0,
    padding: 25,
    marginBottom: 7,
    marginHorizontal: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },

  roomText: {
    // room name text inside each block
    color: colors.white,
    fontSize: 25,
    fontFamily: "BebasNeue-Regular",
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  statusDot: {
    // status dot placement
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  statusText: {
    color: colors.white,
    fontSize: 16,
  },
});
