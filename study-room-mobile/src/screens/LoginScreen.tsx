// Login Screen with  authentication mock system

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
import { useNavigation } from '@react-navigation/native';   
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';

// fake login users for now
const fakeUsers = [
  { email: 'test@ohio.edu', password: 'password123' },
  { email: 'meredith@ohio.edu', password: '123456' },
];

export default function LoginScreen() {
  const navigation = useNavigation();    

  // animation fade in value
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // fields for login input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // remember me toggle value (now always ON automatically)
  const remember = true;

  // loading spinner state
  const [loading, setLoading] = useState(false);

  // error message state
  const [error, setError] = useState('');

  // check if user already logged in
  useEffect(() => {
    async function checkLogin() {
      const savedUser = await AsyncStorage.getItem('loggedInUser');
      if (savedUser) {
        navigation.navigate('Home' as never); 
      }
    }
    checkLogin();
  }, []);

  // fade in animation for logo
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  // login handler
  const handleLogin = async () => {
    setError('');

    // basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    // loading icon when login is pressed
    setTimeout(async () => {
      const match = fakeUsers.find(
        (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
      );

      if (!match) {
        setLoading(false);
        setError('Incorrect email or password');
        return;
      }

      // always save login automatically
      await AsyncStorage.setItem('loggedInUser', email);

      setLoading(false);
      navigation.navigate('Home' as never); 
    }, 1200);
  };

  return (
    <View style={styles.container}>

      {/* fade-in logo */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('@/assets/images/bf_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* error message */}
      {error.length > 0 && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Text style={styles.label}>EMAIL</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

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

      {/* login button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.loginText}>LOGIN</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// styles section
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
  appTitle: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 42,
    color: colors.white,
    marginBottom: 50,
    lineHeight: 45,
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
    marginBottom: 30,
    fontSize: 14,
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
  },
  loginText: {
    color: colors.primary,
    fontFamily: 'BebasNeue-Regular',
    fontSize: 25,
  },
});
