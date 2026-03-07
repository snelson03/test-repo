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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ThemeColors } from "@/constants/theme";
import {
  FONT_BODY,
  FONT_HEADING,
  FONT_SIZE_BODY,
  FONT_SIZE_BUTTON,
  FONT_SIZE_SMALL,
  FONT_SIZE_TITLE_LARGE,
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
import { RootStackParamList } from "@/navigation/AppNavigator";
import { authAPI } from "@/utils/api";

export default function ForgotPasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleReset = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!email.endsWith("@ohio.edu")) {
      setError("You must use an @ohio.edu email.");
      return;
    }

    setLoading(true);

    try {
      await authAPI.requestPasswordReset(email.toLowerCase());
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const webMaxWidth = 480;
  const webCardWidth = Math.min(width - 40, webMaxWidth);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isWeb && styles.containerWeb,
      ]}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="Forgot password screen"
    >
      <View
        style={isWeb ? { width: webCardWidth } : undefined}
        accessibilityLabel="Forgot password form"
      >
        <Animated.View
          style={{ opacity: fadeAnim }}
          accessibilityLabel="App logo"
        >
          <Image
            source={require("@/assets/images/bf_logo.png")}
            style={[styles.logo, isWeb && styles.logoWeb]}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Bobcat Finder logo"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>

        <Text style={styles.header}>FORGOT PASSWORD</Text>

        <Text style={styles.helpText}>
          Enter your Ohio University email and we’ll send password reset instructions.
        </Text>

        {error.length > 0 && (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            accessibilityLabel={`Error: ${error}`}
          >
            {error}
          </Text>
        )}

        {success.length > 0 && (
          <Text
            style={styles.successText}
            accessibilityRole="alert"
            accessibilityLabel={success}
          >
            {success}
          </Text>
        )}

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

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel={loading ? "Sending reset instructions" : "Send reset instructions"}
          accessibilityState={{ busy: loading, disabled: loading }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.loginText}>SEND RESET LINK</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to login"
        >
          <Text style={styles.createAccountText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function createStyles(c: ThemeColors) {
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

    header: {
      fontFamily: FONT_HEADING,
      fontSize: FONT_SIZE_TITLE_LARGE - 3,
      color: c.white,
      marginBottom: SPACE_SM,
    },

    helpText: {
      color: c.white,
      fontFamily: FONT_BODY,
      fontSize: FONT_SIZE_BODY,
      marginBottom: SPACE_LG,
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

    successText: {
      color: "#D7FFD9",
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