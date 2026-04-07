import React, { useMemo, useState, useRef, useEffect } from "react";
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

import { useLocalSearchParams, useRouter } from "expo-router";

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
  WEB_DESKTOP_LAYOUT_MIN_WIDTH,
} from "@/constants/typography";

import { useTheme } from "@/context/ThemeContext";
import { authAPI } from "@/utils/api";

export default function ResetPasswordPage() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const token = typeof params.token === "string" ? params.token : "";

  const { width } = useWindowDimensions();
  const isWebDesktop =
    Platform.OS === "web" && width >= WEB_DESKTOP_LAYOUT_MIN_WIDTH;

  const webMaxWidth = 480;
  const webCardWidth = Math.min(width - 40, webMaxWidth);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleResetPassword = async () => {
    setError("");

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill out both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, newPassword);

      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isWebDesktop && styles.containerWeb,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={isWebDesktop ? { width: webCardWidth } : undefined}>
        {/* Logo */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={require("@/assets/images/bf_logo.png")}
            style={[styles.logo, isWebDesktop && styles.logoWeb]}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Error */}
        {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}

        {/* NEW PASSWORD */}
        <Text style={styles.label}>NEW PASSWORD</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {/* CONFIRM PASSWORD */}
        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* RESET BUTTON */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.loginText}>RESET PASSWORD</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function createStyles(c: any) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: c.primary,
      paddingHorizontal: CONTAINER_PADDING_H,
      paddingTop: CONTAINER_PADDING_TOP_MOBILE + 40,
    },

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
  });
}