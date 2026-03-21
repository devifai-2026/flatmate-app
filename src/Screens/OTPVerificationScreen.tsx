import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  OTPVerificationScreen: { phoneNumber: string };
  Login: undefined;
  NameScreen: undefined;
  [key: string]: any;
};

type OTPScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTPVerificationScreen'>;

const OTPVerificationScreen = () => {
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const route = useRoute<any>();
  const passedPhoneNumber = route.params?.phoneNumber || '+91278974478';

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Auto-focus logic
    if (cleanValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
            <Text style={styles.mainHeading}>Enter your confirmation code</Text>
            
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitle}>
                We sent a 4 digit code to {passedPhoneNumber}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.editButton}>
                <Icon name="pencil" size={14} color="#038C98" />
              </TouchableOpacity>
            </View>
          </View>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={`otp-${index}`}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpBox,
                  { borderColor: digit ? '#038C98' : '#D1D5DB' } // Active/Filled state color
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend Links */}
          <View style={styles.resendContainer}>
            <TouchableOpacity style={styles.resendButton}>
              <Text style={styles.resendText}>RESEND CODE BY SMS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resendButton}>
              <Text style={styles.resendText}>RESEND CODE BY CALL</Text>
            </TouchableOpacity>
          </View>

          {/* Flex spacer pushes button to bottom */}
          <View style={styles.flexSpacer} />

          {/* Continue Button */}
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.navigate('NameScreen')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
  
  // Header
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
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
  
  // Titles
  headerContainer: {
    marginBottom: 40,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18181B', // Strong dark title
    marginBottom: 10,
    lineHeight: 34,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280', // Soft minimal gray
    lineHeight: 22,
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  
  // OTP Form
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#18181B',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Android Shadow
    elevation: 2,
  },
  
  // Resend Options
  resendContainer: {
    alignItems: 'center',
    gap: 16, // Stacked gap
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    color: '#038C98',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Footer
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
});

export default OTPVerificationScreen;
