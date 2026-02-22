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

  // refs for better screen reader + keyboard flow (minimal, no UI changes)
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

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
      Alert.alert("Missing Information", "Please fill out all required fields.");
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
      Alert.alert("Error", err.message || "Account creation failed. Please try again.");
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
      accessibilityLabel="Create account screen"
    >
      {/* on web, wrap the content in a fixed-width container so it doesn’t stretch */}
      <View style={isWeb ? { width: webCardWidth } : undefined}>
        <View
          style={[styles.container, isWeb && styles.containerWeb]}
          accessibilityLabel="Create account form"
        >
          {/* Logo */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Image
              source={require("@/assets/images/bf_logo.png")}
              style={styles.logo} // only adjust logo sizing on web
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Bobcat Finder logo"
              accessibilityIgnoresInvertColors
            />
          </Animated.View>

          {/* Header */}
          <Text style={styles.header} accessibilityRole="header">
            CREATE ACCOUNT
          </Text>

          <View style={styles.formBox} accessibilityLabel="Account details">
            {/* Name */}
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              ref={nameRef}
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoComplete="name"
              textContentType="givenName"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              accessibilityLabel="First name"
              accessibilityHint="Enter your first name"
            />

            {/* Email */}
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              accessibilityLabel="Email"
              accessibilityHint="Enter your Ohio University email ending in at ohio dot edu"
            />

            {/* Password */}
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              ref={passwordRef}
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              accessibilityLabel="Password"
              accessibilityHint="Enter a password"
            />

            {/* Confirm Password */}
            <Text style={styles.label}>RE-ENTER PASSWORD</Text>
            <TextInput
              ref={confirmRef}
              style={styles.input}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              accessibilityLabel="Re-enter password"
              accessibilityHint="Re-enter your password to confirm"
            />

            {/* Phone */}
            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              ref={phoneRef}
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="done"
              onSubmitEditing={handleCreate}
              accessibilityLabel="Phone number"
              accessibilityHint="Enter your phone number"
            />
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={loading ? "Creating account" : "Create account"}
            accessibilityHint="Creates your account and signs you in"
            accessibilityState={{ disabled: loading, busy: loading }}
          >
            <Text style={styles.createButtonText}>
              {loading ? "CREATING..." : "CREATE"}
            </Text>
          </TouchableOpacity>

          {/* return to login */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login" as never)}
            accessibilityRole="button"
            accessibilityLabel="Return to login"
            accessibilityHint="Goes back to the login screen"
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
