// Login Screen – authentication using AsyncStorage accounts
// user must enter correct username and password saved locally to enter the app,
// account can be created by clicking create account

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "@/constants/colors";
import { useUser } from "@/context/UserContext";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { authAPI } from "@/utils/api";

// navigation
export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // used for the fade in on the logo
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { setUserForLogin } = useUser(); // load user into context

  // used for web sizing so it can be centered and not stretched across the screen
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // auto-login if already signed in
  useEffect(() => {
    async function checkLogin() {
      const isAuth = await authAPI.isAuthenticated();
      if (isAuth) {
        try {
          const { usersAPI } = await import("@/utils/api");
          const user = await usersAPI.getCurrentUser();
          await setUserForLogin(user.email);
          navigation.navigate("Home" as never);
        } catch (error) {
          // Token invalid, clear it
          await authAPI.logout();
        }
      }
    }
    checkLogin();
  }, []);

  // fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  // Login logic using real API
  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (!email.endsWith("@ohio.edu")) {
      setError("You must use an @ohio.edu email.");
      return;
    }

    setLoading(true);

    try {
      await authAPI.signin(email.toLowerCase(), password);

      // Load user data into context
      await setUserForLogin(email.toLowerCase());

      setLoading(false);
      navigation.navigate("Home" as never);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Login failed. Please try again.");
    }
  };

  // web layout helper: keep the login area at a reasonable width on desktop
  const webMaxWidth = 480;
  const webCardWidth = Math.min(width - 40, webMaxWidth); // leaves some padding on the sides

  return (
    // ScrollView helps on smaller screens and also lets us center things on web
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isWeb && styles.containerWeb, // only apply these changes on web
      ]}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="Login screen"
    >
      {/* on web, wrap the content in a fixed-width container so it doesn’t stretch */}
      <View
        style={isWeb ? { width: webCardWidth } : undefined}
        accessibilityLabel="Login form"
      >
        {/* Logo */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          accessibilityLabel="App logo"
        >
          <Image
            source={require("@/assets/images/bf_logo.png")}
            style={[styles.logo, isWeb && styles.logoWeb]} // only adjust logo sizing on web
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Bobcat Finder logo"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>

        {/* Error */}
        {error.length > 0 && (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            accessibilityLabel={`Error: ${error}`}
          >
            {error}
          </Text>
        )}

        {/* Email */}
        <Text style={styles.label} accessibilityRole="text">
          EMAIL
        </Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          accessibilityLabel="Email"
          accessibilityHint="Enter your ohio.edu email address"
          textContentType="emailAddress"
          keyboardType="email-address"
          autoComplete="email"
        />

        {/* Password */}
        <Text style={styles.label} accessibilityRole="text">
          PASSWORD
        </Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          accessibilityLabel="Password"
          accessibilityHint="Enter your password"
          textContentType="password"
          autoComplete="password"
        />

        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          accessibilityRole="button"
          accessibilityLabel="Reset password"
          accessibilityHint="Password reset is not implemented yet"
        >
          <Text style={styles.resetText}>Reset Password</Text>
        </TouchableOpacity>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          accessibilityRole="button"
          accessibilityLabel={loading ? "Logging in" : "Login"}
          accessibilityHint="Attempts to sign you in"
          accessibilityState={{ busy: loading, disabled: loading }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              accessibilityLabel="Loading"
            />
          ) : (
            <Text style={styles.loginText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        {/* CREATE ACCOUNT BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateAccount")}
          accessibilityRole="button"
          accessibilityLabel="Create an account"
          accessibilityHint="Opens the Create Account screen"
        >
          <Text style={styles.createAccountText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Styles section
const styles = StyleSheet.create({
  // main container (same look on iOS), but using flexGrow so ScrollView works correctly
  container: {
    flexGrow: 1, // changed from flex: 1 so the ScrollView can size + center properly
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingTop: 120,
  },

  // only used on web to center the login form and reduce the huge top padding
  containerWeb: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },

  logo: {
    width: 370,
    height: 130,
    marginBottom: 20,
    marginLeft: -10,
  },

  // web-only logo tweak so it scales down nicely instead of overflowing
  logoWeb: {
    width: "100%",
    marginLeft: 0,
  },

  label: {
    fontSize: 18,
    fontFamily: "BebasNeue-Regular",
    color: colors.white,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#D9D9D9",
    borderRadius: 3,
    padding: 10,
    marginBottom: 20,
  },
  resetText: {
    color: colors.white,
    textDecorationLine: "underline",
    fontFamily: Platform.OS === "web" ? undefined : "Poppins",
    marginBottom: 30,
    fontSize: 13,
  },
  errorText: {
    color: "#FFB3B3",
    marginBottom: 10,
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: 14,
    borderRadius: 3,
    alignItems: "center",
    width: "55%",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 240,
  },
  loginText: {
    color: colors.primary,
    fontFamily: "BebasNeue-Regular",
    fontSize: 25,
  },
  createAccountText: {
    color: colors.white,
    fontFamily: Platform.OS === "web" ? undefined : "Poppins",
    textDecorationLine: "underline",
    textAlign: "center",
    fontSize: 16,
  },
});