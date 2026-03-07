import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function InfoTooltip({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Ionicons name="information-circle-outline" size={22} color={colors.white} />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.tooltipBox, { backgroundColor: colors.white }]}>
            <Text style={[styles.text, { color: colors.primary }]}>
              {message}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipBox: {
    padding: 20,
    borderRadius: 12,
    width: "80%",
    elevation: 8,
  },
  text: {
    fontSize: 16,
  },
});