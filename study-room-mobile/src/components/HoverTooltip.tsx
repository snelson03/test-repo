import React, { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export default function HoverTooltip({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View
      style={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <View style={[styles.tooltip, { backgroundColor: colors.white }]}>
          <Text style={[styles.text, { color: colors.primary }]}>
            {message}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignSelf: "flex-start",
  },
  tooltip: {
    position: "absolute",
    bottom: "120%",
    left: "50%",
    transform: [{ translateX: -60 }],
    minWidth: 120,
    maxWidth: 200,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 9999,
  },
  text: {
    fontSize: 13,
    textAlign: "center",
  },
});