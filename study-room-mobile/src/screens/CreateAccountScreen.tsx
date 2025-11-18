// Create Account Screen
// Allows new users to make an account and saves it to AsyncStorage

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';

export default function CreateAccountScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phone, setPhone] = useState('');

  // fade logo in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      Alert.alert('Missing Information', 'Please fill out all required fields.');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    // check if account exists
    const existing = await AsyncStorage.getItem(`userdata_${email.toLowerCase()}`);
    if (existing) {
      Alert.alert('Account Exists', 'An account with this email already exists.');
      return;
    }

    // create new user data
    const newUser = {
      email: email.toLowerCase(),
      name,
      phone,
      password, 
    };

    await AsyncStorage.setItem(`userdata_${email.toLowerCase()}`, JSON.stringify(newUser));

    Alert.alert('Success', 'Account created successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('Login' as never) },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.primary }}>
      <View style={styles.container}>

        {/* Logo */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={require('@/assets/images/bf_logo.png')}
            style={styles.logo}
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
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>CREATE</Text>
        </TouchableOpacity>
        {/* return to login*/}
        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.returnText}>Return to Login</Text>
        </TouchableOpacity>


      </View>
    </ScrollView>
  );
}
 // styles section
const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  logo: {
    width: 350,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
  },
  header: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 35,
    color: colors.white,
    marginBottom: 5,
  },
  formBox: {
    backgroundColor: colors.white,
    borderRadius: 0,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  label: {
    fontFamily: 'BebasNeue-Regular',
    color: colors.primary,
    fontSize: 20,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: 3,
    padding: 10,
    marginBottom: 22,
  },
  createButton: {
    backgroundColor: '#D9D9D9',
    paddingVertical: 14,
    borderRadius: 3,
    width: '50%',
    alignSelf: 'center',
    marginBottom: 50,
  },
  createButtonText: {
    color: colors.primary,
    fontFamily: 'BebasNeue-Regular',
    fontSize: 26,
    textAlign: 'center',
  },
  returnText: {
    color: colors.white,
    textDecorationLine: 'underline',
    fontFamily: 'Poppins',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
  },
  
});
