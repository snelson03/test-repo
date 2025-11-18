// Login Screen – authentication using AsyncStorage accounts

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Animated
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '@/constants/colors';
import { useUser } from '@/context/UserContext';
import { RootStackParamList } from '@/navigation/AppNavigator';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { setUserForLogin } = useUser();   // load user into context

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // auto-login if already signed in
  useEffect(() => {
    async function checkLogin() {
      const saved = await AsyncStorage.getItem('loggedInUser');
      if (saved) {
        await setUserForLogin(saved);
        navigation.navigate('Home' as never);
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

  // Login logic (real account data, OU and email authentication not yet implemented)
  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      try {
        const key = `userdata_${email.toLowerCase()}`;
        const savedUser = await AsyncStorage.getItem(key);

        if (!savedUser) {
          setLoading(false);
          setError('Incorrect email or password');
          return;
        }

        const userData = JSON.parse(savedUser);

        if (userData.password !== password) {
          setLoading(false);
          setError('Incorrect email or password');
          return;
        }

        // Save login state
        await AsyncStorage.setItem('loggedInUser', email.toLowerCase());

        // Load into global context
        await setUserForLogin(email.toLowerCase());

        setLoading(false);
        navigation.navigate('Home' as never);

      } catch (e) {
        setLoading(false);
        setError('Login error. Try again.');
      }
    }, 800);
  };

  return (
    <View style={styles.container}>

      {/* Logo */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('@/assets/images/bf_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Error */}
      {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}

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

      <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
        <Text style={styles.resetText}>Reset Password</Text>
      </TouchableOpacity>

      {/* LOGIN BUTTON */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.loginText}>LOGIN</Text>
        )}
      </TouchableOpacity>

      {/* CREATE ACCOUNT BUTTON */}
      <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
        <Text style={styles.createAccountText}>Create an Account</Text>
      </TouchableOpacity>
    </View>
  );
}


// Styles section
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingTop: 120,
  },
  logo: {
    width: 370,
    height: 130,
    marginBottom: 20,
    marginLeft: -10,
  },
  label: {
    fontSize: 18,
    fontFamily: 'BebasNeue-Regular',
    color: colors.white,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#D9D9D9',
    borderRadius: 3,
    padding: 10,
    marginBottom: 20,
  },
  resetText: {
    color: colors.white,
    textDecorationLine: 'underline',
    fontFamily: 'Poppins',
    marginBottom: 30,
    fontSize: 13,
  },
  errorText: {
    color: '#FFB3B3',
    marginBottom: 10,
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: '#D9D9D9',
    paddingVertical: 14,
    borderRadius: 3,
    alignItems: 'center',
    width: '55%',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 240,
  },
  loginText: {
    color: colors.primary,
    fontFamily: 'BebasNeue-Regular',
    fontSize: 25,
  },
  createAccountText: {
    color: colors.white,
    fontFamily: 'Poppins',
    textDecorationLine: 'underline',
    textAlign: 'center',
    fontSize: 16,
  },
});
