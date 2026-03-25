import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  OTPVerificationScreen: { phoneNumber: string };
  [key: string]: any;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // --- Animation Refs ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate focus state
  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // Color and border width don't support native driver
    }).start();
  }, [isFocused]);

  const handleContinue = async () => {
    setErrorMsg('');
    const trimmedPhone = phone.trim();

    if (!trimmedPhone || trimmedPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    
    // Simulate loading briefly
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('OTPVerificationScreen', {
        phoneNumber: `${countryCode}${trimmedPhone}`,
      });
    }, 800);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const isComplete = phone.length === 10;

  useEffect(() => {
    if (isComplete) {
      Animated.spring(buttonScale, {
        toValue: 1.02,
        friction: 4,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  }, [isComplete]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D1D5DB', '#038C98'],
  });

  const borderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[
          styles.container, 
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] 
          }
        ]}>
          
          {/* Top Header Row */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="chevron-left" size={20} color="#038C98" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Login</Text>
          </View>

          {/* Main Titles */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainHeading}>Enter your phone</Text>
            <Text style={styles.subtitle}>
              We will send you a confirmation code to your phone
            </Text>
          </View>

          {/* Form Fields - Bottom Border Only */}
          <View style={styles.inputRow}>
            {/* Country Code */}
            <Animated.View style={[
              styles.countryCodeContainer, 
              { borderBottomColor: borderColor, borderBottomWidth: borderWidth }
            ]}>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
            </Animated.View>

            {/* Phone Input */}
            <Animated.View style={[
              styles.phoneInputContainer, 
              { borderBottomColor: borderColor, borderBottomWidth: borderWidth }
            ]}>
              <TextInput
                style={styles.textInput}
                placeholder="000 000 0000"
                placeholderTextColor="#D1D5DB"
                keyboardType="phone-pad"
                value={phone}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChangeText={(text) => {
                  setErrorMsg('');
                  // Only allow digits
                  const formatted = text.replace(/[^0-9]/g, '');
                  setPhone(formatted);
                }}
                maxLength={10}
              />
            </Animated.View>
          </View>

          {/* Error Message display */}
          {!!errorMsg && (
            <Animated.Text style={styles.errorText}>{errorMsg}</Animated.Text>
          )}

          {/* Flex spacer pushes button to bottom */}
          <View style={styles.flexSpacer} />

          {/* Full-Width Teal Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={[
                styles.continueButton, 
                (!isComplete || isLoading) && styles.disabledButton,
                isComplete && styles.glowBtn
              ]} 
              onPress={handleContinue}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#038C98',
  },
  headerContainer: {
    marginBottom: 48,
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717A',
    lineHeight: 24,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryCodeContainer: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 20,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  phoneInputContainer: {
    flex: 1, 
    borderBottomWidth: 1,
  },
  textInput: {
    fontSize: 22,
    color: '#1A1A1A',
    paddingVertical: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorText: {
    color: '#EF4444', 
    fontSize: 14,
    marginTop: 10,
    fontWeight: '600',
  },
  flexSpacer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#038C98',
    borderRadius: 18,
    height: 60,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#038C98',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  glowBtn: {
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: '#E4E4E7',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default Login;
