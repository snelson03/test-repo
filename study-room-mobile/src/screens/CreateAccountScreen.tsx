// Create Account Screen
// Allows new users to make an account and saves it locally to AsyncStorage
// Account credentials can then be used on login screen to enter the app
// authentication not implemented yet, email does not have to be valid

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Alert,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { authAPI } from "@/utils/api";
import { useUser } from "@/context/UserContext";

export default function CreateAccountScreen() {
  const navigation = useNavigation();
  const { setUserForLogin } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // used for web sizing so the form doesn't stretch across the whole screen
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // fade logo in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // checks that all fields are filled out and passwords match
  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      Alert.alert(
        "Missing Information",
        "Please fill out all required fields."
      );
      return;
    }

    if (!email.endsWith("@ohio.edu")) {
      Alert.alert("Invalid Email", "You must use an @ohio.edu email.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create account via API
      await authAPI.signup(email.toLowerCase(), password, name);

      // Auto sign in after account creation
      await authAPI.signin(email.toLowerCase(), password);

      // Load user into context
      await setUserForLogin(email.toLowerCase());

      setLoading(false);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Home" as never) },
      ]);
    } catch (err: any) {
      setLoading(false);
      Alert.alert(
        "Error",
        err.message || "Account creation failed. Please try again."
      );
    }
  };

  // web layout helper: keep the form at a reasonable width on desktop
  const webMaxWidth = 520;
  const webCardWidth = Math.min(width - 40, webMaxWidth); // leaves some padding on the sides

  return (
    // ScrollView is still used so it works on smaller screens and with the keyboard
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        isWeb && styles.scrollContentWeb, // only apply these changes on web
      ]}
      style={{ flex: 1, backgroundColor: colors.primary }}
      keyboardShouldPersistTaps="handled"
    >
      {/* on web, wrap the content in a fixed-width container so it doesn’t stretch */}
      <View style={isWeb ? { width: webCardWidth } : undefined}>
        <View style={[styles.container, isWeb && styles.containerWeb]}>
          {/* Logo */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Image
              source={require("@/assets/images/bf_logo.png")}
              style={styles.logo}// only adjust logo sizing on web
              resizeMode="contain"
            />
          </Animated.View>

          {/* Header */}
          <Text style={styles.header}>CREATE ACCOUNT</Text>

          <View style={styles.formBox}>
            {/* Name */}
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            {/* Email */}
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Confirm Password */}
            <Text style={styles.label}>RE-ENTER PASSWORD</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />

            {/* Phone */}
            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? "CREATING..." : "CREATE"}
            </Text>
          </TouchableOpacity>

          {/* return to login*/}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login" as never)}
          >
            <Text style={[styles.returnText, isWeb && styles.returnTextWeb]}>
              Return to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// styles section
function createStyles(c: ThemeColors) {
  return StyleSheet.create({
  // used so ScrollView can center things on web without breaking mobile layout
  scrollContent: {
    flexGrow: 1,
  },

  // only used on web to center the whole page content
  scrollContentWeb: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },

  container: {
    paddingTop: 80,
    paddingHorizontal: 24,
  },

  // only used on web so the top spacing isn't huge on desktop screens
  containerWeb: {
    paddingTop: 40,
  },

  logo: {
    width: 350,
    height: 120,
    alignSelf: "center",
    marginBottom: 30,
  },

  // web-only logo tweak so it scales down nicely instead of overflowing
  logoWeb: {
    width: "100%",
  },

  header: {
    fontFamily: "BebasNeue-Regular",
    fontSize: 35,
    color: c.white,
    marginBottom: 5,
  },
  formBox: {
    backgroundColor: c.white,
    borderRadius: 0,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  label: {
    fontFamily: "BebasNeue-Regular",
    color: c.primary,
    fontSize: 20,
    marginBottom: 6,
  },
  input: {
    backgroundColor: c.gray300,
    borderRadius: 3,
    padding: 10,
    marginBottom: 22,
    color: c.primary,
  },
  createButton: {
    backgroundColor: c.gray300,
    paddingVertical: 14,
    borderRadius: 3,
    width: "50%",
    alignSelf: "center",
    marginBottom: 50,
  },
  createButtonText: {
    color: c.primary,
    fontFamily: "BebasNeue-Regular",
    fontSize: 26,
    textAlign: "center",
  },
  returnText: {
    color: c.white,
    textDecorationLine: "underline",
    fontFamily: "Poppins",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },

  // web-only: remove the custom font so it uses the browser default
  returnTextWeb: {
    fontFamily: undefined,
  },
  });
}
