import React, { useState } from 'react';
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

  const handleContinue = async () => {
    setErrorMsg('');
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      setErrorMsg('Phone number cannot be empty.');
      return;
    }
    if (trimmedPhone.length < 10) {
      setErrorMsg('Phone number must be at least 10 digits.');
      return;
    }

    setIsLoading(true);
    
    // Simulate loading briefly
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('OTPVerificationScreen', {
        phoneNumber: `${countryCode}${trimmedPhone}`,
      });
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          
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
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
            </View>

            {/* Phone Input */}
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Phone no"
                placeholderTextColor="#A3A3A3"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setErrorMsg('');
                  setPhone(text);
                }}
                maxLength={15}
              />
            </View>
          </View>

          {/* Error Message display */}
          {!!errorMsg && (
            <Text style={styles.errorText}>{errorMsg}</Text>
          )}

          {/* Flex spacer pushes button to bottom */}
          <View style={styles.flexSpacer} />

          {/* Full-Width Teal Button */}
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.disabledButton]} 
            onPress={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
          
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid White background
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40, // Spacing from header
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Compensate visual width
    marginRight: 8,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#038C98', // Teal Bold
  },
  headerContainer: {
    marginBottom: 40,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18181B', // Strong dark title
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280', // Soft minimal gray
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countryCodeContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB', // Minimal gray bottom-border only
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 16, // Gap between code and phone input
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 18,
    color: '#18181B',
    fontWeight: '500',
  },
  phoneInputContainer: {
    flex: 1, 
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB', // Minimal gray bottom-border only
  },
  textInput: {
    fontSize: 18,
    color: '#18181B',
    paddingVertical: 12,
  },
  errorText: {
    color: '#EF4444', 
    fontSize: 13,
    marginTop: 8,
  },
  flexSpacer: {
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#038C98', // Rounded Teal
    borderRadius: 14,
    height: 56, // Tall premium button
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default Login;
