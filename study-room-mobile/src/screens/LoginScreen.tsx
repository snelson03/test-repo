// Login Screen – authentication using AsyncStorage accounts
// user must enter correct username and password saved locally to enter the app,
// account can be created by clicking create account

import React, { useEffect, useState, useRef, useMemo } from "react";
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

import type { ThemeColors } from "@/constants/theme";
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_BODY,
  FONT_SIZE_BUTTON,
  FONT_SIZE_SMALL,
  BUTTON_PADDING_V,
  BUTTON_BORDER_RADIUS,
  CONTAINER_PADDING_H,
  CONTAINER_PADDING_TOP_MOBILE,
  CONTAINER_PADDING_TOP_WEB,
  INPUT_PADDING,
  INPUT_BORDER_RADIUS,
  INPUT_MARGIN_BOTTOM,
  LABEL_MARGIN_BOTTOM,
  SPACE_LG,
  SPACE_SM,
} from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { useRegisterSessionExpiryNavigation } from "@/context/SessionExpiryContext";
import { authAPI } from "@/utils/api";

// navigation
export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useRegisterSessionExpiryNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          onPress={() => navigation.navigate("ForgotPassword")}
          accessibilityRole="button"
          accessibilityLabel="Reset password"
          accessibilityHint="Opens the forgot password screen"
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
function createStyles(c: ThemeColors) {
  return StyleSheet.create({
  // main container (same look on iOS), but using flexGrow so ScrollView works correctly
  container: {
    flexGrow: 1,
    backgroundColor: c.primary,
    paddingHorizontal: CONTAINER_PADDING_H,
    paddingTop: CONTAINER_PADDING_TOP_MOBILE + 40,
  },

  // only used on web to center the login form and reduce the huge top padding
  containerWeb: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: CONTAINER_PADDING_TOP_WEB,
    paddingBottom: CONTAINER_PADDING_TOP_WEB,
  },

  logo: {
    width: 370,
    height: 130,
    marginBottom: SPACE_LG,
    marginLeft: -10,
  },

  // web-only logo tweak so it scales down nicely instead of overflowing
  logoWeb: {
    width: "100%",
    marginLeft: 0,
  },

  label: {
    fontSize: FONT_SIZE_BODY + 2,
    fontFamily: FONT_HEADING,
    color: c.white,
    marginBottom: LABEL_MARGIN_BOTTOM,
  },
  input: {
    backgroundColor: c.gray300,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    marginBottom: INPUT_MARGIN_BOTTOM,
    color: c.primary,
    fontFamily: FONT_BODY,
  },
  resetText: {
    color: c.white,
    textDecorationLine: "underline",
    fontFamily: FONT_BODY,
    marginBottom: 30,
    fontSize: FONT_SIZE_SMALL,
  },
  errorText: {
    color: "#FFB3B3",
    marginBottom: SPACE_SM,
    fontSize: FONT_SIZE_BODY - 1,
    fontFamily: FONT_BODY,
  },
  loginButton: {
    backgroundColor: "#D9D9D9",
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: "center",
    width: "55%",
    alignSelf: "center",
    marginTop: SPACE_SM,
    marginBottom: 240,
  },
  loginText: {
    color: c.primary,
    fontFamily: FONT_HEADING,
    fontSize: FONT_SIZE_BUTTON,
  },
  createAccountText: {
    color: c.white,
    fontFamily: FONT_BODY,
    textDecorationLine: "underline",
    textAlign: "center",
    fontSize: FONT_SIZE_BODY,
  },
});
}